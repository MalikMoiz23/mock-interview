import type { BankDomain } from "../question-bank";
import { c, mcq, spoken, typed } from "./authoring";

/**
 * QA / Test Automation — depth tranche.
 *
 * The senior and staff material deliberately tests judgement about what NOT to
 * automate and how to argue for quality against delivery pressure, because
 * those decide whether a QA function adds value or becomes a bottleneck.
 */
export const QA_DEPTH: BankDomain = {
  slug: "qa-automation",
  name: "QA / Test Automation",
  blurb: "Finds what is broken before users do, and builds the tests that keep it that way.",
  questions: [
    // --- BEGINNER ---------------------------------------------------------
    mcq(
      "BEGINNER",
      "What is the difference between a test's assertion and its setup?",
      [
        "Setup runs after the assertion",
        "Setup puts the system in a known state; the assertion is the specific claim being checked",
        "Assertions are optional",
        "Setup is only needed for integration tests",
      ],
      1,
      "A test with elaborate setup and no clear assertion proves nothing. A test with several unrelated assertions cannot tell you which claim failed.",
    ),
    mcq(
      "BEGINNER",
      "Why is 'the app is broken' a poor bug report?",
      [
        "It is too short",
        "It gives no steps, no expected result and no actual result, so nobody can reproduce or judge it",
        "It uses informal language",
        "It does not name a developer",
      ],
      1,
      "Steps, expected, actual, environment. Without those, the first hour of every bug is spent recovering information the reporter already had.",
    ),
    mcq(
      "BEGINNER",
      "What is equivalence partitioning?",
      [
        "Splitting tests across multiple machines",
        "Grouping inputs that should be handled identically, so one representative from each group is tested",
        "Dividing a test suite by feature",
        "Running the same test with different browsers",
      ],
      1,
      "It is how you get useful coverage without testing every possible value. Boundary testing then checks the edges between partitions.",
    ),
    mcq(
      "BEGINNER",
      "A test checks that a page contains the text 'Success'. What is the weakness?",
      [
        "Text assertions are always wrong",
        "It passes even if the underlying action did not actually happen, as long as the word appears",
        "It is too slow",
        "It cannot run in CI",
      ],
      1,
      "The test verifies a symptom rather than the outcome. Checking the resulting state — the record created, the balance changed — is what makes it meaningful.",
    ),
    mcq(
      "BEGINNER",
      "Why is it important that a test can be run repeatedly without manual cleanup?",
      [
        "It saves disk space",
        "A test that only passes on a fresh environment cannot run in CI or be trusted by anyone else",
        "It makes the test faster",
        "It is required by test frameworks",
      ],
      1,
      "Repeatability is what separates a test from a one-off check. Tests that leave state behind also break the tests that run after them.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "How would you test a search box? Talk me through everything you would try.", [
      c("happy", "Covers the ordinary case", 2, ["normal", "finds", "results", "expected"]),
      c("edges", "Explores empty, long, special characters and no results", 3, ["empty", "no results", "special", "long", "spaces", "case"]),
      c("beyond", "Considers performance, accessibility or injection", 3, ["slow", "many results", "keyboard", "injection", "unicode", "paste"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What does 'quality' mean for software, beyond the absence of bugs?", [
      c("breadth", "Goes beyond defects", 3, ["usable", "fast", "accessible", "reliable", "understandable"]),
      c("user", "Centres on the person using it", 3, ["user", "task", "achieve", "confusing", "trust"]),
      c("context", "Knows quality is relative to purpose", 2, ["depends", "context", "prototype", "medical", "fit for"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What is the difference between finding a bug and proving it matters?", [
      c("severity", "Distinguishes severity from priority", 3, ["severity", "priority", "impact", "how many", "frequency"]),
      c("evidence", "Gathers evidence of impact", 3, ["how often", "who", "data", "reproduce", "affected"]),
      c("communication", "Frames it so others can decide", 2, ["explain", "business", "decision", "risk"]),
    ]),
    typed("SCENARIO", "BEGINNER", "You have two days to test a feature and no specification. Write how you would spend the time.", [
      c("discovery", "Establishes intended behaviour first", 3, ["ask", "designer", "developer", "ticket", "what should"]),
      c("exploration", "Uses structured exploratory testing", 3, ["explore", "charter", "notes", "session", "systematic"]),
      c("prioritisation", "Spends time where risk is highest", 2, ["riskiest", "most used", "critical", "priority"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A user reports a bug that you cannot reproduce on your machine. Write what you would do.", [
      c("information", "Gathers what differs about their situation", 3, ["browser", "device", "version", "steps", "data", "account"]),
      c("evidence", "Seeks logs, screenshots or a recording", 3, ["screenshot", "video", "logs", "console", "error"]),
      c("persistence", "Does not close it as unreproducible immediately", 2, ["not close", "keep open", "monitor", "others"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A release is going out tomorrow and you have found four bugs. Write how you would decide what to raise as blocking.", [
      c("criteria", "Uses impact and frequency criteria", 3, ["impact", "how many users", "workaround", "data loss", "frequency"]),
      c("communication", "Presents facts rather than demands", 3, ["explain", "options", "decision", "risk", "recommend"]),
      c("humility", "Accepts the release decision is not solely theirs", 2, ["their call", "product", "recommend", "flag"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time you were thorough and it paid off. What did you do that someone else might not have?", [
      c("thoroughness", "Describes going beyond the obvious", 3, ["also checked", "went further", "edge", "what if"]),
      c("payoff", "Found something real", 3, ["found", "would have", "caught", "prevented"]),
      c("method", "Was systematic rather than lucky", 2, ["systematic", "list", "checked each", "method"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Describe a time you had to test something you did not understand well. How did you cope?", [
      c("learning", "Built understanding deliberately", 3, ["asked", "read", "watched", "used it", "learned"]),
      c("honesty", "Was open about the limits of their testing", 3, ["told them", "said", "not sure", "flagged"]),
      c("value", "Still added value", 2, ["found", "still", "questions", "usable"]),
    ]),

    // --- JUNIOR -----------------------------------------------------------
    mcq(
      "JUNIOR",
      "What does the arrange-act-assert structure give a test?",
      [
        "Faster execution",
        "A single clear intent — one action under test, with setup and verification visibly separated",
        "Automatic cleanup",
        "Compatibility across frameworks",
      ],
      1,
      "When a test has three 'act' steps you cannot tell which behaviour broke. The structure enforces one behaviour per test.",
    ),
    mcq(
      "JUNIOR",
      "A test asserts on an element's CSS class name. Why is that fragile?",
      [
        "CSS classes are case sensitive",
        "The class is an implementation detail that changes with styling, breaking the test without any behaviour change",
        "Classes cannot be selected reliably",
        "It is slower than selecting by id",
      ],
      1,
      "Tests that break on refactoring train people to fix tests rather than trust them. Query by role, label or a dedicated test id instead.",
    ),
    mcq(
      "JUNIOR",
      "What is the strongest reason not to chase 100% code coverage?",
      [
        "It takes too long",
        "Coverage measures execution, not verification — code can be covered by tests that assert nothing meaningful",
        "Some code cannot be tested",
        "Coverage tools are unreliable",
      ],
      1,
      "It is a useful signal for finding untested areas and a terrible target. Gating on a number reliably produces assertion-free tests.",
    ),
    mcq(
      "JUNIOR",
      "Your end-to-end test waits for a fixed two seconds before clicking. What should it do instead?",
      [
        "Wait four seconds to be safe",
        "Wait for the specific condition — the element being visible and enabled — with a timeout",
        "Retry the whole test on failure",
        "Run the test on a faster machine",
      ],
      1,
      "Fixed waits are simultaneously too short on a slow day and wasted time on a fast one. Conditional waits are both faster and more reliable.",
    ),
    mcq(
      "JUNIOR",
      "A test creates a user, asserts on it, and leaves it in the database. What problem does this cause?",
      [
        "The test runs slowly",
        "State accumulates between runs, so tests start passing or failing depending on what ran before them",
        "The database runs out of space",
        "The assertion becomes invalid",
      ],
      1,
      "Order dependence is the result. Each test should create what it needs and leave nothing that another test could observe.",
    ),
    mcq(
      "JUNIOR",
      "A test suite is run with `--retry 3` and now passes. What has actually changed?",
      [
        "The flakiness is fixed",
        "Nothing — the flakiness is hidden, and a real intermittent bug is now indistinguishable from noise",
        "Tests run faster",
        "Coverage improved",
      ],
      1,
      "Retries can be a pragmatic stopgap, but only alongside tracking which tests retry. Otherwise they convert a signal into silence.",
    ),
    spoken("CONCEPTUAL", "JUNIOR", "Explain what makes a test suite trustworthy, and what destroys trust in one.", [
      c("reliability", "Identifies flakiness as the main destroyer", 3, ["flaky", "intermittent", "rerun", "ignore", "trust"]),
      c("meaning", "Tests must fail for real reasons", 3, ["real failure", "meaningful", "catches", "false positive"]),
      c("behaviour", "Describes what teams do once trust is gone", 2, ["ignore", "rerun", "merge anyway", "disable"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "How do you decide what to automate and what to test manually?", [
      c("criteria", "Uses repetition and stability as criteria", 3, ["repetitive", "stable", "regression", "changes often", "frequency"]),
      c("human", "Reserves exploration and judgement for people", 3, ["exploratory", "usability", "judgement", "look", "feel"]),
      c("cost", "Weighs maintenance cost of automation", 2, ["maintenance", "cost", "brittle", "worth"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What is risk-based testing, and how would you apply it with limited time?", [
      c("risk", "Combines likelihood and impact", 3, ["likelihood", "impact", "probability", "consequence", "risk"]),
      c("targeting", "Focuses effort on the highest risk areas", 3, ["most used", "recently changed", "complex", "payment", "focus"]),
      c("transparency", "Makes what was not tested explicit", 2, ["not tested", "documented", "communicate", "known gap"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A developer says your bug is 'not reproducible' and closes it. You can reproduce it every time. Write how you would respond.", [
      c("evidence", "Provides irrefutable reproduction evidence", 3, ["video", "steps", "exact", "environment", "recording"]),
      c("difference", "Investigates why their environment differs", 3, ["their machine", "data", "version", "config", "why"]),
      c("tone", "Stays collaborative rather than adversarial", 2, ["together", "pair", "show", "help"]),
    ]),
    typed("SCENARIO", "JUNIOR", "You are asked to write automated tests for a legacy feature with no documentation. Write your approach.", [
      c("discovery", "Establishes current behaviour as the baseline", 3, ["current behaviour", "observe", "explore", "characterise", "as it is"]),
      c("caution", "Does not encode bugs as expected behaviour unexamined", 3, ["is this right", "ask", "verify", "intended", "bug"]),
      c("priority", "Covers the most valuable paths first", 2, ["critical", "most used", "first", "priority"]),
    ]),
    typed("SCENARIO", "JUNIOR", "Your team ships weekly and testing always compresses into the last day. Write what you would propose.", [
      c("diagnosis", "Identifies late involvement as the cause", 3, ["late", "end", "waterfall", "not involved", "last"]),
      c("shift", "Proposes earlier involvement", 3, ["earlier", "design", "refinement", "acceptance criteria", "shift left"]),
      c("incremental", "Tests continuously rather than in a block", 2, ["as they merge", "continuous", "per ticket", "not batch"]),
    ]),
    typed("CODING", "JUNIOR", "Write the test cases for a shopping basket that applies a 10% discount over £100 and free delivery over £50. Present them as a table with input and expected output.", [
      c("boundaries", "Tests exactly at and around each threshold", 3, ["49", "50", "51", "99", "100", "101", "boundary"]),
      c("combinations", "Covers both rules interacting", 3, ["both", "combination", "discount and delivery", "over 100"]),
      c("edges", "Includes empty, zero and negative or invalid cases", 2, ["empty", "0", "negative", "invalid"]),
    ]),
    typed("CODING", "JUNIOR", "Write an automated test for a signup form that verifies validation errors appear for an invalid email, without depending on the exact wording of the message.", [
      c("resilience", "Queries by role or accessible name, not text", 3, ["role", "label", "test id", "not exact text", "aria"]),
      c("assertion", "Asserts on the meaningful outcome", 3, ["error shown", "not submitted", "invalid", "associated"]),
      c("independence", "Sets up and cleans its own state", 2, ["setup", "unique", "cleanup", "independent"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you were under pressure to say something was ready when you did not think it was.", [
      c("integrity", "Did not simply comply", 3, ["said", "raised", "would not", "honest"]),
      c("evidence", "Backed the position with specifics", 3, ["because", "specific", "bugs", "untested", "risk"]),
      c("resolution", "Reached a professional outcome", 2, ["agreed", "shipped with", "documented", "decision"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Describe a time your testing missed something important. What did you change?", [
      c("ownership", "Owns the miss", 3, ["i missed", "did not test", "my"]),
      c("analysis", "Understands why it was missed", 3, ["assumed", "did not think", "gap", "no case for"]),
      c("change", "Changed the approach afterwards", 2, ["added", "now", "checklist", "since"]),
    ]),

    // --- MID --------------------------------------------------------------
    mcq(
      "MID",
      "Your suite has 5% flake across 2,000 tests. What is the practical consequence per run?",
      [
        "Roughly 100 tests fail randomly, so almost every run fails and the suite stops being a gate",
        "One test fails occasionally",
        "The suite runs 5% slower",
        "Coverage drops by 5%",
      ],
      0,
      "At that rate a green run becomes rare. The suite stops being a signal and becomes an obstacle people learn to bypass.",
    ),
    mcq(
      "MID",
      "What does a contract test between two services verify that an integration test does not?",
      [
        "That the services are fast enough",
        "That each side's expectations of the interface match, without deploying both together",
        "That the database schema is correct",
        "That authentication works",
      ],
      1,
      "It catches interface drift at build time for each side independently, which is what makes independent deployment safe.",
    ),
    mcq(
      "MID",
      "Your end-to-end suite runs against a shared environment and tests interfere with each other. What is the soundest fix?",
      [
        "Run the tests sequentially",
        "Give each test its own isolated data — unique accounts and records created by the test itself",
        "Add retries",
        "Run tests at different times of day",
      ],
      1,
      "Sequential execution trades hours for a problem that returns as soon as two people run the suite. Data isolation is what actually removes the coupling.",
    ),
    mcq(
      "MID",
      "What is the strongest objection to a mandatory 90% coverage gate?",
      [
        "It slows down CI",
        "It incentivises tests written to touch lines rather than to verify behaviour",
        "90% is impossible to achieve",
        "Coverage tools disagree with each other",
      ],
      1,
      "The target becomes the goal. Teams write assertion-light tests over trivial code while the risky code stays genuinely untested.",
    ),
    mcq(
      "MID",
      "Which is the best use of a snapshot test?",
      [
        "As the primary assertion for business logic",
        "As a change detector for large stable output, where a diff is reviewed deliberately",
        "As a replacement for end-to-end tests",
        "To measure performance regressions",
      ],
      1,
      "Snapshots are useful when someone actually reads the diff. Updated reflexively, they assert only that the output equals itself.",
    ),
    mcq(
      "MID",
      "You must test a feature that depends on the current date. What is the correct approach?",
      [
        "Run the tests only on days where they pass",
        "Inject a controllable clock so tests can pin the time explicitly",
        "Add a tolerance to the assertions",
        "Mock the entire date library globally",
      ],
      1,
      "Time as an injected dependency makes year boundaries, leap days and timezones testable rather than a source of December surprises.",
    ),
    spoken("CONCEPTUAL", "MID", "Explain the testing pyramid, and describe a situation where you would deliberately depart from it.", [
      c("shape", "Explains the cost and speed reasoning", 3, ["fast", "cheap", "many unit", "few e2e", "cost"]),
      c("departure", "Names a legitimate exception", 3, ["integration heavy", "thin logic", "glue", "microservice", "honeycomb"]),
      c("reasoning", "Justifies the departure by risk", 2, ["risk", "where bugs", "value", "depends"]),
    ]),
    spoken("CONCEPTUAL", "MID", "What do you look for when reviewing someone else's test, beyond whether it passes?", [
      c("intent", "Checks the test would fail for the right reason", 3, ["would it fail", "assertion", "meaningful", "break it"]),
      c("clarity", "Checks it communicates intent", 3, ["name", "readable", "obvious", "one thing"]),
      c("robustness", "Checks for hidden coupling and flakiness", 2, ["order", "shared state", "timing", "sleep", "brittle"]),
    ]),
    spoken("CONCEPTUAL", "MID", "How would you test a system where the correct answer is not deterministic — a recommendation engine, for example?", [
      c("properties", "Tests properties rather than exact output", 3, ["property", "invariant", "always", "never", "range"]),
      c("evaluation", "Uses metrics over a dataset", 3, ["metric", "dataset", "baseline", "threshold", "offline"]),
      c("monitoring", "Extends verification into production", 2, ["monitor", "production", "canary", "a/b", "drift"]),
    ]),
    spoken("CONCEPTUAL", "MID", "How do you approach testing for accessibility, and what can automation not tell you?", [
      c("automation", "Knows what tools catch", 3, ["axe", "contrast", "missing label", "automated", "lint"]),
      c("limits", "Knows the majority needs human judgement", 3, ["cannot", "manual", "screen reader", "keyboard", "makes sense", "meaningful"]),
      c("practice", "Tests with real assistive technology", 2, ["screen reader", "keyboard only", "tab", "actual"]),
    ]),
    typed("SCENARIO", "MID", "You join a team with 2,000 tests, a 40-minute suite and a 15% failure rate nobody investigates. Write your first month.", [
      c("measurement", "Quantifies before acting", 3, ["measure", "which tests", "categorise", "track", "top"]),
      c("triage", "Separates real failures from flakes", 3, ["real", "flake", "quarantine", "separate", "investigate"]),
      c("trust", "Restores a green baseline people believe", 2, ["green", "trust", "gate", "block", "baseline"]),
    ]),
    typed("SCENARIO", "MID", "Product wants to release a feature that has only been tested on the happy path, citing a deadline. Write your position.", [
      c("risk", "Articulates specific untested risk", 3, ["what we have not", "specific", "payment", "data", "risk"]),
      c("options", "Offers graded options, not a veto", 3, ["feature flag", "limited release", "beta", "subset", "monitor"]),
      c("decision", "Leaves the call with the right people", 2, ["their decision", "informed", "recommend", "document"]),
    ]),
    typed("SCENARIO", "MID", "Your team has no QA engineer and developers test their own work. Write how you would make that work well.", [
      c("structure", "Adds structure rather than relying on diligence", 3, ["checklist", "definition of done", "acceptance criteria", "peer"]),
      c("blindspot", "Addresses authors missing their own assumptions", 3, ["own assumptions", "someone else", "cross test", "fresh eyes"]),
      c("automation", "Uses automation where humans are unreliable", 2, ["automated", "regression", "ci", "consistent"]),
    ]),
    typed("CODING", "MID", "Write an end-to-end test for a checkout flow that is resilient to slow networks and does not depend on other tests having run. Show the key structure.", [
      c("isolation", "Creates its own data and account", 3, ["create", "unique", "setup", "own data", "fixture"]),
      c("waiting", "Waits on conditions rather than time", 3, ["wait for", "visible", "expect", "not sleep", "timeout"]),
      c("assertion", "Verifies the resulting state, not just the message", 2, ["order created", "database", "api", "state", "confirm"]),
    ]),
    typed("CODING", "MID", "Write a test that verifies an API correctly rejects a request from a user who does not own the resource. Include what a false pass would look like.", [
      c("setup", "Creates two distinct users and a resource", 3, ["two users", "owner", "other", "create"]),
      c("assertion", "Asserts the status and that no data leaked", 3, ["403", "404", "not in body", "no data", "status"]),
      c("falsepass", "Identifies how the test could pass wrongly", 3, ["404 because missing", "not authenticated", "false pass", "would also pass"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Tell me about a time you changed how a team thought about quality. What actually shifted?", [
      c("influence", "Changed behaviour, not just opinion", 3, ["started", "now they", "changed", "adopted"]),
      c("method", "Used demonstration over advocacy", 3, ["showed", "example", "data", "pilot", "made it easy"]),
      c("durability", "It outlasted their attention", 2, ["still", "sustained", "after", "habit"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Describe a disagreement with a developer about whether something was a bug. How was it resolved?", [
      c("position", "Held a reasoned position", 3, ["user", "expected", "spec", "confusing", "because"]),
      c("resolution", "Sought a shared source of truth", 3, ["asked product", "spec", "user", "designer", "together"]),
      c("grace", "Accepted the outcome either way", 2, ["accepted", "was right", "was wrong", "moved on"]),
    ]),

    // --- SENIOR -----------------------------------------------------------
    mcq(
      "SENIOR",
      "Which is the strongest argument for testing in production alongside pre-release testing?",
      [
        "It is cheaper than staging",
        "Some failure modes only exist with real data, real scale and real user behaviour",
        "It removes the need for a test suite",
        "It is faster to set up",
      ],
      1,
      "Synthetic monitoring, canaries and feature flags observe the conditions you cannot reproduce. It complements pre-release testing rather than replacing it.",
    ),
    mcq(
      "SENIOR",
      "A team wants to automate all manual regression testing. What is the most important caution?",
      [
        "Automation is too expensive",
        "Automation encodes known expectations; it cannot notice the unexpected, which is what exploratory testing finds",
        "Manual testers will resist",
        "Automated tests are slower",
      ],
      1,
      "Automation is regression protection, not discovery. Removing human exploration entirely means new classes of problem go unseen.",
    ),
    mcq(
      "SENIOR",
      "What is the most reliable way to stop a large suite degrading into flakiness over time?",
      [
        "Periodic clean-up sprints",
        "Automatic detection and quarantine of flaky tests, with ownership and a deadline for each",
        "Banning end-to-end tests",
        "Requiring code review on all tests",
      ],
      1,
      "Flakiness accumulates continuously, so the response has to be continuous. Clean-up sprints lose to the rate of accrual.",
    ),
    spoken("CONCEPTUAL", "SENIOR", "How would you define a quality strategy for an organisation shipping to production several times a day?", [
      c("shift", "Moves verification into the pipeline", 3, ["pipeline", "automated", "gate", "fast", "every change"]),
      c("production", "Uses progressive delivery and monitoring", 3, ["canary", "flag", "monitor", "rollback", "production"]),
      c("human", "Retains exploratory and risk-based human testing", 2, ["exploratory", "risk", "human", "judgement"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "What is your view on a separate QA team versus embedded quality engineers?", [
      c("tradeoffs", "Names the real trade-offs of each", 3, ["silo", "throw over", "context", "independence", "bottleneck"]),
      c("position", "Takes a reasoned position", 3, ["embedded", "prefer", "because", "depends on"]),
      c("responsibility", "Keeps quality with the whole team", 2, ["everyone", "not just qa", "own", "shared"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "How do you measure whether a testing investment is paying off?", [
      c("outcomes", "Measures escaped defects and recovery", 3, ["escaped", "production defects", "mttr", "incidents", "customer reported"]),
      c("delivery", "Measures confidence and speed to release", 3, ["lead time", "release frequency", "confidence", "rollback"]),
      c("caution", "Avoids vanity metrics", 2, ["not coverage", "not test count", "vanity", "misleading"]),
    ]),
    typed("SCENARIO", "SENIOR", "Releases keep slipping because testing finds problems late. Leadership proposes hiring more testers. Write your response.", [
      c("diagnosis", "Identifies the structural cause", 3, ["late", "end of process", "not enough testers", "batch", "handoff"]),
      c("alternative", "Proposes changing where quality happens", 3, ["earlier", "smaller batches", "automated", "definition of done", "shift left"]),
      c("evidence", "Supports it with data", 2, ["data", "where found", "measure", "cost of"]),
    ]),
    typed("SCENARIO", "SENIOR", "Your organisation is adopting microservices and end-to-end tests have become unmaintainable. Write your testing strategy.", [
      c("contract", "Moves interface verification to contract tests", 3, ["contract", "consumer driven", "pact", "per service", "independent"]),
      c("scope", "Keeps a small number of critical journeys end to end", 3, ["few", "critical journey", "smoke", "limited", "key path"]),
      c("production", "Compensates with production verification", 2, ["monitor", "synthetic", "canary", "observability"]),
    ]),
    typed("SCENARIO", "SENIOR", "A safety-relevant defect reached customers and the board asks how you will guarantee it never recurs. Write your answer.", [
      c("honesty", "Does not promise a guarantee", 3, ["cannot guarantee", "reduce", "likelihood", "honest"]),
      c("specific", "Addresses this defect's class concretely", 3, ["this class", "specific test", "detection", "why missed"]),
      c("systemic", "Improves detection and response generally", 2, ["monitor", "faster detection", "rollback", "process"]),
    ]),
    typed("SCENARIO", "SENIOR", "Two teams disagree on whether integration tests should run against real dependencies or mocks. Write how you would resolve it.", [
      c("framing", "Reframes it as risk, not preference", 3, ["risk", "what could break", "trade-off", "both", "depends"]),
      c("resolution", "Proposes a layered answer", 3, ["contract", "some real", "mostly mock", "layer", "both"]),
      c("decision", "Reaches a decision people can follow", 2, ["decide", "guideline", "document", "default"]),
    ]),
    typed("CODING", "SENIOR", "Design a test data strategy for a suite that must run in parallel against a shared database: creation, isolation, and cleanup. Show the mechanism.", [
      c("isolation", "Guarantees no two runs collide", 3, ["unique", "namespace", "uuid", "per test", "tenant"]),
      c("cleanup", "Cleans up reliably including after failures", 3, ["teardown", "finally", "after", "orphan", "sweep"]),
      c("performance", "Avoids setup dominating runtime", 2, ["fast", "factory", "minimal", "reuse", "seed"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about a time you had to rebuild an organisation's confidence in its test suite.", [
      c("state", "Describes the starting state honestly", 3, ["ignored", "red", "no trust", "bypassed"]),
      c("approach", "Made progress visible and incremental", 3, ["quarantine", "green", "one at a time", "measured", "published"]),
      c("outcome", "Trust actually returned", 2, ["now", "gate", "believed", "blocked"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Describe a time you advocated for shipping despite known defects. How did you reach that position?", [
      c("judgement", "Shows quality is not maximalism", 3, ["acceptable", "low impact", "trade-off", "value of shipping"]),
      c("transparency", "Made the risks explicit", 3, ["documented", "known", "communicated", "listed"]),
      c("mitigation", "Had a plan if it went wrong", 2, ["monitor", "rollback", "fix fast", "flag"]),
    ]),

    // --- STAFF ------------------------------------------------------------
    mcq(
      "STAFF",
      "What most reliably indicates that a quality function has become a bottleneck rather than an enabler?",
      [
        "It has a large backlog",
        "Teams route work around it, or treat its sign-off as a formality rather than a signal",
        "It reports many defects",
        "It requests more headcount",
      ],
      1,
      "Both bypassing and rubber-stamping mean the gate has stopped carrying information. A backlog alone may just mean demand is high.",
    ),
    mcq(
      "STAFF",
      "You are setting quality standards across many teams with different risk profiles. Which approach is soundest?",
      [
        "One uniform standard applied everywhere",
        "A risk-tiered standard where higher-consequence systems carry stricter requirements",
        "Let each team decide entirely",
        "Standards set by the quality team alone",
      ],
      1,
      "A uniform bar is either too heavy for low-risk work or too light for high-risk work. Tiering puts the cost where the consequence is.",
    ),
    mcq(
      "STAFF",
      "Which metric is most dangerous to set as an organisational quality target?",
      [
        "Escaped defect rate",
        "Number of test cases written",
        "Change failure rate",
        "Time to detect a production issue",
      ],
      1,
      "It is trivially gameable and measures activity rather than protection. The other three describe outcomes that are hard to fake.",
    ),
    spoken("CONCEPTUAL", "STAFF", "How would you build a quality culture in an organisation where quality is seen as the QA team's job?", [
      c("ownership", "Moves accountability to delivery teams", 3, ["team owns", "not just qa", "accountable", "everyone"]),
      c("mechanism", "Changes incentives and defaults, not slogans", 3, ["definition of done", "on call", "incentive", "default", "pipeline"]),
      c("support", "Gives teams the capability to own it", 2, ["training", "tooling", "embedded", "coach", "help"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "What is your position on the value of manual exploratory testing in a highly automated organisation?", [
      c("value", "Articulates what only humans find", 3, ["unexpected", "usability", "not specified", "judgement", "discovery"]),
      c("integration", "Fits it into a fast delivery model", 3, ["timeboxed", "charter", "per feature", "session", "alongside"]),
      c("balance", "Avoids arguing for either extreme", 2, ["both", "not instead", "complement", "balance"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How do you decide how much quality is enough for a given product or feature?", [
      c("consequence", "Ties the bar to the cost of failure", 3, ["cost of failure", "consequence", "safety", "money", "reputation"]),
      c("stage", "Considers product stage and reversibility", 3, ["prototype", "experiment", "reversible", "mature", "stage"]),
      c("explicit", "Makes the decision explicit rather than implicit", 2, ["agreed", "documented", "stated", "explicit"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How would you assess whether AI-assisted test generation is helping or harming a codebase?", [
      c("scepticism", "Distrusts volume as a proxy for value", 3, ["more tests", "not better", "assertion", "meaningful", "volume"]),
      c("evaluation", "Proposes concrete evaluation", 3, ["mutation", "would it catch", "escaped defects", "review", "measure"]),
      c("risk", "Names maintenance and false confidence risk", 2, ["maintenance", "false confidence", "brittle", "nobody understands"]),
    ]),
    typed("SCENARIO", "STAFF", "The company is entering a regulated market requiring documented test evidence for every release. Write your plan.", [
      c("evidence", "Produces evidence from the pipeline automatically", 3, ["automated", "artefact", "traceable", "generated", "pipeline"]),
      c("traceability", "Links requirements to tests to results", 3, ["traceability", "requirement", "linked", "coverage of requirement"]),
      c("velocity", "Avoids reverting to manual gates", 2, ["still fast", "not manual", "continuous", "without slowing"]),
    ]),
    typed("SCENARIO", "STAFF", "Your organisation's test suites cost significant CI spend and take 90 minutes. Leadership wants both cut. Write your approach.", [
      c("analysis", "Finds where time and money actually go", 3, ["measure", "slowest", "most expensive", "profile", "which"]),
      c("selection", "Runs the right tests rather than all tests", 3, ["affected", "selection", "impacted", "parallel", "tiered"]),
      c("risk", "States what risk each cut introduces", 2, ["risk", "trade-off", "what we lose", "accept"]),
    ]),
    typed("SCENARIO", "STAFF", "A major customer demands sight of your test results before each release. Write how you would respond.", [
      c("understanding", "Establishes what assurance they actually want", 3, ["what do they want", "underlying", "confidence", "why", "ask"]),
      c("offer", "Proposes something meaningful and sustainable", 3, ["summary", "coverage of their", "sla", "evidence", "report"]),
      c("boundaries", "Avoids commitments that would not scale", 2, ["not per release", "every customer", "sustainable", "precedent"]),
    ]),
    typed("SCENARIO", "STAFF", "Quality engineers are leaving because the role feels like a support function with no career path. Write what you would change.", [
      c("diagnosis", "Understands the actual grievance", 3, ["listened", "why", "no progression", "not respected", "asked"]),
      c("role", "Redefines the work towards higher leverage", 3, ["tooling", "platform", "coaching", "strategy", "engineering"]),
      c("path", "Creates a genuine progression", 2, ["ladder", "senior", "principal", "path", "promotion"]),
    ]),
    typed("SCENARIO", "STAFF", "You must decide whether to keep a large legacy end-to-end suite that catches real bugs but costs two engineers to maintain. Write your analysis.", [
      c("value", "Quantifies what it actually catches", 3, ["which bugs", "how many", "would have escaped", "value", "measure"]),
      c("alternatives", "Considers replacing rather than deleting", 3, ["replace", "lower level", "contract", "subset", "migrate"]),
      c("decision", "Reaches a clear, defensible position", 2, ["recommend", "keep", "reduce", "because"]),
    ]),
    typed("CODING", "STAFF", "Define the quality gates in a deployment pipeline used by 20 teams: what blocks, what warns, what is measured only. Justify each placement.", [
      c("placement", "Blocks only on high-confidence signals", 3, ["block", "warn", "measure", "confidence", "flaky"]),
      c("speed", "Keeps the blocking path fast", 3, ["fast", "minutes", "before merge", "after merge", "async"]),
      c("override", "Handles legitimate emergency bypass", 2, ["override", "break glass", "audited", "emergency"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Tell me about a time you were wrong about a quality risk. What did it cost and what changed?", [
      c("admission", "Owns a real misjudgement", 3, ["wrong", "underestimated", "dismissed", "my call"]),
      c("cost", "Honest about the consequence", 3, ["incident", "cost", "customers", "impact"]),
      c("change", "Changed how they judge risk", 2, ["now", "since", "differently", "learned"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Describe how you have influenced engineering leadership to invest in quality without a crisis to point at.", [
      c("case", "Built the case proactively", 3, ["before", "proactive", "data", "trend", "argued"]),
      c("language", "Spoke in business terms", 3, ["cost", "velocity", "churn", "revenue", "risk"]),
      c("outcome", "Secured something concrete", 2, ["funded", "headcount", "time", "agreed", "quarter"]),
    ]),
  ],
};
