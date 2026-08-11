import type { AnswerMode, Difficulty, QuestionType } from "@prisma/client";

export type Criterion = { key: string; label: string; weight: number; keywords: string[] };

export type BankQuestion = {
  type: QuestionType;
  answerMode: AnswerMode;
  difficulty: Difficulty;
  prompt: string;
  timeLimitSec: number;
  criteria: Criterion[];
  options?: string[];
  correctIndex?: number;
  explanation?: string;
};

export type BankDomain = {
  slug: string;
  name: string;
  blurb: string;
  questions: BankQuestion[];
};

// --- Authoring helpers ------------------------------------------------------

/** Multiple choice. Auto-graded, so no rubric. */
const mcq = (
  difficulty: Difficulty,
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
  timeLimitSec = 60,
): BankQuestion => ({
  type: "MCQ",
  answerMode: "CHOICE",
  difficulty,
  prompt,
  timeLimitSec,
  criteria: [],
  options,
  correctIndex,
  explanation,
});

/** Spoken answer: CONCEPTUAL (about the field) or BEHAVIORAL (experience). */
const spoken = (
  type: "CONCEPTUAL" | "BEHAVIORAL",
  difficulty: Difficulty,
  prompt: string,
  criteria: Criterion[],
  timeLimitSec = type === "CONCEPTUAL" ? 150 : 240,
): BankQuestion => ({
  type,
  answerMode: "SPOKEN",
  difficulty,
  prompt,
  timeLimitSec,
  criteria,
});

/** Typed answer: SCENARIO (problem statement) or CODING (hands-on task). */
const typed = (
  type: "SCENARIO" | "CODING",
  difficulty: Difficulty,
  prompt: string,
  criteria: Criterion[],
  timeLimitSec = type === "SCENARIO" ? 330 : 450,
): BankQuestion => ({
  type,
  answerMode: "TYPED",
  difficulty,
  prompt,
  timeLimitSec,
  criteria,
});

const c = (key: string, label: string, weight: number, keywords: string[]): Criterion => ({
  key,
  label,
  weight,
  keywords,
});

// ---------------------------------------------------------------------------
// Full Stack Development
// ---------------------------------------------------------------------------

const FULLSTACK: BankDomain = {
  slug: "fullstack-development",
  name: "Full Stack Development",
  blurb:
    "End-to-end web applications: UI, API design, databases, auth, and deployment.",
  questions: [
    mcq(
      "BEGINNER",
      "A form submits a new user to your server. Which HTTP method is the correct choice?",
      ["GET", "POST", "HEAD", "OPTIONS"],
      1,
      "POST creates a new resource. GET is for retrieval, must not change server state, and would expose the data in the URL.",
    ),
    mcq(
      "BEGINNER",
      "Where should a database password live in a deployed web application?",
      [
        "In a config file committed to the repository",
        "In an environment variable read by the server at runtime",
        "In the frontend JavaScript so the app can connect directly",
        "Hard-coded in the source so it cannot be lost",
      ],
      1,
      "Secrets belong in the server's environment. Anything in the repository or the frontend bundle is readable by anyone who gets the code.",
    ),
    mcq(
      "BEGINNER",
      "What does a 404 status code mean?",
      [
        "The server crashed while handling the request",
        "The request was understood but the resource does not exist",
        "The user is not logged in",
        "The request took too long",
      ],
      1,
      "404 is 'not found'. 500 is a server crash, 401/403 cover authentication and permission, 408 is a timeout.",
    ),
    mcq(
      "BEGINNER",
      "Your page shows stale data after the user saves a change. What is the most likely cause?",
      [
        "The database is corrupted",
        "The UI is still rendering its cached copy and was never refreshed after the save",
        "The internet connection is too slow",
        "The browser needs to be reinstalled",
      ],
      1,
      "Almost always a client-side state problem: the write succeeded but the local copy was never invalidated or refetched.",
    ),
    mcq(
      "JUNIOR",
      "Your API returns a user list, and each row triggers a separate query for that user's orders. What is this called and why does it matter?",
      [
        "Denormalisation — it wastes disk space",
        "The N+1 query problem — one request becomes hundreds of round trips as the list grows",
        "A race condition — the queries can return out of order",
        "A memory leak — the query results are never freed",
      ],
      1,
      "N+1 is the classic ORM trap. Ten users cost eleven queries; a thousand users cost a thousand and one.",
    ),
    mcq(
      "JUNIOR",
      "Which of these belongs in server-side validation even if the frontend already checks it?",
      [
        "Nothing — duplicating the check wastes CPU",
        "All of it, because anyone can call your API directly without ever loading your frontend",
        "Only password length",
        "Only fields the designer marked as required",
      ],
      1,
      "Frontend validation is a UX convenience. The API is a public door; every rule must be enforced behind it.",
    ),
    mcq(
      "MID",
      "You add an index on `orders(customer_id)`. Which query benefits least?",
      [
        "SELECT * FROM orders WHERE customer_id = 42",
        "SELECT * FROM orders WHERE customer_id IN (1,2,3)",
        "SELECT * FROM orders WHERE total_cents > 5000",
        "SELECT count(*) FROM orders WHERE customer_id = 42",
      ],
      2,
      "The index is on customer_id, so a filter on total_cents cannot use it and still scans.",
    ),
    mcq(
      "MID",
      "Two users load the same record, both edit it, and both save. The second save silently overwrites the first. What fixes this?",
      [
        "Adding a longer timeout to the save request",
        "Optimistic concurrency: send the version the user loaded, and reject the write if it has changed",
        "Making the save endpoint faster so collisions are rarer",
        "Putting the form in a modal so only one user edits at a time",
      ],
      1,
      "This is the lost-update problem. Version or timestamp checks turn a silent overwrite into a visible conflict the user can resolve.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "In your own words, what is an API, and why do the frontend and backend talk through one instead of the frontend reading the database directly?", [
      c("definition", "Explains the contract idea clearly", 2, ["contract", "interface", "request", "response", "endpoint"]),
      c("security", "Understands the trust boundary", 3, ["security", "trust", "credential", "anyone", "expose", "validate"]),
      c("practicality", "Mentions a practical benefit", 1, ["change", "reuse", "mobile", "multiple", "logic"]),
    ]),
    spoken("CONCEPTUAL", "MID", "Explain what you understand by authentication versus authorisation, and describe a bug you could ship by confusing the two.", [
      c("distinction", "Distinguishes identity from permission", 3, ["who", "what", "identity", "permission", "allowed"]),
      c("failure", "Concrete failure mode", 3, ["another user", "id", "access", "leak", "escalat", "idor"]),
      c("implementation", "Knows where each is enforced", 2, ["middleware", "token", "session", "server", "check"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A user says: 'I clicked Save and nothing happened.' You cannot reproduce it. Write out, step by step, how you would investigate. Be specific about what you would look at first and what you would ask the user.", [
      c("method", "Has an ordered method rather than guessing", 3, ["first", "then", "check", "reproduce", "steps"]),
      c("evidence", "Looks at real evidence", 3, ["console", "network", "log", "error", "devtools", "server"]),
      c("user", "Asks the user useful questions", 2, ["browser", "what happened", "screenshot", "when", "which"]),
    ]),
    typed("SCENARIO", "MID", "Your app's signup works fine in testing but 30% of real users abandon it. Analytics show most drop-offs happen after clicking 'Create account'. Write how you would find the cause. State what data you would want and what you would rule out first.", [
      c("hypotheses", "Generates several distinct hypotheses", 3, ["slow", "error", "validation", "email", "timeout", "mobile"]),
      c("data", "Names the data that separates them", 3, ["log", "error rate", "latency", "funnel", "segment", "device"]),
      c("ruling_out", "Prioritises cheap checks first", 2, ["first", "quickest", "rule out", "check"]),
      c("bias", "Notes that testing conditions differ from real users", 1, ["real", "network", "device", "production", "differ"]),
    ]),
    typed("SCENARIO", "SENIOR", "Your team ships a feature that doubles database load overnight. The database is at 85% CPU and the on-call engineer is paging you. Write what you do in the first 30 minutes, and then what you do in the following week. Separate the two clearly.", [
      c("triage", "Stabilises before investigating", 3, ["rollback", "disable", "flag", "mitigat", "shed", "first"]),
      c("diagnosis", "Evidence-driven root cause", 3, ["slow query", "explain", "index", "n+1", "metric", "trace"]),
      c("separation", "Distinguishes mitigation from fix", 3, ["short term", "long term", "then", "permanent", "root"]),
      c("prevention", "Durable prevention", 2, ["load test", "review", "alert", "budget", "limit"]),
    ]),
    typed("CODING", "JUNIOR", "Write a server-side handler that registers a user from `{ email, password }`. Validate the input, reject duplicates, store the password safely, and return an appropriate status code for each outcome. Comment on why you store the password the way you do.", [
      c("validation", "Validates before touching the database", 3, ["valid", "email", "length", "400", "if"]),
      c("hashing", "Hashes, never stores plaintext", 3, ["hash", "bcrypt", "argon", "salt", "never"]),
      c("duplicates", "Handles the existing-email case", 2, ["exists", "409", "unique", "duplicate"]),
      c("responses", "Correct status codes", 2, ["201", "400", "409", "status"]),
    ]),
    typed("CODING", "MID", "Write a paginated API endpoint for a list of posts. Handle a page size the client controls, avoid the performance trap of large offsets, and comment on what breaks if a new post is inserted while the user is paging.", [
      c("pagination", "Working pagination", 3, ["limit", "cursor", "offset", "page", "next"]),
      c("cursor", "Understands why offset degrades", 3, ["cursor", "keyset", "offset", "scan", "slow", "after"]),
      c("bounds", "Bounds the client-supplied page size", 2, ["max", "cap", "min", "100"]),
      c("consistency", "Notes the shifting-window problem", 2, ["insert", "shift", "duplicate", "skip", "stable"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a feature you built end to end — from the interface through to the data. What was the hardest part, and how did you work it out?", [
      c("ownership", "Genuinely built it themselves", 2, ["i built", "i wrote", "my", "decided"]),
      c("breadth", "Covers both ends of the stack", 2, ["frontend", "backend", "database", "api"]),
      c("problem", "Real difficulty with a real resolution", 3, ["stuck", "bug", "figured", "tried", "worked"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Describe a time you disagreed with a technical decision on your team. What was the disagreement, how did you handle it, and what happened in the end?", [
      c("substance", "The disagreement was technical, not personal", 3, ["because", "risk", "performance", "maintain", "data"]),
      c("conduct", "Handled it constructively", 3, ["listened", "proposed", "evidence", "prototype", "discussed"]),
      c("outcome", "Accepts outcomes they did not win", 2, ["went with", "agreed", "wrong", "learned", "committed"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about a system you owned that you had to keep running while significantly changing it. What was the risk, and how did you sequence the work?", [
      c("risk", "Names the specific risk", 3, ["downtime", "data", "customer", "revenue", "corrupt"]),
      c("sequencing", "Incremental, reversible steps", 3, ["incremental", "phase", "flag", "dual", "shadow", "rollback"]),
      c("verification", "Verified at each step", 2, ["compare", "monitor", "metric", "canary", "test"]),
    ]),
  ],
};

// ---------------------------------------------------------------------------
// UI/UX Design
// ---------------------------------------------------------------------------

const UIUX: BankDomain = {
  slug: "uiux-design",
  name: "UI/UX Design",
  blurb:
    "Product thinking, interaction and interface design, usability research, accessibility, design systems.",
  questions: [
    mcq(
      "BEGINNER",
      "A user fills in a long form and one field is invalid on submit. What is the best way to communicate the error?",
      [
        "A single alert at the top saying 'Form invalid'",
        "An inline message next to the field, describing what is wrong and how to fix it",
        "Colour the field red with no message",
        "Clear the form so the user can start again",
      ],
      1,
      "Errors should be next to the thing that is wrong, say what is wrong, and say how to fix it. Colour alone also fails colour-blind users.",
    ),
    mcq(
      "BEGINNER",
      "Why is colour alone a poor way to convey meaning in an interface?",
      [
        "Colours look different on different screens",
        "Roughly 1 in 12 men cannot reliably distinguish some colour pairs, so the meaning is lost",
        "Colour makes files larger",
        "Designers disagree about colour",
      ],
      1,
      "Colour must be paired with text, icon, or shape. This is a WCAG requirement, not a preference.",
    ),
    mcq(
      "BEGINNER",
      "What is the main purpose of a wireframe?",
      [
        "To choose the final colours and typography",
        "To agree on structure, hierarchy, and flow before anyone invests in visual detail",
        "To hand developers production-ready assets",
        "To satisfy a documentation requirement",
      ],
      1,
      "Wireframes are cheap to change. Their job is to settle layout and flow while changes still cost minutes.",
    ),
    mcq(
      "BEGINNER",
      "A stakeholder says 'make the button pop more'. What is the most useful first response?",
      [
        "Increase the size and saturation immediately",
        "Ask what problem they are seeing — are users missing it, or is this a taste preference?",
        "Explain that the design is already final",
        "Add an animation to draw attention",
      ],
      1,
      "'Pop more' is a proposed solution, not a problem. The job is to find the underlying issue before changing anything.",
    ),
    mcq(
      "JUNIOR",
      "What does WCAG require as the minimum contrast ratio for normal body text?",
      ["2:1", "3:1", "4.5:1", "7:1"],
      2,
      "4.5:1 is the AA minimum for body text. Large text may drop to 3:1, and 7:1 is the stricter AAA level.",
    ),
    mcq(
      "JUNIOR",
      "Five users test your checkout and three fail at the same step. What is the correct conclusion?",
      [
        "Nothing — five users is too small to conclude anything",
        "There is a real usability problem at that step worth fixing and re-testing",
        "60% of all users will fail there",
        "The three users were not paying attention",
      ],
      1,
      "Small qualitative tests find problems reliably; they do not measure how common the problem is. Do not turn 3 of 5 into a percentage.",
    ),
    mcq(
      "MID",
      "Your design system component does not fit a new use case. What is usually the right first move?",
      [
        "Fork the component locally so the team is not blocked",
        "Understand whether the use case is genuinely new, and if so extend the component with the team",
        "Redesign the whole system around the new case",
        "Tell the requesting team the use case is invalid",
      ],
      1,
      "Silent forks are how design systems die. Either the case is a variant worth adding, or the design should change to fit — both need the conversation.",
    ),
    mcq(
      "MID",
      "An A/B test shows the new checkout increases conversion by 2% but support tickets about billing double. What should you conclude?",
      [
        "Ship it — conversion is the primary metric",
        "The test is measuring one outcome and missing a cost; investigate before shipping",
        "Discard the test as invalid",
        "Ship it and add more support staff",
      ],
      1,
      "A metric that improves while a related cost rises usually means the design shifted the burden rather than removing it.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "What is the difference between UI and UX in your own words? Give an example of a product with a beautiful interface but poor experience.", [
      c("distinction", "Clear, non-cliché distinction", 3, ["interface", "experience", "flow", "look", "feel", "journey"]),
      c("example", "Concrete example, not abstract", 3, ["app", "site", "when i", "for example", "tried"]),
      c("reasoning", "Explains why the example fails", 2, ["because", "confus", "slow", "hidden", "steps"]),
    ]),
    spoken("CONCEPTUAL", "MID", "Explain how you decide when a design needs user research versus when you can decide from principles and ship. Give an example of each.", [
      c("judgement", "Has a real decision rule", 3, ["cost", "risk", "reversible", "unknown", "assumption"]),
      c("research", "Knows what research answers", 3, ["behaviour", "why", "observe", "test", "interview"]),
      c("examples", "Gives one of each", 2, ["for example", "we shipped", "we tested"]),
    ]),
    typed("SCENARIO", "BEGINNER", "Users abandon your 4-step signup at step 2, which asks for their company name, size, industry, and role. Write what you would change and why. Explain how you would know your change worked.", [
      c("diagnosis", "Questions whether the fields are needed", 3, ["why", "needed", "remove", "later", "optional", "required"]),
      c("change", "Concrete, specific change", 3, ["remove", "defer", "progress", "split", "default"]),
      c("measurement", "Says how success is measured", 3, ["completion", "drop", "measure", "compare", "before"]),
    ]),
    typed("SCENARIO", "MID", "A product manager asks for a dashboard showing 'all the key metrics'. There are 40 candidate metrics and one screen. Write how you would approach this, including how you decide what does not go on the screen.", [
      c("questions", "Starts from user and decision, not metrics", 3, ["who", "decision", "action", "what will they do", "goal"]),
      c("prioritisation", "Has a method for cutting", 3, ["hierarchy", "primary", "drill", "secondary", "remove"]),
      c("structure", "Proposes a concrete structure", 2, ["top", "layout", "group", "section", "detail"]),
      c("pushback", "Willing to say no to the request as stated", 2, ["not all", "cannot", "instead", "push back"]),
    ]),
    typed("SCENARIO", "SENIOR", "You inherit a product with no design system, six engineers shipping inconsistent UI, and no appetite from leadership for a 'design system project'. Write how you would proceed over the next quarter.", [
      c("pragmatism", "Works without a big-bang project", 3, ["incremental", "alongside", "existing", "gradual", "start"]),
      c("leverage", "Picks high-leverage components first", 3, ["button", "form", "most used", "audit", "common"]),
      c("buyin", "Builds the case in their language", 3, ["time", "speed", "cost", "show", "evidence", "ship"]),
      c("adoption", "Thinks about how engineers actually adopt it", 2, ["documentation", "code", "pair", "easy", "default"]),
    ]),
    typed("CODING", "JUNIOR", "Write the complete specification for an error state on a data table that failed to load: what the user sees, what text it says, what actions are offered, and what happens on a retry that also fails. Be precise enough that an engineer could build it without asking you anything.", [
      c("completeness", "Covers visual, copy, and actions", 3, ["message", "button", "icon", "layout", "retry"]),
      c("copy", "Actual user-facing words, not placeholders", 3, ["\"", "'", "says", "text:"]),
      c("edge", "Handles the repeated-failure case", 3, ["again", "second", "persist", "support", "contact"]),
      c("tone", "Blames the system, not the user", 1, ["we", "sorry", "our", "try"]),
    ]),
    typed("CODING", "MID", "Specify the complete interaction for an autocomplete search field: keyboard behaviour, loading state, empty results, selection, and how it works for a screen-reader user. Precision matters more than length.", [
      c("keyboard", "Full keyboard model", 3, ["arrow", "enter", "escape", "tab", "focus"]),
      c("states", "All the states, not just the happy path", 3, ["loading", "empty", "no results", "error", "min characters"]),
      c("a11y", "Screen reader support is specific", 3, ["aria", "announce", "role", "live", "label"]),
      c("timing", "Handles debounce and stale responses", 2, ["debounce", "delay", "race", "stale", "cancel"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a design of yours that users struggled with. How did you find out, and what did you do?", [
      c("honesty", "Admits a real failure", 3, ["did not work", "struggled", "wrong", "confused"]),
      c("discovery", "Found out through evidence", 2, ["test", "watched", "feedback", "support", "data"]),
      c("response", "Changed the design in response", 3, ["changed", "redesign", "simplified", "removed"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Describe a time you had to defend a design decision against a stakeholder who wanted something different. What was the argument, and what happened?", [
      c("position", "Had a reasoned position", 3, ["because", "user", "data", "test", "principle"]),
      c("listening", "Took the stakeholder seriously", 2, ["their", "concern", "understood", "business"]),
      c("outcome", "Honest about the result", 2, ["compromise", "changed", "shipped", "lost", "agreed"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about a time you changed how a team worked, not just what they shipped. What did you change and how did it stick?", [
      c("scope", "Process or practice, not a single design", 3, ["process", "review", "ritual", "handoff", "team"]),
      c("resistance", "Handles resistance realistically", 3, ["pushback", "sceptic", "resistant", "convinced", "slow"]),
      c("durability", "Explains why it lasted", 2, ["still", "stuck", "adopted", "after i", "habit"]),
    ]),
  ],
};

// ---------------------------------------------------------------------------
// Graphic Design
// ---------------------------------------------------------------------------

const GRAPHIC: BankDomain = {
  slug: "graphic-design",
  name: "Graphic Design",
  blurb:
    "Visual identity, typography, layout and composition, colour, print and digital production.",
  questions: [
    mcq(
      "BEGINNER",
      "You are designing a logo that must work on a billboard and on a favicon. Which format should the master artwork be?",
      ["JPEG at maximum quality", "Vector (SVG or AI)", "PNG at 4000px wide", "GIF"],
      1,
      "Vector artwork is resolution-independent, so one master scales from favicon to billboard without loss.",
    ),
    mcq(
      "BEGINNER",
      "Which colour mode should a file destined for commercial printing use?",
      ["RGB", "CMYK", "HSL", "Indexed colour"],
      1,
      "Print uses CMYK inks. Designing in RGB and converting late causes bright colours to shift unexpectedly on press.",
    ),
    mcq(
      "BEGINNER",
      "What is 'bleed' in print production?",
      [
        "The gap between columns of text",
        "Artwork extended past the trim line so trimming never leaves a white edge",
        "Ink spreading into the paper fibres",
        "The margin reserved for binding",
      ],
      1,
      "Cutting machines have tolerance. Bleed — usually 3mm — means a slightly off cut still lands inside your artwork.",
    ),
    mcq(
      "BEGINNER",
      "You have two typefaces in a layout and it looks cluttered. Which pairing usually works best?",
      [
        "Two similar sans-serifs at the same weight",
        "One typeface for headings and one for body, clearly different in character but sharing proportions",
        "Four typefaces so each section is distinct",
        "One typeface used at exactly one size throughout",
      ],
      1,
      "Contrast should be obvious, not slight. Two near-identical faces read as a mistake; four faces read as noise.",
    ),
    mcq(
      "JUNIOR",
      "A client sends a 600×400px logo to place across the top of an A4 poster. What do you do?",
      [
        "Upscale it in Photoshop and sharpen",
        "Ask for the vector master or a print-resolution file before starting",
        "Use it at 600px wide and design around it",
        "Trace it by eye and use your version without telling them",
      ],
      1,
      "Upscaling raster art invents detail that was never there. Asking costs one email; a blurry printed poster costs a reprint.",
    ),
    mcq(
      "JUNIOR",
      "What does kerning adjust?",
      [
        "The space between all letters uniformly",
        "The space between two specific adjacent characters",
        "The vertical space between lines",
        "The width of each character",
      ],
      1,
      "Kerning is pairwise. Uniform letter spacing is tracking; vertical line spacing is leading.",
    ),
    mcq(
      "MID",
      "A brand guideline specifies a single accent colour that fails contrast against white for small text. What is the right response?",
      [
        "Use it anyway — brand consistency comes first",
        "Propose an accessible tint or tone of the brand colour for text use, keeping the original for large graphics",
        "Replace the brand colour entirely",
        "Only use the colour in print, never on screen",
      ],
      1,
      "Brands routinely need an accessible text variant. It keeps the identity intact while making the text legible.",
    ),
    mcq(
      "MID",
      "Why does a grid help a layout even when the final design does not look grid-like?",
      [
        "It makes files smaller",
        "It gives alignment decisions a reason, so spacing looks intentional rather than arbitrary",
        "It is required by print vendors",
        "It guarantees the design will be original",
      ],
      1,
      "A grid is scaffolding for decisions. Even when you break it, breaking a system deliberately reads differently from having no system.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "Explain what visual hierarchy means and how you create it. Use a piece of your own work as the example.", [
      c("definition", "Understands hierarchy as guiding attention", 3, ["first", "attention", "order", "eye", "important"]),
      c("tools", "Names the tools that create it", 3, ["size", "weight", "colour", "space", "contrast", "position"]),
      c("example", "Grounded in real work", 2, ["i designed", "poster", "my", "project"]),
    ]),
    spoken("CONCEPTUAL", "MID", "A brand identity is more than a logo. Explain what else it includes and why consistency across those elements matters commercially.", [
      c("breadth", "Names several identity components", 3, ["typography", "colour", "tone", "photography", "layout", "voice"]),
      c("system", "Understands it as a system", 3, ["system", "consistent", "recognis", "together", "rules"]),
      c("commercial", "Connects to business value", 2, ["trust", "recognition", "customer", "value", "brand equity"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A client rejects your first concept with 'I just don't like it.' Write exactly what you would say or ask next, and what you would bring to the follow-up meeting.", [
      c("questions", "Converts taste into specifics", 3, ["what", "which", "specific", "part", "feel", "compare"]),
      c("professionalism", "Not defensive", 2, ["understand", "help me", "thanks", "happy to"]),
      c("preparation", "Brings something concrete back", 3, ["options", "direction", "reference", "moodboard", "two"]),
    ]),
    typed("SCENARIO", "MID", "You are given a 2-day deadline for a campaign that needs 14 assets across print and social. Write how you would approach it, including what you would negotiate and what you would refuse to compromise on.", [
      c("system", "Builds a reusable system rather than 14 one-offs", 3, ["template", "master", "system", "reuse", "component"]),
      c("negotiation", "Negotiates scope explicitly", 3, ["ask", "reduce", "priorit", "which", "phase", "negotiate"]),
      c("nonnegotiable", "Holds a line on something real", 3, ["legibility", "resolution", "bleed", "brand", "will not"]),
      c("sequencing", "Sensible order of work", 2, ["first", "then", "start", "order"]),
    ]),
    typed("SCENARIO", "SENIOR", "A company with no visual consistency across 5 product lines asks you to 'unify the brand' with no budget for a full rebrand. Write your plan.", [
      c("audit", "Starts by understanding what exists", 3, ["audit", "inventory", "existing", "collect", "review"]),
      c("leverage", "Finds the cheapest high-impact changes", 3, ["typography", "colour", "template", "first", "quick"]),
      c("constraint", "Works within the real constraint", 3, ["no budget", "phase", "incremental", "existing", "without"]),
      c("governance", "Thinks about how it stays consistent", 2, ["guideline", "template", "who", "maintain", "document"]),
    ]),
    typed("CODING", "JUNIOR", "Write the complete typographic specification for a two-page A4 print brochure: typefaces, sizes, weights, leading, margins, and grid. Be precise enough that another designer could set it without asking you anything.", [
      c("precision", "Real numbers with units", 3, ["pt", "mm", "px", "/", "size"]),
      c("hierarchy", "Covers heading through caption", 3, ["h1", "heading", "body", "caption", "subhead"]),
      c("grid", "Defines the grid and margins", 3, ["column", "margin", "gutter", "grid", "baseline"]),
      c("print", "Print-aware choices", 2, ["bleed", "cmyk", "300", "trim"]),
    ]),
    typed("CODING", "MID", "Critique this brief: 'Design a modern, clean, professional logo for a tech startup. Make it memorable.' Write what is wrong with it and rewrite it into a brief you could actually work from.", [
      c("critique", "Identifies the missing substance", 3, ["subjective", "vague", "modern", "means", "no audience", "what does"]),
      c("missing", "Names what a real brief needs", 3, ["audience", "competitor", "context", "where", "usage", "constraint"]),
      c("rewrite", "Produces a genuinely better brief", 3, ["who", "used on", "must", "avoid", "success"]),
      c("measurable", "Makes success checkable", 2, ["measure", "test", "criteria", "recognis"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Walk me through a piece of work in your portfolio: what the brief was, what decisions you made, and what you would change now.", [
      c("brief", "States the actual constraint", 2, ["brief", "client", "needed", "audience"]),
      c("decisions", "Explains choices, not just describes the visual", 3, ["chose", "because", "decided", "instead"]),
      c("reflection", "Honest about what is weak", 3, ["would change", "now", "weak", "better"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Tell me about a time you received feedback you strongly disagreed with. What did you do?", [
      c("specifics", "A real, specific instance", 3, ["client", "said", "wanted", "feedback"]),
      c("handling", "Engaged rather than complied silently or dug in", 3, ["asked", "explained", "showed", "discussed", "presented"]),
      c("outcome", "Honest ending", 2, ["ended up", "agreed", "changed", "kept", "learned"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Describe a time your design work had to serve a business goal you personally found uninspiring. How did you handle it?", [
      c("maturity", "Takes the business goal seriously", 3, ["business", "goal", "revenue", "purpose", "understood"]),
      c("craft", "Kept quality up regardless", 2, ["still", "quality", "care", "best"]),
      c("agency", "Found a way to make it better", 2, ["proposed", "improved", "suggested", "found"]),
    ]),
  ],
};

// ---------------------------------------------------------------------------
// App Development (Mobile)
// ---------------------------------------------------------------------------

const APPDEV: BankDomain = {
  slug: "app-development",
  name: "App Development (Mobile)",
  blurb:
    "iOS, Android, React Native and Flutter apps: lifecycle, state, offline behaviour, performance, store release.",
  questions: [
    mcq(
      "BEGINNER",
      "Your app fetches data when a screen opens. The user opens it on a train with no signal. What should happen?",
      [
        "The app crashes so the user knows something is wrong",
        "A clear message explains there is no connection, with a way to retry",
        "The screen stays blank",
        "The app retries silently forever",
      ],
      1,
      "Offline is a normal state on mobile, not an error case. A blank screen and an infinite spinner are both failures.",
    ),
    mcq(
      "BEGINNER",
      "Where should an API key that your mobile app uses to call your backend be stored?",
      [
        "Hard-coded in the app — the code is compiled so nobody can read it",
        "Nowhere in the app; the app should authenticate as the user and let your server hold the secret",
        "In the app's local database",
        "In a comment so it is easy to update",
      ],
      1,
      "Compiled apps are trivially decompiled. Any secret shipped in a binary is a public secret.",
    ),
    mcq(
      "BEGINNER",
      "What is the main reason to test on a real device rather than only a simulator?",
      [
        "Simulators cannot run the app",
        "Real devices show actual performance, memory limits, network conditions, and touch behaviour",
        "Simulators are not allowed in app stores",
        "Real devices compile faster",
      ],
      1,
      "Simulators run on desktop hardware. They hide exactly the constraints — CPU, memory, battery, flaky networks — that break mobile apps.",
    ),
    mcq(
      "BEGINNER",
      "A user reports the app 'uses too much battery'. Which is the most likely culprit?",
      [
        "Too many images in the app bundle",
        "Frequent background work such as location updates, polling, or wake locks",
        "The app being written in the wrong language",
        "Having too many screens",
      ],
      1,
      "Battery drain is almost always about what runs when the screen is off: location, network polling, and wake locks.",
    ),
    mcq(
      "JUNIOR",
      "Your app's list screen stutters while scrolling through 500 items with images. What is the most likely cause?",
      [
        "Too many items in the underlying array",
        "Every row is being built and its image decoded on the main thread instead of being recycled and loaded off-thread",
        "The device is too old to scroll",
        "The list needs a faster animation curve",
      ],
      1,
      "Jank on scroll is a main-thread problem. Recycling, fixed row sizes, and off-thread image decoding are the standard fixes.",
    ),
    mcq(
      "JUNIOR",
      "The user rotates the device mid-form and their input disappears. What happened?",
      [
        "The keyboard cleared the fields",
        "The screen was recreated on configuration change and the state was not preserved",
        "Rotation is not supported on that device",
        "The form submitted itself",
      ],
      1,
      "Rotation destroys and rebuilds the screen on Android. State must live somewhere that survives it.",
    ),
    mcq(
      "MID",
      "Users on poor networks see duplicate orders. Each tap on 'Pay' sends a request. What is the correct fix?",
      [
        "Disable the button for two seconds after the first tap",
        "Send an idempotency key with the request so the server treats a retry as the same operation",
        "Show a warning telling users not to tap twice",
        "Increase the request timeout",
      ],
      1,
      "Disabling the button helps the UI but does not survive a retry after a dropped response. Correctness has to be enforced server-side.",
    ),
    mcq(
      "MID",
      "You ship a critical bug to the app store. What is the fastest legitimate route to protect users?",
      [
        "Submit a fix and wait for review",
        "Use a server-side flag or config to disable the broken feature immediately, then ship the fix",
        "Ask users to uninstall the app",
        "Push a silent update bypassing review",
      ],
      1,
      "Mobile releases are gated by review, so remote configuration is the only fast lever. This is why risky features ship behind flags.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "Explain what happens to a mobile app when the user switches to another app and comes back ten minutes later. What does that mean for how you write code?", [
      c("lifecycle", "Understands background and termination", 3, ["background", "suspend", "kill", "memory", "resume", "lifecycle"]),
      c("consequence", "Draws a coding consequence", 3, ["save", "state", "restore", "persist", "reload"]),
      c("examples", "Gives a concrete example", 2, ["form", "video", "timer", "download", "screen"]),
    ]),
    spoken("CONCEPTUAL", "MID", "Explain how you think about offline support in a mobile app. What is worth making work offline, and what is not?", [
      c("judgement", "Has a rule rather than 'everything'", 3, ["read", "write", "sync", "worth", "cost", "critical"]),
      c("conflicts", "Recognises sync conflicts", 3, ["conflict", "merge", "last write", "queue", "resolve"]),
      c("ux", "Considers what the user sees", 2, ["indicator", "pending", "stale", "show"]),
    ]),
    typed("SCENARIO", "BEGINNER", "Your app works perfectly on your phone but a tester reports it 'freezes on login'. Write step by step how you would investigate, given you cannot reproduce it.", [
      c("questions", "Gathers device and context detail", 3, ["device", "os", "version", "network", "when", "which"]),
      c("evidence", "Uses logs and crash reports", 3, ["log", "crash", "console", "report", "adb", "trace"]),
      c("hypotheses", "Considers network and slow devices", 2, ["slow", "timeout", "offline", "older", "memory"]),
    ]),
    typed("SCENARIO", "MID", "Your app's crash rate jumps from 0.2% to 3% after a release, concentrated on Android 12 devices. Write what you do, in order, and how you decide whether to roll back.", [
      c("triage", "Prioritises stopping the bleeding", 3, ["halt", "rollback", "staged", "pause", "percent"]),
      c("diagnosis", "Uses crash grouping and device data", 3, ["stack", "crashlytics", "group", "device", "reproduce"]),
      c("decision", "Has a rollback criterion", 3, ["if", "threshold", "criteria", "decide", "rollback when"]),
      c("communication", "Tells the right people", 1, ["inform", "team", "support", "stakeholder"]),
    ]),
    typed("SCENARIO", "SENIOR", "You own an app with 2 million users, a 6-week release cycle, and a growing crash rate nobody can pin down. Leadership wants new features. Write how you would handle the next quarter.", [
      c("evidence", "Makes the problem visible with data", 3, ["metric", "crash rate", "dashboard", "measure", "baseline"]),
      c("tradeoff", "Argues the business case for stability", 3, ["churn", "review", "rating", "revenue", "cost", "retention"]),
      c("mechanism", "Changes the system, not just the sprint", 3, ["release", "flag", "staged", "test", "automation", "budget"]),
      c("delivery", "Still ships something", 2, ["parallel", "alongside", "also", "feature"]),
    ]),
    typed("CODING", "JUNIOR", "Write a screen component that loads a list from an API. Handle loading, empty, error, and success states, and make sure a slow response that arrives after the user navigates away does not cause a problem. Comment on that last part.", [
      c("states", "All four states handled", 3, ["loading", "error", "empty", "success", "if"]),
      c("cleanup", "Cancels or guards the late response", 3, ["cancel", "abort", "unmount", "mounted", "cleanup", "dispose"]),
      c("errors", "Error path is usable, not a blank screen", 2, ["retry", "message", "try again"]),
      c("structure", "Readable component structure", 1, ["return", "function", "widget", "state"]),
    ]),
    typed("CODING", "MID", "Write the logic that queues user actions while offline and syncs them when the connection returns. Comment on what happens if the same action is queued twice, and what happens if the sync fails halfway.", [
      c("queue", "Durable queue, not in-memory only", 3, ["storage", "persist", "database", "queue", "disk"]),
      c("idempotency", "Duplicate handling", 3, ["idempot", "id", "duplicate", "unique", "once"]),
      c("partial", "Handles partial failure", 3, ["retry", "partial", "resume", "failed", "remaining"]),
      c("ordering", "Considers ordering", 1, ["order", "sequence", "fifo"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about an app you built or worked on. What was the hardest platform-specific problem you hit?", [
      c("specificity", "A genuinely mobile problem", 3, ["permission", "lifecycle", "battery", "store", "device", "notification"]),
      c("process", "Worked it out methodically", 3, ["tried", "logged", "tested", "read", "found"]),
      c("outcome", "Reached a resolution", 2, ["fixed", "worked", "shipped", "solved"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Describe a time a release went badly. What did you learn about your release process?", [
      c("honesty", "Real failure, owned", 3, ["broke", "crash", "bug", "we shipped", "my"]),
      c("impact", "Knows the user impact", 2, ["users", "percent", "reviews", "support"]),
      c("process", "Changed the process, not just the code", 3, ["staged", "rollout", "test", "review", "flag", "since then"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about a technical decision you made in an app that you had to live with for years. Was it the right call?", [
      c("decision", "Explains the decision and its context", 3, ["chose", "framework", "architecture", "at the time", "because"]),
      c("longevity", "Reflects on the long-term cost", 3, ["years", "later", "cost", "maintain", "migrat"]),
      c("honesty", "Genuine assessment either way", 2, ["right", "wrong", "would", "regret", "held up"]),
    ]),
  ],
};

// ---------------------------------------------------------------------------
// Frontend — React / TypeScript
// ---------------------------------------------------------------------------

const FRONTEND: BankDomain = {
  slug: "frontend-react",
  name: "Frontend — React / TypeScript",
  blurb: "Component architecture, state management, rendering performance, accessibility.",
  questions: [
    mcq(
      "BEGINNER",
      "Why does React need a `key` when rendering a list?",
      [
        "To sort the list alphabetically",
        "To identify which items changed so it can update the DOM correctly instead of rebuilding everything",
        "To make the list accessible to screen readers",
        "To prevent duplicate items",
      ],
      1,
      "Keys let React match elements between renders. Using the array index as a key breaks when items are reordered, inserted, or removed.",
    ),
    mcq(
      "BEGINNER",
      "What happens if you call `setState` inside a component body during render?",
      [
        "The state updates immediately and rendering continues",
        "It causes an infinite render loop",
        "React ignores it silently",
        "It only works in development",
      ],
      1,
      "Setting state during render triggers another render, which sets state again. State changes belong in effects or event handlers.",
    ),
    mcq(
      "BEGINNER",
      "Which is the correct way to update an array in state?",
      [
        "items.push(newItem); setItems(items)",
        "setItems([...items, newItem])",
        "items = [...items, newItem]",
        "setItems(items.push(newItem))",
      ],
      1,
      "State must be replaced, not mutated. Pushing into the existing array keeps the same reference, so React sees no change.",
    ),
    mcq(
      "BEGINNER",
      "What does `useEffect` with an empty dependency array do?",
      [
        "Runs on every render",
        "Runs once after the first render",
        "Never runs",
        "Runs only when the component unmounts",
      ],
      1,
      "An empty array means no dependencies to watch, so the effect runs once on mount and its cleanup runs on unmount.",
    ),
    mcq(
      "JUNIOR",
      "A parent re-renders on every keystroke and its 200 expensive children re-render too. Which fix addresses the actual cause?",
      [
        "Wrapping every child in React.memo and moving on",
        "Moving the input's state down into a smaller component so the expensive subtree stops re-rendering",
        "Adding a key to each child",
        "Switching to a class component",
      ],
      1,
      "Memoisation patches the symptom. Colocating state so the expensive subtree is not under the changing state is the structural fix.",
    ),
    mcq(
      "JUNIOR",
      "What is the accessibility problem with `<div onClick={...}>Submit</div>`?",
      [
        "Divs cannot have click handlers",
        "It is not focusable, not announced as a button, and cannot be activated by keyboard",
        "It will not work on mobile",
        "The styling cannot be changed",
      ],
      1,
      "A real `<button>` gives you focus, keyboard activation, and the correct role for free. Recreating those on a div is work you will get wrong.",
    ),
    mcq(
      "MID",
      "Your bundle grew from 200KB to 900KB after adding a date library and a chart library. What is the first thing to check?",
      [
        "Whether the server has enough bandwidth",
        "Whether you are importing the whole library instead of only the parts you use, and whether either can be code-split",
        "Whether users have fast enough devices",
        "Whether to switch bundlers",
      ],
      1,
      "Barrel imports and non-tree-shakeable libraries are the usual cause. Route-level code splitting handles what remains.",
    ),
    mcq(
      "MID",
      "A `useEffect` fetches data and sets state. The component unmounts before the fetch resolves. What is the risk?",
      [
        "The fetch continues and its result is set on an unmounted component, wasting work and potentially overwriting newer state",
        "The browser crashes",
        "The fetch is automatically cancelled by React",
        "The data is cached forever",
      ],
      0,
      "React no longer warns about this, but the wasted work and race with a newer request are real. Use AbortController or a mounted guard.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "Explain what state is in a React component, and how you decide whether something should be state, a prop, or just a computed value.", [
      c("definition", "Understands state as changing data owned by a component", 2, ["change", "over time", "owns", "render", "update"]),
      c("distinction", "Distinguishes props from state", 3, ["prop", "parent", "passed", "own"]),
      c("derived", "Knows not to store derived values", 3, ["calculate", "derive", "compute", "from", "duplicate"]),
    ]),
    spoken("CONCEPTUAL", "MID", "Explain the difference between client-side and server-side rendering, and how you would decide which to use for a given page.", [
      c("mechanics", "Explains where HTML is produced", 3, ["server", "browser", "html", "javascript", "hydrate"]),
      c("tradeoffs", "Real trade-offs", 3, ["seo", "first paint", "ttfb", "interactive", "cost", "cache"]),
      c("decision", "Has a decision rule", 2, ["depends", "public", "dashboard", "logged in", "content"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A page takes 6 seconds to become usable on a mid-range phone but feels fine on your laptop. Write how you would investigate and what you would try first.", [
      c("measurement", "Measures on realistic hardware", 3, ["throttl", "device", "lighthouse", "profil", "network", "measure"]),
      c("causes", "Names plausible causes", 3, ["bundle", "javascript", "image", "render", "request", "blocking"]),
      c("prioritisation", "Starts with the biggest win", 2, ["first", "biggest", "quick"]),
    ]),
    typed("SCENARIO", "MID", "Your team's component library has 40 components and engineers keep writing their own instead of using them. Write what you would do to find out why and fix it.", [
      c("diagnosis", "Investigates rather than mandating", 3, ["ask", "why", "talk", "find out", "survey"]),
      c("causes", "Considers real causes", 3, ["discover", "documentation", "flexible", "props", "does not fit", "slow"]),
      c("fix", "Concrete change", 3, ["document", "example", "extend", "api", "easier"]),
    ]),
    typed("CODING", "JUNIOR", "Write a React component that fetches and displays a user profile by ID. Handle loading, error and success, and make sure switching to a different ID quickly does not display the wrong user's data.", [
      c("states", "Handles all three states", 3, ["loading", "error", "data", "if"]),
      c("race", "Handles the out-of-order response", 3, ["abort", "cancel", "ignore", "stale", "cleanup", "current"]),
      c("effect", "Correct dependencies", 2, ["useeffect", "[", "id", "dependency"]),
      c("types", "Typed", 1, ["type", "interface", ":"]),
    ]),
    typed("CODING", "MID", "A list of 10,000 rows re-renders on every keystroke in a search box above it, and typing is visibly laggy. Write the code changes you would make, and comment on which change you would ship first and why.", [
      c("diagnosis", "Names the actual cause of the re-render", 3, ["re-render", "parent", "state", "reference"]),
      c("virtualisation", "Reaches for windowing on 10k rows", 3, ["virtual", "window", "visible", "slice"]),
      c("memo", "Correct use of memo/useMemo/useCallback", 2, ["memo", "usememo", "usecallback"]),
      c("prioritisation", "Sequences the fixes by impact", 2, ["first", "biggest", "cheapest", "ship"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a React component you built that turned out harder than expected. What made it hard, and how did you get it working?", [
      c("problem", "Describes the actual difficulty concretely", 2, ["state", "prop", "render", "bug", "because"]),
      c("process", "Shows a debugging process, not guesswork", 3, ["console", "devtools", "isolated", "reproduce", "logged"]),
      c("learning", "Names what they would do differently", 2, ["next time", "learned", "instead", "now i"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Describe a time a page you owned was slow. Walk me through how you found the cause and what you changed. Be specific about how you measured the improvement.", [
      c("measurement", "Measured before changing anything", 3, ["profiler", "lighthouse", "devtools", "metric", "ms", "measured"]),
      c("diagnosis", "Identified a real root cause", 3, ["re-render", "bundle", "waterfall", "memo", "network", "layout"]),
      c("outcome", "Quantifies the result", 2, ["reduced", "from", "to", "%", "seconds"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about a frontend architecture decision you made that you later regretted. What went wrong, and how did you deal with it?", [
      c("ownership", "Owns the decision rather than deflecting", 3, ["i decided", "my call", "i chose", "mistake"]),
      c("consequence", "Concrete downstream cost", 2, ["migration", "rewrite", "team", "slow", "bug"]),
      c("recovery", "Describes the remediation path", 3, ["incremental", "strangler", "deprecated", "migrated"]),
    ]),
  ],
};

// ---------------------------------------------------------------------------
// Backend — Node.js / APIs
// ---------------------------------------------------------------------------

const BACKEND_NODE: BankDomain = {
  slug: "backend-node",
  name: "Backend — Node.js / APIs",
  blurb: "HTTP API design, data modelling, concurrency, failure handling, observability.",
  questions: [
    mcq(
      "BEGINNER",
      "Which status code should an API return when the client sends a malformed request body?",
      ["200", "400", "404", "500"],
      1,
      "400 means the client's request was wrong. 500 says the server broke, which sends the wrong team to investigate.",
    ),
    mcq(
      "BEGINNER",
      "Why is blocking the event loop a problem in Node.js?",
      [
        "It uses too much memory",
        "Node handles all requests on one thread, so a long synchronous operation stalls every other request",
        "It causes the database to disconnect",
        "It only affects development mode",
      ],
      1,
      "One blocked thread means every concurrent request waits. This is why CPU-heavy work belongs in a worker or another service.",
    ),
    mcq(
      "BEGINNER",
      "What is the risk of `SELECT * FROM users WHERE email = '\" + email + \"'`?",
      [
        "It is slower than a parameterised query",
        "SQL injection — the input can change the meaning of the query",
        "It returns too many columns",
        "It only works on PostgreSQL",
      ],
      1,
      "String concatenation lets input become code. Parameterised queries keep data as data.",
    ),
    mcq(
      "BEGINNER",
      "An endpoint returns a user's data including their password hash. What is wrong?",
      [
        "Nothing, the hash is not the password",
        "The response exposes data the client never needs, widening the blast radius of any leak",
        "Hashes are too large to send",
        "It will break JSON parsing",
      ],
      1,
      "APIs should return the minimum the client needs. Hashes enable offline cracking and have no client-side use.",
    ),
    mcq(
      "JUNIOR",
      "Your API's p50 latency is 40ms but p99 is 4 seconds. What does this tell you?",
      [
        "The average request is slow",
        "Most requests are fast but a small fraction are drastically slower — worth finding what those have in common",
        "The measurement is broken",
        "The server needs more memory",
      ],
      1,
      "Averages hide tails. The 1% is usually a specific cause: a missing index on a large account, a cold cache, or a lock.",
    ),
    mcq(
      "JUNIOR",
      "When is it correct to retry a failed HTTP request automatically?",
      [
        "Always — retries make systems resilient",
        "When the failure is transient (network error, 429, 5xx) and the operation is safe to repeat",
        "Never — retries hide bugs",
        "Only for GET requests",
      ],
      1,
      "Retrying a 400 repeats the same invalid request. Retrying a non-idempotent operation can duplicate it.",
    ),
    mcq(
      "MID",
      "Under load your service exhausts its database connection pool. Which is the least useful response?",
      [
        "Finding the queries holding connections longest",
        "Raising the pool size until the errors stop",
        "Adding a statement timeout",
        "Moving long-running reads to a replica",
      ],
      1,
      "Raising the pool moves the bottleneck to the database itself and usually makes the incident worse.",
    ),
    mcq(
      "MID",
      "Two concurrent requests read a balance of 100, both subtract 30, and both write 70. What is this?",
      [
        "A deadlock",
        "A lost update — the second write overwrites the first without seeing it",
        "A cache miss",
        "A memory leak",
      ],
      1,
      "Read-modify-write without a transaction or atomic update loses one of the changes. The fix is an atomic update or row-level locking.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "Explain what a database index is, in your own words, and why adding one to every column would be a bad idea.", [
      c("purpose", "Explains lookup speed correctly", 3, ["faster", "lookup", "find", "scan", "search"]),
      c("cost", "Knows indexes are not free", 3, ["write", "slower", "space", "insert", "update", "storage"]),
      c("judgement", "Has a rule for when to add one", 2, ["query", "where", "measure", "common"]),
    ]),
    spoken("CONCEPTUAL", "MID", "Explain what idempotency means for an API and why it matters more on unreliable networks.", [
      c("definition", "Correct definition", 3, ["same", "twice", "once", "repeat", "effect"]),
      c("relevance", "Connects to retries and network failure", 3, ["retry", "timeout", "network", "duplicate", "unsure"]),
      c("implementation", "Knows how it is achieved", 2, ["key", "unique", "token", "id"]),
    ]),
    typed("SCENARIO", "JUNIOR", "Your API works locally but times out in production for one specific customer. Write how you would investigate.", [
      c("difference", "Looks at what makes that customer different", 3, ["data", "size", "volume", "large", "account", "different"]),
      c("evidence", "Uses logs and query plans", 3, ["log", "trace", "query", "explain", "slow"]),
      c("reproduce", "Tries to reproduce with real conditions", 2, ["reproduce", "copy", "similar", "staging"]),
    ]),
    typed("SCENARIO", "SENIOR", "A downstream service you depend on becomes slow, and your API starts timing out too — taking down features that do not need that service at all. Write how you would stop this happening again.", [
      c("isolation", "Isolates the failure", 3, ["timeout", "circuit", "bulkhead", "isolat", "pool", "separate"]),
      c("degradation", "Degrades gracefully", 3, ["fallback", "cache", "stale", "partial", "degrade", "default"]),
      c("detection", "Detects it faster next time", 2, ["alert", "monitor", "dashboard", "metric"]),
      c("blast", "Understands cascade", 2, ["cascade", "spread", "unrelated", "everything"]),
    ]),
    typed("CODING", "JUNIOR", "Write an Express route handler `GET /users/:id` that fetches a user from `db.users.findById(id)`, returns 404 when missing, and returns 500 on failure without leaking internal error details to the client.", [
      c("happy", "Correct success path", 2, ["res.json", "await", "findbyid", "200"]),
      c("notfound", "Handles the missing user", 3, ["404", "!user", "null", "not found"]),
      c("errors", "Catches and does not leak internals", 3, ["try", "catch", "500", "log"]),
    ]),
    typed("CODING", "MID", "Write a function `withRetry(fn, { attempts, baseDelayMs })` that retries an async function with exponential backoff and jitter. It must not retry on 4xx errors. Comment on why retrying a 4xx is wrong.", [
      c("backoff", "Exponential backoff implemented correctly", 3, ["2 **", "math.pow", "delay", "attempt"]),
      c("jitter", "Adds jitter and explains why", 2, ["jitter", "random", "thundering"]),
      c("classification", "Distinguishes retryable from terminal errors", 3, ["status", "4", "5", "retryable", "throw"]),
    ]),
    typed("CODING", "SENIOR", "Two concurrent requests both call `POST /orders` with the same idempotency key. Write the handler logic that guarantees exactly one order is created. State your storage assumptions and the failure mode of your approach.", [
      c("mechanism", "Uses a real concurrency primitive", 3, ["unique", "constraint", "transaction", "lock", "insert"]),
      c("race", "Handles the interleaving, not just the check", 3, ["race", "conflict", "duplicate", "catch"]),
      c("replay", "Second request returns the original result", 2, ["return", "existing", "cached", "same"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Tell me about a production incident you were involved in. What was the impact, how did you diagnose it, and what changed afterwards so it could not recur?", [
      c("impact", "States user impact, not just the symptom", 2, ["users", "downtime", "requests", "failed", "percent"]),
      c("diagnosis", "Evidence-driven diagnosis", 3, ["logs", "metrics", "trace", "dashboard", "reproduce"]),
      c("prevention", "Durable follow-up, not just 'be careful'", 3, ["alert", "test", "monitor", "runbook", "limit"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Describe a system you designed that had to handle a large increase in load. What did you get right, and where did the design actually break first?", [
      c("design", "Explains the design and its constraints", 3, ["queue", "cache", "shard", "replica", "throughput"]),
      c("bottleneck", "Names the real first bottleneck", 3, ["database", "connection", "lock", "memory", "io"]),
      c("honesty", "Admits what the design got wrong", 2, ["wrong", "underestimated", "should have"]),
    ]),
  ],
};

// ---------------------------------------------------------------------------
// Remaining specialist domains
// ---------------------------------------------------------------------------

const BACKEND_PYTHON: BankDomain = {
  slug: "backend-python",
  name: "Backend — Python",
  blurb: "Django/FastAPI services, ORM behaviour, async patterns, testing discipline.",
  questions: [
    mcq(
      "BEGINNER",
      "What does `[x for x in items if x.active]` produce?",
      [
        "A generator that yields active items lazily",
        "A new list containing only the active items",
        "The original list with inactive items removed in place",
        "A dictionary keyed by item",
      ],
      1,
      "A list comprehension builds a new list eagerly. The lazy version uses parentheses and is a generator expression.",
    ),
    mcq(
      "BEGINNER",
      "Why is a mutable default argument such as `def f(items=[])` a known Python trap?",
      [
        "It is slower than passing None",
        "The default list is created once and shared across every call, so mutations persist between calls",
        "Python raises a SyntaxError",
        "It only works in Python 2",
      ],
      1,
      "Defaults are evaluated once at definition time. The idiom is `items=None` then `items = items or []` inside.",
    ),
    mcq(
      "JUNIOR",
      "Your Django view loops over 500 orders and accesses `order.customer.name` in each iteration. What happens?",
      [
        "One efficient join query",
        "501 queries — one for the orders and one per customer",
        "A syntax error",
        "The ORM caches everything automatically",
      ],
      1,
      "This is the N+1 problem. `select_related` on a foreign key turns it into a single join.",
    ),
    mcq(
      "MID",
      "Which is true about Python's GIL for a web service?",
      [
        "It makes threads useless for everything",
        "It limits CPU-bound parallelism in one process, but IO-bound work still benefits from threads or async",
        "It prevents any concurrency",
        "It only applies to Windows",
      ],
      1,
      "The GIL is released during IO. CPU-bound work needs multiple processes, not more threads.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "Explain the difference between a list and a dictionary in Python, and give an example where choosing the wrong one would hurt performance.", [
      c("distinction", "Ordered sequence vs keyed lookup", 3, ["order", "index", "key", "lookup", "value"]),
      c("performance", "Understands lookup cost", 3, ["o(1)", "o(n)", "fast", "scan", "hash", "slow"]),
      c("example", "Concrete example", 2, ["search", "find", "loop", "in"]),
    ]),
    typed("SCENARIO", "MID", "A nightly Django management command that took 20 minutes now takes 6 hours. Nothing in the code changed. Write how you would investigate.", [
      c("data", "Suspects data growth first", 3, ["grew", "rows", "volume", "size", "count"]),
      c("queries", "Looks at the SQL", 3, ["query", "explain", "index", "n+1", "slow query"]),
      c("memory", "Considers loading everything into memory", 2, ["memory", "iterator", "chunk", "all()"]),
    ]),
    typed("CODING", "JUNIOR", "Write a Python function `group_by_domain(emails: list[str]) -> dict[str, list[str]]` that groups email addresses by their domain. Handle malformed input rather than crashing, and say what you decided 'malformed' means.", [
      c("correctness", "Grouping logic is correct", 3, ["split", "@", "dict", "append", "setdefault"]),
      c("validation", "Handles malformed addresses deliberately", 3, ["if", "count", "skip", "continue", "invalid"]),
      c("typing", "Type hints and clear naming", 1, ["list[str]", "dict", "->"]),
    ]),
    typed("CODING", "MID", "Write an async function that fetches 100 URLs with at most 10 in flight at a time and returns results in the original order. Failures must not abort the batch.", [
      c("concurrency", "Bounds concurrency correctly", 3, ["semaphore", "gather", "asyncio", "limit"]),
      c("ordering", "Preserves input order", 2, ["order", "index", "gather", "enumerate"]),
      c("errors", "Isolates per-item failure", 3, ["return_exceptions", "try", "except", "none"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Tell me about a time an ORM did something you did not expect in production. What happened, and how did you find it?", [
      c("specificity", "A concrete, real incident", 3, ["query", "queries", "orm", "django", "sqlalchemy"]),
      c("diagnosis", "Looked at the generated SQL", 3, ["sql", "explain", "log", "n+1", "profil"]),
      c("fix", "Fixed the cause, not the symptom", 2, ["select_related", "prefetch", "join", "index", "eager"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Describe a service you inherited that was hard to change. What made it hard, and what did you do about it while still shipping features?", [
      c("diagnosis", "Names specific structural problems", 3, ["coupling", "test", "global", "circular", "legacy"]),
      c("strategy", "Incremental strategy, not a rewrite fantasy", 3, ["incremental", "seam", "test", "extract", "strangler"]),
      c("delivery", "Kept shipping while improving", 2, ["feature", "parallel", "alongside", "still"]),
    ]),
  ],
};

const DEVOPS: BankDomain = {
  slug: "devops-cloud",
  name: "DevOps / Cloud Infrastructure",
  blurb: "CI/CD, containers, infrastructure as code, monitoring, incident response.",
  questions: [
    mcq(
      "BEGINNER",
      "Why does the order of instructions in a Dockerfile matter?",
      [
        "Docker runs them in random order otherwise",
        "Each instruction is a cached layer, so putting frequently-changing files early invalidates everything after them",
        "It affects the final image's security",
        "It determines which user the container runs as",
      ],
      1,
      "Copy dependency manifests and install before copying source, so a code change does not re-run the install.",
    ),
    mcq(
      "BEGINNER",
      "What is the risk of running a container as root?",
      [
        "The container will not start",
        "A compromise inside the container has far more privilege, and on some setups a path to the host",
        "It uses more memory",
        "Logs are not written",
      ],
      1,
      "Least privilege applies inside containers too. A non-root user is a one-line change with real benefit.",
    ),
    mcq(
      "JUNIOR",
      "What is the difference between a liveness and a readiness probe?",
      [
        "They are the same thing with different names",
        "Liveness failing restarts the container; readiness failing removes it from load-balancer rotation",
        "Liveness is for databases, readiness is for web servers",
        "Readiness runs once at startup only",
      ],
      1,
      "Confusing them is how a slow dependency turns into a cluster-wide restart loop.",
    ),
    mcq(
      "MID",
      "Your liveness probe checks that the database is reachable. The database has a 30-second blip. What happens?",
      [
        "Nothing — the probe recovers",
        "Every instance fails its liveness check and restarts simultaneously, turning a blip into an outage",
        "Traffic is routed to a replica",
        "The probe is ignored during outages",
      ],
      1,
      "Liveness must only test whether *this process* is healthy. Dependencies belong in readiness, if anywhere.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "Explain what infrastructure as code means and what problem it solves compared to configuring servers by hand.", [
      c("definition", "Understands declarative config in version control", 3, ["code", "version", "git", "declar", "repeat"]),
      c("problems", "Names the problems it solves", 3, ["drift", "consistent", "reproduc", "manual", "documented", "review"]),
      c("limits", "Aware it is not free", 1, ["state", "learn", "complex", "still"]),
    ]),
    typed("SCENARIO", "MID", "Deployments take 45 minutes and the team has started batching a week of changes into each one. Write what you would change and in what order.", [
      c("causality", "Links batch size to risk", 3, ["risk", "batch", "bigger", "harder", "rollback", "blast"]),
      c("speed", "Attacks the pipeline duration", 3, ["cache", "parallel", "test", "stage", "build", "slow"]),
      c("safety", "Makes frequent deploys safe", 2, ["canary", "flag", "rollback", "staged", "automated"]),
    ]),
    typed("CODING", "MID", "Write a Dockerfile for a Node.js service that builds TypeScript and runs in production. Optimise for image size and rebuild speed, and comment on why each stage exists.", [
      c("multistage", "Multi-stage build", 3, ["from", "as build", "copy --from", "stage"]),
      c("caching", "Layer ordering exploits the build cache", 3, ["package.json", "npm ci", "before", "cache"]),
      c("security", "Does not run as root", 2, ["user", "node", "non-root"]),
      c("size", "Slim base and no dev dependencies at runtime", 2, ["alpine", "slim", "--omit=dev", "production"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Walk me through a deployment that went wrong. How did you notice, how did you recover, and what did you change about the pipeline afterwards?", [
      c("detection", "Detected by monitoring, not by a user", 3, ["alert", "monitor", "metric", "dashboard", "noticed"]),
      c("recovery", "Fast, rehearsed rollback path", 3, ["rollback", "revert", "previous", "minutes"]),
      c("prevention", "Changed the system, not the process only", 2, ["canary", "staging", "gate", "smoke", "health"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about the largest infrastructure cost or reliability problem you have owned. What was the constraint, and what did you actually change?", [
      c("measurement", "Measured before acting", 3, ["baseline", "usage", "metric", "profil", "audit"]),
      c("change", "Concrete architectural change", 3, ["autoscal", "right-siz", "reserved", "cache", "region"]),
      c("result", "Quantified outcome", 2, ["%", "reduced", "saved", "from", "to"]),
    ]),
  ],
};

const DATA_ENG: BankDomain = {
  slug: "data-engineering",
  name: "Data Engineering",
  blurb: "SQL, pipeline design, data quality, warehouse modelling, orchestration.",
  questions: [
    mcq(
      "BEGINNER",
      "What does a LEFT JOIN return that an INNER JOIN does not?",
      [
        "Rows from the right table with no match on the left",
        "Rows from the left table even when there is no matching row on the right",
        "Duplicate rows only",
        "Only the columns from the left table",
      ],
      1,
      "LEFT JOIN preserves every left row, filling the right side with NULLs when nothing matches.",
    ),
    mcq(
      "BEGINNER",
      "Why does `COUNT(column)` sometimes return a smaller number than `COUNT(*)`?",
      [
        "COUNT(*) counts duplicates twice",
        "COUNT(column) skips NULLs",
        "COUNT(*) includes deleted rows",
        "They always return the same value",
      ],
      1,
      "Aggregate functions ignore NULLs. This silently changes results when a column is nullable.",
    ),
    mcq(
      "JUNIOR",
      "A daily pipeline appends yesterday's rows. It is re-run after a failure and the numbers double. What was missing?",
      [
        "Better error handling",
        "Idempotency — the job should produce the same result whether it runs once or five times",
        "A faster warehouse",
        "More memory",
      ],
      1,
      "Append-only jobs are not safe to re-run. Delete-then-insert for the partition, or merge on a key.",
    ),
    mcq(
      "MID",
      "Records can arrive up to 3 days late. Your pipeline only processes yesterday's partition. What is the consequence?",
      [
        "Nothing — late data is rare",
        "Late records are silently never processed, so historical numbers are permanently wrong",
        "The pipeline will crash",
        "The warehouse will reject them",
      ],
      1,
      "Silent undercounting is the worst failure mode: nothing errors, and the numbers are simply wrong.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "Explain what you understand by data quality. What would you check before trusting a table you have never seen?", [
      c("dimensions", "Names several quality dimensions", 3, ["null", "duplicate", "range", "fresh", "complete", "count"]),
      c("method", "Has a concrete first-look routine", 3, ["count", "min", "max", "distinct", "sample", "profile"]),
      c("scepticism", "Does not assume correctness", 2, ["assume", "check", "verify", "trust"]),
    ]),
    typed("SCENARIO", "MID", "The finance team says last month's revenue number in your dashboard is wrong, but they cannot say by how much. Write how you would investigate.", [
      c("reconciliation", "Compares against a source of truth", 3, ["source", "compare", "reconcil", "raw", "system"]),
      c("scope", "Narrows down where it diverges", 3, ["day", "segment", "narrow", "break", "which"]),
      c("causes", "Considers real causes", 2, ["duplicate", "late", "filter", "timezone", "currency", "refund"]),
    ]),
    typed("CODING", "MID", "Given `orders(id, customer_id, created_at, total_cents, status)`, write SQL returning each customer's first and most recent completed order date and their lifetime completed total. Exclude customers with no completed orders. Comment on behaviour at 50 million rows.", [
      c("correctness", "Query returns the right result", 3, ["group by", "min(", "max(", "sum(", "where"]),
      c("filtering", "Filters status correctly and early", 2, ["status", "completed", "where"]),
      c("performance", "Thinks about scale and indexes", 3, ["index", "scan", "partition", "customer_id"]),
    ]),
    typed("CODING", "SENIOR", "Design the write logic for an incremental daily pipeline where source records can arrive up to 3 days late and can be corrected after the fact. Write the core merge and explain why a plain append would be wrong.", [
      c("lateness", "Handles late-arriving data explicitly", 3, ["late", "window", "lookback", "3 day", "reprocess"]),
      c("idempotency", "Reruns are safe", 3, ["merge", "upsert", "idempotent", "delete", "overwrite"]),
      c("corrections", "Handles updates to existing records", 2, ["update", "version", "scd", "latest"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Tell me about a time downstream users found bad data before you did. What was wrong, and what did you put in place afterwards?", [
      c("honesty", "Owns the detection gap", 2, ["did not", "missed", "found out", "reported"]),
      c("rootcause", "Real root cause, not 'bad source data'", 3, ["schema", "null", "duplicate", "late", "upstream"]),
      c("controls", "Added automated quality checks", 3, ["test", "assertion", "freshness", "alert", "validation"]),
    ]),
  ],
};

const QA: BankDomain = {
  slug: "qa-automation",
  name: "QA / Test Automation",
  blurb: "Test strategy, automation frameworks, flakiness, coverage judgement.",
  questions: [
    mcq(
      "BEGINNER",
      "Which selector is most resilient in an end-to-end test?",
      [
        "div > div:nth-child(3) > button",
        "A dedicated test id such as data-testid=\"submit\"",
        "The button's CSS class from the styling framework",
        "The button's position on screen",
      ],
      1,
      "Structural and styling selectors break on any refactor. A test id is an explicit contract with the test.",
    ),
    mcq(
      "BEGINNER",
      "Why is `sleep(3000)` a bad way to wait for content in a test?",
      [
        "It makes tests slow and still fails when the app is slower than 3 seconds",
        "Test frameworks do not support it",
        "It uses too much memory",
        "It only works on Chrome",
      ],
      1,
      "Fixed sleeps are simultaneously too slow in the common case and too short in the bad case. Wait on the condition.",
    ),
    mcq(
      "JUNIOR",
      "A test passes alone but fails when the suite runs. What is the most likely cause?",
      [
        "The test framework has a bug",
        "Shared state between tests — leftover data, a shared user, or ordering dependence",
        "The machine is too slow",
        "The test needs a longer timeout",
      ],
      1,
      "Order-dependent failure is nearly always shared mutable state. Each test should create and clean its own data.",
    ),
    mcq(
      "MID",
      "Your suite has 5% flake. What is the most damaging consequence?",
      [
        "CI takes longer",
        "The team stops trusting failures and starts re-running until green, so real bugs get ignored",
        "It costs more in CI minutes",
        "Coverage numbers become inaccurate",
      ],
      1,
      "A flaky suite trains everyone to dismiss red. At that point the suite is worse than no suite: it costs time and catches nothing.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "Explain the difference between unit, integration, and end-to-end tests, and how you would decide which to write for a given change.", [
      c("distinction", "Distinguishes the three clearly", 3, ["unit", "integration", "end to end", "isolat", "together", "browser"]),
      c("tradeoffs", "Understands speed vs confidence", 3, ["fast", "slow", "confidence", "brittle", "cost"]),
      c("decision", "Has a rule for choosing", 2, ["depends", "risk", "logic", "flow", "critical"]),
    ]),
    typed("SCENARIO", "MID", "You join a team with 2,000 tests, a 40-minute suite, and a 15% failure rate that everyone ignores. Write your plan for the first month.", [
      c("triage", "Separates real failures from flakes", 3, ["quarantine", "categor", "identify", "track", "which"]),
      c("trust", "Prioritises restoring trust in the signal", 3, ["trust", "green", "reliable", "ignore", "believe"]),
      c("deletion", "Willing to delete low-value tests", 2, ["delete", "remove", "value", "duplicate"]),
      c("speed", "Addresses duration too", 2, ["parallel", "split", "faster", "slow"]),
    ]),
    typed("CODING", "MID", "Write an end-to-end test for a login flow that is resilient rather than flaky. Point out the three things most likely to make this test flaky and how your code avoids each.", [
      c("selectors", "Stable selectors, not brittle CSS paths", 3, ["data-testid", "role", "label", "getby"]),
      c("waiting", "Waits on state, not on time", 3, ["waitfor", "expect", "visible", "no sleep", "timeout"]),
      c("isolation", "Test sets up and cleans its own data", 2, ["beforeeach", "seed", "cleanup", "unique"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Tell me about a flaky test suite you dealt with. How did you decide what to fix, delete, or quarantine?", [
      c("diagnosis", "Understands why tests were flaky", 3, ["timing", "race", "async", "shared state", "order"]),
      c("judgement", "Has a rule for deleting vs fixing", 3, ["value", "delete", "quarantine", "cost", "coverage"]),
      c("measurement", "Tracked flake rate", 2, ["rate", "percent", "tracked", "dashboard"]),
    ]),
  ],
};

export const DOMAINS: BankDomain[] = [
  FULLSTACK,
  FRONTEND,
  BACKEND_NODE,
  BACKEND_PYTHON,
  APPDEV,
  UIUX,
  GRAPHIC,
  DEVOPS,
  DATA_ENG,
  QA,
];
