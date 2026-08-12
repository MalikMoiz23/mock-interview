import type { BankDomain } from "../question-bank";
import { c, mcq, spoken, typed } from "./authoring";

/**
 * Full Stack Development — depth tranche.
 *
 * Brings beginner, junior and mid to 30 questions each and gives senior and
 * staff a real pool instead of the two questions they had, which was forcing
 * those papers onto the synthetic fallback generator.
 */
export const FULLSTACK_DEPTH: BankDomain = {
  slug: "fullstack-development",
  name: "Full Stack Development",
  blurb: "Builds both the interface and the server behind it.",
  questions: [
    // --- BEGINNER ---------------------------------------------------------
    mcq(
      "BEGINNER",
      "What is the main reason to use HTTPS instead of HTTP?",
      [
        "It makes pages load faster",
        "It encrypts traffic so someone on the same network cannot read or alter it",
        "It compresses images automatically",
        "It is required for JavaScript to run",
      ],
      1,
      "HTTPS gives confidentiality and integrity. Anyone between the user and the server — on café Wi-Fi, for example — can read and modify plain HTTP.",
    ),
    mcq(
      "BEGINNER",
      "You need to store a user's date of birth. Which column type is the sensible choice?",
      ["A string", "A date type", "An integer of the year only", "Three separate integer columns"],
      1,
      "A date type lets the database sort, compare and validate. Storing dates as strings pushes all of that work into application code and invites malformed values.",
    ),
    mcq(
      "BEGINNER",
      "What does it mean when we say a function is 'asynchronous' in JavaScript?",
      [
        "It runs on a separate CPU core",
        "It starts work and lets the rest of the program continue before the result is ready",
        "It runs faster than a normal function",
        "It cannot return a value",
      ],
      1,
      "Asynchronous work does not block the single thread. The result arrives later via a promise or callback; it is about not waiting, not about parallel hardware.",
    ),
    mcq(
      "BEGINNER",
      "A visitor should see a page but only logged-in users may edit it. Where must that rule be enforced?",
      [
        "In the browser, by hiding the edit button",
        "On the server, on every request that changes data",
        "In CSS, by disabling the form",
        "In the database schema alone",
      ],
      1,
      "Hiding a button hides it from honest users only. Anyone can call the endpoint directly, so the check must live on the server.",
    ),
    mcq(
      "BEGINNER",
      "What is the purpose of an environment variable in a web application?",
      [
        "To make the code run on any operating system",
        "To keep configuration and secrets out of the source code so they can differ per environment",
        "To speed up the application at runtime",
        "To store user preferences",
      ],
      1,
      "The same code should run in development and production with different databases and keys. Committing those values to the repository leaks them and couples the code to one environment.",
    ),
    mcq(
      "BEGINNER",
      "Your page makes a request to another domain and the browser blocks it with a CORS error. What is happening?",
      [
        "The other server is offline",
        "The browser is enforcing a rule that the other server has not granted your origin permission",
        "Your internet connection dropped",
        "The request used the wrong HTTP method",
      ],
      1,
      "CORS is enforced by the browser on behalf of the user. The fix is a header on the responding server, not a change in your fetch call.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "What is a database, and why not just save everything to a file?", [
      c("purpose", "Explains what a database gives beyond a file", 3, ["query", "search", "structure", "relation", "index"]),
      c("concurrency", "Mentions many users reading and writing at once", 2, ["concurrent", "same time", "multiple users", "lock"]),
      c("integrity", "Touches on not losing or corrupting data", 2, ["integrity", "corrupt", "transaction", "backup", "consistent"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "When someone types a web address and presses enter, what happens before they see the page? Take it as far as you can.", [
      c("lookup", "Mentions resolving the name to an address", 2, ["dns", "domain", "ip", "resolve", "lookup"]),
      c("request", "Describes a request going to a server and a response coming back", 3, ["request", "response", "server", "http", "html"]),
      c("render", "Mentions the browser building the page from what it receives", 2, ["render", "parse", "html", "css", "javascript"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What does it mean to 'validate' user input, and why is it not enough to do it in the browser?", [
      c("what", "Explains checking that input is the right shape and range", 3, ["required", "format", "length", "type", "range"]),
      c("why-server", "Says the browser can be bypassed", 3, ["bypass", "server", "devtools", "direct request", "trust"]),
      c("feedback", "Mentions telling the user clearly what is wrong", 1, ["message", "feedback", "error", "clear"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A signup form lets people register with the same email address twice, creating duplicate accounts. Describe how you would stop this happening, both in the database and in what the user sees.", [
      c("database", "Proposes a uniqueness guarantee at the database level", 3, ["unique", "constraint", "index", "key"]),
      c("race", "Recognises two simultaneous signups can both pass a prior check", 2, ["race", "same time", "concurrent", "check then insert"]),
      c("ux", "Describes a clear, non-leaking message to the user", 2, ["message", "already registered", "friendly", "error"]),
    ]),
    typed("SCENARIO", "BEGINNER", "You have inherited a page that takes eight seconds to load. You have not seen the code yet. Write the order in which you would investigate, and say what you would measure at each step.", [
      c("measure", "Starts by measuring rather than guessing", 3, ["measure", "profile", "network tab", "timing", "devtools"]),
      c("split", "Separates server time from browser time", 3, ["server", "browser", "network", "render", "query"]),
      c("evidence", "Draws a conclusion only from what was observed", 2, ["evidence", "confirm", "reproduce", "data"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time you asked for help. What had you already tried before asking, and how did you frame the question?", [
      c("effort", "Shows independent effort before asking", 3, ["tried", "searched", "read", "documentation", "debug"]),
      c("framing", "Frames the question so it is answerable", 2, ["context", "specific", "what i expected", "what happened"]),
      c("outcome", "Says what they learned", 2, ["learned", "understood", "next time"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Describe a piece of feedback you received on your code or your work. How did you react at the time, and what did you do with it?", [
      c("openness", "Receives criticism without defensiveness", 3, ["accepted", "listened", "fair", "understood"]),
      c("action", "Describes a concrete change made", 3, ["changed", "rewrote", "applied", "improved"]),
      c("reflection", "Shows honest self-assessment", 2, ["realised", "in hindsight", "learned"]),
    ]),

    // --- JUNIOR -----------------------------------------------------------
    mcq(
      "JUNIOR",
      "Which of these is the strongest reason to hash passwords rather than encrypt them?",
      [
        "Hashing is faster than encryption",
        "Hashing is one-way, so a stolen database does not reveal the passwords",
        "Hashed passwords take less storage",
        "Encryption is not available in most languages",
      ],
      1,
      "Encryption is reversible by design, so the key becomes a single point of catastrophic failure. Hashing with a slow algorithm such as bcrypt or argon2 has no such key.",
    ),
    mcq(
      "JUNIOR",
      "Your endpoint accepts `?sort=` and interpolates it straight into SQL. What is the correct fix?",
      [
        "Escape quotes in the value",
        "Validate the value against an allowlist of column names",
        "Use a parameterised query for the sort clause",
        "Reject requests containing the word SELECT",
      ],
      1,
      "Placeholders cannot parameterise identifiers such as column names, so an allowlist is the fix here. Escaping and keyword blocklists both fail against inputs you did not anticipate.",
    ),
    mcq(
      "JUNIOR",
      "What does an ORM's 'lazy loading' most commonly cause in a list view?",
      [
        "Slower application startup",
        "A separate query per row, so one page becomes dozens of queries",
        "Data being written twice",
        "Higher memory use on the database server",
      ],
      1,
      "This is the N+1 problem. It is invisible on ten test rows and crippling on ten thousand real ones; eager loading or an explicit join fixes it.",
    ),
    mcq(
      "JUNIOR",
      "A background job occasionally runs twice for the same record. What property should the job have?",
      [
        "It should be faster",
        "It should be idempotent, so running twice has the same effect as running once",
        "It should log more detail",
        "It should run on a single server only",
      ],
      1,
      "At-least-once delivery is the norm in queues. Designing the job so a repeat is harmless is far more robust than trying to guarantee exactly-once.",
    ),
    mcq(
      "JUNIOR",
      "Why prefer a database migration file over changing the schema by hand in production?",
      [
        "Migrations run faster",
        "The change is versioned, reviewable and repeatable across every environment",
        "Migrations avoid downtime automatically",
        "Hand changes are not permitted by most databases",
      ],
      1,
      "A migration makes the schema part of the codebase. A hand-applied change exists only in one database and is invisible to the next person and to your test environment.",
    ),
    mcq(
      "JUNIOR",
      "Your API returns 500 when a user requests a record they do not own. What should it return?",
      [
        "500, because it is a server error",
        "403 or 404, because the request was understood but is not permitted",
        "400, because the input was invalid",
        "200 with an empty body",
      ],
      1,
      "500 means your code broke. A refused request is a client error; 404 is often preferred over 403 so the response does not confirm the record exists.",
    ),
    mcq(
      "JUNIOR",
      "What is the practical difference between a unit test and an integration test here?",
      [
        "Unit tests are written first",
        "A unit test exercises one piece in isolation; an integration test exercises pieces working together, often with a real database",
        "Integration tests are always slower to write",
        "Unit tests cannot use assertions",
      ],
      1,
      "The distinction is scope, not speed or ordering. Both matter: units catch logic errors quickly, integrations catch wiring and query errors units cannot see.",
    ),
    spoken("CONCEPTUAL", "JUNIOR", "Explain what a REST API is, and describe one thing people commonly get wrong about it.", [
      c("resources", "Describes resources and verbs over ad-hoc actions", 3, ["resource", "verb", "get", "post", "noun", "endpoint"]),
      c("statelessness", "Mentions each request carrying its own context", 2, ["stateless", "no session", "token", "self-contained"]),
      c("critique", "Names a real misuse rather than reciting a definition", 3, ["status code", "post for everything", "verb in url", "misuse"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What is the difference between server-side rendering and client-side rendering, and how would you choose between them?", [
      c("mechanics", "Explains where the HTML is produced", 3, ["server", "client", "html", "javascript", "browser"]),
      c("tradeoffs", "Names real trade-offs rather than a preference", 3, ["first paint", "seo", "interactivity", "load", "cost"]),
      c("choice", "Ties the choice to the kind of product", 2, ["content site", "dashboard", "depends", "audience"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What does it mean for code to be 'testable', and what makes code hard to test?", [
      c("dependencies", "Identifies hidden dependencies as the obstacle", 3, ["dependency", "inject", "global", "database", "network", "clock"]),
      c("purity", "Mentions separating decisions from side effects", 3, ["pure", "side effect", "separate", "logic", "io"]),
      c("example", "Grounds it in something they have actually written", 2, ["for example", "i had", "we refactored"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "Explain what an index does to a database table, and why you would not add one to every column.", [
      c("mechanism", "Explains faster lookup at a cost", 3, ["lookup", "scan", "b-tree", "sorted", "faster read"]),
      c("cost", "Names the write and storage penalty", 3, ["write", "insert", "update", "storage", "slower"]),
      c("selection", "Ties index choice to actual query patterns", 2, ["query", "where", "join", "usage", "measure"]),
    ]),
    typed("SCENARIO", "JUNIOR", "Your team's test suite takes 25 minutes and people have started pushing without running it. Analyse why this is dangerous and describe how you would get it back under control.", [
      c("risk", "Names the real risk of an unrun suite", 3, ["broken", "regression", "confidence", "main", "production"]),
      c("diagnosis", "Proposes finding what is actually slow", 3, ["profile", "slowest", "measure", "which tests"]),
      c("plan", "Offers a workable split or parallelisation", 3, ["parallel", "split", "fast subset", "ci", "pre-commit"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A product manager asks for a feature that would require storing users' full payment card numbers. Write how you would respond.", [
      c("pushback", "Declines to store card numbers directly", 3, ["do not store", "pci", "provider", "token", "compliance"]),
      c("alternative", "Offers a route that meets the underlying need", 3, ["tokenise", "stripe", "gateway", "last four", "reference"]),
      c("tone", "Explains the reasoning without being obstructive", 2, ["explain", "risk", "liability", "work with"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A deploy went out an hour ago and error rates have tripled. You have the ability to roll back. Write what you do, in order, and say what you would capture before acting.", [
      c("stop-bleeding", "Prioritises restoring service", 3, ["roll back", "revert", "restore", "first"]),
      c("evidence", "Captures diagnostics before losing them", 3, ["logs", "capture", "snapshot", "error", "trace", "before"]),
      c("followup", "Plans a root-cause pass afterwards", 2, ["root cause", "postmortem", "reproduce", "test"]),
    ]),
    typed("CODING", "JUNIOR", "Write a function that takes a list of orders, each `{ customerId, total }`, and returns the total spend per customer sorted from highest to lowest. State how you handle an empty list.", [
      c("grouping", "Aggregates correctly by key", 3, ["map", "reduce", "group", "accumulate", "object"]),
      c("sorting", "Sorts descending by the aggregate", 2, ["sort", "descending", "b - a", "comparator"]),
      c("edges", "Addresses the empty input explicitly", 2, ["empty", "return", "[]", "guard"]),
    ]),
    typed("CODING", "JUNIOR", "Write an endpoint that lets a signed-in user update only their own profile. Show the authorisation check and say what you return when the check fails.", [
      c("ownership", "Compares the record owner to the caller", 3, ["user id", "owner", "session", "compare", "match"]),
      c("response", "Returns a correct refusal status", 2, ["403", "404", "forbidden", "not found"]),
      c("fields", "Restricts which fields can be changed", 3, ["allowlist", "pick", "whitelist", "role", "cannot change"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you shipped something that broke in production. What did you do in the first hour?", [
      c("ownership", "Takes responsibility without deflecting", 3, ["my", "i broke", "responsible", "own"]),
      c("response", "Describes a sensible immediate response", 3, ["rollback", "fix", "communicate", "told the team"]),
      c("prevention", "Changed something so it cannot recur", 2, ["test", "check", "alert", "process"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Describe a time you had to work with code you found confusing or badly written. How did you approach it?", [
      c("approach", "Describes building understanding methodically", 3, ["read", "traced", "test", "small change", "debugger"]),
      c("restraint", "Resists rewriting for its own sake", 2, ["did not rewrite", "understand first", "risk", "incremental"]),
      c("improvement", "Left it better in some measurable way", 2, ["renamed", "test", "documented", "refactored"]),
    ]),

    // --- MID --------------------------------------------------------------
    mcq(
      "MID",
      "You need to add a NOT NULL column to a 50-million-row table with no downtime. What is the safe sequence?",
      [
        "Add the column with NOT NULL and a default in one statement",
        "Add it nullable, backfill in batches, then add the constraint",
        "Drop and recreate the table with the new schema",
        "Add it in a transaction with the backfill",
      ],
      1,
      "A single blocking statement can hold a lock for minutes. Nullable-then-backfill-then-constrain keeps each step short; wrapping the backfill in one transaction reintroduces exactly the problem you are avoiding.",
    ),
    mcq(
      "MID",
      "Your service calls a third-party API that starts timing out. Without a circuit breaker, what is the most likely consequence?",
      [
        "The third party recovers faster",
        "Your own threads or connections are exhausted waiting, and unrelated requests start failing",
        "The requests are automatically retried",
        "Only that one endpoint returns errors",
      ],
      1,
      "This is how one dependency takes down a whole service. A breaker fails fast once a failure rate is detected, keeping resources available for everything else.",
    ),
    mcq(
      "MID",
      "What problem does a database connection pool solve?",
      [
        "It encrypts the connection",
        "It reuses a limited set of expensive connections instead of opening one per request",
        "It balances load between replicas",
        "It caches query results",
      ],
      1,
      "Establishing a connection costs a round trip and server memory. The pool also caps concurrency, which protects the database from being overwhelmed.",
    ),
    mcq(
      "MID",
      "A cached value is expensive to compute and expires at a fixed time. Many requests arrive the instant it expires. What is this called and what fixes it?",
      [
        "Cache poisoning; sign the cache entries",
        "A cache stampede; use a lock or staggered expiry so one request recomputes",
        "Cache thrashing; increase the cache size",
        "A cold cache; warm it on deploy",
      ],
      1,
      "Every request misses simultaneously and all of them hit the origin. Single-flight locking, or jittered TTLs, keeps the recompute to one caller.",
    ),
    mcq(
      "MID",
      "Which statement about database read replicas is correct?",
      [
        "Reads from a replica are always as current as the primary",
        "A replica may lag, so a read straight after a write can return the old value",
        "Replicas accept writes and forward them to the primary",
        "Replication removes the need for backups",
      ],
      1,
      "Replication lag is the trap. A user who saves and immediately reloads can see their own change vanish unless that read is routed to the primary.",
    ),
    mcq(
      "MID",
      "You are choosing between a queue and a direct synchronous call for sending a welcome email. Which reasoning is soundest?",
      [
        "Synchronous, because the user should know the email was sent",
        "A queue, because email delivery should not make signup fail or slow",
        "Synchronous, because queues lose messages",
        "A queue, because it is always faster",
      ],
      1,
      "Signup succeeding should not depend on a mail provider being healthy. Decoupling also lets you retry delivery without blocking the user.",
    ),
    spoken("CONCEPTUAL", "MID", "Explain database transaction isolation levels, and describe a bug you would expect at READ COMMITTED that SERIALIZABLE would prevent.", [
      c("levels", "Distinguishes the levels accurately", 3, ["read committed", "repeatable read", "serializable", "dirty", "phantom"]),
      c("anomaly", "Names a concrete anomaly", 3, ["non-repeatable", "phantom", "write skew", "lost update"]),
      c("cost", "Acknowledges the throughput cost of stricter levels", 2, ["contention", "lock", "retry", "throughput", "cost"]),
    ]),
    spoken("CONCEPTUAL", "MID", "What is the difference between horizontal and vertical scaling, and what in an application usually blocks horizontal scaling first?", [
      c("definitions", "Distinguishes the two clearly", 2, ["more machines", "bigger machine", "instances", "cpu", "ram"]),
      c("blocker", "Identifies state as the usual obstacle", 3, ["session", "state", "sticky", "local disk", "in-memory", "database"]),
      c("remedy", "Describes externalising state", 3, ["shared", "redis", "database", "stateless", "object storage"]),
    ]),
    spoken("CONCEPTUAL", "MID", "How do you decide what to log, and what makes a log line useful at three in the morning?", [
      c("selection", "Logs decisions and boundaries, not noise", 3, ["error", "boundary", "decision", "not every", "noise"]),
      c("context", "Includes correlation and identifiers", 3, ["request id", "correlation", "user", "trace", "context"]),
      c("hygiene", "Keeps secrets and personal data out", 2, ["pii", "password", "token", "redact", "secret"]),
    ]),
    spoken("CONCEPTUAL", "MID", "Describe how you would design an API that a mobile app and a web app both consume, when their needs differ.", [
      c("shared", "Finds the common core", 2, ["shared", "core", "resource", "same"]),
      c("divergence", "Handles differing needs without forking", 3, ["fields", "versioning", "graphql", "bff", "query param"]),
      c("evolution", "Plans for change without breaking old clients", 3, ["version", "backward compatible", "deprecate", "additive"]),
    ]),
    typed("SCENARIO", "MID", "Your application stores uploaded files on the web server's local disk. You now need to run three instances behind a load balancer. Analyse what breaks and describe the migration.", [
      c("breakage", "Identifies files being visible on only one instance", 3, ["one instance", "missing", "404", "not found", "local disk"]),
      c("target", "Proposes shared or object storage", 3, ["s3", "object storage", "shared", "blob", "bucket"]),
      c("migration", "Sequences the change without losing files", 3, ["copy", "dual write", "backfill", "cutover", "verify"]),
    ]),
    typed("SCENARIO", "MID", "Support reports that a small number of customers see another customer's data. It is intermittent. Write your investigation plan and your first three hypotheses.", [
      c("severity", "Treats it as an urgent security incident", 3, ["urgent", "severe", "disable", "incident", "escalate"]),
      c("hypotheses", "Proposes plausible causes for cross-tenant leakage", 3, ["cache", "shared state", "global", "connection", "tenant id", "singleton"]),
      c("method", "Describes how to confirm rather than guess", 3, ["reproduce", "log", "correlate", "trace", "narrow"]),
    ]),
    typed("SCENARIO", "MID", "You inherit a service with no tests and a monthly release that always slips. You have one quarter. Write what you would change first and justify the order.", [
      c("priority", "Starts where risk is highest, not where it is easiest", 3, ["riskiest", "critical path", "highest value", "first"]),
      c("safety-net", "Builds tests around behaviour before refactoring", 3, ["characterisation", "integration", "smoke", "before changing"]),
      c("delivery", "Improves release frequency incrementally", 2, ["smaller", "more often", "automate", "pipeline"]),
    ]),
    typed("CODING", "MID", "Write a function that retries an async operation with exponential backoff, gives up after a maximum number of attempts, and does not retry on a 4xx client error.", [
      c("backoff", "Increases the delay between attempts", 3, ["exponential", "2 **", "delay", "jitter", "sleep"]),
      c("selective", "Distinguishes retryable from non-retryable failures", 3, ["4xx", "client error", "do not retry", "status", "throw"]),
      c("bounds", "Stops and surfaces the final failure", 2, ["max", "attempts", "throw", "give up"]),
    ]),
    typed("CODING", "MID", "Write the query and the endpoint for cursor-based pagination over a posts table ordered by creation time. Explain why you would choose it over OFFSET.", [
      c("cursor", "Uses a stable key rather than an offset", 3, ["cursor", "where created_at <", "id", "keyset", "seek"]),
      c("stability", "Explains skipped or repeated rows under OFFSET", 3, ["shift", "insert", "duplicate", "skip", "unstable"]),
      c("performance", "Notes OFFSET degrading on deep pages", 2, ["offset", "scan", "slow", "deep"]),
    ]),
    typed("CODING", "MID", "Write a function that safely transfers an amount between two account rows. Assume concurrent transfers are possible and state the isolation or locking you rely on.", [
      c("atomicity", "Wraps both updates in one transaction", 3, ["transaction", "begin", "commit", "rollback", "atomic"]),
      c("concurrency", "Prevents lost updates or deadlock", 3, ["for update", "lock", "order", "deadlock", "serializable"]),
      c("validation", "Refuses to overdraw", 2, ["balance", "insufficient", "check", "constraint"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Tell me about a time you had to say no to a request from someone more senior than you. How did you handle it?", [
      c("substance", "Had a real reason rather than reluctance", 3, ["risk", "data", "evidence", "cost", "because"]),
      c("delivery", "Communicated respectfully and offered options", 3, ["alternative", "explained", "options", "discussed"]),
      c("outcome", "Reports the result honestly, including losing", 2, ["outcome", "they decided", "we agreed", "in the end"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Describe a technical decision you made that you later regretted. What would you do differently?", [
      c("candour", "Names a genuine mistake", 3, ["regret", "wrong", "mistake", "should have"]),
      c("analysis", "Understands why it was wrong, not just that it was", 3, ["because", "underestimated", "did not know", "assumption"]),
      c("learning", "Applies it to future decisions", 2, ["now i", "since then", "would"]),
    ]),

    // --- SENIOR -----------------------------------------------------------
    mcq(
      "SENIOR",
      "You are splitting a monolith. Which boundary is most likely to succeed as a separate service?",
      [
        "One drawn around a shared database table",
        "One drawn around a business capability that owns its own data",
        "One drawn around a technical layer such as 'all controllers'",
        "One drawn around the largest source directory",
      ],
      1,
      "Services that share a database are distributed monoliths with worse failure modes. Owning its data is what lets a service deploy and scale independently.",
    ),
    mcq(
      "SENIOR",
      "Two services must both update state as part of one business operation. Distributed transactions are unavailable. What pattern applies?",
      [
        "Two-phase commit over HTTP",
        "A saga with compensating actions for each step",
        "A shared transaction manager in the load balancer",
        "Retrying until both succeed",
      ],
      1,
      "A saga accepts that intermediate states are visible and defines how to undo each step. Retrying forever converts a correctness problem into an availability one.",
    ),
    mcq(
      "SENIOR",
      "Which is the strongest argument for an event-driven design over synchronous calls between services?",
      [
        "It is easier to debug",
        "Producers do not need to know or wait for consumers, so a slow consumer cannot stall the producer",
        "It guarantees ordering",
        "It removes the need for schemas",
      ],
      1,
      "Temporal decoupling is the real prize. Debugging is harder, ordering needs explicit work, and schemas matter more rather than less.",
    ),
    spoken("CONCEPTUAL", "SENIOR", "How do you decide when a system needs a cache, and how do you decide what its invalidation strategy should be?", [
      c("evidence", "Requires measurement before caching", 3, ["measure", "profile", "hot", "read heavy", "latency"]),
      c("invalidation", "Reasons about staleness tolerance", 3, ["ttl", "invalidate", "write through", "stale", "tolerance"]),
      c("failure", "Considers what happens when the cache is empty or wrong", 3, ["stampede", "cold", "fallback", "wrong", "consistency"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "Explain how you would introduce observability into a system that currently has only logs. What would you add first and why?", [
      c("pillars", "Distinguishes metrics, traces and logs by purpose", 3, ["metric", "trace", "log", "span", "cardinality"]),
      c("priority", "Starts from user-visible symptoms", 3, ["slo", "latency", "error rate", "user", "golden signals"]),
      c("cost", "Acknowledges volume and cost trade-offs", 2, ["sampling", "cost", "retention", "cardinality"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "What does 'backwards compatible' mean for an API, and how do you retire a field that clients still use?", [
      c("definition", "Defines it in terms of not breaking existing clients", 3, ["existing clients", "additive", "optional", "no break"]),
      c("process", "Describes measuring usage before removing", 3, ["telemetry", "usage", "who calls", "measure", "deprecate"]),
      c("communication", "Plans notice and a migration window", 2, ["notice", "deprecation", "timeline", "documentation"]),
    ]),
    typed("SCENARIO", "SENIOR", "Your platform must support a customer who contractually requires their data to stay in one country. The system is currently single-region. Analyse the implications and outline an approach.", [
      c("scope", "Recognises this touches storage, backups, logs and third parties", 3, ["backup", "logs", "third party", "replica", "analytics"]),
      c("architecture", "Proposes a workable partitioning approach", 3, ["shard", "region", "routing", "per-tenant", "cell"]),
      c("honesty", "States the cost and what would not be solved quickly", 2, ["cost", "months", "trade-off", "not trivial"]),
    ]),
    typed("SCENARIO", "SENIOR", "A dependency your product relies on announces end of life in six months. It touches roughly 200 files. Write your plan.", [
      c("assessment", "Maps the true blast radius before committing", 3, ["audit", "inventory", "usage", "which files", "measure"]),
      c("strategy", "Proposes incremental migration behind an abstraction", 3, ["adapter", "wrapper", "incremental", "strangler", "facade"]),
      c("risk", "Plans verification and a fallback", 2, ["test", "canary", "rollback", "parallel"]),
    ]),
    typed("SCENARIO", "SENIOR", "Two teams have independently built overlapping services and both want to own the shared concept. You have been asked to resolve it. Write how you would approach the decision.", [
      c("facts", "Gathers usage and cost data before deciding", 3, ["data", "usage", "traffic", "cost", "who uses"]),
      c("criteria", "Sets explicit decision criteria", 3, ["criteria", "ownership", "boundary", "domain", "roadmap"]),
      c("people", "Handles the political dimension honestly", 2, ["stakeholder", "agree", "escalate", "consensus", "decision record"]),
    ]),
    typed("SCENARIO", "SENIOR", "Your error budget is exhausted three weeks into the quarter and product wants to ship a large feature. Write the conversation you would have and the position you would take.", [
      c("data", "Grounds the position in reliability data", 3, ["error budget", "slo", "incident", "data", "availability"]),
      c("options", "Offers graded options rather than a flat refusal", 3, ["feature flag", "phased", "canary", "smaller", "options"]),
      c("authority", "Knows what is their call and what is not", 2, ["escalate", "decision", "business", "accept risk"]),
    ]),
    typed("CODING", "SENIOR", "Write an idempotency layer for a payments endpoint: same idempotency key returns the original result, concurrent duplicates do not double-charge. State your storage and its failure modes.", [
      c("key-handling", "Stores and checks the key atomically", 3, ["unique", "insert", "constraint", "atomic", "key"]),
      c("concurrency", "Handles two simultaneous requests correctly", 3, ["race", "lock", "in progress", "conflict", "409"]),
      c("failure", "Considers a crash between charge and record", 3, ["crash", "partial", "reconcile", "provider", "retry"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about a time you inherited a team or system in poor shape. What did you change first, and how did you decide?", [
      c("diagnosis", "Listened and measured before acting", 3, ["listened", "measured", "asked", "understood", "first weeks"]),
      c("sequencing", "Sequenced changes by risk and morale", 3, ["first", "quick win", "trust", "riskiest", "order"]),
      c("result", "Reports outcome including what did not work", 2, ["result", "did not", "still", "improved"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Describe a time you had to advocate for paying down technical debt against competing feature pressure. How did you make the case?", [
      c("framing", "Translated debt into business terms", 3, ["cost", "velocity", "incident", "risk", "revenue", "time"]),
      c("evidence", "Brought data rather than opinion", 3, ["data", "measured", "hours", "incidents", "trend"]),
      c("pragmatism", "Accepted partial wins", 2, ["compromise", "some", "incremental", "alongside"]),
    ]),

    // --- STAFF ------------------------------------------------------------
    mcq(
      "STAFF",
      "Which is the clearest sign that a proposed architecture is over-engineered for its stage?",
      [
        "It uses more than one programming language",
        "It solves scaling and flexibility problems the business has no evidence of having",
        "It has more than five services",
        "It requires a message queue",
      ],
      1,
      "Complexity is justified by evidence, not by anticipation. The cost is paid immediately in delivery speed while the benefit remains hypothetical.",
    ),
    mcq(
      "STAFF",
      "You must choose between strong consistency and availability for a shopping cart during a network partition. Which reasoning is soundest?",
      [
        "Always choose consistency; correctness matters most",
        "Choose availability, because a temporarily divergent cart is recoverable and a blocked checkout is lost revenue",
        "Always choose consistency, because carts involve money",
        "The choice does not apply to carts",
      ],
      1,
      "The right answer follows from the business cost of each failure. Carts tolerate merge-on-reconcile; the payment step itself is where consistency must win.",
    ),
    mcq(
      "STAFF",
      "What is the primary purpose of an architecture decision record?",
      [
        "To satisfy an audit requirement",
        "To capture the context and alternatives so a future team understands why, not just what",
        "To assign responsibility for failures",
        "To replace design documents",
      ],
      1,
      "The decision itself is usually visible in the code. What is lost is the constraint set at the time, which is exactly what a future reader needs to know whether it still holds.",
    ),
    spoken("CONCEPTUAL", "STAFF", "How do you evaluate whether an organisation should build, buy, or adopt open source for a capability that is not its core business?", [
      c("criteria", "Uses explicit criteria beyond price", 3, ["total cost", "maintenance", "differentiator", "core", "lock-in"]),
      c("risk", "Weighs exit cost and dependency risk", 3, ["exit", "lock-in", "vendor", "abandoned", "support"]),
      c("organisation", "Considers who will own it in two years", 2, ["ownership", "team", "capacity", "on-call"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "Describe how you would set technical direction across several teams without becoming a bottleneck for their decisions.", [
      c("mechanism", "Uses principles and guardrails over case-by-case approval", 3, ["principle", "guardrail", "standard", "paved road", "template"]),
      c("autonomy", "Preserves team ownership", 3, ["autonomy", "own", "trust", "not approve", "delegate"]),
      c("feedback", "Builds a way to learn direction is wrong", 2, ["review", "feedback", "adjust", "measure"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "What is your view on measuring engineering productivity, and what would you actually track?", [
      c("scepticism", "Rejects naive individual output metrics", 3, ["lines of code", "not individual", "gaming", "misleading"]),
      c("system", "Focuses on flow and reliability of the system", 3, ["lead time", "deployment frequency", "change failure", "recovery", "dora"]),
      c("qualitative", "Pairs numbers with human signal", 2, ["survey", "talk", "qualitative", "context"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How would you approach a rewrite proposal for a system that works but is widely disliked by the team?", [
      c("scrutiny", "Challenges the premise before agreeing", 3, ["why", "specific", "evidence", "symptom", "actually"]),
      c("alternatives", "Considers incremental options first", 3, ["incremental", "strangler", "refactor", "partial"]),
      c("morale", "Takes the human signal seriously without capitulating", 2, ["team", "morale", "listen", "retention"]),
    ]),
    typed("SCENARIO", "STAFF", "The company wants to move from quarterly releases to continuous deployment. Engineering is willing; QA and compliance are not. Write your plan for the first six months.", [
      c("stakeholders", "Addresses the objections on their own terms", 3, ["compliance", "audit", "evidence", "qa", "risk", "control"]),
      c("technical", "Sequences the technical prerequisites", 3, ["automated test", "pipeline", "feature flag", "canary", "rollback"]),
      c("proof", "Proves it on a low-risk surface first", 2, ["pilot", "one service", "low risk", "start with"]),
    ]),
    typed("SCENARIO", "STAFF", "A critical vulnerability is disclosed in a library used across 40 repositories, some unmaintained. Write your response plan for the first 48 hours.", [
      c("triage", "Establishes exposure before mass patching", 3, ["inventory", "which", "exposed", "reachable", "triage"]),
      c("execution", "Sequences by real risk", 3, ["internet facing", "priority", "first", "patch", "mitigate"]),
      c("systemic", "Fixes the discovery gap, not just this bug", 2, ["sbom", "dependency scanning", "inventory", "process"]),
    ]),
    typed("SCENARIO", "STAFF", "Your largest customer asks for a feature that would fork the product's data model for them alone. It is 30% of revenue. Write your analysis and recommendation.", [
      c("cost", "Names the long-term cost of a fork honestly", 3, ["fork", "maintenance", "every feature", "compound", "debt"]),
      c("alternatives", "Looks for a generalisable form of the request", 3, ["configurable", "generalise", "extension", "plugin", "opt-in"]),
      c("commercial", "Engages with the revenue reality rather than ignoring it", 3, ["revenue", "concentration", "negotiate", "price", "risk"]),
    ]),
    typed("SCENARIO", "STAFF", "Two years of incidents share a root cause nobody has fixed because it sits between three teams. Write how you would get it resolved.", [
      c("evidence", "Aggregates the incident history into a case", 3, ["pattern", "incidents", "cost", "data", "recurring"]),
      c("ownership", "Resolves the ownership gap explicitly", 3, ["owner", "assign", "boundary", "accountable", "raci"]),
      c("execution", "Makes it someone's funded priority", 2, ["roadmap", "prioritise", "sponsor", "resource"]),
    ]),
    typed("SCENARIO", "STAFF", "Leadership wants an AI coding assistant rolled out to all engineers next month, citing productivity. Write your recommendation, including what you would measure and what you would restrict.", [
      c("balance", "Neither dismisses nor accepts the premise uncritically", 3, ["evidence", "trial", "depends", "measure", "some tasks"]),
      c("risk", "Names concrete risks such as licensing and leaked source", 3, ["licence", "secret", "source code", "review", "confidential", "security"]),
      c("measurement", "Proposes how success would actually be judged", 2, ["measure", "baseline", "review time", "defect", "survey"]),
    ]),
    typed("CODING", "STAFF", "Design and sketch the interface for a feature-flag system used by 20 teams: targeting rules, safe defaults when the service is unreachable, and an audit trail. Explain your key decisions.", [
      c("api", "Defines a small, hard-to-misuse interface", 3, ["interface", "default", "typed", "simple", "signature"]),
      c("failure", "Fails safe when the flag service is down", 3, ["default", "cached", "unreachable", "fail", "last known"]),
      c("governance", "Handles audit and flag lifecycle", 3, ["audit", "who changed", "cleanup", "stale", "expiry"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Tell me about a time you changed your mind about an important technical position after someone challenged it.", [
      c("openness", "Genuinely updated rather than conceding to rank", 3, ["changed my mind", "convinced", "evidence", "wrong"]),
      c("reasoning", "Explains what specifically shifted", 3, ["because", "showed me", "data", "argument"]),
      c("humility", "Comfortable being publicly wrong", 2, ["told the team", "admitted", "publicly"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Describe the largest technical bet you have taken. How did you decide, and how did it turn out?", [
      c("stakes", "Describes a decision of real consequence", 3, ["bet", "risk", "months", "cost", "reversible"]),
      c("process", "Reduced uncertainty before committing", 3, ["prototype", "spike", "data", "reversible", "small"]),
      c("honesty", "Reports the outcome without spin", 2, ["worked", "did not", "partly", "in hindsight"]),
    ]),
  ],
};
