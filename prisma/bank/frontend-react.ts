import type { BankDomain } from "../question-bank";
import { c, mcq, spoken, typed } from "./authoring";

/**
 * Frontend — React / TypeScript — depth tranche.
 *
 * Weighted towards what actually distinguishes frontend engineers in practice:
 * rendering behaviour, accessibility, and performance on the devices real users
 * hold, rather than framework trivia that a search would answer.
 */
export const FRONTEND_DEPTH: BankDomain = {
  slug: "frontend-react",
  name: "Frontend — React / TypeScript",
  blurb: "Builds the interface users touch, in React and TypeScript.",
  questions: [
    // --- BEGINNER ---------------------------------------------------------
    mcq(
      "BEGINNER",
      "What is the difference between `props` and `state`?",
      [
        "Props are faster to read than state",
        "Props are passed in from the parent and not changed by the component; state is owned and changed by the component",
        "State can only hold strings",
        "Props are for styling and state is for data",
      ],
      1,
      "Ownership is the distinction. A component reads props and cannot reassign them; it owns its state and is the only thing that should change it.",
    ),
    mcq(
      "BEGINNER",
      "Why is `<img>` required to have an `alt` attribute?",
      [
        "It improves image loading speed",
        "Screen readers announce it, and it is shown when the image fails to load",
        "The browser will not render the image without it",
        "It is only needed for decorative images",
      ],
      1,
      "It is the text equivalent of the image. Decorative images should carry an empty `alt=\"\"` so assistive technology skips them rather than reading the filename.",
    ),
    mcq(
      "BEGINNER",
      "What does CSS `flex-direction: column` do?",
      [
        "Makes text render vertically",
        "Lays the flex container's children out top to bottom instead of left to right",
        "Creates a multi-column text layout",
        "Sets the width of each child to 100%",
      ],
      1,
      "It changes the main axis. Note that properties such as `justify-content` then apply vertically, which is a common source of confusion.",
    ),
    mcq(
      "BEGINNER",
      "In TypeScript, what does declaring a value as `string | null` mean?",
      [
        "It is a string that may be empty",
        "It holds either a string or null, and you must handle both before using it as a string",
        "It converts null into an empty string",
        "It is the same as `any`",
      ],
      1,
      "A union forces the check at compile time. That is the point: the compiler will not let you call a string method until you have narrowed away the null.",
    ),
    mcq(
      "BEGINNER",
      "Where should you put a network request that should run once when a component first appears?",
      [
        "Directly in the component body",
        "In a `useEffect` with an empty dependency array",
        "In the component's return statement",
        "In a `useState` initialiser",
      ],
      1,
      "The component body runs on every render, so a request there fires repeatedly. The effect runs after mount, which is where side effects belong.",
    ),
    mcq(
      "BEGINNER",
      "A button submits a form twice when clicked quickly. What is the simplest correct fix?",
      [
        "Add a CSS transition to slow the click",
        "Disable the button while the submission is in flight",
        "Wrap the handler in a try/catch",
        "Move the handler to the parent component",
      ],
      1,
      "Disabling communicates state to the user and prevents the second submission. Server-side idempotency is still worth having, but the button is the immediate fix.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "What is the DOM, and what does it mean when we say React updates it for you?", [
      c("dom", "Describes the DOM as the page's live structure", 3, ["tree", "elements", "structure", "browser", "nodes"]),
      c("react-role", "Explains describing what you want rather than mutating", 3, ["declarative", "describe", "react updates", "re-render", "state"]),
      c("contrast", "Contrasts with manual manipulation", 2, ["queryselector", "manually", "jquery", "by hand"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What does 'responsive design' mean, and how would you check that a page is genuinely responsive?", [
      c("meaning", "Explains adapting to viewport rather than fixed layouts", 3, ["viewport", "screen size", "adapt", "breakpoint", "fluid"]),
      c("technique", "Names concrete techniques", 2, ["media query", "flex", "grid", "relative units", "percentage"]),
      c("verification", "Describes testing on real constraints", 3, ["real device", "resize", "devtools", "small screen", "touch"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "Why does TypeScript exist when the browser only runs JavaScript? What does it actually buy you?", [
      c("purpose", "Explains catching errors before running", 3, ["compile", "before", "catch", "error", "type"]),
      c("tooling", "Mentions editor assistance and refactoring", 2, ["autocomplete", "editor", "refactor", "rename", "intellisense"]),
      c("limits", "Knows types disappear at runtime", 3, ["erased", "runtime", "compiled away", "not enforced", "validate"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A colleague reports that a dropdown you built cannot be used with the keyboard. Write how you would investigate and what you would change.", [
      c("reproduce", "Tries the keyboard path themselves", 3, ["tab", "keyboard", "arrow", "enter", "escape", "try"]),
      c("semantics", "Reaches for native elements or proper roles", 3, ["button", "select", "role", "aria", "semantic", "focusable"]),
      c("verification", "Confirms the fix beyond visual inspection", 2, ["screen reader", "test", "tab order", "focus visible"]),
    ]),
    typed("SCENARIO", "BEGINNER", "Text on a page is grey on a light grey background. The designer says it looks clean. Write your response.", [
      c("issue", "Identifies contrast as an accessibility problem", 3, ["contrast", "readable", "wcag", "low vision", "sunlight"]),
      c("evidence", "Proposes measuring rather than arguing taste", 3, ["ratio", "checker", "4.5", "measure", "tool"]),
      c("collaboration", "Works with the designer rather than overriding", 2, ["suggest", "alternative", "together", "still looks"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A form loses everything the user typed when they accidentally hit the browser back button. Write what you would do about it.", [
      c("empathy", "Recognises the user cost", 2, ["frustrating", "lost", "retype", "user"]),
      c("approach", "Proposes preserving the entered data", 3, ["local storage", "draft", "save", "session", "restore"]),
      c("warning", "Considers warning before leaving", 2, ["confirm", "warn", "unsaved", "beforeunload"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about something you built where you had to figure out the design yourself, with no mockup. How did you decide what it should look like?", [
      c("process", "Describes a reasoned approach rather than guesswork", 3, ["looked at", "reference", "simple", "user", "iterated"]),
      c("judgement", "Made deliberate choices", 2, ["chose", "decided", "because"]),
      c("feedback", "Sought reaction from someone", 2, ["showed", "asked", "feedback"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Describe a bug in something you built that a user found before you did. How did it make you think about testing?", [
      c("honesty", "Describes a real miss without deflecting", 3, ["missed", "did not test", "my", "assumed"]),
      c("analysis", "Understands why it was missed", 3, ["only tested", "happy path", "my browser", "assumption"]),
      c("change", "Changed something afterwards", 2, ["now i", "since", "check", "test"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time you had to learn a new tool or framework for a project. How did you go about it?", [
      c("method", "Describes an effective learning approach", 3, ["documentation", "tutorial", "small project", "built", "read"]),
      c("application", "Applied it to something real", 2, ["built", "used it", "project"]),
      c("depth", "Went beyond copying examples", 2, ["understood", "why", "underneath", "how it works"]),
    ]),

    // --- JUNIOR -----------------------------------------------------------
    mcq(
      "JUNIOR",
      "Why can using an array index as a React `key` cause bugs?",
      [
        "Indexes are slower than strings",
        "If items are reordered or removed, the index no longer identifies the same item, so state attaches to the wrong row",
        "React forbids numeric keys",
        "It causes a memory leak",
      ],
      1,
      "The key is an identity claim. With an index, deleting the first row makes React believe every subsequent row changed content rather than position — input state follows the wrong item.",
    ),
    mcq(
      "JUNIOR",
      "What does `useMemo` actually do?",
      [
        "Prevents a component from re-rendering",
        "Caches the result of a computation between renders while its dependencies are unchanged",
        "Makes a function reference stable",
        "Defers a computation to idle time",
      ],
      1,
      "It caches a value, not a render. `React.memo` skips renders and `useCallback` stabilises functions; conflating the three leads to memoising things that were never expensive.",
    ),
    mcq(
      "JUNIOR",
      "A modal opens but keyboard focus stays behind it on the page. What is the accessibility failure?",
      [
        "The modal is missing a close button",
        "Focus is not moved into the modal and not trapped there, so keyboard and screen reader users are stranded",
        "The modal has no animation",
        "The z-index is too low",
      ],
      1,
      "A modal must take focus, keep it while open, and return it to the trigger on close. Without that, the content behind is still reachable and the modal is effectively invisible to non-mouse users.",
    ),
    mcq(
      "JUNIOR",
      "Which of these makes a TypeScript codebase less safe despite compiling?",
      [
        "Using `interface` instead of `type`",
        "Widespread use of `as` assertions and `any` to silence errors",
        "Enabling `strict` mode",
        "Using generics",
      ],
      1,
      "An assertion tells the compiler to stop checking. It compiles and then fails at runtime in exactly the place the type system was trying to warn about.",
    ),
    mcq(
      "JUNIOR",
      "Your images are the largest part of a slow page. Which change usually helps most?",
      [
        "Minifying the JavaScript bundle",
        "Serving correctly sized, modern-format images and lazy-loading those below the fold",
        "Adding a loading spinner",
        "Moving images to a subdomain",
      ],
      1,
      "Sending a 4000px image into a 400px slot is the common waste. Format and dimensions cut bytes far more than transport tweaks do.",
    ),
    mcq(
      "JUNIOR",
      "What problem does a debounce solve on a search input?",
      [
        "It prevents typing errors",
        "It waits for a pause in typing so one request is sent instead of one per keystroke",
        "It caches the search results",
        "It cancels the previous render",
      ],
      1,
      "Throttle limits rate; debounce waits for quiet. Search wants debounce, because the intermediate queries have no value.",
    ),
    spoken("CONCEPTUAL", "JUNIOR", "Explain what causes a React component to re-render, and how you would find out why one is re-rendering more than you expect.", [
      c("causes", "Names state, props and parent renders", 3, ["state", "props", "parent", "context", "hook"]),
      c("investigation", "Describes measuring rather than guessing", 3, ["profiler", "devtools", "why did you render", "log", "measure"]),
      c("restraint", "Does not reach for memoisation reflexively", 2, ["measure first", "not always", "premature", "cost"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What is the difference between controlled and uncontrolled form inputs, and when would you choose each?", [
      c("mechanics", "Explains where the value lives", 3, ["state", "value", "dom", "ref", "default value"]),
      c("tradeoff", "Names the re-render and complexity trade-off", 3, ["re-render", "every keystroke", "simpler", "performance"]),
      c("choice", "Ties the choice to the need", 2, ["validation", "large form", "depends", "instant feedback"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "How do you decide whether state belongs in a component, lifted to a parent, or in a global store?", [
      c("locality", "Starts with the narrowest scope that works", 3, ["local", "closest", "lift", "only where needed"]),
      c("sharing", "Lifts when genuinely shared", 3, ["shared", "two components", "parent", "common ancestor"]),
      c("caution", "Treats global state as a cost", 2, ["global", "last resort", "coupling", "harder to trace"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A page shows a loading spinner, then content, then jumps as images load. Users complain it is 'jumpy'. Analyse the cause and describe the fix.", [
      c("diagnosis", "Identifies layout shift from unsized content", 3, ["layout shift", "cls", "no dimensions", "reflow", "height"]),
      c("fix", "Reserves space before content arrives", 3, ["width", "height", "aspect ratio", "skeleton", "placeholder"]),
      c("measurement", "Proposes verifying the improvement", 2, ["lighthouse", "cls", "measure", "before after"]),
    ]),
    typed("SCENARIO", "JUNIOR", "Your app calls an API that sometimes takes 8 seconds. The interface freezes with no feedback. Write how you would change the experience.", [
      c("feedback", "Gives immediate, honest feedback", 3, ["loading", "spinner", "skeleton", "progress", "disable"]),
      c("control", "Gives the user an escape", 3, ["cancel", "abort", "retry", "timeout"]),
      c("failure", "Handles the failure case explicitly", 2, ["error", "message", "fallback", "what went wrong"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A stakeholder asks for a feature that requires showing 5,000 rows at once. Write how you would respond and what you would build.", [
      c("challenge", "Questions the underlying need", 3, ["why", "what are they", "find", "actually need", "use case"]),
      c("technique", "Knows how to render large lists if required", 3, ["virtualise", "windowing", "pagination", "infinite scroll"]),
      c("alternative", "Offers search or filtering as the real answer", 2, ["search", "filter", "sort", "export"]),
    ]),
    typed("CODING", "JUNIOR", "Write a custom React hook `useDebouncedValue(value, delayMs)` that returns the value only after it has stopped changing. Handle cleanup on unmount.", [
      c("timing", "Resets the timer on each change", 3, ["settimeout", "cleartimeout", "delay", "effect"]),
      c("cleanup", "Clears the timer on unmount and on change", 3, ["return", "cleanup", "cleartimeout", "unmount"]),
      c("api", "Returns a sensible value immediately", 2, ["initial", "usestate", "return", "value"]),
    ]),
    typed("CODING", "JUNIOR", "Write a component that renders a list of items with a text filter above it. Show how you avoid re-filtering on every unrelated render.", [
      c("filtering", "Filters correctly and case-insensitively", 3, ["filter", "includes", "tolowercase", "query"]),
      c("memo", "Memoises the derived list against the right dependencies", 2, ["usememo", "dependency", "items", "query"]),
      c("keys", "Uses a stable identity for list items", 2, ["key", "id", "not index"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you disagreed with a design decision. How did you raise it?", [
      c("substance", "Had a concrete, user-grounded reason", 3, ["user", "accessibility", "confusing", "data", "because"]),
      c("approach", "Raised it constructively", 3, ["asked", "suggested", "showed", "prototype", "discussed"]),
      c("outcome", "Accepts the decision either way", 2, ["agreed", "went with", "outcome"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Describe a time you had to make an interface work on a device or browser you did not have. How did you handle it?", [
      c("resourcefulness", "Found a way to test rather than guessing", 3, ["emulator", "browserstack", "borrowed", "devtools", "asked"]),
      c("caution", "Recognised the limits of what they could verify", 2, ["could not fully", "risk", "assumed"]),
      c("outcome", "Confirmed afterwards", 2, ["confirmed", "user", "checked", "reported"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a component or page you are proud of. What made it good, beyond it working?", [
      c("quality", "Names qualities beyond function", 3, ["accessible", "fast", "reusable", "simple", "readable"]),
      c("users", "Shows awareness of who used it", 2, ["user", "feedback", "easier", "faster for"]),
      c("craft", "Shows genuine care in the detail", 2, ["detail", "edge case", "polish", "considered"]),
    ]),

    // --- MID --------------------------------------------------------------
    mcq(
      "MID",
      "Your app's largest contentful paint is 4.2s on mobile. Which is most likely to be responsible?",
      [
        "Too many React components",
        "A render-blocking bundle and an unoptimised hero image loaded late",
        "Using CSS-in-JS",
        "Too many event listeners",
      ],
      1,
      "LCP is dominated by when the largest element can paint. Blocking scripts delay everything, and the hero image is usually the element being measured.",
    ),
    mcq(
      "MID",
      "What is the practical risk of storing an authentication token in `localStorage`?",
      [
        "It is limited to 5MB",
        "Any injected script on the page can read it, so one XSS becomes full account takeover",
        "It is cleared when the tab closes",
        "It cannot be read by the server",
      ],
      1,
      "An HttpOnly cookie is unreadable by JavaScript, which contains the blast radius of an XSS. The trade-off is that cookies then need CSRF protection.",
    ),
    mcq(
      "MID",
      "A `useEffect` with `[user]` in its dependencies refetches constantly. `user` is an object built in the parent's render. Why?",
      [
        "Effects always run on every render",
        "A new object identity is created each render, so the dependency comparison never matches",
        "Objects cannot be used as dependencies",
        "The effect is missing a cleanup function",
      ],
      1,
      "Dependency comparison is by reference. Depending on `user.id`, or memoising the object at its source, fixes it.",
    ),
    mcq(
      "MID",
      "Which is the strongest reason to prefer CSS Grid over nested flexbox for a page layout?",
      [
        "Grid has better browser support",
        "Grid expresses two-dimensional layout directly, so rows and columns align without wrapper elements",
        "Grid is faster to render",
        "Flexbox cannot centre content",
      ],
      1,
      "Flexbox is one-dimensional. Forcing a two-dimensional layout out of it produces wrapper divs whose only job is to fight the model.",
    ),
    mcq(
      "MID",
      "You are code-splitting a large app. Which split usually yields the most benefit first?",
      [
        "Splitting every component into its own chunk",
        "Splitting by route, so a user downloads only the page they opened",
        "Splitting the CSS from the JavaScript",
        "Splitting third-party code into a vendor chunk",
      ],
      1,
      "Route-level boundaries match how people actually navigate. Per-component splitting multiplies requests for little gain, and a vendor chunk mainly helps caching rather than first load.",
    ),
    mcq(
      "MID",
      "What does a `Suspense` boundary let you express that a loading flag in state does not?",
      [
        "Faster data fetching",
        "A declarative fallback for anything below it that is not ready, without each component managing its own flag",
        "Automatic retries on failure",
        "Server-side rendering",
      ],
      1,
      "It moves the loading state to a boundary rather than scattering flags through the tree, which is what makes coordinated loading states tractable.",
    ),
    mcq(
      "MID",
      "A screen reader user reports that your live search results are never announced. What is missing?",
      [
        "An `alt` attribute",
        "An ARIA live region so updates are announced without moving focus",
        "A larger font size",
        "A `tabindex` on the results",
      ],
      1,
      "Visual users see the change; assistive technology needs to be told. A polite live region announces without stealing focus mid-typing.",
    ),
    spoken("CONCEPTUAL", "MID", "Explain how you would approach making an existing application accessible when it was built without any accessibility consideration.", [
      c("triage", "Prioritises by user impact rather than by rule count", 3, ["keyboard", "critical path", "blocking", "priority", "worst"]),
      c("technique", "Names real remediation techniques", 3, ["semantic", "aria", "focus", "contrast", "label", "landmark"]),
      c("process", "Builds prevention into the workflow", 2, ["lint", "ci", "audit", "checklist", "test"]),
    ]),
    spoken("CONCEPTUAL", "MID", "What is hydration, and what kinds of bugs are unique to it?", [
      c("definition", "Explains attaching behaviour to server-rendered markup", 3, ["server", "html", "attach", "event", "client"]),
      c("mismatch", "Names markup mismatch as the characteristic bug", 3, ["mismatch", "different", "date", "random", "window", "warning"]),
      c("cost", "Notes the cost before interactivity", 2, ["blocking", "delay", "interactive", "bundle", "tti"]),
    ]),
    spoken("CONCEPTUAL", "MID", "How do you decide what belongs in a shared component library versus staying in a single application?", [
      c("criteria", "Uses genuine reuse rather than speculation", 3, ["used in", "twice", "three", "actually reused", "not speculative"]),
      c("cost", "Recognises the cost of premature abstraction", 3, ["abstraction", "props explosion", "coupling", "hard to change"]),
      c("governance", "Considers versioning and ownership", 2, ["version", "breaking", "owner", "migration"]),
    ]),
    spoken("CONCEPTUAL", "MID", "Explain your approach to testing frontend code. What do you test, and what do you deliberately not test?", [
      c("focus", "Tests behaviour a user can observe", 3, ["user", "behaviour", "role", "text", "interaction", "testing library"]),
      c("avoid", "Avoids testing implementation detail", 3, ["implementation", "internal state", "not snapshot", "brittle"]),
      c("layers", "Places different tests at appropriate layers", 2, ["unit", "integration", "e2e", "pyramid", "critical path"]),
    ]),
    typed("SCENARIO", "MID", "Your team's app has 40 different button styles that all started from one component. Write how you would get back to a coherent system.", [
      c("audit", "Inventories actual usage before designing", 3, ["audit", "inventory", "which", "usage", "catalogue"]),
      c("design", "Proposes a constrained variant API", 3, ["variant", "props", "tokens", "constrain", "limited"]),
      c("migration", "Migrates incrementally without a freeze", 2, ["codemod", "incremental", "deprecate", "gradually"]),
    ]),
    typed("SCENARIO", "MID", "A third-party analytics script is adding 800ms to page load and marketing will not remove it. Write your options and your recommendation.", [
      c("measurement", "Quantifies the actual cost", 3, ["measure", "ms", "blocking", "profile", "waterfall"]),
      c("options", "Offers real mitigations short of removal", 3, ["async", "defer", "lazy", "after load", "worker", "facade"]),
      c("negotiation", "Frames the trade-off for the stakeholder", 2, ["conversion", "bounce", "trade-off", "data", "business"]),
    ]),
    typed("SCENARIO", "MID", "Users on slow connections see the app shell and then a blank content area for several seconds. Write how you would improve the perceived experience.", [
      c("perception", "Distinguishes perceived from actual speed", 3, ["perceived", "skeleton", "progressive", "feels"]),
      c("technique", "Names concrete techniques", 3, ["skeleton", "streaming", "priority", "critical css", "prefetch"]),
      c("honesty", "Does not disguise failure as loading", 2, ["timeout", "error", "honest", "stuck"]),
    ]),
    typed("CODING", "MID", "Write a component that fetches paginated results as the user scrolls, cancels in-flight requests when the query changes, and does not fire twice for the same page.", [
      c("cancellation", "Aborts superseded requests", 3, ["abortcontroller", "signal", "cancel", "cleanup"]),
      c("deduplication", "Prevents duplicate page fetches", 3, ["ref", "loading", "guard", "already", "set"]),
      c("observer", "Detects the scroll boundary sensibly", 2, ["intersectionobserver", "sentinel", "scroll", "threshold"]),
    ]),
    typed("CODING", "MID", "Write an accessible modal component: focus moves in on open, is trapped while open, Escape closes it, and focus returns to the trigger.", [
      c("focus", "Moves and restores focus correctly", 3, ["focus", "ref", "return", "trigger", "previous"]),
      c("trap", "Keeps Tab within the dialog", 3, ["trap", "tab", "first", "last", "cycle"]),
      c("semantics", "Uses correct roles and Escape handling", 2, ["role", "dialog", "aria-modal", "escape", "keydown"]),
    ]),
    typed("CODING", "MID", "Write a TypeScript type and a component prop signature for a button that must accept either `href` or `onClick`, but never both. Explain the technique.", [
      c("union", "Uses a discriminated or exclusive union", 3, ["union", "never", "type", "|", "discriminate"]),
      c("enforcement", "Makes the invalid combination a compile error", 3, ["never", "error", "cannot", "exclusive"]),
      c("ergonomics", "Keeps the API usable", 2, ["readable", "inference", "simple", "props"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Tell me about a time you pushed back on a deadline because quality would have suffered. What happened?", [
      c("specificity", "Names the concrete risk", 3, ["accessibility", "bug", "untested", "security", "risk"]),
      c("communication", "Made the trade-off visible rather than refusing", 3, ["options", "explained", "scope", "what we could"]),
      c("outcome", "Reports the real result", 2, ["shipped", "delayed", "cut", "outcome"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Describe a time you mentored someone on frontend work. What did you find hardest about it?", [
      c("approach", "Taught rather than took over", 3, ["explained", "paired", "let them", "guided", "questions"]),
      c("difficulty", "Honest about what was hard", 3, ["hard", "patience", "resisted", "time", "struggled"]),
      c("outcome", "Focuses on the other person's growth", 2, ["they", "improved", "independent", "now"]),
    ]),

    // --- SENIOR -----------------------------------------------------------
    mcq(
      "SENIOR",
      "Which is the most defensible reason to adopt a micro-frontend architecture?",
      [
        "It reduces bundle size",
        "Independent teams need to deploy independently and the coordination cost has become the bottleneck",
        "It makes the code easier to read",
        "It removes the need for a shared design system",
      ],
      1,
      "The problem it solves is organisational, not technical. Bundle size usually gets worse from duplicated dependencies, and a shared design system becomes more necessary rather than less.",
    ),
    mcq(
      "SENIOR",
      "Your design system ships a breaking change to a core component used by 12 teams. What is the soundest release approach?",
      [
        "Publish a major version and let teams migrate whenever they can",
        "Publish a major version alongside a codemod and a deprecation period where both APIs work",
        "Patch it silently to avoid disruption",
        "Fork the component per team",
      ],
      1,
      "Twelve teams will not migrate on your schedule without help. Overlapping support plus automated migration is what makes the change actually land.",
    ),
    mcq(
      "SENIOR",
      "What is the most reliable way to keep frontend performance from regressing over time?",
      [
        "A quarterly performance review",
        "Automated budgets enforced in CI that fail the build when key metrics regress",
        "Training all engineers on performance",
        "Using a faster framework",
      ],
      1,
      "Anything not enforced decays. A budget in the pipeline catches the regression in the pull request that caused it, when it is still cheap to fix.",
    ),
    spoken("CONCEPTUAL", "SENIOR", "How would you design the state architecture for an application with real-time collaborative editing?", [
      c("conflict", "Addresses concurrent edits explicitly", 3, ["conflict", "crdt", "operational transform", "merge", "last write"]),
      c("latency", "Handles optimistic updates and reconciliation", 3, ["optimistic", "rollback", "reconcile", "local first", "latency"]),
      c("failure", "Considers disconnection and resync", 2, ["offline", "reconnect", "resync", "queue", "stale"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "What is your position on rendering strategy — static, server, client, or streaming — and how do you decide per route?", [
      c("nuance", "Decides per route rather than globally", 3, ["per route", "depends", "mixed", "some pages"]),
      c("criteria", "Uses concrete criteria", 3, ["cacheable", "personalised", "seo", "freshness", "interactive"]),
      c("cost", "Weighs infrastructure and complexity cost", 2, ["cost", "cache", "invalidation", "complexity", "operational"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "How do you approach frontend security beyond avoiding XSS?", [
      c("breadth", "Covers more than input escaping", 3, ["csp", "csrf", "dependency", "supply chain", "clickjacking", "cors"]),
      c("dependencies", "Treats third-party code as a risk surface", 3, ["npm", "dependency", "audit", "third party", "script"]),
      c("defence", "Layers defences rather than relying on one", 2, ["defence in depth", "layer", "assume", "contain"]),
    ]),
    typed("SCENARIO", "SENIOR", "You are asked to support a locale that reads right to left, plus text that expands 40% when translated. The app was built English-only. Write your assessment and plan.", [
      c("scope", "Recognises this touches layout, not just strings", 3, ["rtl", "direction", "mirror", "layout", "icon", "logical properties"]),
      c("expansion", "Plans for longer text breaking layouts", 3, ["overflow", "truncate", "wrap", "fixed width", "expansion"]),
      c("process", "Sets up ongoing translation workflow", 2, ["extract", "keys", "workflow", "pseudo-localisation", "review"]),
    ]),
    typed("SCENARIO", "SENIOR", "A/B tests are being added by three teams and the app now has 60 flags, many stale. Write how you would bring this under control without stopping experimentation.", [
      c("lifecycle", "Gives flags an expiry and owner", 3, ["expiry", "owner", "ttl", "cleanup", "stale"]),
      c("interaction", "Addresses combinatorial interaction between flags", 3, ["interaction", "combination", "conflict", "test matrix"]),
      c("enablement", "Keeps experimentation viable", 2, ["still", "process", "self-serve", "guardrail"]),
    ]),
    typed("SCENARIO", "SENIOR", "Your app must keep working for users on a 2018 Android phone with 2GB RAM while the team wants to adopt a heavy new framework. Write your position.", [
      c("evidence", "Grounds the decision in real device data", 3, ["analytics", "device", "share", "measure", "real user"]),
      c("technical", "Understands memory and CPU constraints", 3, ["memory", "cpu", "parse", "bundle", "throttle"]),
      c("decision", "Reaches a defensible conclusion either way", 2, ["recommend", "trade-off", "because", "budget"]),
    ]),
    typed("SCENARIO", "SENIOR", "Users report the app 'randomly logs them out'. It is not reproducible internally. Write your investigation plan.", [
      c("instrumentation", "Adds signal before theorising", 3, ["log", "telemetry", "correlate", "session", "instrument"]),
      c("hypotheses", "Proposes plausible causes", 3, ["token expiry", "clock", "refresh race", "multiple tab", "storage cleared"]),
      c("segmentation", "Looks for the pattern among affected users", 2, ["which users", "browser", "device", "segment", "cohort"]),
    ]),
    typed("CODING", "SENIOR", "Write a request layer that deduplicates identical in-flight GET requests, caches responses briefly, and revalidates stale data in the background. State the invalidation rules.", [
      c("dedup", "Shares one promise across identical concurrent calls", 3, ["map", "in-flight", "promise", "key", "dedupe"]),
      c("staleness", "Implements stale-while-revalidate correctly", 3, ["stale", "revalidate", "ttl", "background", "return cached"]),
      c("invalidation", "States when entries are dropped", 2, ["invalidate", "mutation", "evict", "key", "clear"]),
    ]),
    typed("CODING", "SENIOR", "Write an error boundary strategy for a large app: what is caught where, what the user sees, and what gets reported. Show the key code.", [
      c("granularity", "Places boundaries at meaningful units", 3, ["route", "widget", "boundary", "granular", "isolate"]),
      c("recovery", "Offers a path forward rather than a dead end", 3, ["retry", "reset", "fallback", "reload", "still usable"]),
      c("reporting", "Reports with enough context to act on", 2, ["report", "sentry", "context", "user", "stack"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about a time you led a significant frontend migration. How did you keep the product shipping during it?", [
      c("strategy", "Migrated incrementally rather than big-bang", 3, ["incremental", "strangler", "parallel", "route by route", "coexist"]),
      c("delivery", "Kept feature work moving", 3, ["still shipped", "alongside", "did not freeze", "balance"]),
      c("honesty", "Reports what went badly too", 2, ["longer", "underestimated", "did not", "harder"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Describe a time you had to raise the quality bar on a team that had stopped caring about it. What worked?", [
      c("diagnosis", "Understood why standards had slipped", 3, ["pressure", "deadline", "why", "listened", "cause"]),
      c("mechanism", "Used systems rather than exhortation", 3, ["lint", "ci", "review", "template", "automated", "default"]),
      c("buy-in", "Brought people with them", 2, ["agreed", "team", "together", "convinced"]),
    ]),

    // --- STAFF ------------------------------------------------------------
    mcq(
      "STAFF",
      "You are setting frontend standards across eight teams. Which approach is most likely to be adopted?",
      [
        "A written standards document reviewed quarterly",
        "A generator and shared configuration that makes the standard path the easiest path",
        "A mandatory review by the platform team on every pull request",
        "A quarterly audit with a compliance score",
      ],
      1,
      "Standards survive when following them is less work than not. Documents are unread, and gate-keeping reviews make the platform team the bottleneck they were meant to remove.",
    ),
    mcq(
      "STAFF",
      "Which signal most reliably indicates a design system is failing its users?",
      [
        "Component count is not growing",
        "Teams are copying components out and modifying them locally",
        "The library has open issues",
        "Adoption is below 100%",
      ],
      1,
      "Forking is the market speaking. It means the component does not fit real needs and the escape hatch was cheaper than the contribution path.",
    ),
    mcq(
      "STAFF",
      "What is the strongest argument against standardising every team on one frontend framework?",
      [
        "Frameworks go out of fashion",
        "The cost is real but the benefit depends on whether teams actually share code and people",
        "Different frameworks perform differently",
        "It limits hiring",
      ],
      1,
      "Standardisation pays off through shared libraries, shared tooling and engineer mobility. Where teams genuinely do not share those things, the benefit is largely theoretical while the migration cost is not.",
    ),
    spoken("CONCEPTUAL", "STAFF", "How would you build a case to executives for investing in frontend performance when there is no obvious incident driving it?", [
      c("translation", "Converts performance into business outcomes", 3, ["conversion", "revenue", "bounce", "retention", "cost"]),
      c("evidence", "Uses real data from their own product", 3, ["our data", "measure", "correlate", "experiment", "field data"]),
      c("proposal", "Asks for something specific and bounded", 2, ["specific", "budget", "quarter", "target", "scope"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "What is your philosophy on dependency management for a large frontend codebase?", [
      c("criteria", "Has explicit criteria for adding a dependency", 3, ["maintained", "size", "alternative", "criteria", "own it"]),
      c("risk", "Treats dependencies as supply-chain risk", 3, ["supply chain", "audit", "lockfile", "compromise", "transitive"]),
      c("maintenance", "Plans for ongoing upgrade cost", 2, ["upgrade", "renovate", "cadence", "debt"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How do you think about the boundary between design and engineering, and where do most organisations get it wrong?", [
      c("collaboration", "Describes genuine collaboration over handoff", 3, ["handoff", "together", "early", "involved", "collaborate"]),
      c("failure", "Names a real, common failure mode", 3, ["thrown over", "late", "no constraints", "pixel", "rework"]),
      c("mechanism", "Proposes a structural fix", 2, ["tokens", "shared", "system", "pairing", "review"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How would you decide whether your organisation should build a native mobile app or invest further in the web?", [
      c("criteria", "Uses capability and distribution criteria", 3, ["capability", "offline", "push", "store", "distribution", "device"]),
      c("cost", "Accounts for ongoing dual maintenance", 3, ["two codebases", "maintenance", "team", "cost", "parity"]),
      c("evidence", "Grounds it in user behaviour data", 2, ["data", "usage", "retention", "user research"]),
    ]),
    typed("SCENARIO", "STAFF", "The company is acquiring a competitor whose product is built on an entirely different frontend stack. You must present an integration strategy. Write it.", [
      c("options", "Lays out genuine options rather than one answer", 3, ["keep separate", "rewrite", "gradual", "integrate", "options"]),
      c("criteria", "Decides on business, not aesthetic, grounds", 3, ["customer", "revenue", "team", "timeline", "risk"]),
      c("people", "Addresses the acquired engineers", 2, ["team", "retention", "morale", "knowledge"]),
    ]),
    typed("SCENARIO", "STAFF", "A regulator now requires your product to meet WCAG 2.2 AA within nine months. Nobody has audited it. Write your programme.", [
      c("assessment", "Establishes the real gap first", 3, ["audit", "baseline", "assess", "scope", "inventory"]),
      c("execution", "Sequences by risk and user impact", 3, ["critical journey", "priority", "phase", "highest"]),
      c("sustainability", "Prevents regression after compliance", 3, ["ci", "lint", "training", "definition of done", "ongoing"]),
    ]),
    typed("SCENARIO", "STAFF", "Three teams have each built their own data-fetching layer. A fourth is about to start. Write how you would intervene.", [
      c("timing", "Acts before the fourth divergence", 3, ["now", "before", "converge", "opportunity"]),
      c("approach", "Builds from what exists rather than imposing", 3, ["learn from", "best of", "existing", "migrate", "adapter"]),
      c("adoption", "Makes adoption attractive rather than mandated", 2, ["easier", "value", "support", "voluntary", "help"]),
    ]),
    typed("SCENARIO", "STAFF", "Your frontend build takes 18 minutes and engineers batch their pull requests to avoid waiting. Write your analysis of the true cost and your plan.", [
      c("cost", "Quantifies the compounding human cost", 3, ["engineer hours", "context switch", "batching", "larger prs", "cost"]),
      c("diagnosis", "Profiles before optimising", 3, ["profile", "which step", "measure", "cache", "bottleneck"]),
      c("plan", "Proposes concrete, sequenced improvements", 2, ["cache", "parallel", "incremental", "split", "remote"]),
    ]),
    typed("SCENARIO", "STAFF", "A senior engineer proposes rewriting the entire frontend in a new framework, and half the team is enthusiastic. Write how you would handle it.", [
      c("scrutiny", "Separates real problems from novelty", 3, ["what problem", "specific", "evidence", "actually", "symptom"]),
      c("alternatives", "Explores incremental adoption", 3, ["incremental", "one route", "pilot", "coexist", "trial"]),
      c("respect", "Engages the enthusiasm rather than crushing it", 2, ["team", "motivation", "listen", "involve"]),
    ]),
    typed("CODING", "STAFF", "Sketch the public API for a shared component library's theming layer: runtime theme switching, per-brand overrides, and type safety. Explain the key trade-offs.", [
      c("api", "Defines a small, coherent surface", 3, ["tokens", "provider", "interface", "typed", "contract"]),
      c("flexibility", "Supports overrides without unbounded escape hatches", 3, ["override", "constrain", "scoped", "not arbitrary", "variant"]),
      c("tradeoff", "States what the design gives up", 2, ["trade-off", "cost", "runtime", "bundle", "flexibility"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Tell me about a technical standard you introduced that failed to take hold. Why did it fail?", [
      c("candour", "Admits a genuine failure", 3, ["failed", "did not", "ignored", "abandoned"]),
      c("analysis", "Diagnoses the real cause", 3, ["friction", "no value", "not involved", "imposed", "why"]),
      c("learning", "Changed their approach afterwards", 2, ["now i", "since", "instead", "differently"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Describe how you have grown other engineers into senior frontend roles. What did you do concretely?", [
      c("concreteness", "Gives specific actions, not platitudes", 3, ["gave them", "paired", "sponsored", "review", "project"]),
      c("stretch", "Created real opportunity with support", 3, ["stretch", "ownership", "backed", "safety net", "let them lead"]),
      c("outcome", "Points to actual progression", 2, ["promoted", "now leads", "grew", "took over"]),
    ]),
  ],
};
