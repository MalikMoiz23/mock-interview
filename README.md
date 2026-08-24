# AI Interview Platform

Proctored, AI-assisted technical screening for software houses. A recruiter picks a
domain and difficulty, generates a one-time candidate link, and gets back scored
answers plus an integrity report to decide who to bring in for an onsite.

---

## Read this before you use it

**This platform reduces cheating. It does not prevent it.**

Every signal it collects comes from inside the candidate's browser. A candidate
with a second device — a phone, a tablet, another laptop — who reads the question
off-screen and types an LLM's answer back produces **no signal at all**. Every
commercial proctoring vendor has this hole; a web page cannot see outside itself.

What the platform actually does:

- **Raises the cost of cheating.** Spoken answers, blocked paste, live camera,
  fullscreen enforcement and a running clock make casual cheating awkward.
- **Collects evidence.** Face absence, second faces, gaze direction, tab
  switching, paste events, and typing rhythm are logged with timestamps and
  frames.
- **Scores confidence, not guilt.** A low integrity score routes the session to a
  human reviewer instead of silently changing the competence score, so a false
  positive costs a review rather than a candidate.

Browser signals are also **spoofable**. Tab-switch and fullscreen events can be
suppressed by a determined candidate with devtools or an extension. Real assurance
needs a lockdown desktop client or a second camera on a phone. Treat the integrity
score as a triage tool.

**The AI score is a first-pass filter, not a hiring decision.** Read the
transcripts. The platform is designed to shortlist for a physical interview — that
is the intended output, and the final judgement stays with a person.

### Legal

Recording candidates' camera and microphone is regulated. Facial imagery is
biometric data under GDPR Art. 9, BIPA (Illinois), and comparable laws elsewhere.

Built in: an explicit consent screen listing every category of data collected, a
decline path, no continuous video upload (frames only at flagged moments), and a
one-click endpoint to purge a candidate's stored frames.

Not built in, and **your** responsibility: a retention policy and its enforcement,
a lawful basis for processing in your jurisdiction, a privacy notice, a candidate
access/erasure process, and disclosure that automated scoring is used — several
jurisdictions (EU AI Act, NYC Local Law 144) impose extra duties on automated
hiring tools, including bias auditing. Get counsel before running this on real
candidates.

---

## Stack

Next.js 15 (App Router) · TypeScript · PostgreSQL + Prisma · Tailwind v4 ·
MediaPipe face + object detection (in-browser) · Web Speech API · Ollama for
local scoring.

**Cost to run: nothing.** Every npm dependency is MIT / Apache-2.0 / BSD,
PostgreSQL is free, the proctoring models are Apache-2.0, and scoring runs on a
model on your own machine. There is no hosted provider and nothing bills per
interview.

---

## Setup

PostgreSQL must be running. Node 20+.

```bash
npm install
npm run setup:models        # MediaPipe WASM + face and object detection models
ollama pull qwen2.5:7b      # free local scorer (see Choosing a scorer)
cp .env.example .env        # then edit DATABASE_URL and AUTH_SECRET
npm run db:push             # create the schema
npm run db:seed             # domains, question bank, admin user
npm run dev
```

Open http://localhost:3000 and sign in with `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` from `.env`. **Change that password immediately.**

### Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Signs admin session cookies and the IP hash. 32+ random bytes |
| `APP_BASE_URL` | Origin used when generating candidate links |
| `AI_PROVIDER` | `ollama` (local, default) or `mock` (offline heuristic) |
| `OLLAMA_BASE_URL` / `OLLAMA_MODEL` | Local model endpoint and tag |
| `SNAPSHOT_DIR` | Where violation frames are written |
| `SNAPSHOT_MAX_PER_SESSION` | Hard cap on stored frames per session |

---

## Choosing a scorer

Two providers behind one interface, both free and both running on your own
machine. Multiple choice is graded by exact match in either, so it never costs
anything and is never a judgement call.

| | `ollama` **(default)** | `mock` |
|---|---|---|
| **Cost** | Free | Free |
| **Runs** | Your machine | In-process |
| **Candidate data leaves your network** | No | No |
| **Works offline** | Yes | Yes |
| **Judges correctness** | Yes | **No** |
| **Speed (10 questions)** | ~1–3 min | Instant |

### `ollama` — free and actually reads the answers

```bash
winget install Ollama.Ollama      # or: brew install ollama
ollama pull qwen2.5:7b
# .env
AI_PROVIDER=ollama
```

Needs ~6 GB of VRAM (or ~8 GB RAM without a GPU) for the 7B model; `qwen2.5:3b`
runs on far less and is noticeably less reliable. Qwen2.5 is Apache-2.0, so
there is no licence question about commercial use.

Grading is where a local model earns its place, so that is all it is used for.
Question *writing* stays with the curated bank — small models drift toward
generic, tutorial-grade questions — which is what the `preferBank` flag on the
provider controls. It is used to generate only when the bank cannot fill a paper.

**Why this is worth 15 seconds per answer.** The same three answers to
"explain what a database index is, and why not index every column", scored by
both free providers:

| Answer | `mock` (keywords) | `ollama` (qwen2.5:7b) |
|---|---|---|
| Correct and complete | 76 | **88** |
| Fluent but **factually wrong** | **55** | **15** |
| Empty | 0 | 0 |

Keyword matching puts a confidently wrong answer 21 points below a correct one,
because the wrong answer happens to contain the same vocabulary. The local model
puts them 73 points apart, and its concerns read *"incorrect description of what
an index is"*. That gap is the whole argument for running a model locally.

**Scores are derived, not taken on trust.** The headline score is computed from
the model's per-criterion marks weighted by the rubric, not from the overall
number it reports. A 7B model reasons well per criterion but its holistic figure
drifts — in testing an answer it marked 20/15/10 across the rubric still came
back as 45 overall, and an empty answer it flagged as not substantive came back
as 25. Deriving the total fixed both.

**Be clear-eyed about the trade.** This is good enough to rank a batch and decide
who is worth a call. It is worse than a frontier model at catching an answer that
is subtly rather than obviously wrong. Read the transcripts before rejecting
anyone.

**Speed:** ~15 s per answer once the model is warm, so about a minute for a
typical paper. The first call after startup takes ~100 s while the model loads
into VRAM. Grading already runs in the background after submission, so the
candidate never waits.

### `mock` — free, but cannot judge anything

Counts rubric keywords. Deterministic, instant, and genuinely useful for testing
the flow end to end. It will happily give a fluent, completely wrong answer a
good score. **Not for hiring decisions.** The admin UI says so on every page.

### Adding another

Implement `AIProvider` in [`src/lib/ai/types.ts`](src/lib/ai/types.ts) and
register it in [`src/lib/ai/index.ts`](src/lib/ai/index.ts). Nothing else in the
app knows which provider is in use.

---

## Fields and question types

Ten built-in fields, including **Full Stack Development**, **UI/UX Design**,
**Graphic Design**, and **App Development (Mobile)**. Add your own by inserting
into `Domain` and `QuestionTemplate`, or scope them to one organisation with
`Domain.orgId`.

Five question types, mixed per paper:

| Type | Answered by | Graded by |
|---|---|---|
| **Multiple choice** | Clicking one of four options | Exact match — never sent to a model, so it is objective and free |
| **About the field** | Speaking | Rubric |
| **Problem statement** | Typing prose | Rubric |
| **Hands-on task** | Typing code, a query, or a spec | Rubric |
| **Experience** | Speaking | Rubric |

"Hands-on" means whatever it means in the field: a function for a developer, a
typographic specification for a graphic designer, a full interaction spec for a
UI/UX designer.

### Difficulty presets

Each level ships a default paper, tuned so the questions actually discriminate at
that level. A beginner sitting five open-ended questions freezes and the result
says nothing, so the beginner paper leans on multiple choice and short spoken
answers and skips open-ended coding entirely.

| Level | Paper | Time |
|---|---|---|
| **Beginner** (student / first job) | 6 MCQ, 2 spoken, 1 scenario, 1 experience | 25 min |
| Junior (0-2 yrs) | 4 MCQ, 2 spoken, 1 scenario, 1 task, 1 experience | 35 min |
| Mid (2-5 yrs) | 3 MCQ, 1 spoken, 2 scenarios, 2 tasks, 1 experience | 45 min |
| Senior (5-9 yrs) | 1 MCQ, 1 spoken, 3 scenarios, 2 tasks, 2 experience | 55 min |
| Staff (9+ yrs) | 1 spoken, 4 scenarios, 1 task, 3 experience | 60 min |

Every count is editable per link, and the form warns when a paper cannot fit its
time limit.

### Question sourcing

The recruiter sees, **before sending the link**, how much of the paper comes from
the vetted bank versus generated at interview time. The builder prefers a real
vetted question of a different type over a generated one of the requested type,
because with the mock provider the generated filler is generic. The bank is
deepest for Full Stack, Frontend, Backend Node, UI/UX, Graphic Design and App
Development; the specialist fields are thinner and will lean on generation at
Senior and Staff level.

## How the interview runs

1. **Consent** — every collected data category is listed, with a decline path.
2. **Check-in** — a three-step gate before the clock starts:
   - **Camera.** Live face feedback ("no face", "more than one person", "face
     detected") and a **check-in photo**, which the recruiter sees at the top of
     the review page. Without it they have flagged frames of a stranger and no
     reference to compare them against. The capture button stays disabled until
     exactly one face is in frame.
   - **Microphone.** A live level meter that requires **five consecutive loud
     samples** before it will let the candidate through, so a door slam does not
     pass a muted mic. A mic discovered dead at question three has already lost
     the spoken answers.
   - **Guide.** Navigation (next / previous / skip / the numbered jump squares /
     what submitting a section does), every monitored behaviour stated
     explicitly, and a checkbox the candidate must tick before the button
     enables.

4. **Sections** — the paper is split into sections, one per question type,
   easiest first. See below.
5. **Submission** — grading runs in the background; the admin view offers a manual
   re-grade if it does not complete.

### Sections, navigation and skipping

The paper is split into one section per question type, ordered easiest first, so
a candidate warms up on multiple choice before writing anything long.

**Inside a section** the candidate can move between questions, change answers,
skip anything to come back to, and jump straight to a question via numbered
pips that show at a glance what is still blank. Answers **autosave** on every
move, so a crashed tab or a dropped connection costs nothing.

**Between sections there is no way back.** Submitting a section stamps every
question in it, records anything blank as *skipped* rather than as an empty
answer, and advances a server-side pointer. There is no endpoint that moves it
backwards, so a replayed request or a doctored client cannot reopen a closed
section — the API returns 409. Before submitting, the candidate is told exactly
how many questions are unanswered and offered a jump link to each.

**Only the current section crosses the wire.** The rest of the paper — and every
MCQ answer key — stays on the server. That is a deliberate compromise: strict
one-question-at-a-time would be marginally harder to game, but it makes
reviewing and changing an answer impossible, which is worse for a real
assessment. Answer keys are never sent at all.

**The clock is server-authoritative.** The deadline is stamped on the session at
start; the client's countdown is cosmetic and a tampered clock changes nothing.
Question timing is measured from the server-side `servedAt`.

### Different questions every time

412 curated questions across 10 fields — every field has at least 39 — and the
builder **rotates them**. Selection ranks by
least-recently-used for that domain and difficulty over the last 60 days, then
by exact difficulty match, then by a per-session shuffle. A shuffle alone is not
enough: with a bank only just deep enough for the paper, every candidate would
still see the same set.

**Depth is what buys the variety, and it has to be depth at the right
difficulty.** A beginner paper draws only from BEGINNER and JUNIOR questions,
and an early measurement found the long-form pools there were 2, 1 and
sometimes 0 against a paper needing 2, 1 and 1 — so multiple choice rotated
freely while every candidate answered the same conceptual and scenario
questions. Entry-level long-form questions were added to close that.

Measured over five consecutive beginner candidates per field, end to end:

| | Full Stack | UI/UX | QA |
|---|---|---|---|
| Distinct questions used across 5 papers | 28 | 26 | 27 |
| Average overlap between any two papers | 2.4/10 | 2.8/10 | 2.3/10 |
| Identical papers | 0 | 0 | 0 |
| Distinct multiple choice used | 14 | 13 | 16 |
| Distinct conceptual used | 5 | 5 | 5 |
| Distinct scenario used | 4 | 4 | 3 |
| Distinct behavioural used | 5 | 4 | 3 |

The recruiter's coverage panel shows the pool for the paper being built, so a
thin combination is visible before a link is sent rather than after.

Candidate links are 32 bytes of CSPRNG entropy, **stored only as a SHA-256 hash**,
shown to the recruiter once, single-use by default, and expiring. A database leak
does not hand out working interview links. An interrupted attempt resumes without
consuming another one.

### What is detected

| Signal | Weight | How |
|---|---|---|
| Phone or tablet in frame | −20 each | COCO object detector, in-browser. Frame captured |
| Second person in frame | −18 each | Object detector — catches a body whose face is turned away or cropped, which face counting misses |
| Second face in frame | −15 each | Face mesh |
| Camera/mic stopped | −15 each | Track `ended`/`mute` events |
| Devtools suspected | −15 each | Window-geometry heuristic; easily defeated |
| Paste into an answer | −12 each | Paste is blocked *and* recorded |
| Left the interview tab | −10 each | Duration tracked |
| Superhuman typing burst | −10 each | >25 chars/sec sustained |
| Another voice in the room | −9 each | Mic energy in the speech band while the candidate's mouth is still |
| Second display attached | −8 | `screen.isExtended` |
| Silence then fluent delivery | −8 each | Words-per-minute against detected speech time |
| Face absent >2s | −6 each | Frame captured |
| Fullscreen exit / copy | −5 each | |
| Window lost focus >0.8s | −4 each | |
| Looking away >1.5s | −2 each | Head pose from face landmarks |
| Transcript hand-corrected | **−0** | Recorded for transparency, never penalised |

Each type has a cap, so one recurring nuisance cannot zero the score on its own.
A session goes to `INTEGRITY_REVIEW` when the score drops below 50 **or two
different serious signals fire** — the caps mean three independent serious
signals can otherwise still total above 50, which reads as a clean pass.

**What phone detection can and cannot see.** It sees what the webcam sees. A
phone in a lap, under the desk, or behind the monitor is invisible to it, and
moving the phone out of shot defeats it entirely. It also mistakes dark
rectangles for phones occasionally, which is why a hit captures a frame for a
human rather than ending the interview.

**What voice detection can and cannot tell.** It flags speech-band audio while
the candidate's mouth is still. That covers a person feeding answers, a phone on
speaker, and a TV — it cannot tell them apart, and it is not speaker
identification. A candidate who mutters with barely-parted lips can trip it. It
is weighted as suspicious, not serious, for that reason.

### Editable transcripts

Candidates can pause dictation, correct a mis-transcribed word, and resume.
This is deliberate: speech recognition mangles names, jargon, and accents, and
grading someone on the recogniser's mistakes would penalise an accent rather
than an answer. Edits are recorded and shown to the reviewer at **zero penalty**,
and the grader is told explicitly that a corrected transcript is not suspicious.

---

## Operational notes

- **Rate limiting is in-process.** `src/lib/http.ts` uses an in-memory map. Behind
  more than one instance it is not a security control — move it to Redis first.
- **Snapshots are on local disk** under `SNAPSHOT_DIR`, served only to
  authenticated recruiters in the owning organisation. For multi-instance
  deployments, move to S3/R2 and swap `src/lib/snapshots.ts`.
- **Background grading dies with the process.** On a serverless host, replace the
  detached `gradeSession()` call in the finish route with a queue.
- **Browser support.** Chrome or Edge on desktop. Safari and Firefox have no Web
  Speech API — the interview still runs, with spoken questions falling back to
  typing, and the session is flagged as reduced-coverage.

## Layout

```
prisma/schema.prisma          data model
prisma/question-bank.ts       curated questions across 10 fields
prisma/question-bank-extra.ts depth bank, so rotation has room to vary papers
src/lib/sections.ts           section planning and instructions
prisma/seed.ts                seeding + MCQ answer-key validation
src/lib/blueprint.ts          question-type mix, difficulty presets, time budget
src/lib/ai/                   provider adapter (types, mock, ollama)
src/lib/proctor/face.ts       face presence, head pose, mouth movement
src/lib/proctor/objects.ts    phone and second-person detection
src/lib/proctor/audio.ts      speech-band energy, background-voice logic
src/lib/proctor/monitor.ts    episode tracking, batching, snapshots
src/lib/proctor/stt.ts        dictation with pause/edit/resume
src/lib/integrity.ts          event weights -> integrity score + review rule
src/lib/questions.ts          bank selection, substitution, coverage preview
src/lib/grading.ts            per-answer scoring + session summary
src/app/admin/                recruiter UI
src/app/interview/[token]/    candidate UI (client.tsx orchestrates, section-view.tsx renders)
src/app/api/                  route handlers
```

Models are downloaded to `public/models/` by `npm run setup:models` (~18 MB
total) and served from your own origin, so the interview page never depends on a
third-party CDN at exam time.
