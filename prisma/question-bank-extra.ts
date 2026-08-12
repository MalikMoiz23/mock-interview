import type { BankDomain, BankQuestion, Criterion } from "./question-bank";

/**
 * Second tranche of curated questions.
 *
 * Kept separate from the first bank purely for file size. Its job is depth:
 * rotation only produces variety when the bank holds meaningfully more
 * questions than a paper needs, so this concentrates on the types that papers
 * consume fastest — multiple choice at beginner and junior level above all.
 */

const mcq = (
  difficulty: BankQuestion["difficulty"],
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
): BankQuestion => ({
  type: "MCQ",
  answerMode: "CHOICE",
  difficulty,
  prompt,
  timeLimitSec: 60,
  criteria: [],
  options,
  correctIndex,
  explanation,
});

const spoken = (
  type: "CONCEPTUAL" | "BEHAVIORAL",
  difficulty: BankQuestion["difficulty"],
  prompt: string,
  criteria: Criterion[],
): BankQuestion => ({
  type,
  answerMode: "SPOKEN",
  difficulty,
  prompt,
  timeLimitSec: type === "CONCEPTUAL" ? 150 : 240,
  criteria,
});

const typed = (
  type: "SCENARIO" | "CODING",
  difficulty: BankQuestion["difficulty"],
  prompt: string,
  criteria: Criterion[],
): BankQuestion => ({
  type,
  answerMode: "TYPED",
  difficulty,
  prompt,
  timeLimitSec: type === "SCENARIO" ? 330 : 450,
  criteria,
});

const c = (key: string, label: string, weight: number, keywords: string[]): Criterion => ({
  key, label, weight, keywords,
});

// ---------------------------------------------------------------------------

export const EXTRA_DOMAINS: BankDomain[] = [
  {
    slug: "fullstack-development",
    name: "Full Stack Development",
    blurb: "",
    questions: [
      mcq("BEGINNER", "What does it mean that HTTP is stateless?", ["The server cannot store any data", "Each request arrives with no memory of previous ones, so identity must be re-established every time", "Responses cannot contain data", "Only GET requests are allowed"], 1, "Every request is independent, which is why sessions and tokens exist."),
      mcq("BEGINNER", "A user's browser shows an old version of your CSS after a deploy. What is the usual cause?", ["The server did not restart", "The browser cached the old file, and the filename did not change", "The CSS is invalid", "The database needs migrating"], 1, "Cache-busting via hashed filenames is why build tools rename assets on every build."),
      mcq("BEGINNER", "Which of these should never be sent to the browser?", ["The user's display name", "The database connection string", "The list of products", "The current page number"], 1, "Anything in the browser is readable by the user. Connection strings stay server-side."),
      mcq("BEGINNER", "What is the purpose of a foreign key?", ["To encrypt a column", "To enforce that a value in one table refers to a real row in another", "To make queries faster", "To generate unique ids"], 1, "It is a correctness constraint. Speed comes from the index that usually accompanies it."),
      mcq("BEGINNER", "Your API returns 200 with `{\"error\": \"not found\"}`. What is wrong?", ["Nothing, the body explains it", "The status code says success while the body says failure, so clients and monitoring will treat it as fine", "It should be 500", "The body should be plain text"], 1, "Status codes are the machine-readable part. Monitoring and retries key off them, not prose."),
      mcq("JUNIOR", "When is it appropriate to store a computed value in the database instead of calculating it on read?", ["Never — always compute", "When the calculation is expensive and read far more often than the inputs change, accepting that it must be kept in sync", "Always, computing is slow", "Only for money values"], 1, "Denormalisation trades correctness risk for read speed; the cost is the invalidation you now own."),
      mcq("JUNIOR", "Your session cookie lacks the HttpOnly flag. What is the risk?", ["The cookie expires too early", "Client-side JavaScript can read it, so any XSS becomes full session theft", "The cookie is sent over HTTP", "It cannot be used cross-domain"], 1, "HttpOnly does not prevent XSS; it prevents XSS from escalating into stolen sessions."),
      mcq("JUNIOR", "What problem does a database transaction solve?", ["It makes writes faster", "It makes several operations succeed or fail as one unit, so a crash cannot leave half-applied state", "It prevents SQL injection", "It compresses the data"], 1, "Atomicity. Transferring money is the canonical example: both sides must move or neither."),
      mcq("MID", "Your app reads a user's role from a JWT to decide what they can do. The role changes. What happens?", ["The change applies instantly", "The old role stays in effect until the token expires, because the token is a snapshot the server did not re-check", "The token is rejected", "The user is logged out"], 1, "Stateless tokens trade a database lookup for staleness. Revocation needs a deliberate design."),
      mcq("MID", "What does `SELECT ... FOR UPDATE` do?", ["Updates the rows immediately", "Locks the selected rows for the rest of the transaction so a concurrent transaction cannot modify them", "Marks the rows read-only", "Creates a backup"], 1, "It is how you serialise a read-modify-write without losing an update."),
      spoken("CONCEPTUAL", "BEGINNER", "What is the difference between a library and a framework? Give an example of each you have used, and explain how it changed the way you wrote code.", [
        c("inversion", "Grasps inversion of control", 3, ["calls", "you call", "calls you", "structure", "control"]),
        c("examples", "Real examples they have used", 3, ["react", "express", "django", "used", "i built"]),
        c("consequence", "Says how it changed their code", 2, ["had to", "structure", "convention", "because"]),
      ]),
      spoken("CONCEPTUAL", "MID", "Explain what caching costs you, not what it saves. When have you decided against adding a cache?", [
        c("costs", "Names invalidation and staleness", 3, ["stale", "invalidat", "wrong", "out of date", "consistency"]),
        c("complexity", "Recognises the operational burden", 2, ["debug", "complex", "another", "layer", "reason about"]),
        c("judgement", "Has genuinely declined one", 3, ["did not", "decided against", "instead", "fixed the query"]),
      ]),
      typed("SCENARIO", "JUNIOR", "Your team's staging environment has drifted so far from production that bugs only appear after release. Write what you would do about it, given you cannot rebuild everything at once.", [
        c("diagnosis", "Identifies what actually differs", 3, ["data", "config", "version", "scale", "differ"]),
        c("incremental", "Realistic incremental plan", 3, ["first", "start", "one", "gradual"]),
        c("prevention", "Stops it drifting again", 2, ["automate", "script", "same", "infrastructure as code", "rebuild"]),
      ]),
      typed("SCENARIO", "MID", "A feature works for you and fails for 5% of users with no error in your logs. Write how you would find out what is happening.", [
        c("segmentation", "Looks for what the 5% share", 3, ["browser", "device", "region", "version", "segment", "common"]),
        c("observability", "Notices the logging gap itself", 3, ["no error", "client", "not logged", "add logging", "instrument"]),
        c("reproduce", "Tries to reproduce their conditions", 2, ["reproduce", "emulat", "same", "throttl"]),
      ]),
      typed("CODING", "MID", "Write a rate limiter that allows 100 requests per user per minute. State where the counter lives and what happens when your service runs as three instances behind a load balancer.", [
        c("algorithm", "Correct counting approach", 3, ["window", "bucket", "count", "expire", "ttl"]),
        c("distributed", "Handles multiple instances", 3, ["redis", "shared", "central", "instance", "per-process"]),
        c("boundary", "Aware of window edge behaviour", 2, ["burst", "boundary", "sliding", "edge"]),
        c("response", "Returns the right status and headers", 2, ["429", "retry-after", "header"]),
      ]),
      spoken("BEHAVIORAL", "JUNIOR", "Tell me about something you built that you later had to change significantly. What forced the change?", [
        c("specificity", "A real change with a real cause", 3, ["because", "requirement", "grew", "broke", "user"]),
        c("learning", "Extracted something general", 2, ["learned", "now i", "next time", "would"]),
        c("ownership", "Owns the original decision", 2, ["i", "my", "chose", "decided"]),
      ]),
      spoken("BEHAVIORAL", "MID", "Describe the worst bug you have debugged. What made it hard, and what finally cracked it?", [
        c("difficulty", "Explains why it resisted diagnosis", 3, ["intermittent", "could not reproduce", "no error", "only in production"]),
        c("method", "Systematic rather than lucky", 3, ["narrowed", "bisect", "isolated", "logged", "hypothesis"]),
        c("resolution", "Identifies the actual root cause", 2, ["turned out", "root cause", "because"]),
      ]),
    ],
  },

  {
    slug: "frontend-react",
    name: "Frontend — React / TypeScript",
    blurb: "",
    questions: [
      mcq("BEGINNER", "What does `useState` return?", ["The current value only", "An array of the current value and a function to update it", "A promise", "An object with get and set methods"], 1, "The array pair is why destructuring `const [x, setX]` is the standard form."),
      mcq("BEGINNER", "Why should you not mutate props inside a component?", ["It causes a syntax error", "Props are owned by the parent; mutating them makes data flow unpredictable and the change is not tracked", "It makes the component slower", "It is only a style preference"], 1, "One-way data flow only works if children treat props as read-only."),
      mcq("BEGINNER", "What is the difference between `null` and `undefined` in a TypeScript component's props?", ["They are identical", "`undefined` usually means the prop was not passed; `null` usually means it was explicitly set to no value", "`null` is a syntax error in props", "`undefined` cannot be typed"], 1, "The distinction carries intent, which is why strict configs keep them separate."),
      mcq("BEGINNER", "When does a React component re-render?", ["Only when the page reloads", "When its state changes, its props change, or its parent re-renders", "Every second", "Only when you call render()"], 1, "The parent-re-render case is the one that surprises people and causes most performance problems."),
      mcq("BEGINNER", "What does `e.preventDefault()` do in a form submit handler?", ["Stops the form from validating", "Stops the browser's default full-page submit and reload", "Clears the form", "Blocks the event from firing"], 1, "Without it, the page reloads and your JavaScript handler's work is thrown away."),
      mcq("JUNIOR", "Your `useEffect` runs on every render even though you passed a dependency array containing an object. Why?", ["Objects cannot be dependencies", "The object is recreated each render, so its reference differs even when its contents do not", "The array must be empty", "Effects always run every render"], 1, "Dependency comparison is by reference. This is what `useMemo` on the object solves."),
      mcq("JUNIOR", "What is the accessibility purpose of a `<label>` bound to an input?", ["Styling only", "It names the field for screen readers and makes the label clickable to focus the input", "It validates the input", "It sets the placeholder"], 1, "A placeholder is not a label: it vanishes on focus and is not reliably announced."),
      mcq("MID", "Which situation genuinely calls for `useRef` rather than `useState`?", ["Storing a value shown in the UI", "Holding a mutable value that must survive re-renders without causing one, such as a timer id", "Storing form input", "Any value that changes"], 1, "Writing to a ref does not schedule a render, which is exactly the point."),
      mcq("MID", "Why can rendering user-supplied HTML with `dangerouslySetInnerHTML` be a security problem?", ["It is slow", "It injects markup unescaped, so attacker-supplied script can run with your page's privileges", "It breaks hydration", "It only works in development"], 1, "This is stored XSS. Sanitise on the way in, or do not render raw HTML at all."),
      spoken("CONCEPTUAL", "JUNIOR", "Explain what the virtual DOM is and what problem it solves. Is it always faster than touching the DOM directly?", [
        c("mechanism", "Explains diffing and batching", 3, ["diff", "compare", "batch", "minimal", "update"]),
        c("problem", "Names the problem it solves", 2, ["expensive", "reflow", "manual", "sync"]),
        c("honesty", "Does not claim it is always faster", 3, ["not always", "overhead", "direct", "depends", "slower"]),
      ]),
      spoken("CONCEPTUAL", "MID", "Explain how you think about component boundaries. When does one component become two?", [
        c("criteria", "Has real criteria, not line count", 3, ["responsibility", "reuse", "state", "changes together", "concern"]),
        c("cost", "Knows splitting is not free", 2, ["prop", "drill", "indirection", "harder", "too many"]),
        c("example", "Grounded in real work", 2, ["i split", "we had", "for example"]),
      ]),
      typed("SCENARIO", "MID", "Your single-page app takes 4 seconds to show anything on a 3G connection. Write the changes you would make, ordered by impact per unit of effort.", [
        c("measurement", "Measures before acting", 3, ["measure", "lighthouse", "profil", "network", "throttl"]),
        c("causes", "Identifies real causes", 3, ["bundle", "split", "render", "waterfall", "blocking", "image"]),
        c("ordering", "Genuinely prioritises", 3, ["first", "biggest", "cheap", "then", "order"]),
      ]),
      typed("CODING", "JUNIOR", "Write a controlled form with an email and a password field that validates on blur, shows a per-field error message, and disables submit until both are valid. Explain in a comment why the error is announced to screen readers.", [
        c("controlled", "Correct controlled inputs", 3, ["value", "onchange", "usestate"]),
        c("validation", "Per-field validation on blur", 3, ["onblur", "error", "valid", "if"]),
        c("a11y", "Errors are announced", 3, ["aria", "role", "describedby", "live", "announce"]),
        c("submit", "Submit gating is correct", 1, ["disabled", "&&", "both"]),
      ]),
      spoken("BEHAVIORAL", "JUNIOR", "Tell me about a piece of UI you built that users found confusing. How did you find out, and what did you change?", [
        c("discovery", "Learned from evidence", 3, ["feedback", "watched", "support", "test", "data"]),
        c("change", "Concrete change", 3, ["changed", "moved", "removed", "renamed", "added"]),
        c("verification", "Checked it worked", 2, ["after", "improved", "measured", "asked"]),
      ]),
      spoken("BEHAVIORAL", "MID", "Describe a time you had to work with a design that you thought would not work well in practice. What did you do?", [
        c("substance", "Technical or usability reasoning", 3, ["performance", "state", "edge case", "mobile", "data"]),
        c("collaboration", "Engaged the designer", 3, ["talked", "showed", "prototype", "explained", "together"]),
        c("outcome", "Honest ending", 2, ["changed", "shipped", "compromise", "as designed"]),
      ]),
    ],
  },

  {
    slug: "uiux-design",
    name: "UI/UX Design",
    blurb: "",
    questions: [
      mcq("BEGINNER", "What is the minimum recommended touch target size on mobile?", ["16×16 px", "24×24 px", "About 44×44 px", "60×60 px"], 2, "Roughly 44px reflects the size of a fingertip; smaller targets cause mis-taps."),
      mcq("BEGINNER", "A destructive action such as 'Delete account' should be…", ["The most prominent button on the page", "Visually distinct, not adjacent to the primary action, and confirmed before it takes effect", "Hidden so nobody finds it", "Identical to every other button"], 1, "Distinct, separated, and confirmed. Hiding it is a different failure."),
      mcq("BEGINNER", "What is the main problem with using placeholder text as a field label?", ["It looks bad", "It disappears when the user types, so they lose the label exactly when they need to check it", "It cannot be styled", "It is not translatable"], 1, "It also fails screen readers and defeats browser autofill in some cases."),
      mcq("BEGINNER", "In a usability test, the participant asks 'what should I click here?' What is the best response?", ["Tell them exactly where to click", "Ask what they would do if you were not there", "End the session", "Explain how the feature works"], 1, "Answering destroys the data you came for. Redirect and observe."),
      mcq("BEGINNER", "What does 'progressive disclosure' mean?", ["Loading a page in stages", "Showing only what is needed now and revealing complexity on demand", "Animating elements in sequence", "Requiring users to complete steps in order"], 1, "It manages complexity without removing capability."),
      mcq("JUNIOR", "Your form has 12 fields and users abandon it. Which is the strongest first move?", ["Split it into 12 separate pages", "Question whether every field is genuinely required now, and defer or remove the rest", "Add a progress bar", "Make the fields smaller"], 1, "A progress bar makes a long form feel measurable, not shorter. Removing fields is the real fix."),
      mcq("JUNIOR", "What is a 'jobs to be done' framing useful for?", ["Assigning tasks to designers", "Describing what outcome the user is trying to achieve, independent of your product's features", "Estimating project timelines", "Naming components"], 1, "It stops the brief being a feature list and reframes it as an outcome."),
      mcq("MID", "Users say they want a feature but do not use it after launch. What most likely happened?", ["They lied", "Stated preference diverged from actual behaviour — a well-known limit of asking rather than observing", "The feature was built wrong", "They forgot it exists"], 1, "This is why observation beats surveys for behaviour, though surveys are fine for attitudes."),
      spoken("CONCEPTUAL", "JUNIOR", "What makes an interface accessible beyond colour contrast? Name several things and say which you check first.", [
        c("breadth", "Names several distinct areas", 3, ["keyboard", "screen reader", "focus", "label", "alt", "motion", "target"]),
        c("priority", "Has an order of checking", 2, ["first", "start", "most", "biggest"]),
        c("practice", "Sounds like they have actually done it", 2, ["i use", "test", "tab through", "tool"]),
      ]),
      spoken("CONCEPTUAL", "MID", "Explain the difference between qualitative and quantitative research in design. Give a question each is good at answering, and one neither can answer.", [
        c("distinction", "Clear distinction", 3, ["why", "how many", "behaviour", "number", "observe"]),
        c("examples", "Good example per method", 3, ["for example", "such as", "would tell"]),
        c("limits", "Names a genuine limit", 2, ["cannot", "neither", "future", "predict", "would"]),
      ]),
      typed("SCENARIO", "JUNIOR", "A client insists on a carousel on their homepage. Research says carousels perform poorly. Write how you would handle the conversation and what you would propose.", [
        c("evidence", "Brings evidence without lecturing", 3, ["data", "research", "shows", "click", "first slide"]),
        c("underlying", "Finds the need behind the request", 3, ["why", "what", "trying", "need", "multiple"]),
        c("alternative", "Proposes something concrete", 3, ["instead", "propose", "stack", "prioritis"]),
      ]),
      typed("SCENARIO", "SENIOR", "Two teams have shipped two different date pickers in the same product. Neither wants to give theirs up. Write how you would resolve it.", [
        c("neutrality", "Does not simply pick a side", 3, ["both", "neither", "criteria", "evaluate"]),
        c("criteria", "Defines objective criteria", 3, ["accessib", "usage", "maintain", "cover", "requirement"]),
        c("process", "Solves it durably", 3, ["own", "governance", "who decides", "process", "next time"]),
      ]),
      typed("CODING", "MID", "Write the complete empty-state specification for a project list a user sees on first login: what is shown, what it says, what actions exist, and how it differs from a list emptied by a filter.", [
        c("firstrun", "Treats first-run as onboarding", 3, ["get started", "create", "first", "explain", "action"]),
        c("distinction", "Distinguishes empty from filtered-empty", 3, ["filter", "no results", "different", "clear"]),
        c("copy", "Real words, not placeholders", 3, ["\"", "says", "text"]),
      ]),
      spoken("BEHAVIORAL", "MID", "Tell me about a time you were wrong about a design decision, and how you found out.", [
        c("honesty", "Genuinely admits error", 3, ["wrong", "mistake", "assumed", "thought"]),
        c("evidence", "Found out through evidence", 3, ["data", "test", "users", "watched", "feedback"]),
        c("change", "Changed course", 2, ["changed", "redid", "reverted", "fixed"]),
      ]),
    ],
  },

  {
    slug: "graphic-design",
    name: "Graphic Design",
    blurb: "",
    questions: [
      mcq("BEGINNER", "What is the difference between RGB and CMYK in one sentence?", ["RGB has more colours than CMYK", "RGB is additive light for screens; CMYK is subtractive ink for print", "They are the same in different notation", "CMYK is only for black and white"], 1, "Additive versus subtractive is why bright screen colours cannot always be printed."),
      mcq("BEGINNER", "What resolution is standard for commercial print?", ["72 DPI", "150 DPI", "300 DPI", "600 DPI"], 2, "300 DPI at final size. 72 DPI is a screen convention and prints visibly soft."),
      mcq("BEGINNER", "Which file format preserves transparency and is lossless?", ["JPEG", "PNG", "BMP", "GIF at 24-bit"], 1, "JPEG has no alpha channel and is lossy; GIF transparency is 1-bit and it caps at 256 colours."),
      mcq("BEGINNER", "What does 'leading' control?", ["Space between letters", "Space between lines of text", "The width of a text block", "The weight of the typeface"], 1, "The name comes from the strips of lead once placed between lines of metal type."),
      mcq("BEGINNER", "Why is white space not 'wasted' space?", ["It saves ink", "It creates grouping and hierarchy, and gives the eye somewhere to rest", "It makes files smaller", "It is required by printers"], 1, "Proximity is one of the strongest grouping cues available; space is what creates it."),
      mcq("JUNIOR", "A client wants their logo 'bigger' on every piece. What is the professional response?", ["Enlarge it as asked and move on", "Find out what they actually fear — usually that the brand is not recognisable — and address that, which may or may not mean size", "Refuse, citing design principles", "Reduce everything else instead"], 1, "'Bigger' is a proposed fix. Recognition can come from placement, contrast, or repetition."),
      mcq("JUNIOR", "What is the practical difference between a typeface and a font?", ["Nothing", "A typeface is the design; a font is a specific weight and size instance of it", "A font is for print, a typeface for screen", "A typeface is free and a font is licensed"], 1, "Helvetica is the typeface; Helvetica Bold 12pt is a font."),
      mcq("MID", "You are asked to design for a market whose language you do not read. What is the biggest typographic risk?", ["The colours will be wrong", "Line breaks, character sets, and text expansion will break a layout built around English text", "The file size will grow", "You need a different program"], 1, "German expands, Arabic runs right to left, CJK has no spaces. Layouts must flex."),
      spoken("CONCEPTUAL", "JUNIOR", "How do you choose a colour palette for a brand? Walk me through your process on something you have actually designed.", [
        c("process", "Has a real process", 3, ["start", "brief", "audience", "competitor", "mood"]),
        c("constraints", "Considers practical constraints", 3, ["print", "contrast", "accessib", "screen", "reproduc"]),
        c("example", "Concrete piece of work", 2, ["i designed", "for", "project", "client"]),
      ]),
      spoken("CONCEPTUAL", "MID", "Explain what makes a logo work at very small sizes, and what you sacrifice to get there.", [
        c("simplification", "Understands detail loss", 3, ["simpl", "detail", "remove", "legib", "small"]),
        c("form", "Talks about shape and counters", 3, ["shape", "silhouette", "counter", "weight", "gap"]),
        c("tradeoff", "Names what is given up", 2, ["sacrific", "lose", "trade", "less"]),
      ]),
      typed("SCENARIO", "JUNIOR", "A print run of 5,000 brochures has come back with the images looking muddy and dark. Write how you would work out what went wrong and what you would do differently next time.", [
        c("diagnosis", "Names plausible causes", 3, ["cmyk", "rgb", "profile", "proof", "ink", "paper", "total ink"]),
        c("process", "Investigates rather than guesses", 3, ["check", "compare", "file", "printer", "ask"]),
        c("prevention", "Names the missing step", 3, ["proof", "test", "profile", "sample", "before"]),
      ]),
      typed("CODING", "MID", "Write a complete brand guideline page for logo usage: minimum size, clear space, approved colourways, and a list of misuses. Be precise enough that someone could follow it without asking you.", [
        c("precision", "Concrete numbers and rules", 3, ["mm", "px", "%", "minimum", "x-height"]),
        c("clearspace", "Defines clear space relationally", 3, ["clear space", "exclusion", "equal to", "based on"]),
        c("misuse", "Specific misuses, not vague ones", 3, ["do not", "never", "stretch", "rotate", "recolour", "shadow"]),
      ]),
      spoken("BEHAVIORAL", "MID", "Tell me about a project where the constraints made the work better rather than worse.", [
        c("constraint", "Names a real constraint", 3, ["budget", "one colour", "deadline", "size", "existing"]),
        c("response", "Turned it into a decision", 3, ["forced", "meant", "so i", "instead", "focus"]),
        c("outcome", "Explains why it improved things", 2, ["better", "clearer", "stronger", "simpler"]),
      ]),
    ],
  },

  {
    slug: "app-development",
    name: "App Development (Mobile)",
    blurb: "",
    questions: [
      mcq("BEGINNER", "When should an app ask for location permission?", ["On first launch, before showing anything", "At the moment the user does something that needs it, with the reason explained", "Never", "In the app store listing only"], 1, "Contextual requests are granted far more often, and pre-launch prompts train users to deny."),
      mcq("BEGINNER", "What happens to an app's unsaved state when the OS terminates it in the background?", ["It is saved automatically", "It is lost unless the app explicitly persisted it", "The app is restarted immediately", "The OS never terminates apps"], 1, "Background termination is normal under memory pressure, not an error case."),
      mcq("BEGINNER", "Why should network calls never run on the main thread?", ["They fail if they do", "The main thread draws the UI, so blocking it freezes the interface", "They use too much data", "The OS forbids it in all cases"], 1, "A frozen UI for more than a moment reads as a crash to the user."),
      mcq("BEGINNER", "What is the safest place to store an authentication token on a phone?", ["In plain shared preferences or user defaults", "In the platform's secure keystore or keychain", "In a file in the app's documents folder", "In a global variable"], 1, "The keystore is hardware-backed on most modern devices; plain preferences are readable on a rooted phone."),
      mcq("JUNIOR", "Your list scrolls smoothly with 20 items and stutters with 2,000. What changed?", ["The data got too large for memory", "Views are being created rather than recycled, and work per row now happens thousands of times", "The device throttled", "The list needs pagination in the API"], 1, "Recycling and constant work-per-row are the fix; pagination helps but is a different problem."),
      mcq("JUNIOR", "What does 'optimistic UI' mean and what is its risk?", ["Showing a loading spinner immediately; the risk is confusion", "Showing the expected result before the server confirms; the risk is having to undo it visibly when the call fails", "Preloading the next screen; the risk is data usage", "Caching everything; the risk is staleness"], 1, "It makes an app feel instant, but you must design the rollback, not just the happy path."),
      mcq("MID", "Your app must work in a country with expensive, intermittent mobile data. Which choice matters most?", ["A darker colour scheme", "Aggressive caching, small payloads, and resumable transfers", "More animations", "A larger initial download"], 1, "Bytes and retries are the cost. Design for the network, not the device."),
      mcq("MID", "Why is a deep link a security consideration and not just a navigation feature?", ["It is not", "It is an entry point into your app that external parties can invoke with arbitrary parameters, so it needs validation and auth checks", "It slows the app down", "It only works when logged out"], 1, "Any URL a third party can construct is untrusted input that lands inside your app."),
      spoken("CONCEPTUAL", "JUNIOR", "Explain what happens between a user tapping a button and something appearing on screen, in a mobile app that has to call an API.", [
        c("chain", "Describes the full chain", 3, ["thread", "request", "network", "response", "parse", "render"]),
        c("async", "Understands it is asynchronous", 3, ["async", "await", "callback", "wait", "meanwhile"]),
        c("ux", "Considers what the user sees meanwhile", 2, ["loading", "spinner", "disable", "feedback"]),
      ]),
      spoken("CONCEPTUAL", "MID", "Explain how you decide between building one cross-platform app and two native ones.", [
        c("factors", "Names real deciding factors", 3, ["team", "platform", "feature", "performance", "native", "cost"]),
        c("nuance", "Avoids a blanket answer", 3, ["depends", "if", "trade", "either"]),
        c("experience", "Has lived with the consequences", 2, ["we", "i", "ended up", "found"]),
      ]),
      typed("SCENARIO", "JUNIOR", "Your app is rejected from the store for a privacy policy issue relating to data collection. Write how you would respond and what you would check across the app.", [
        c("understanding", "Reads the actual rejection reason", 3, ["reason", "which", "specific", "policy", "clause"]),
        c("audit", "Audits what is actually collected", 3, ["sdk", "analytics", "collect", "third party", "audit"]),
        c("fix", "Fixes disclosure and collection", 2, ["disclose", "remove", "consent", "update"]),
      ]),
      typed("CODING", "MID", "Write the logic that handles a token expiring mid-session: a request returns 401, the app must refresh the token and retry, and several requests may be in flight at once. Comment on the concurrency problem.", [
        c("refresh", "Refresh-and-retry works", 3, ["401", "refresh", "retry", "token"]),
        c("concurrency", "Handles simultaneous 401s", 3, ["queue", "single", "one refresh", "lock", "in flight", "race"]),
        c("failure", "Handles refresh failing", 2, ["logout", "fail", "redirect", "clear"]),
      ]),
      spoken("BEHAVIORAL", "MID", "Tell me about a time you had to support an older OS version or device that made your work harder.", [
        c("specificity", "Real constraint", 3, ["version", "api", "device", "old", "support"]),
        c("approach", "Handled it deliberately", 3, ["polyfill", "fallback", "conditional", "dropped", "minimum"]),
        c("decision", "Weighed the cost", 2, ["users", "percent", "worth", "decided"]),
      ]),
    ],
  },

  {
    slug: "backend-node",
    name: "Backend — Node.js / APIs",
    blurb: "",
    questions: [
      mcq("BEGINNER", "What is the difference between authentication and authorisation?", ["They are the same", "Authentication proves who you are; authorisation decides what you may do", "Authentication is for APIs, authorisation for pages", "Authorisation happens first"], 1, "Confusing them is how a logged-in user ends up able to read someone else's data."),
      mcq("BEGINNER", "Why should passwords be hashed rather than encrypted?", ["Hashing is faster", "Encryption is reversible; a hash is not, so a database leak does not hand over the passwords", "Hashes are smaller", "Encryption is not allowed"], 1, "You never need the original password back — only to check a candidate against it."),
      mcq("BEGINNER", "What does an ORM's `findMany` without a `take` or `limit` risk?", ["Nothing", "Loading the entire table into memory once the data grows", "A syntax error", "Missing rows"], 1, "It works perfectly on a dev database with 50 rows and falls over at 5 million."),
      mcq("BEGINNER", "Which HTTP method should be idempotent?", ["POST", "PUT", "Neither", "Only GET"], 1, "PUT and DELETE are defined as idempotent; POST is not, which is why double-submits create duplicates."),
      mcq("JUNIOR", "A background job throws and nobody notices for a week. What was missing?", ["More logging inside the job", "Alerting on job failure and success, so silence is itself detectable", "A faster server", "A retry loop"], 1, "Logs nobody reads are not monitoring. Absence of a success signal must page someone."),
      mcq("JUNIOR", "What is the risk of putting a user id in a URL like `/api/orders?userId=42`?", ["The URL is too long", "The server may trust the parameter instead of the authenticated session, letting anyone read another user's orders", "It cannot be cached", "It breaks REST conventions"], 1, "This is IDOR, one of the most common real-world API vulnerabilities."),
      mcq("MID", "Your service writes to a database and publishes an event. The write succeeds and the publish fails. What is the standard fix?", ["Retry the publish in a loop", "Write the event to the same database in the same transaction and publish from there — the outbox pattern", "Publish before writing", "Ignore it, events are best-effort"], 1, "Two systems cannot be updated atomically; the outbox makes the second step recoverable."),
      spoken("CONCEPTUAL", "JUNIOR", "Explain what a connection pool is and what goes wrong without one.", [
        c("purpose", "Understands connection reuse", 3, ["reuse", "expensive", "open", "connection", "handshake"]),
        c("failure", "Knows what exhaustion looks like", 3, ["exhaust", "wait", "timeout", "limit", "queue"]),
        c("sizing", "Considers pool size", 2, ["size", "too many", "database", "max"]),
      ]),
      typed("SCENARIO", "JUNIOR", "You are asked to add an endpoint that returns 'all the data' for a reporting screen. Write how you would push back and what you would build instead.", [
        c("questions", "Asks what it is actually for", 3, ["what", "which", "why", "need", "use"]),
        c("risk", "Names the risks of the request as stated", 3, ["slow", "grow", "memory", "timeout", "sensitive"]),
        c("alternative", "Proposes something concrete", 3, ["paginat", "filter", "aggregate", "specific", "fields"]),
      ]),
      spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you had to work with an API or library that was poorly documented.", [
        c("approach", "Systematic investigation", 3, ["source", "read", "tested", "experiment", "logged"]),
        c("persistence", "Actually solved it", 2, ["figured", "worked", "found", "got it"]),
        c("contribution", "Left it better", 1, ["documented", "wrote", "shared", "note"]),
      ]),
    ],
  },

  {
    slug: "backend-python",
    name: "Backend — Python",
    blurb: "",
    questions: [
      mcq("BEGINNER", "What does a virtual environment give you?", ["Faster code", "Per-project dependency isolation, so two projects can need different versions of the same package", "Automatic testing", "A remote server"], 1, "Without it, every project shares one global set of packages and they eventually conflict."),
      mcq("BEGINNER", "What is the difference between a tuple and a list?", ["Tuples are faster only", "Tuples are immutable; lists can be changed after creation", "Tuples cannot hold strings", "There is none"], 1, "Immutability is why a tuple can be a dictionary key and a list cannot."),
      mcq("BEGINNER", "What does `if __name__ == '__main__':` accomplish?", ["It marks the entry point required by Python", "It runs the block only when the file is executed directly, not when it is imported", "It defines the main function", "It enables debugging"], 1, "Without it, importing a module runs its script code as a side effect."),
      mcq("JUNIOR", "Why can a bare `except:` be dangerous?", ["It is slower", "It swallows everything including KeyboardInterrupt and genuine bugs, hiding failures", "It only catches syntax errors", "It is deprecated"], 1, "Catch the exceptions you can handle; let the rest surface."),
      mcq("JUNIOR", "What does `yield` change about a function?", ["Nothing, it is a synonym for return", "It makes it a generator that produces values lazily instead of building the whole result in memory", "It makes it asynchronous", "It caches the result"], 1, "Laziness is the point: you can iterate a billion rows without holding them all."),
      mcq("MID", "Your Django app is slow and the profiler shows most time in the template layer. What is the most likely cause?", ["Templates are inherently slow", "The template is triggering database queries per row through lazy relations", "Too many CSS files", "The server needs more RAM"], 1, "Lazy attribute access in a loop is the N+1 problem wearing a different hat."),
      spoken("CONCEPTUAL", "MID", "Explain what a migration is and what makes one dangerous to run on a large production table.", [
        c("purpose", "Understands schema versioning", 3, ["schema", "version", "change", "apply", "history"]),
        c("danger", "Knows about locking and rewrites", 3, ["lock", "rewrite", "downtime", "large", "block"]),
        c("mitigation", "Has a safer approach", 2, ["batch", "nullable", "backfill", "concurrent", "steps"]),
      ]),
      typed("SCENARIO", "MID", "A colleague's pull request works but adds a function with eight positional parameters and no tests. Write the review you would leave.", [
        c("specific", "Concrete, actionable comments", 3, ["suggest", "consider", "instead", "could"]),
        c("reasoning", "Explains why, not just what", 3, ["because", "hard to", "risk", "readable"]),
        c("tone", "Constructive rather than dismissive", 2, ["nice", "thanks", "what do you think", "happy to"]),
      ]),
    ],
  },

  {
    slug: "devops-cloud",
    name: "DevOps / Cloud Infrastructure",
    blurb: "",
    questions: [
      mcq("BEGINNER", "What does a load balancer do?", ["Compresses responses", "Distributes incoming requests across several instances and stops sending traffic to unhealthy ones", "Caches database queries", "Encrypts traffic only"], 1, "Health-based removal is as important as the distribution itself."),
      mcq("BEGINNER", "Why store secrets in a secret manager rather than environment variables in a repo?", ["Environment variables are slow", "Anything in the repository is readable by everyone with access and lives forever in history", "Environment variables have a size limit", "It is only a convention"], 1, "Git history means a committed secret is leaked even after you delete it."),
      mcq("BEGINNER", "What is the point of a staging environment?", ["To have a backup of production", "To exercise a change against production-like conditions before real users see it", "To run tests faster", "To store old releases"], 1, "Its value is proportional to how closely it resembles production."),
      mcq("JUNIOR", "Your alert fires 40 times a day and is always ignored. What should you do?", ["Increase the threshold until it stops firing", "Work out whether it signals something actionable; if not, delete it, and if so, fix the underlying noise", "Route it to a different channel", "Add more alerts"], 1, "An ignored alert is worse than no alert: it trains people to ignore the channel."),
      mcq("JUNIOR", "What does 'immutable infrastructure' mean in practice?", ["Servers cannot be deleted", "You replace instances with new ones built from an image rather than patching them in place", "Configuration files are read-only", "Nothing can be changed after launch"], 1, "It eliminates configuration drift by never modifying a running machine."),
      mcq("MID", "Your autoscaling scales on CPU, but the bottleneck is database connections. What happens under load?", ["It scales correctly", "It adds instances that each open more connections, making the real bottleneck worse", "It refuses to scale", "It scales the database too"], 1, "Scaling on the wrong signal can actively accelerate an outage."),
      spoken("CONCEPTUAL", "MID", "Explain the difference between logs, metrics and traces, and what each is bad at.", [
        c("distinction", "Distinguishes all three", 3, ["log", "metric", "trace", "event", "aggregate", "request"]),
        c("weakness", "Names a real weakness of each", 3, ["expensive", "cardinal", "volume", "sampling", "cannot"]),
        c("practice", "Knows when to reach for which", 2, ["when", "use", "start with", "then"]),
      ]),
      typed("SCENARIO", "MID", "You are handed an AWS account with no documentation and a monthly bill that has doubled in three months. Write your first week.", [
        c("visibility", "Gets visibility before acting", 3, ["cost explorer", "tag", "audit", "inventory", "breakdown"]),
        c("safety", "Does not delete blindly", 3, ["before", "check", "who owns", "used", "confirm"]),
        c("targets", "Finds the usual suspects", 2, ["idle", "storage", "snapshot", "instance", "nat", "egress"]),
      ]),
    ],
  },

  {
    slug: "data-engineering",
    name: "Data Engineering",
    blurb: "",
    questions: [
      mcq("BEGINNER", "What is the difference between a fact table and a dimension table?", ["Facts are bigger", "Facts hold measurable events; dimensions hold the descriptive attributes you slice them by", "Dimensions are computed", "There is no difference"], 1, "Sales rows are facts; the customer, product and date are dimensions."),
      mcq("BEGINNER", "Why is `SELECT *` discouraged in production pipelines?", ["It is slower to type", "It reads columns you do not need and silently changes behaviour when the schema changes", "It is invalid SQL", "It only works on small tables"], 1, "An upstream column addition can break a downstream load that assumed a shape."),
      mcq("BEGINNER", "What does ETL stand for and what does the order imply?", ["Extract, Transform, Load — data is reshaped before it lands", "Export, Transfer, Link", "Extract, Test, Log", "Evaluate, Transform, Load"], 0, "ELT reverses the last two, transforming inside the warehouse after landing raw data."),
      mcq("JUNIOR", "A daily row count drops 40% with no error. What is the most likely cause?", ["The warehouse compressed the data", "An upstream change — a renamed field, a failed partition, or a filter now excluding rows", "The query is wrong", "Normal variation"], 1, "Silent volume changes are the classic signal of an upstream break."),
      mcq("JUNIOR", "Why does timezone handling cause so many data bugs?", ["Timezones change size", "Events recorded in local time, stored without offset, and aggregated by day produce different answers depending on where you stand", "SQL cannot store timezones", "Only leap years matter"], 1, "Store UTC with an explicit offset and convert only at presentation."),
      mcq("MID", "What is the practical problem with a pipeline that has no idempotency?", ["It runs slowly", "It cannot be safely re-run, so any failure requires manual repair before recovery", "It uses more storage", "It cannot be scheduled"], 1, "Recovery is the whole point of idempotency: retry becomes safe."),
      spoken("CONCEPTUAL", "MID", "Explain what a slowly changing dimension is and why you would bother with one.", [
        c("concept", "Explains history preservation", 3, ["history", "change", "over time", "previous", "version"]),
        c("motivation", "Knows why it matters", 3, ["as of", "point in time", "report", "historic", "accurate"]),
        c("cost", "Aware of the complexity", 2, ["complex", "join", "more rows", "harder"]),
      ]),
      typed("SCENARIO", "MID", "Two dashboards report different revenue for the same month and both are 'correct' according to their owners. Write how you would resolve it.", [
        c("definition", "Suspects definitional difference first", 3, ["definition", "what counts", "refund", "tax", "timezone", "filter"]),
        c("trace", "Traces both to source", 3, ["lineage", "source", "back", "query", "compare"]),
        c("resolution", "Fixes it durably", 2, ["single", "canonical", "document", "agree", "one place"]),
      ]),
    ],
  },

  {
    slug: "qa-automation",
    name: "QA / Test Automation",
    blurb: "",
    questions: [
      mcq("BEGINNER", "What does a good test failure message tell you?", ["That the test failed", "What was expected, what actually happened, and enough context to locate the cause", "The line number only", "How long the test took"], 1, "A failure you must debug to understand is a test that costs more than it saves."),
      mcq("BEGINNER", "Why should a test not depend on the result of another test?", ["It is slower", "Running them alone, in a different order, or in parallel will fail unpredictably", "The framework forbids it", "It uses more memory"], 1, "Order dependence is the most common cause of 'passes locally, fails in CI'."),
      mcq("BEGINNER", "What is a test double used for?", ["Running the test twice", "Standing in for a real dependency so the test is fast and deterministic", "Doubling coverage", "Testing two things at once"], 1, "Mocks, stubs and fakes are all test doubles with different behaviours."),
      mcq("JUNIOR", "100% line coverage means…", ["The code is fully tested", "Every line executed during the tests — which says nothing about whether the assertions were meaningful", "There are no bugs", "Every branch was tested"], 1, "You can reach 100% coverage with no assertions at all."),
      mcq("JUNIOR", "Which is the better bug report title?", ["\"Login broken\"", "\"Login fails with 500 when email contains a plus sign\"", "\"Urgent issue\"", "\"Please fix ASAP\""], 1, "A specific title makes the bug searchable, triageable, and reproducible."),
      mcq("MID", "Your team wants to automate everything manual testers currently do. What is the sound objection?", ["Automation is too expensive", "Exploratory testing finds problems nobody thought to specify, which scripted automation by definition cannot", "Automation is unreliable", "Testers would lose their jobs"], 1, "Automation checks known expectations; exploration discovers unknown ones."),
      spoken("CONCEPTUAL", "MID", "Explain what you would test and what you would deliberately not test for a new checkout feature.", [
        c("prioritisation", "Prioritises by risk", 3, ["risk", "critical", "money", "most", "important"]),
        c("exclusion", "Willing to name what to skip", 3, ["not", "skip", "would not", "low value"]),
        c("layers", "Chooses the right level per case", 2, ["unit", "integration", "end to end", "manual"]),
      ]),
      typed("SCENARIO", "MID", "A developer says a bug you filed is 'not reproducible'. Write how you would respond.", [
        c("evidence", "Supplies better evidence", 3, ["steps", "video", "log", "environment", "version", "data"]),
        c("collaboration", "Not adversarial", 3, ["together", "pair", "happy to", "walk through"]),
        c("difference", "Looks for environmental difference", 2, ["different", "browser", "data", "account", "config"]),
      ]),
    ],
  },
];
