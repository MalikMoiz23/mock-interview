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
MediaPipe FaceLandmarker (in-browser) · Web Speech API · Anthropic Claude
(optional).

---

## Setup

PostgreSQL must be running. Node 20+.

```bash
npm install
npm run setup:models        # copies MediaPipe WASM + downloads the face model
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
| `AI_PROVIDER` | `mock` (offline) or `anthropic` |
| `ANTHROPIC_API_KEY` | Required when `AI_PROVIDER=anthropic` |
| `ANTHROPIC_MODEL` | Defaults to `claude-opus-5` |
| `SNAPSHOT_DIR` | Where violation frames are written |
| `SNAPSHOT_MAX_PER_SESSION` | Hard cap on stored frames per session |

---

## Switching on the real AI

The platform ships with `AI_PROVIDER=mock`. The mock is a **rubric keyword-coverage
heuristic** — deterministic, free, and useful for testing the flow, but it cannot
judge whether an answer is correct. Do not make hiring decisions on it.

To use Claude:

```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

Nothing else changes. With a key present, questions are **generated per session**
so two candidates for the same role never get an identical paper, and the curated
bank becomes the fallback. Answers are scored against the rubric with structured
outputs, so the grader's response is schema-validated rather than parsed out of
prose.

Adding a third provider means implementing `AIProvider` in
[`src/lib/ai/types.ts`](src/lib/ai/types.ts) and registering it in
[`src/lib/ai/index.ts`](src/lib/ai/index.ts). Nothing else in the app knows which
provider is in use.

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
2. **Device check** — camera and microphone are required; the face model and
   speech recogniser are probed and any gap is recorded on the session.
3. **Rules** — expectations stated, then fullscreen is requested.
4. **Questions** — served **one at a time**; the full paper is never in the
   browser, and an MCQ's answer key never leaves the server. Spoken questions
   transcribe live and can be corrected; typed questions use a plain text box with
   paste blocked and keystroke telemetry recorded.
5. **Submission** — grading runs in the background; the admin view offers a manual
   re-grade if it does not complete.

**The clock is server-authoritative.** The deadline is stamped on the session at
start; the client's countdown is cosmetic and a tampered clock changes nothing.
Question timing is measured from the server-side `servedAt`.

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
prisma/question-bank.ts       142 curated questions across 10 fields
prisma/seed.ts                seeding + MCQ answer-key validation
src/lib/blueprint.ts          question-type mix, difficulty presets, time budget
src/lib/ai/                   provider adapter (types, mock, anthropic)
src/lib/proctor/face.ts       face presence, head pose, mouth movement
src/lib/proctor/objects.ts    phone and second-person detection
src/lib/proctor/audio.ts      speech-band energy, background-voice logic
src/lib/proctor/monitor.ts    episode tracking, batching, snapshots
src/lib/proctor/stt.ts        dictation with pause/edit/resume
src/lib/integrity.ts          event weights -> integrity score + review rule
src/lib/questions.ts          bank selection, substitution, coverage preview
src/lib/grading.ts            per-answer scoring + session summary
src/app/admin/                recruiter UI
src/app/interview/[token]/    candidate UI
src/app/api/                  route handlers
```

Models are downloaded to `public/models/` by `npm run setup:models` (~18 MB
total) and served from your own origin, so the interview page never depends on a
third-party CDN at exam time.
