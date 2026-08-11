import { z } from "zod";
import { env } from "../env";
import { QUESTION_TYPES, QUESTION_TYPE_META } from "../blueprint";
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

/**
 * Local model provider, via Ollama.
 *
 * Runs entirely on the interviewer's own machine: no API key, no per-token
 * charge, no candidate data leaving the network. That last point is the real
 * argument for it — transcripts are candidate personal data, and this keeps
 * them local.
 *
 * Be clear-eyed about the trade. A 7B model grading against an explicit rubric
 * is far better than keyword coverage, and good enough to rank a batch of
 * candidates and flag who is worth a call. It is not as good as a frontier
 * model at spotting a confident answer that is subtly wrong, and it is slower —
 * expect a minute or two to grade a full paper rather than seconds. Read the
 * transcripts before rejecting anyone on its say-so.
 */

const CHAT_TIMEOUT_MS = 240_000; // local inference is slow; do not clip it early

/** Ollama wants a plain JSON Schema; zod emits one with a `$schema` header. */
function jsonSchema(schema: z.ZodType): Record<string, unknown> {
  const out = z.toJSONSchema(schema) as Record<string, unknown>;
  delete out.$schema;
  return out;
}

type ChatMessage = { role: "system" | "user"; content: string };

const INTERVIEWER_SYSTEM = `You write technical interview questions. Output only JSON matching the schema. Target the stated seniority exactly. Never ask for personal or demographic information. Never ask trivia a search engine answers in one query.`;

const GRADER_SYSTEM = `You grade one interview answer against a rubric. Output only JSON matching the schema.

Rules:
- Score what the candidate actually demonstrated, not what the topic could cover.
- A fluent answer that is technically wrong scores low. Correctness beats polish.
- Spoken answers are transcripts. Ignore filler, false starts and transcription noise. Never penalise grammar, accent or phrasing. Candidates may correct their own transcript; that is not suspicious.
- Calibrate to the seniority given. A beginner giving a correct, simple, complete answer scores well.
- An empty, off-topic or evasive answer is not average: set answeredSubstantively false and score low.
- Score each rubric criterion using the exact keys provided.`;

function difficultyBrief(d: string): string {
  switch (d) {
    case "BEGINNER":
      return "student or first job. Expect correct fundamentals and clear thinking, nothing more.";
    case "JUNIOR":
      return "0-2 years. Expect fundamentals and clear reasoning, not system design.";
    case "MID":
      return "2-5 years. Expect independent delivery, debugging skill, awareness of trade-offs.";
    case "SENIOR":
      return "5-9 years. Expect design judgement and failure-mode thinking.";
    default:
      return "9+ years. Expect architecture, risk framing and organisational impact.";
  }
}

export class OllamaProvider implements AIProvider {
  readonly name = "ollama";
  readonly model: string;
  readonly preferBank = true;
  private baseUrl: string;

  constructor() {
    this.model = env.ollamaModel;
    this.baseUrl = env.ollamaBaseUrl.replace(/\/$/, "");
  }

  /** Confirms the daemon is up and the model is pulled. */
  async health(): Promise<{ ok: boolean; detail: string }> {
    let tags: Response;
    try {
      tags = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      return {
        ok: false,
        detail: `Cannot reach Ollama at ${this.baseUrl}. Start it with "ollama serve".`,
      };
    }
    if (!tags.ok) return { ok: false, detail: `Ollama returned HTTP ${tags.status}.` };

    const body = (await tags.json()) as { models?: Array<{ name: string }> };
    const installed = (body.models ?? []).map((m) => m.name);
    // Ollama reports "qwen2.5:7b"; tolerate the bare name too.
    const present = installed.some(
      (n) => n === this.model || n.split(":")[0] === this.model.split(":")[0],
    );
    if (!present) {
      return {
        ok: false,
        detail: `Model "${this.model}" is not installed. Run: ollama pull ${this.model}`,
      };
    }
    return { ok: true, detail: `${this.model} ready` };
  }

  private async chat<T>(
    messages: ChatMessage[],
    schema: z.ZodType,
    what: string,
    maxTokens = 2048,
  ): Promise<T> {
    const body = {
      model: this.model,
      messages,
      stream: false,
      // Constrains decoding to the schema, so the reply is valid JSON by
      // construction rather than by hoping the model complied.
      format: jsonSchema(schema),
      options: {
        // Grading should be reproducible; creativity is not wanted here.
        temperature: 0.2,
        num_predict: maxTokens,
        num_ctx: 8192,
      },
    };

    let lastError = "";
    // One retry: small models occasionally emit a truncated object.
    for (let attempt = 0; attempt < 2; attempt++) {
      let res: Response;
      try {
        res = await fetch(`${this.baseUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
        });
      } catch (err) {
        lastError =
          (err as Error).name === "TimeoutError"
            ? `Ollama did not respond within ${CHAT_TIMEOUT_MS / 1000}s while trying to ${what}.`
            : `Cannot reach Ollama at ${this.baseUrl}.`;
        continue;
      }

      if (!res.ok) {
        lastError = `Ollama returned HTTP ${res.status} while trying to ${what}.`;
        continue;
      }

      const payload = (await res.json()) as { message?: { content?: string } };
      const raw = payload.message?.content ?? "";
      try {
        const parsed = schema.parse(JSON.parse(raw));
        return parsed as T;
      } catch (err) {
        lastError = `Ollama produced output that did not match the schema while trying to ${what}: ${(err as Error).message.slice(0, 160)}`;
      }
    }

    throw new Error(lastError || `Ollama failed to ${what}.`);
  }

  /**
   * Generates one type at a time. Small models degrade sharply when asked for a
   * large nested object in one shot, and this is only ever a gap-filler because
   * `preferBank` keeps the curated bank in charge of the paper.
   */
  async generateQuestions(input: GenerateQuestionsInput): Promise<GeneratedQuestion[]> {
    const out: GeneratedQuestion[] = [];

    for (const type of QUESTION_TYPES) {
      const count = input.blueprint[type] ?? 0;
      for (let i = 0; i < count; i++) {
        const isMcq = type === "MCQ";
        const spec = isMcq
          ? `Write one multiple-choice question with exactly 4 options. Exactly one is correct; set correctIndex to its 0-based position. Wrong options must be plausible to someone who half-knows the topic — no joke answers, no "all of the above". Do not make the longest option the correct one. Put one sentence in "explanation". Set rubric to {"criteria": []}, answerMode to "CHOICE", timeLimitSec to 60.`
          : `Write one ${type} question. answerMode must be "${QUESTION_TYPE_META[type].mode}". Set options to [], correctIndex to -1, explanation to "". Give rubric.criteria 3-4 entries, each with a short lowercase key, a label, a positive weight, and 3-5 keywords a strong answer would contain. timeLimitSec ${isMcq ? 60 : type === "CODING" ? 450 : type === "SCENARIO" ? 330 : 180}.`;

        try {
          const q = await this.chat<GeneratedQuestion>(
            [
              { role: "system", content: INTERVIEWER_SYSTEM },
              {
                role: "user",
                content: `Domain: ${input.domainName}\nScope: ${input.domainBlurb}\nSeniority: ${input.difficulty} — ${difficultyBrief(input.difficulty)}\n\n${spec}\n\nThe question must be specific to ${input.domainName}, not generic software advice.`,
              },
            ],
            GeneratedQuestionSchema,
            `generate a ${type} question`,
            1024,
          );
          // The model sometimes labels the type incorrectly; trust the request.
          out.push({ ...q, type, answerMode: QUESTION_TYPE_META[type].mode });
        } catch (err) {
          console.error("[ollama] question generation failed:", (err as Error).message);
        }
      }
    }
    return out;
  }

  async scoreAnswer(input: ScoreAnswerInput): Promise<AnswerScore> {
    const modeLine =
      input.answerMode === "SPOKEN"
        ? `Spoken answer, transcribed automatically. Detected speech: ${Math.round(input.spokenMs / 1000)}s.${input.transcriptEdited ? " The candidate corrected the transcript, which is permitted." : ""}`
        : "Typed answer, written without an editor or autocomplete.";

    const rubric = input.rubric.criteria
      .map(
        (c) =>
          `- ${c.key} (weight ${c.weight}): ${c.label}. Strong answers often mention: ${c.keywords.join(", ") || "n/a"}`,
      )
      .join("\n");

    const score = await this.chat<AnswerScore>(
      [
        { role: "system", content: GRADER_SYSTEM },
        {
          role: "user",
          content: `Role: ${input.difficulty} ${input.domainName} — ${difficultyBrief(input.difficulty)}
${modeLine}

QUESTION
${input.prompt}

RUBRIC
${rubric}

ANSWER
"""
${input.answerText || "(no answer submitted)"}
"""

Give an overall 0-100 score, a 0-100 score and one-line note per rubric criterion using the exact keys above, a two-sentence summary for a recruiter, up to 3 strengths, up to 3 concerns, and answeredSubstantively.`,
        },
      ],
      AnswerScoreSchema,
      "score an answer",
      1536,
    );

    const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
    const criterionScores = score.criterionScores.map((c) => ({
      ...c,
      score: clamp(c.score),
    }));

    // Derive the headline score from the criterion scores rather than trusting
    // the model's own overall. A 7B model reasons well per criterion but its
    // holistic number drifts: in testing, an answer it marked 20/15/10 across
    // the rubric still came back as 45 overall, and an empty answer it flagged
    // as not substantive came back as 25. The per-criterion judgements are the
    // trustworthy part, so the total is computed from them here.
    const byKey = new Map(criterionScores.map((c) => [c.key, c.score]));
    let weighted = 0;
    let totalWeight = 0;
    for (const c of input.rubric.criteria) {
      const marked = byKey.get(c.key);
      if (marked === undefined) continue;
      const w = c.weight || 1;
      weighted += marked * w;
      totalWeight += w;
    }

    // Fall back to the model's own figure only when nothing could be matched,
    // e.g. it invented criterion keys or the rubric was empty.
    const derived = totalWeight > 0 ? weighted / totalWeight : clamp(score.score);

    // A non-answer is not a low score, it is no score. Without this an empty
    // box collects marks for the criteria the model felt generous about.
    const finalScore = score.answeredSubstantively ? clamp(derived) : 0;

    return { ...score, score: finalScore, criterionScores };
  }

  async summarise(input: SummariseInput): Promise<SessionSummary> {
    const body = input.perQuestion
      .map(
        (q) =>
          `Q${q.order + 1} [${q.type}] ${q.score.score}/100 — ${q.score.summary}`,
      )
      .join("\n");

    const summary = await this.chat<SessionSummary>(
      [
        { role: "system", content: GRADER_SYSTEM },
        {
          role: "user",
          content: `Summarise a completed interview for a ${input.difficulty} ${input.domainName} role.

PER-QUESTION RESULTS
${body}

Give an overall 0-100 score, four 0-100 dimension scores (technical, problemSolving, communication, depth), a recommendation of STRONG_YES, YES, BORDERLINE or NO, a rationale of at most four sentences for a hiring manager deciding whether to book an onsite, up to 5 strengths and up to 5 concerns.

Judge competence only. Ignore proctoring; the platform scores integrity separately.`,
        },
      ],
      SessionSummarySchema,
      "summarise the interview",
      1536,
    );

    const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
    return {
      ...summary,
      overall: clamp(summary.overall),
      dimensions: {
        technical: clamp(summary.dimensions.technical),
        problemSolving: clamp(summary.dimensions.problemSolving),
        communication: clamp(summary.dimensions.communication),
        depth: clamp(summary.dimensions.depth),
      },
    };
  }
}
