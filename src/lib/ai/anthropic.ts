import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { env } from "../env";
import { QUESTION_TYPES } from "../blueprint";
import {
  AnswerScoreSchema,
  GeneratedQuestionSchema,
  SessionSummarySchema,
  type AIProvider,
  type AnswerScore,
  type GenerateQuestionsInput,
  type GeneratedQuestion,
  type ScoreAnswerInput,
  type SessionSummary,
  type SummariseInput,
} from "./types";

const QuestionSetSchema = z.object({ questions: z.array(GeneratedQuestionSchema) });

const MAX_TOKENS = 16_000;

const INTERVIEWER_SYSTEM = `You write and grade technical interview questions for software companies.

Rules that apply to everything you produce:
- Target the stated seniority. A BEGINNER question must be answerable by someone who has finished a course and built a couple of projects; a STAFF question must not be answerable from a tutorial.
- Questions must be answerable in the allotted time by someone with no internet access, no IDE, and no design tool open.
- Never ask for personal, demographic, health, or protected-characteristic information.
- Never ask trivia that a search engine answers in one query. Ask about judgement, trade-offs, and lived experience.
- Match the domain. A question for a graphic designer must be about design work, not about writing code.`;

const GRADER_SYSTEM = `You grade a single interview answer against a rubric.

Grading rules:
- Score what the candidate actually demonstrated, not what the topic could have covered.
- A confident, fluent answer that is technically wrong scores low. Correctness outranks polish.
- Spoken answers are transcripts: ignore filler words, false starts, and transcription noise. Do not penalise grammar, accent, or phrasing. Candidates are allowed to correct their own transcripts; a corrected transcript is not suspicious.
- Calibrate to the stated seniority. A beginner giving a correct, simple, complete answer scores well — do not mark them down for lacking senior-level depth that was never asked for.
- An empty, off-topic, or non-committal answer is not "average" — set answeredSubstantively to false and score accordingly.
- Do not infer anything about the candidate beyond the answer text. No demographic inference.
- You may be told a paste event or an unusual typing burst occurred. Report it in concerns as an observation; never treat it as proof of cheating and never let it change the competence score.`;

function toDifficultyBrief(d: string): string {
  switch (d) {
    case "BEGINNER":
      return "student or first job; has completed coursework and personal projects but has not shipped professionally. Expect correct fundamentals and clear thinking, nothing more.";
    case "JUNIOR":
      return "0-2 years experience; expect fundamentals and clear reasoning, not system design.";
    case "MID":
      return "2-5 years; expect independent delivery, debugging skill, and awareness of trade-offs.";
    case "SENIOR":
      return "5-9 years; expect design judgement, failure-mode thinking, and mentoring signals.";
    default:
      return "9+ years; expect cross-team architecture, risk framing, and organisational impact.";
  }
}

const TYPE_SPEC = `Question types and what each must look like:

- MCQ — answerMode "CHOICE". One question with exactly 4 options. Exactly one is correct; correctIndex is its 0-based index. The three wrong options must be plausible to someone who half-knows the topic — no joke answers, no "all of the above", no option that is obviously absurd. Never make the longest option the correct one. Fill "explanation" with one sentence on why the right answer is right. timeLimitSec 45-90. rubric.criteria must be an empty array.
- CONCEPTUAL — answerMode "SPOKEN". Tests understanding of an idea in the field: what it is for, when it applies, when it does not. Answerable in 1-2 minutes out loud. timeLimitSec 120-180.
- SCENARIO — answerMode "TYPED". A realistic problem statement with enough concrete detail to reason about — a situation, a constraint, and a decision to make. Answered in prose. timeLimitSec 240-420.
- CODING — answerMode "TYPED". A small hands-on task written by hand with no editor: a function, a query, a component, a config, a spec, or a critique — whatever "hands-on" means in this domain. timeLimitSec 300-600.
- BEHAVIORAL — answerMode "SPOKEN". A real situation the candidate handled. timeLimitSec 180-300.

For every type except MCQ: options must be an empty array, correctIndex must be -1, explanation must be an empty string, and rubric.criteria must have 3-5 entries. Each criterion needs a short lowercase key, a human-readable label, a positive weight relative within the question, and 3-6 keywords or short phrases a strong answer is likely to contain (grading hints, not a checklist).`;

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  readonly model: string;
  readonly preferBank = false;
  private client: Anthropic;

  constructor() {
    if (!env.anthropicApiKey) {
      throw new Error("AI_PROVIDER=anthropic but ANTHROPIC_API_KEY is empty.");
    }
    this.model = env.anthropicModel;
    this.client = new Anthropic({ apiKey: env.anthropicApiKey });
  }

  private assertServed(stopReason: string | null, parsed: unknown, what: string) {
    if (stopReason === "refusal") {
      throw new Error(`Claude declined to ${what}.`);
    }
    if (stopReason === "max_tokens") {
      throw new Error(`Response truncated while trying to ${what}; raise max_tokens.`);
    }
    if (parsed == null) {
      throw new Error(`Claude returned no parsable output while trying to ${what}.`);
    }
  }

  async generateQuestions(input: GenerateQuestionsInput): Promise<GeneratedQuestion[]> {
    const wanted = QUESTION_TYPES.filter((t) => (input.blueprint[t] ?? 0) > 0)
      .map((t) => `${input.blueprint[t]} × ${t}`)
      .join(", ");

    const response = await this.client.messages.parse({
      model: this.model,
      max_tokens: MAX_TOKENS,
      system: INTERVIEWER_SYSTEM,
      output_config: { format: zodOutputFormat(QuestionSetSchema) },
      messages: [
        {
          role: "user",
          content: `Write an interview question set.

Domain: ${input.domainName}
Domain scope: ${input.domainBlurb}
Seniority: ${input.difficulty} — ${toDifficultyBrief(input.difficulty)}

Produce exactly: ${wanted}.
Order them MCQ first, then CONCEPTUAL, SCENARIO, CODING, BEHAVIORAL — easiest to hardest, so the candidate warms up.

${TYPE_SPEC}

Every question must be answerable by someone working in this specific domain. Do not reuse the same underlying topic twice in the set.`,
        },
      ],
    });

    this.assertServed(response.stop_reason, response.parsed_output, "generate questions");
    return response.parsed_output!.questions;
  }

  async scoreAnswer(input: ScoreAnswerInput): Promise<AnswerScore> {
    const telemetryLine = input.telemetry
      ? `Typing telemetry: ${input.telemetry.keystrokes} keystrokes for ${input.telemetry.chars} characters, ${input.telemetry.pastes} paste event(s), peak ${input.telemetry.maxBurstCps.toFixed(1)} chars/sec, mean gap ${Math.round(input.telemetry.meanIkiMs)}ms, ${input.telemetry.backspaces} backspaces.`
      : "Typing telemetry: not captured.";

    const modeLine =
      input.answerMode === "SPOKEN"
        ? `This is a spoken answer transcribed by the browser's speech recogniser. Detected speech time: ${Math.round(input.spokenMs / 1000)}s.${input.transcriptEdited ? " The candidate corrected the transcript by hand afterwards, which is permitted." : ""}`
        : "This is a typed answer written in a plain text box without an editor, autocomplete, or execution.";

    const response = await this.client.messages.parse({
      model: this.model,
      max_tokens: MAX_TOKENS,
      system: GRADER_SYSTEM,
      output_config: { format: zodOutputFormat(AnswerScoreSchema) },
      messages: [
        {
          role: "user",
          content: `Grade one answer.

Role: ${input.difficulty} ${input.domainName} — ${toDifficultyBrief(input.difficulty)}
Question type: ${input.type}
${modeLine}
${telemetryLine}

QUESTION
${input.prompt}

RUBRIC
${input.rubric.criteria
  .map(
    (c) =>
      `- ${c.key} (weight ${c.weight}) — ${c.label}. Signals a strong answer may include: ${c.keywords.join(", ") || "n/a"}`,
  )
  .join("\n")}

CANDIDATE ANSWER
"""
${input.answerText || "(no answer submitted)"}
"""

Return a score from 0-100 for the answer overall, a 0-100 score plus a one-line note for every rubric criterion (use the exact keys above), a two-sentence summary a recruiter can read without the transcript, up to three strengths, up to three concerns, and answeredSubstantively.`,
        },
      ],
    });

    this.assertServed(response.stop_reason, response.parsed_output, "score an answer");
    return response.parsed_output!;
  }

  async summarise(input: SummariseInput): Promise<SessionSummary> {
    const body = input.perQuestion
      .map(
        (q) =>
          `Q${q.order + 1} [${q.type}] score ${q.score.score}/100 — ${q.score.summary}\n  strengths: ${q.score.strengths.join("; ") || "none"}\n  concerns: ${q.score.concerns.join("; ") || "none"}`,
      )
      .join("\n\n");

    const response = await this.client.messages.parse({
      model: this.model,
      max_tokens: MAX_TOKENS,
      system: GRADER_SYSTEM,
      output_config: { format: zodOutputFormat(SessionSummarySchema) },
      messages: [
        {
          role: "user",
          content: `Summarise a completed interview for a ${input.difficulty} ${input.domainName} role.

PER-QUESTION RESULTS
${body}

Return an overall 0-100 score, four 0-100 dimension scores (technical, problemSolving, communication, depth), a recommendation, a rationale of at most four sentences aimed at a hiring manager deciding whether to book an onsite, up to five strengths, and up to five concerns.

Weight the dimensions by evidence: MCQ and CODING answers speak to technical, SCENARIO and CODING to problemSolving, BEHAVIORAL and CONCEPTUAL to communication. Where a dimension has no supporting question, say so in the rationale rather than inventing a score for it.

The recommendation is about competence only. Do not factor in proctoring or integrity signals — those are scored separately by the platform and shown next to your output.`,
        },
      ],
    });

    this.assertServed(response.stop_reason, response.parsed_output, "summarise the interview");
    return response.parsed_output!;
  }
}
