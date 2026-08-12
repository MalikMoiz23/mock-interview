import type { BankDomain } from "../question-bank";
import { c, mcq, spoken, typed } from "./authoring";

/**
 * Top-up tranche.
 *
 * The per-domain files were written to a target of 30/30/30/15/15. Counting by
 * hand across ten files left some cells a question or two short once duplicate
 * prompts were rejected at seed time. This file closes those specific gaps
 * rather than padding every domain evenly, so the measured coverage matches the
 * stated target exactly.
 */

const APP_DEV: BankDomain = {
  slug: "app-development",
  name: "App Development (Mobile)",
  blurb: "Builds mobile applications for phones and tablets.",
  questions: [
    mcq(
      "BEGINNER",
      "Why should a tap target be larger than the icon drawn inside it?",
      [
        "It makes the icon easier to see",
        "Fingers are imprecise and cover the target, so the touchable area must be bigger than the visual",
        "It improves rendering performance",
        "It is required for dark mode",
      ],
      1,
      "Both platforms recommend around 44–48 points. A 16-point icon with a 16-point target is accurate with a mouse and frustrating with a thumb.",
    ),
    spoken("CONCEPTUAL", "JUNIOR", "Why does an app need a different navigation model on a phone than on a tablet, and how would you handle both?", [
      c("constraint", "Recognises the space and reach difference", 3, ["space", "reach", "thumb", "width", "one hand"]),
      c("pattern", "Names appropriate patterns per size", 3, ["tabs", "split view", "master detail", "drawer", "sidebar"]),
      c("approach", "Adapts rather than scaling one up", 2, ["adapt", "not stretch", "layout", "breakpoint", "size class"]),
    ]),
    typed("SCENARIO", "JUNIOR", "Your app stores a draft locally and the user reinstalls the app. Write what you would expect to happen and what you would design.", [
      c("reality", "Knows local data is lost on reinstall", 3, ["lost", "deleted", "gone", "removed", "wiped"]),
      c("decision", "Decides deliberately what should survive", 3, ["server", "sync", "account", "backup", "should it"]),
      c("expectation", "Sets the user's expectation clearly", 2, ["tell", "indicator", "saved to", "only on this device"]),
    ]),
    spoken("CONCEPTUAL", "MID", "How would you decide what belongs in a push notification and what does not?", [
      c("value", "Sends only what is worth an interruption", 3, ["interrupt", "worth", "timely", "actionable", "relevant"]),
      c("consequence", "Knows over-notifying loses the channel", 3, ["disable", "turn off", "uninstall", "lose", "permission"]),
      c("control", "Gives the user granular control", 2, ["settings", "categories", "opt out", "preferences", "quiet"]),
    ]),
    typed("SCENARIO", "MID", "Your app supports biometric login, and a user's fingerprint stops being recognised after an OS update. Write how you would handle it.", [
      c("fallback", "Always keeps a working alternative", 3, ["fallback", "password", "pin", "alternative", "locked out"]),
      c("invalidation", "Understands enrolment changes invalidate keys", 3, ["invalidate", "re-enrol", "key", "changed", "new fingerprint"]),
      c("communication", "Explains it to the user rather than failing silently", 2, ["explain", "message", "why", "re-authenticate"]),
    ]),
    typed("SCENARIO", "SENIOR", "You must support two mobile platforms with a team that has deep expertise in one and none in the other. Write your approach.", [
      c("honesty", "Acknowledges the capability gap plainly", 3, ["no expertise", "gap", "risk", "learning curve", "honest"]),
      c("options", "Weighs hiring, training and cross-platform", 3, ["hire", "train", "cross platform", "contract", "options"]),
      c("quality", "Guards against shipping a poor second version", 2, ["parity", "quality", "second class", "review", "standard"]),
    ]),
  ],
};

const BACKEND_PYTHON: BankDomain = {
  slug: "backend-python",
  name: "Backend — Python",
  blurb: "Builds services and data-handling code in Python.",
  questions: [
    mcq(
      "SENIOR",
      "A Python service holds a large in-memory cache and runs with four worker processes. What is the practical consequence?",
      [
        "The cache is shared automatically between workers",
        "Each worker holds its own copy, so memory use multiplies and the caches can disagree",
        "Only the first worker caches anything",
        "The cache is written to disk",
      ],
      1,
      "Process-based workers do not share memory. Either move the cache out of process or accept both the memory cost and the inconsistency.",
    ),
    spoken("CONCEPTUAL", "SENIOR", "How would you decide whether a piece of Python work belongs in a request handler, a background worker, or a scheduled job?", [
      c("user", "Keeps the request path to what the user must wait for", 3, ["user waits", "response", "fast", "not block", "synchronous"]),
      c("durability", "Uses a worker where the work must survive failure", 3, ["retry", "durable", "queue", "survive", "guaranteed"]),
      c("timing", "Uses a schedule where work is time-driven rather than event-driven", 2, ["nightly", "periodic", "scheduled", "batch", "cron"]),
    ]),
  ],
};

const DATA_ENGINEERING: BankDomain = {
  slug: "data-engineering",
  name: "Data Engineering",
  blurb: "Builds the pipelines and models that turn raw data into something trustworthy.",
  questions: [
    mcq(
      "JUNIOR",
      "A pipeline's source column changes from an integer id to a string id. What breaks first and most quietly?",
      [
        "The pipeline fails to start",
        "Joins against downstream tables silently match nothing, producing empty or shrunken results",
        "The storage cost increases",
        "The schedule stops firing",
      ],
      1,
      "A type change that still loads is worse than one that crashes. The join simply stops matching and the row count drop looks like a quiet business change.",
    ),
    typed("SCENARIO", "SENIOR", "You must give an external partner a daily extract of data that contains fields they are not permitted to see. Write your approach.", [
      c("minimisation", "Sends only the permitted fields", 3, ["only", "select", "exclude", "minimum", "view"]),
      c("enforcement", "Enforces it structurally rather than by convention", 3, ["view", "separate table", "role", "generated", "not manual"]),
      c("verification", "Verifies each delivery rather than trusting the query", 2, ["check", "audit", "test", "verify", "schema check"]),
    ]),
  ],
};

const DEVOPS: BankDomain = {
  slug: "devops-cloud",
  name: "DevOps / Cloud Infrastructure",
  blurb: "Builds and operates the infrastructure and delivery pipeline products run on.",
  questions: [
    mcq(
      "JUNIOR",
      "Why should a CI job that deploys to production use a short-lived credential rather than a long-lived key?",
      [
        "Short-lived credentials are faster",
        "A leaked long-lived key stays valid indefinitely, while a short-lived one expires before most attackers can use it",
        "Long-lived keys cost more",
        "It is required by most CI providers",
      ],
      1,
      "CI logs, forks and caches all leak credentials occasionally. Expiry converts a permanent compromise into a narrow window.",
    ),
    spoken("CONCEPTUAL", "MID", "Explain what you would do differently when designing a system that must survive the loss of an entire availability zone.", [
      c("distribution", "Spreads capacity across zones", 3, ["multi-az", "spread", "zones", "replica", "distribute"]),
      c("state", "Addresses data and stateful components", 3, ["database", "failover", "replication", "quorum", "state"]),
      c("verification", "Tests the failure rather than assuming", 2, ["test", "game day", "simulate", "drill", "prove"]),
    ]),
    typed("SCENARIO", "SENIOR", "Your organisation has no way to tell which version of which service is running where. Write how you would fix it.", [
      c("identification", "Makes running versions discoverable", 3, ["version endpoint", "label", "tag", "metadata", "registry"]),
      c("provenance", "Links a running artefact back to a commit", 3, ["commit", "sha", "build", "immutable", "traceable"]),
      c("visibility", "Surfaces it where people look", 2, ["dashboard", "inventory", "query", "single place"]),
    ]),
  ],
};

const GRAPHIC_DESIGN: BankDomain = {
  slug: "graphic-design",
  name: "Graphic Design",
  blurb: "Creates visual work for brand, print and digital.",
  questions: [
    mcq(
      "JUNIOR",
      "You are supplied a logo as a JPEG with a white background and need it over a coloured panel. What is the correct action?",
      [
        "Remove the white with a magic wand tool",
        "Request the vector or transparent original, because a JPEG cut-out will leave artefacts and cannot scale",
        "Set the layer blend mode to multiply",
        "Recreate it by tracing",
      ],
      1,
      "Multiply appears to work on white and fails on any coloured or dark panel. Asking for the master file takes a minute and solves it permanently.",
    ),
    spoken("CONCEPTUAL", "JUNIOR", "What does contrast do in a layout, and what kinds of contrast can you use besides colour?", [
      c("function", "Explains contrast creating distinction and hierarchy", 3, ["hierarchy", "distinguish", "attention", "separate", "emphasis"]),
      c("variety", "Names several kinds", 3, ["size", "weight", "scale", "space", "texture", "direction", "shape"]),
      c("application", "Uses it deliberately rather than decoratively", 2, ["deliberate", "purpose", "guide", "lead the eye"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A client supplies copy that is twice the length the layout was designed for. Write how you would handle it.", [
      c("options", "Considers both design and copy changes", 3, ["cut", "edit", "shorter", "redesign", "more space", "second page"]),
      c("conversation", "Involves the client in the trade-off", 3, ["ask", "explain", "show", "options", "priority"]),
      c("integrity", "Refuses to simply shrink type to fit", 2, ["not shrink", "legibility", "would not", "readable"]),
    ]),
    mcq(
      "MID",
      "A brand needs to work in a single-colour application such as embossing or vehicle etching. What must be true of the identity?",
      [
        "It must include a gradient",
        "It must remain legible and recognisable with no colour, tone or fine detail to rely on",
        "It must be redrawn for each application",
        "It must use a serif typeface",
      ],
      1,
      "Single-colour reproduction is the hardest test of a mark. An identity that only works in full colour has not been designed for its real uses.",
    ),
    spoken("CONCEPTUAL", "MID", "How do you decide when a design problem needs a new visual idea rather than better execution of the existing one?", [
      c("diagnosis", "Distinguishes concept failure from craft failure", 3, ["concept", "idea", "execution", "polish", "fundamental"]),
      c("test", "Has a way of testing which it is", 3, ["strip back", "describe it", "does the idea", "without the styling"]),
      c("courage", "Willing to restart when the idea is wrong", 2, ["start again", "abandon", "new direction", "not salvage"]),
    ]),
    typed("SCENARIO", "MID", "You are asked to produce a design in a format you have never worked in — large-format exhibition graphics. Write how you would approach it.", [
      c("constraints", "Establishes the production constraints first", 3, ["viewing distance", "substrate", "resolution", "printer", "size", "installation"]),
      c("expertise", "Consults the people who produce it", 3, ["printer", "supplier", "ask", "specification", "template"]),
      c("verification", "Proofs at a meaningful scale", 2, ["proof", "section at full size", "test print", "check"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about a time you had to hand your work over to another designer to finish. How did you make that work?", [
      c("preparation", "Left the work in a usable state", 3, ["organised", "named", "layers", "documented", "tidy"]),
      c("transfer", "Communicated intent, not just files", 3, ["rationale", "why", "walked through", "intent", "explained"]),
      c("detachment", "Let them own it", 2, ["their", "let go", "trusted", "not interfere"]),
    ]),
  ],
};

const QA: BankDomain = {
  slug: "qa-automation",
  name: "QA / Test Automation",
  blurb: "Finds what is broken before users do, and builds the tests that keep it that way.",
  questions: [
    mcq(
      "JUNIOR",
      "What does it mean for a test to be 'deterministic'?",
      [
        "It runs quickly",
        "It produces the same result every time for the same code, with no dependence on timing, order or randomness",
        "It tests only one thing",
        "It does not use a database",
      ],
      1,
      "Non-determinism is what flakiness is. Time, random values, network timing and test order are the usual sources.",
    ),
    spoken("CONCEPTUAL", "JUNIOR", "What would you check before believing that a passing test suite means a release is safe?", [
      c("coverage", "Asks what the suite does not cover", 3, ["what is not tested", "gaps", "coverage", "which areas", "missing"]),
      c("quality", "Questions whether the tests assert anything real", 3, ["assert", "meaningful", "would it catch", "flaky", "trust"]),
      c("beyond", "Knows tests are not the only signal", 2, ["exploratory", "manual", "monitoring", "canary", "not enough"]),
    ]),
    typed("SCENARIO", "JUNIOR", "You are asked to sign off a release but two tests are disabled with a comment saying 'flaky, fix later'. Write your response.", [
      c("investigation", "Establishes what those tests covered", 3, ["what do they test", "which feature", "why disabled", "coverage"]),
      c("risk", "Treats disabled tests as unknown risk", 3, ["unknown", "risk", "not covered", "could be real", "gap"]),
      c("action", "Proposes a concrete resolution", 2, ["manual check", "fix", "ticket", "owner", "before sign off"]),
    ]),
    mcq(
      "MID",
      "A bug is reproducible only on the second run of a test suite, never the first. What does that most strongly suggest?",
      [
        "The test framework is faulty",
        "State left behind by an earlier run — a database row, a cache, or a file — is changing the starting conditions",
        "The application has a memory leak",
        "The test needs a longer timeout",
      ],
      1,
      "First-run-passes-second-run-fails is the signature of leaked state. It is also a genuine finding about the application if production restarts less often than your test suite does.",
    ),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about a time you had to build testing capability in a team that had none. Where did you start?", [
      c("start", "Started somewhere with visible value", 3, ["critical path", "one area", "smoke", "highest risk", "first"]),
      c("enablement", "Made it easy for developers to contribute", 3, ["helper", "fixture", "template", "paired", "documentation"]),
      c("durability", "It continued without them", 2, ["they now", "sustained", "habit", "still"]),
    ]),
  ],
};

const UIUX: BankDomain = {
  slug: "uiux-design",
  name: "UI/UX Design",
  blurb: "Designs how a product works and how it feels to use.",
  questions: [
    mcq(
      "JUNIOR",
      "What is the accessibility problem with removing the browser's default focus outline?",
      [
        "It changes the visual design",
        "Keyboard users lose the only indication of where they are on the page",
        "It breaks screen readers",
        "It affects colour contrast",
      ],
      1,
      "Removing it is acceptable only if you replace it with something at least as visible. Removing it outright makes the interface unusable without a mouse.",
    ),
    spoken("CONCEPTUAL", "JUNIOR", "What is the difference between an error the user caused and an error the system caused, and should the interface treat them differently?", [
      c("distinction", "Separates user error from system failure", 3, ["user", "system", "our fault", "invalid input", "server"]),
      c("tone", "Adjusts tone and blame appropriately", 3, ["do not blame", "apologise", "tone", "helpful", "not their fault"]),
      c("recovery", "Offers the right next step for each", 2, ["fix", "retry", "what to do", "contact", "recover"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A stakeholder asks you to add a tooltip to explain a confusing label. Write your response.", [
      c("root", "Treats the tooltip as a symptom", 3, ["why is it confusing", "label", "rename", "root", "symptom"]),
      c("limits", "Knows tooltips are poorly discoverable", 3, ["hover", "not on touch", "hidden", "discoverable", "missed"]),
      c("alternative", "Proposes fixing the label or adding visible help", 2, ["clearer label", "visible", "inline", "helper text"]),
    ]),
    mcq(
      "MID",
      "Your product's onboarding has a 90% completion rate but 40% of those users never return. What does this most likely indicate?",
      [
        "Onboarding is too long",
        "Onboarding teaches the interface but does not get the user to a moment of real value",
        "The completion metric is wrong",
        "Users forgot their password",
      ],
      1,
      "A tour that ends with the user having achieved nothing is a tutorial rather than an onboarding. The measure that matters is first real outcome, not steps completed.",
    ),
    spoken("CONCEPTUAL", "MID", "How do you design for a product where the primary users are not the people who bought it?", [
      c("tension", "Names the conflicting incentives", 3, ["buyer", "user", "different", "conflict", "who decides"]),
      c("advocacy", "Represents the end user", 3, ["end user", "daily", "advocate", "research with", "actually use"]),
      c("commercial", "Engages the buyer's needs honestly", 2, ["reporting", "admin", "procurement", "both", "commercial"]),
    ]),
    typed("SCENARIO", "MID", "Your team wants to add an AI assistant to the product because competitors have one. Write your response.", [
      c("problem", "Insists on a user problem first", 3, ["what problem", "why", "user need", "not because", "competitor"]),
      c("suitability", "Considers where it genuinely helps", 3, ["good for", "not for", "uncertain", "verify", "wrong answers"]),
      c("trust", "Designs for the failure case", 2, ["wrong", "confidence", "check", "undo", "transparent"]),
    ]),
  ],
};

export const TOPUP_DOMAINS: BankDomain[] = [
  APP_DEV,
  BACKEND_PYTHON,
  DATA_ENGINEERING,
  DEVOPS,
  GRAPHIC_DESIGN,
  QA,
  UIUX,
];
