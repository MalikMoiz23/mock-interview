import type { BankDomain, BankQuestion, Criterion } from "./question-bank";

/**
 * Third tranche. Its only job is to bring the thinner specialist fields up to
 * the same depth as the flagship ones, so rotation has room to work everywhere
 * rather than only in full-stack and frontend.
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

export const DEPTH_DOMAINS: BankDomain[] = [
  // -------------------------------------------------------------------------
  {
    slug: "qa-automation",
    name: "QA / Test Automation",
    blurb: "",
    questions: [
      mcq("BEGINNER", "What is regression testing?", ["Testing only the newest feature", "Re-checking that existing behaviour still works after a change", "Testing under heavy load", "Testing without a specification"], 1, "The risk of any change is what it breaks elsewhere, which is what regression suites guard."),
      mcq("BEGINNER", "Which of these belongs in a bug report?", ["Your opinion of the developer", "Steps to reproduce, expected result, actual result, and environment", "Only a screenshot", "The suspected line of code"], 1, "Those four facts let someone else reproduce it without asking you anything."),
      mcq("BEGINNER", "What is a smoke test?", ["A test that always fails", "A small set of checks confirming the build is worth testing further", "A performance test", "A test run only before release"], 1, "It answers one question cheaply: is this build broken enough that deeper testing is a waste of time?"),
      mcq("BEGINNER", "Why test boundary values such as 0, 1, and the maximum?", ["They are quicker to type", "Off-by-one mistakes cluster at boundaries, so that is where bugs hide", "Testers are required to", "They use less memory"], 1, "Almost nobody gets the middle of a range wrong; almost everybody gets an edge wrong eventually."),
      mcq("BEGINNER", "What does it mean for a test to be deterministic?", ["It runs quickly", "The same input always produces the same result", "It never fails", "It runs in isolation"], 1, "Non-determinism is what flakiness is; it makes every failure ambiguous."),
      mcq("JUNIOR", "A test asserts on the exact text 'Welcome back, Alice!'. What is fragile about it?", ["Nothing", "Any copy change, translation or name change breaks a test that is not about copy", "Strings cannot be asserted", "It is too slow"], 1, "Assert the thing the test is about. Coupling it to unrelated copy guarantees false failures."),
      mcq("JUNIOR", "What is the testing pyramid arguing for?", ["More end-to-end tests than unit tests", "Many fast isolated tests, fewer integrated ones, and a thin layer of end-to-end tests", "Equal numbers at every level", "Only manual testing"], 1, "The shape follows from cost: end-to-end tests are the slowest and most brittle, so you want few and only where they earn it."),
      mcq("JUNIOR", "You cannot reproduce a bug a user reported. What is the most useful next step?", ["Close it as invalid", "Gather their environment, exact steps, data and timing, and try to match those conditions", "Ask them to try again", "Rewrite the feature"], 1, "'Not reproducible' usually means 'not reproduced under the same conditions' — the difference is the bug."),
      mcq("MID", "What is the main risk of mocking a dependency in a test?", ["Mocks are slow", "The mock can drift from the real thing, so the test passes while production breaks", "Mocks use more memory", "You cannot assert on mocks"], 1, "A mock encodes your belief about the dependency. Contract tests exist because that belief goes stale."),
      mcq("MID", "Your team wants a coverage gate at 90%. What is the strongest objection?", ["90% is too low", "Coverage measures execution, not assertion quality, so the gate can be met with tests that verify nothing", "It slows CI", "Coverage tools are inaccurate"], 1, "Any gate on a proxy metric gets gamed. Coverage is useful as a signal, poor as a target."),
      spoken("CONCEPTUAL", "BEGINNER", "What is the difference between verification and validation? Give an example where a product passed one and failed the other.", [
        c("distinction", "Built it right versus built the right thing", 3, ["right thing", "built right", "spec", "requirement", "need"]),
        c("example", "Concrete example of the gap", 3, ["matched the spec", "but", "user", "not what", "wrong"]),
        c("consequence", "Sees why it matters", 2, ["waste", "rework", "user", "useless"]),
      ]),
      spoken("CONCEPTUAL", "MID", "Explain what you would look for when reviewing someone else's test, beyond whether it passes.", [
        c("intent", "Checks the test asserts the right thing", 3, ["assert", "actually", "would fail", "intent", "meaningful"]),
        c("fragility", "Spots brittleness", 3, ["brittle", "selector", "sleep", "coupled", "order"]),
        c("clarity", "Cares about the failure message", 2, ["readable", "message", "name", "understand", "diagnose"]),
      ]),
      spoken("BEHAVIORAL", "MID", "Tell me about a bug that reached production that your tests should have caught. What did you change?", [
        c("honesty", "Owns the gap", 3, ["missed", "should have", "we did not", "gap"]),
        c("analysis", "Understood why it slipped through", 3, ["because", "no test", "assumption", "environment", "data"]),
        c("change", "Changed the system, not just the one test", 2, ["added", "process", "check", "since"]),
      ]),
      typed("SCENARIO", "JUNIOR", "You are asked to test a feature with no specification and a developer who has left. Write how you would proceed.", [
        c("sources", "Finds substitutes for the spec", 3, ["code", "ticket", "user", "ask", "existing", "behaviour"]),
        c("documenting", "Writes down what it does", 3, ["document", "record", "baseline", "note"]),
        c("risk", "Prioritises by risk", 2, ["risk", "important", "critical", "money"]),
      ]),
      typed("SCENARIO", "SENIOR", "Releases keep slipping because testing is the last stage and always finds problems late. Write how you would change that.", [
        c("shift", "Moves testing earlier", 3, ["earlier", "shift left", "during", "alongside", "design"]),
        c("mechanism", "Concrete mechanism, not a slogan", 3, ["ci", "pipeline", "definition of done", "pair", "review"]),
        c("evidence", "Measures whether it worked", 2, ["measure", "lead time", "escaped", "rate"]),
        c("politics", "Handles the organisational side", 2, ["team", "buy in", "developer", "convince"]),
      ]),
      typed("CODING", "JUNIOR", "Write the test cases you would run for a password-reset flow. List them as a table of case, input, expected result — cover the unhappy paths.", [
        c("coverage", "Covers unhappy paths", 3, ["expired", "invalid", "used", "unknown email", "twice"]),
        c("security", "Thinks about abuse", 3, ["enumerat", "rate", "brute", "leak", "reuse"]),
        c("precision", "Concrete expected results", 2, ["expected", "should", "returns", "shows"]),
      ]),
      typed("CODING", "MID", "Write a test for an API endpoint that must reject unauthorised access. Include what you would assert beyond the status code, and explain why the status code alone is insufficient.", [
        c("assertions", "Asserts more than the status", 3, ["body", "no data", "header", "leak", "empty"]),
        c("cases", "Covers several unauthorised shapes", 3, ["no token", "expired", "wrong user", "other"]),
        c("reasoning", "Explains why status alone is weak", 2, ["still returned", "leak", "body", "even if"]),
      ]),
    ],
  },

  // -------------------------------------------------------------------------
  {
    slug: "devops-cloud",
    name: "DevOps / Cloud Infrastructure",
    blurb: "",
    questions: [
      mcq("BEGINNER", "What does CI stand for and what does it actually do?", ["Continuous Installation — deploys to servers", "Continuous Integration — merges and verifies changes automatically and often", "Container Isolation", "Code Inspection"], 1, "The value is frequency: small verified merges beat one large risky one."),
      mcq("BEGINNER", "Why pin dependency versions in a build?", ["It is faster", "So the same commit produces the same build tomorrow as it does today", "It reduces disk usage", "It is required by npm"], 1, "Unpinned builds are not reproducible, which makes a failure impossible to attribute."),
      mcq("BEGINNER", "What is the purpose of a health check endpoint?", ["To show uptime to users", "To let infrastructure decide automatically whether an instance should receive traffic", "To log requests", "To test the database"], 1, "It is a machine-readable answer to 'should I send work here?'"),
      mcq("BEGINNER", "What does a rollback require you to have?", ["A backup of the database only", "A previous version that is still deployable, and a schema that the old code can still read", "More servers", "A maintenance window"], 1, "Rollback fails most often on the database, not the code — a migration the old version cannot read blocks it."),
      mcq("BEGINNER", "Why should build artifacts be immutable?", ["To save space", "So the thing you tested is byte-for-byte the thing you deploy", "So they can be edited later", "To speed up builds"], 1, "Rebuilding per environment means you deploy something you never tested."),
      mcq("JUNIOR", "What is the difference between horizontal and vertical scaling?", ["Horizontal is cheaper always", "Horizontal adds more instances; vertical makes one instance bigger", "They are the same", "Vertical only applies to databases"], 1, "Vertical has a ceiling and usually a restart; horizontal needs the workload to be stateless."),
      mcq("JUNIOR", "Your deploy succeeds but the new version never receives traffic. Where do you look first?", ["Application logs", "The health or readiness check, which is what gates traffic", "The database", "DNS"], 1, "Traffic gating is the readiness check's job, so a failing check is the most direct explanation."),
      mcq("JUNIOR", "What problem does a blue-green deployment solve?", ["It reduces cost", "It lets you switch traffic between two full environments so rollback is instant", "It removes the need for tests", "It speeds up builds"], 1, "You pay for two environments and buy back a near-instant, low-risk switch."),
      mcq("MID", "Why is 'it works on my machine' a systems problem rather than a developer problem?", ["It is not", "It means the environment is an undeclared dependency, which is a build and packaging failure", "Developers should test more", "It only happens with old code"], 1, "If the environment matters and is not captured, the build is incomplete — that is what containers and lockfiles address."),
      mcq("MID", "You have alerts on CPU, memory and disk but users report failures you never see. What is missing?", ["More resource alerts", "Alerts on what users experience — error rate, latency and success rate", "A bigger server", "Longer log retention"], 1, "Resource metrics are causes. Symptom-based alerting on user-visible outcomes is what catches the rest."),
      spoken("CONCEPTUAL", "JUNIOR", "Explain what a container gives you that a virtual machine does not, and what it does not give you.", [
        c("difference", "Understands shared kernel versus full OS", 3, ["kernel", "os", "lighter", "share", "boot"]),
        c("benefit", "Names real benefits", 3, ["portab", "consistent", "fast", "density", "package"]),
        c("limits", "Knows the isolation is weaker", 2, ["isolation", "not", "kernel", "security", "same host"]),
      ]),
      spoken("CONCEPTUAL", "MID", "Explain what you understand by blast radius, and how you would reduce it for a change you were nervous about.", [
        c("concept", "Understands scope of impact", 3, ["how many", "impact", "affect", "spread", "scope"]),
        c("techniques", "Names concrete techniques", 3, ["canary", "percentage", "flag", "region", "gradual", "shadow"]),
        c("detection", "Knows you must be able to see it going wrong", 2, ["monitor", "metric", "abort", "threshold"]),
      ]),
      spoken("BEHAVIORAL", "JUNIOR", "Tell me about the first time you were on call. What surprised you?", [
        c("honesty", "Genuine reflection", 3, ["surprised", "did not expect", "harder", "learned"]),
        c("preparation", "Talks about runbooks or the lack of them", 2, ["runbook", "documentation", "who to ask", "escalate"]),
        c("improvement", "Improved something afterwards", 2, ["wrote", "added", "documented", "changed"]),
      ]),
      typed("SCENARIO", "JUNIOR", "A nightly backup job has been reporting success for months. Write how you would establish whether the backups are actually usable.", [
        c("scepticism", "Does not trust the success flag", 3, ["restore", "test", "verify", "actually", "assume"]),
        c("restore", "Proposes a real restore", 3, ["restore", "separate", "check", "data", "compare"]),
        c("routine", "Makes it ongoing", 2, ["regular", "automate", "schedule", "every"]),
      ]),
      typed("SCENARIO", "MID", "Your CI pipeline takes 40 minutes and developers have started pushing straight to main to avoid it. Write what you would do.", [
        c("cause", "Treats the behaviour as a symptom", 3, ["why", "because", "avoid", "slow", "friction"]),
        c("speed", "Concrete ways to shorten it", 3, ["parallel", "cache", "split", "only changed", "stage"]),
        c("guardrail", "Restores safety without blocking people", 2, ["required", "branch protection", "fast check", "then"]),
      ]),
      typed("CODING", "JUNIOR", "Write a CI pipeline configuration for a web service: install, lint, test, build, and deploy only from the main branch. Comment on what you cache and why.", [
        c("stages", "Correct ordered stages", 3, ["install", "test", "build", "deploy", "steps"]),
        c("gating", "Deploy is branch-gated", 3, ["main", "branch", "if", "only"]),
        c("caching", "Caches the right thing", 2, ["cache", "node_modules", "lock", "key"]),
        c("secrets", "Secrets are not inline", 2, ["secret", "env", "vault", "\\$\\{"]),
      ]),
      typed("CODING", "SENIOR", "Write the plan for a zero-downtime schema change that renames a heavily used column. State each deploy step and what is running at each point.", [
        c("expand", "Uses expand and contract", 3, ["add", "both", "backfill", "then", "remove", "expand"]),
        c("compat", "Old and new code coexist", 3, ["old code", "new code", "both", "read", "write"]),
        c("steps", "Discrete ordered deploys", 3, ["step", "deploy 1", "first", "second", "finally"]),
        c("rollback", "Each step is reversible", 2, ["rollback", "revert", "safe", "back out"]),
      ]),
    ],
  },

  // -------------------------------------------------------------------------
  {
    slug: "data-engineering",
    name: "Data Engineering",
    blurb: "",
    questions: [
      mcq("BEGINNER", "What does GROUP BY do?", ["Sorts the rows", "Collapses rows sharing a value into one row per group so aggregates can be computed", "Removes duplicates", "Joins two tables"], 1, "DISTINCT removes duplicates; GROUP BY exists so you can aggregate per group."),
      mcq("BEGINNER", "What is a primary key for?", ["Sorting", "Uniquely identifying each row in a table", "Encrypting a column", "Linking to another database"], 1, "Uniqueness plus not-null. Without it you cannot reliably address a single row."),
      mcq("BEGINNER", "Why is storing dates as text a bad idea?", ["Text is larger", "You lose comparison, sorting and date arithmetic, and formats drift between sources", "Text cannot be indexed", "It is not allowed"], 1, "'01/02/2026' is January or February depending on who wrote it — that ambiguity becomes silent wrong answers."),
      mcq("BEGINNER", "What does a WHERE clause do that a HAVING clause does not?", ["Nothing", "WHERE filters rows before grouping; HAVING filters groups after aggregation", "WHERE is faster", "HAVING works on any query"], 1, "Filtering early in WHERE also means the aggregate never sees those rows, which is usually what you want."),
      mcq("BEGINNER", "What is a data pipeline's 'source of truth'?", ["The dashboard", "The system where the data is originally created and authoritative", "The warehouse", "The most recent copy"], 1, "Every downstream copy can drift; reconciliation always ends at the source."),
      mcq("JUNIOR", "Your join produces more rows than the left table had. What happened?", ["The database is broken", "The join key is not unique on the right side, so rows fanned out", "You used LEFT JOIN", "There are NULLs"], 1, "Fan-out silently multiplies measures — it is the most common cause of inflated revenue numbers."),
      mcq("JUNIOR", "Why partition a large table by date?", ["It looks tidier", "Queries filtered by date can skip whole partitions instead of scanning everything", "It compresses better", "It prevents duplicates"], 1, "Partition pruning is the win; it only pays off when queries actually filter on the partition key."),
      mcq("JUNIOR", "What is the risk of using SELECT DISTINCT to fix duplicate rows?", ["It is slow only", "It hides the cause — usually a bad join — and stops working as soon as a genuinely different column is added", "It changes the data", "There is no risk"], 1, "It treats the symptom. The duplicate is usually telling you the grain of your join is wrong."),
      mcq("MID", "What does 'grain' mean when modelling a table?", ["Its storage format", "What exactly one row represents", "How often it is refreshed", "Its partition size"], 1, "Most modelling bugs are grain bugs: mixing one row per order with one row per line item."),
      mcq("MID", "A pipeline reads from an API that paginates. What is the classic failure?", ["Rate limiting only", "Assuming the page count is stable while new records are being inserted, so records are skipped or duplicated", "Timeouts", "JSON parsing"], 1, "Offset pagination over a moving dataset shifts under you; cursor pagination avoids it."),
      spoken("CONCEPTUAL", "JUNIOR", "Explain what normalisation is and why a warehouse often deliberately denormalises.", [
        c("normalisation", "Understands avoiding duplication", 3, ["duplicat", "one place", "update", "consistent", "join"]),
        c("tradeoff", "Knows why warehouses go the other way", 3, ["read", "join", "fast", "analytic", "query"]),
        c("judgement", "Sees it as a trade, not a rule", 2, ["depends", "trade", "cost", "workload"]),
      ]),
      spoken("CONCEPTUAL", "MID", "Explain what you would put in place so that a pipeline failing loudly is better than it failing quietly.", [
        c("failfast", "Prefers stopping to producing wrong data", 3, ["stop", "fail", "halt", "rather than", "wrong"]),
        c("checks", "Concrete quality checks", 3, ["row count", "null", "freshness", "range", "assert"]),
        c("alerting", "Someone actually hears it", 2, ["alert", "page", "notify", "owner"]),
      ]),
      spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you had to work with data that was messier than expected.", [
        c("specifics", "Concrete mess", 3, ["duplicate", "missing", "format", "encoding", "inconsistent"]),
        c("approach", "Investigated before transforming", 3, ["profil", "looked", "counted", "sample", "checked"]),
        c("decisions", "Made and documented judgement calls", 2, ["decided", "assumed", "documented", "flagged"]),
      ]),
      typed("SCENARIO", "JUNIOR", "You are asked to build a daily report from a source system nobody documents. Write your first steps.", [
        c("exploration", "Profiles the data first", 3, ["profile", "count", "distinct", "sample", "look"]),
        c("stakeholder", "Confirms what is actually wanted", 3, ["ask", "what", "definition", "decision", "use"]),
        c("increments", "Ships something small first", 2, ["start", "small", "first", "iterate"]),
      ]),
      typed("SCENARIO", "SENIOR", "Your warehouse costs have tripled and the finance team wants it halved without losing any reports. Write your approach.", [
        c("visibility", "Finds where the money goes", 3, ["query", "cost", "usage", "top", "audit"]),
        c("usage", "Finds what nobody reads", 3, ["unused", "nobody", "last accessed", "retire", "usage"]),
        c("technique", "Concrete cost levers", 3, ["partition", "cluster", "materiali", "incremental", "storage", "scan"]),
        c("safety", "Does not break reports", 2, ["verify", "compare", "before", "deprecat"]),
      ]),
      typed("CODING", "JUNIOR", "Given `events(user_id, event_name, occurred_at)`, write SQL for daily active users over the last 30 days, one row per day, including days with zero activity.", [
        c("aggregate", "Correct distinct count per day", 3, ["count(distinct", "group by", "date"]),
        c("window", "Bounds to 30 days", 2, ["interval", "30", "where", "current_date"]),
        c("zerodays", "Handles days with no rows", 3, ["generate_series", "calendar", "left join", "zero", "coalesce"]),
      ]),
      typed("CODING", "MID", "Write the transformation that deduplicates a stream where the same record can arrive several times, keeping the most recent version of each id. State how you break ties.", [
        c("dedup", "Correct dedup approach", 3, ["row_number", "partition by", "order by", "rank", "distinct on"]),
        c("recency", "Keeps the latest", 3, ["desc", "latest", "max", "updated_at"]),
        c("ties", "Breaks ties deterministically", 2, ["tie", "then", "id", "deterministic"]),
      ]),
    ],
  },

  // -------------------------------------------------------------------------
  {
    slug: "backend-python",
    name: "Backend — Python",
    blurb: "",
    questions: [
      mcq("BEGINNER", "What does `len()` return for a dictionary?", ["The total size in bytes", "The number of key-value pairs", "The length of the longest key", "The number of keys plus values"], 1, "It counts entries, which is why iterating a dict yields keys."),
      mcq("BEGINNER", "What is the difference between `==` and `is`?", ["None", "`==` compares values; `is` compares identity, whether they are the same object", "`is` is faster always", "`==` only works on numbers"], 1, "`is` on small integers and strings appears to work by accident because of interning — it is still wrong."),
      mcq("BEGINNER", "Why use a context manager (`with open(...)`) for files?", ["It is shorter", "The file is closed even if the block raises an exception", "It reads faster", "It locks the file"], 1, "Cleanup on the error path is the point; a bare `open()` leaks the handle when something throws."),
      mcq("BEGINNER", "What does `*args` allow in a function signature?", ["Only keyword arguments", "Any number of extra positional arguments, collected as a tuple", "Type hints", "Default values"], 1, "`**kwargs` is the keyword equivalent, collected as a dict."),
      mcq("BEGINNER", "What is a docstring for?", ["Comments the interpreter removes", "Documentation attached to the object, readable at runtime and by tooling", "Type checking", "Performance hints"], 1, "Unlike a comment it survives into `help()` and IDE tooling."),
      mcq("JUNIOR", "Why can `dict` ordering matter in modern Python?", ["It never matters", "Insertion order is preserved since 3.7, so code can accidentally depend on it", "Dicts are sorted", "Ordering is random"], 1, "Guaranteed insertion order is convenient and quietly becomes a dependency in serialisation and tests."),
      mcq("JUNIOR", "What does a type hint actually do at runtime?", ["Enforces the type", "Nothing by default — it is metadata for tooling and readers", "Converts the value", "Raises on mismatch"], 1, "Enforcement requires a checker like mypy or a validator like Pydantic."),
      mcq("JUNIOR", "You need to run a slow blocking call inside an async endpoint. What is correct?", ["Call it directly, async handles it", "Run it in a thread or process executor so the event loop is not blocked", "Wrap it in `await`", "Nothing, it is fine"], 1, "`await` on a blocking call does not make it non-blocking; the loop stalls for every other request."),
      mcq("MID", "What is the risk of catching `Exception` around a whole request handler?", ["It is slower", "It converts programming errors into silent 500s with no signal about the actual cause", "It breaks async", "It is not allowed"], 1, "Catch to handle, not to hide. Log with the traceback and re-raise what you cannot handle."),
      mcq("MID", "Your Celery task occasionally runs twice for the same input. What must be true of the task?", ["Nothing, that is a bug in Celery", "It must be idempotent, because at-least-once delivery means retries can duplicate it", "It should be faster", "It must use a database lock"], 1, "Most queues guarantee at-least-once. Exactly-once is a design property of your task, not the broker."),
      spoken("CONCEPTUAL", "JUNIOR", "Explain what happens when you pass a list into a function and modify it inside. Why does that surprise people?", [
        c("semantics", "Understands reference passing", 3, ["reference", "same object", "mutable", "outside", "caller"]),
        c("contrast", "Contrasts with immutables", 3, ["immutable", "int", "string", "tuple", "rebind"]),
        c("practice", "Knows how to avoid the surprise", 2, ["copy", "return", "new list", "avoid"]),
      ]),
      spoken("CONCEPTUAL", "MID", "Explain when you would reach for a dataclass, a Pydantic model, or a plain dict.", [
        c("distinction", "Distinguishes all three", 3, ["dataclass", "pydantic", "dict", "validat", "structure"]),
        c("validation", "Knows where validation belongs", 3, ["boundary", "input", "external", "trust", "parse"]),
        c("judgement", "Not dogmatic", 2, ["depends", "internal", "simple", "overkill"]),
      ]),
      spoken("BEHAVIORAL", "JUNIOR", "Tell me about a Python bug that took you far longer than it should have. What was it?", [
        c("specificity", "Real, specific bug", 3, ["turned out", "because", "mutable", "scope", "import", "encoding"]),
        c("process", "Describes the search", 3, ["print", "debugger", "narrowed", "isolated", "tried"]),
        c("lesson", "Took something from it", 2, ["now i", "learned", "since"]),
      ]),
      typed("SCENARIO", "JUNIOR", "A script that processes a CSV works on your 200-row sample and runs out of memory on the real 4 GB file. Write what you change.", [
        c("streaming", "Stops loading it all", 3, ["stream", "iterate", "chunk", "line", "generator", "yield"]),
        c("libraries", "Uses the right tool", 2, ["csv", "reader", "chunksize", "pandas"]),
        c("verification", "Checks it still produces the same result", 2, ["compare", "same", "verify", "sample"]),
      ]),
      typed("SCENARIO", "MID", "A FastAPI service is fast in isolation and slow under concurrency. Write how you would find out why.", [
        c("blocking", "Suspects blocking the loop", 3, ["blocking", "sync", "event loop", "thread", "await"]),
        c("measurement", "Measures rather than guesses", 3, ["profil", "trace", "measure", "load test", "metric"]),
        c("externals", "Considers pools and dependencies", 2, ["pool", "connection", "database", "downstream"]),
      ]),
      typed("CODING", "JUNIOR", "Write a function that reads a JSON config file and returns validated settings, raising a clear error when a required field is missing or the wrong type. Comment on where you would call it.", [
        c("validation", "Validates rather than trusting", 3, ["if", "raise", "isinstance", "required", "missing"]),
        c("errors", "Errors say what is wrong", 3, ["message", "field", "expected", "clear"]),
        c("placement", "Calls it at startup", 2, ["startup", "boot", "early", "once"]),
      ]),
      typed("CODING", "MID", "Write a decorator that caches a function's result for a given TTL. Comment on what breaks if the wrapped function has side effects or unhashable arguments.", [
        c("correctness", "Working decorator with TTL", 3, ["def wrapper", "functools", "cache", "time", "ttl"]),
        c("keys", "Handles argument keying", 3, ["key", "args", "kwargs", "hashable", "tuple"]),
        c("caveats", "Names the real caveats", 3, ["side effect", "unhashable", "stale", "memory", "unbounded"]),
      ]),
    ],
  },

  // -------------------------------------------------------------------------
  {
    slug: "backend-node",
    name: "Backend — Node.js / APIs",
    blurb: "",
    questions: [
      mcq("BEGINNER", "What does `async` on a function guarantee?", ["It runs in a separate thread", "It returns a promise", "It runs faster", "It cannot throw"], 1, "Async is about the return type and enabling `await`, not about parallelism."),
      mcq("BEGINNER", "Why should an API version its endpoints?", ["For documentation", "So existing clients keep working when the response shape has to change", "To improve caching", "It is required by REST"], 1, "You do not control when clients update — mobile apps especially may run old versions for years."),
      mcq("BEGINNER", "What is the purpose of CORS?", ["To speed up requests", "To let a server declare which other origins browsers may allow to read its responses", "To encrypt traffic", "To authenticate users"], 1, "It is a browser protection. It is not a server-side access control and does not stop a non-browser client."),
      mcq("JUNIOR", "An unhandled promise rejection occurs in a request handler. What is the risk?", ["Nothing", "The request can hang and the error goes unlogged, so the failure is invisible", "The server restarts", "The response is cached"], 1, "Silent failure is the worst kind: no error, no response, no signal."),
      mcq("JUNIOR", "What does a 409 Conflict indicate?", ["The server is down", "The request conflicts with the resource's current state, such as a duplicate or stale update", "Bad credentials", "Rate limited"], 1, "It is the right answer for a lost-update or duplicate-create attempt."),
      mcq("MID", "Why is logging the full request body a hazard?", ["It is slow", "Bodies routinely contain passwords, tokens and personal data, which then live in your logs", "Logs cannot hold JSON", "It breaks parsing"], 1, "Logs are copied, shipped and retained far more widely than the database — redact at the boundary."),
      spoken("CONCEPTUAL", "MID", "Explain why you would put a queue between two services, and what new problems that introduces.", [
        c("benefit", "Decoupling and buffering", 3, ["decouple", "buffer", "spike", "retry", "async"]),
        c("costs", "Names the new problems", 3, ["ordering", "duplicate", "delay", "visibility", "dead letter", "debug"]),
        c("judgement", "Knows when not to", 2, ["not always", "simpler", "direct", "overkill"]),
      ]),
      typed("SCENARIO", "MID", "A client integration is sending malformed requests and blaming your API. Write how you would resolve it.", [
        c("evidence", "Gets the actual request", 3, ["log", "capture", "request id", "example", "payload"]),
        c("contract", "Checks the contract both ways", 3, ["spec", "documentation", "schema", "expected", "validate"]),
        c("tone", "Collaborative not defensive", 2, ["together", "help", "share", "clarify"]),
      ]),
    ],
  },
];
