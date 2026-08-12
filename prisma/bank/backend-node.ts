import type { BankDomain } from "../question-bank";
import { c, mcq, spoken, typed } from "./authoring";

/**
 * Backend — Node.js / APIs — depth tranche.
 *
 * Concentrates on the failure modes that only appear under concurrency and
 * load, since those are what separate someone who has run a service in
 * production from someone who has only built one.
 */
export const BACKEND_NODE_DEPTH: BankDomain = {
  slug: "backend-node",
  name: "Backend — Node.js / APIs",
  blurb: "Builds the services, APIs and data layer behind a product.",
  questions: [
    // --- BEGINNER ---------------------------------------------------------
    mcq(
      "BEGINNER",
      "What does a 201 status code mean?",
      [
        "The request was accepted but not processed yet",
        "A new resource was created as a result of the request",
        "The response came from a cache",
        "The client must authenticate",
      ],
      1,
      "201 is the correct answer to a successful POST that creates something, usually with a Location header pointing at the new resource. 202 is the 'accepted, not done yet' code.",
    ),
    mcq(
      "BEGINNER",
      "Why should an API return a specific error message to logs but a generic one to the client?",
      [
        "Generic messages are shorter",
        "Detailed errors can reveal internal structure that helps an attacker",
        "Clients cannot display long messages",
        "It is required by HTTP",
      ],
      1,
      "A stack trace or SQL fragment in a response tells an attacker about your schema and framework. The detail belongs in your logs, keyed by an id you can give the user.",
    ),
    mcq(
      "BEGINNER",
      "What is the purpose of a `.env` file being listed in `.gitignore`?",
      [
        "To make the repository smaller",
        "To keep credentials out of version control, where they would be permanent and shared",
        "To speed up cloning",
        "To stop the file being overwritten",
      ],
      1,
      "Anything committed stays in the history even after deletion. A leaked key in a repository must be rotated, not just removed.",
    ),
    mcq(
      "BEGINNER",
      "In Node.js, what does `await` do inside an async function?",
      [
        "Blocks the whole process until the promise settles",
        "Pauses only that function until the promise settles, letting other work continue",
        "Runs the promise on a background thread",
        "Converts a callback into a promise",
      ],
      1,
      "The function suspends; the event loop carries on. That is the difference between awaiting and a synchronous blocking call such as `readFileSync`.",
    ),
    mcq(
      "BEGINNER",
      "Your endpoint accepts JSON but crashes when the body is malformed. What is the right response?",
      [
        "500, because the server threw",
        "400, because the client sent something invalid",
        "404, because the body was not found",
        "204, because there is nothing to return",
      ],
      1,
      "A malformed body is the client's error. Letting it surface as a 500 hides real server faults among ordinary bad input.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "What is an environment variable, and why does the same code behave differently in development and production?", [
      c("purpose", "Explains configuration living outside the code", 3, ["config", "outside", "secret", "per environment", "not in code"]),
      c("examples", "Gives concrete examples", 2, ["database", "url", "api key", "port", "mode"]),
      c("hygiene", "Knows they must not be committed", 3, ["gitignore", "not committed", "secret", "leak"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "Explain in your own words what an HTTP request and response actually contain.", [
      c("request", "Names method, path, headers and body", 3, ["method", "path", "url", "header", "body"]),
      c("response", "Names status, headers and body", 3, ["status", "code", "header", "body", "json"]),
      c("purpose", "Explains why headers matter", 2, ["content type", "auth", "cookie", "cache"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What does it mean to say an API endpoint is 'slow'? What are the different places that time could be going?", [
      c("breakdown", "Separates the contributors to latency", 3, ["database", "network", "query", "external", "processing"]),
      c("measurement", "Wants to measure rather than assume", 3, ["measure", "timing", "log", "profile", "where"]),
      c("distribution", "Distinguishes typical from worst case", 2, ["average", "some requests", "p99", "sometimes"]),
    ]),
    typed("SCENARIO", "BEGINNER", "An endpoint that lists products returns in 30ms with 50 products and 9 seconds with 5,000. Write what you suspect and how you would confirm it.", [
      c("hypothesis", "Suspects unbounded results or per-row queries", 3, ["all rows", "no limit", "n+1", "per row", "loop"]),
      c("confirmation", "Proposes measuring the query count or time", 3, ["log queries", "explain", "count", "measure", "timing"]),
      c("fix", "Proposes pagination or a join", 2, ["limit", "pagination", "join", "batch"]),
    ]),
    typed("SCENARIO", "BEGINNER", "You are asked to add a 'delete account' endpoint. Write what you would clarify before writing any code.", [
      c("semantics", "Asks what delete actually means here", 3, ["soft delete", "hard", "anonymise", "retain", "really"]),
      c("dependencies", "Considers related data", 3, ["orders", "related", "foreign key", "cascade", "history"]),
      c("safety", "Guards against accidental or malicious deletion", 2, ["confirm", "auth", "own account", "irreversible"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A teammate suggests storing the user's password so it can be shown to them if they forget it. Write your response.", [
      c("refusal", "Refuses clearly and correctly", 3, ["never", "hash", "cannot", "one way", "no"]),
      c("reasoning", "Explains the breach and trust consequences", 3, ["breach", "reuse", "other sites", "liability", "leak"]),
      c("alternative", "Offers the correct mechanism", 2, ["reset", "token", "email", "expire"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time you had to read documentation to solve something rather than copying an answer. What was the difference?", [
      c("method", "Describes working from primary sources", 3, ["documentation", "read", "official", "source", "spec"]),
      c("understanding", "Gained real understanding", 3, ["understood", "why", "how it works", "rather than"]),
      c("outcome", "Applied it successfully", 2, ["worked", "solved", "fixed"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Describe a time you broke something and had to tell someone. How did you handle it?", [
      c("honesty", "Reported it promptly rather than hiding it", 3, ["told", "immediately", "admitted", "reported"]),
      c("action", "Took steps to fix or contain it", 3, ["fixed", "reverted", "helped", "restored"]),
      c("learning", "Took something away from it", 2, ["learned", "now", "since"]),
    ]),

    // --- JUNIOR -----------------------------------------------------------
    mcq(
      "JUNIOR",
      "Why is `JSON.parse` on untrusted input with no size limit a risk?",
      [
        "It can execute arbitrary code",
        "A very large payload can consume memory and block the event loop while parsing",
        "It cannot handle nested objects",
        "It silently truncates numbers",
      ],
      1,
      "Parsing is synchronous and proportional to size. A body limit is the defence; `JSON.parse` itself does not execute code, unlike `eval`.",
    ),
    mcq(
      "JUNIOR",
      "What does setting `SameSite=Strict` on a session cookie achieve?",
      [
        "It encrypts the cookie",
        "The browser will not send it on requests originating from another site, mitigating CSRF",
        "It prevents JavaScript from reading it",
        "It makes the cookie expire sooner",
      ],
      1,
      "SameSite addresses cross-site request forgery. HttpOnly is what stops JavaScript reading it — the two solve different problems.",
    ),
    mcq(
      "JUNIOR",
      "Your service caches a database result in a module-level variable. What breaks when you run three instances?",
      [
        "Nothing; each instance has its own copy",
        "The caches diverge, so users see different data depending on which instance serves them",
        "The database rejects the connections",
        "Memory usage triples",
      ],
      1,
      "Per-process caches are fine only if staleness is tolerable and consistent. Where users must see the same value, the cache has to be shared.",
    ),
    mcq(
      "JUNIOR",
      "What is the main problem with using `Math.random()` to generate a password reset token?",
      [
        "It is too slow",
        "It is not cryptographically secure, so tokens can be predicted",
        "It can return duplicates",
        "It only returns numbers",
      ],
      1,
      "It is seeded predictably and not designed to resist an attacker. `crypto.randomBytes` is the correct source for anything security-bearing.",
    ),
    mcq(
      "JUNIOR",
      "An endpoint takes 200ms of CPU-bound work per request in Node.js. What is the consequence under load?",
      [
        "Nothing, Node handles it with threads",
        "The single event loop is blocked, so every other request queues behind it",
        "The request is automatically moved to a worker",
        "Memory grows unbounded",
      ],
      1,
      "Node's concurrency comes from non-blocking I/O, not from parallel CPU. Heavy computation needs a worker thread or a separate process.",
    ),
    mcq(
      "JUNIOR",
      "Which is the correct use of a 202 Accepted response?",
      [
        "The request succeeded and the result is in the body",
        "The request was valid and queued for processing that has not finished",
        "The client must retry later",
        "The resource was created",
      ],
      1,
      "202 admits the work is asynchronous. It should point the client at somewhere they can check progress, otherwise it is just an unhelpful 200.",
    ),
    spoken("CONCEPTUAL", "JUNIOR", "Explain what a database migration is and what makes one risky to run against a live system.", [
      c("definition", "Explains versioned, repeatable schema change", 3, ["versioned", "script", "repeatable", "schema", "history"]),
      c("risk", "Names locking and long-running statements", 3, ["lock", "table", "blocking", "downtime", "large table"]),
      c("safety", "Describes reversibility and staged rollout", 2, ["rollback", "reversible", "backwards compatible", "staged"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What is the difference between synchronous and asynchronous processing, and how do you decide which a piece of work needs?", [
      c("distinction", "Explains waiting versus deferring", 3, ["wait", "immediate", "later", "queue", "background"]),
      c("criteria", "Ties the choice to whether the user needs the result", 3, ["user needs", "response", "can wait", "not critical"]),
      c("consequences", "Knows async brings new problems", 2, ["retry", "failure", "ordering", "visibility", "at least once"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "Explain what an API contract is, and what breaking one costs.", [
      c("contract", "Describes the shape both sides rely on", 3, ["shape", "fields", "types", "agreement", "schema"]),
      c("breakage", "Names concrete consequences for clients", 3, ["client", "crash", "mobile", "cannot update", "deploy"]),
      c("evolution", "Knows how to change safely", 2, ["additive", "optional", "version", "deprecate"]),
    ]),
    typed("SCENARIO", "JUNIOR", "Your service depends on an external API with a 5,000-requests-per-hour limit. You are at 90% and traffic is growing. Write your options.", [
      c("reduction", "Reduces calls rather than only asking for more quota", 3, ["cache", "batch", "dedupe", "reduce", "avoid"]),
      c("handling", "Handles hitting the limit gracefully", 3, ["429", "backoff", "queue", "degrade", "retry after"]),
      c("visibility", "Adds monitoring before it becomes an incident", 2, ["alert", "monitor", "threshold", "track"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A cron job that sends daily emails sent them twice yesterday. Write how you would investigate and prevent recurrence.", [
      c("investigation", "Looks for double execution rather than a code bug first", 3, ["ran twice", "two instances", "overlap", "logs", "schedule"]),
      c("prevention", "Proposes a lock or idempotency record", 3, ["lock", "idempotent", "already sent", "record", "unique"]),
      c("blast", "Considers the user impact", 2, ["users", "apologise", "how many", "impact"]),
    ]),
    typed("SCENARIO", "JUNIOR", "You are asked to expose an internal endpoint to a partner company. Write what you would put in place before doing so.", [
      c("authentication", "Requires strong, revocable credentials", 3, ["api key", "oauth", "token", "revoke", "per partner"]),
      c("limits", "Applies rate limiting and quotas", 3, ["rate limit", "quota", "throttle", "abuse"]),
      c("surface", "Restricts to exactly what is needed", 3, ["only", "fields", "scope", "least privilege", "separate"]),
    ]),
    typed("CODING", "JUNIOR", "Write a middleware that logs every request with its method, path, status and duration, without logging request bodies or authorisation headers.", [
      c("timing", "Measures duration correctly across the response", 3, ["start", "finish", "hrtime", "date.now", "on finish"]),
      c("fields", "Logs the useful fields", 2, ["method", "path", "status", "duration"]),
      c("hygiene", "Deliberately excludes sensitive data", 3, ["no body", "redact", "authorization", "exclude", "sensitive"]),
    ]),
    typed("CODING", "JUNIOR", "Write a function that validates a signup payload `{ email, password, age }` and returns all validation errors at once rather than the first one.", [
      c("completeness", "Collects every error rather than returning early", 3, ["errors", "array", "push", "all", "collect"]),
      c("rules", "Applies sensible rules per field", 3, ["email", "format", "length", "number", "range"]),
      c("shape", "Returns a usable result", 2, ["return", "valid", "errors", "object"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you found a bug in code you had reviewed and approved. How did you handle it?", [
      c("ownership", "Shares responsibility rather than blaming the author", 3, ["i approved", "missed it", "we", "my"]),
      c("response", "Fixed it and improved the process", 3, ["fixed", "test", "checklist", "now look for"]),
      c("culture", "Handled it without blame", 2, ["no blame", "learn", "together"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Describe a time you were asked to build something you thought was a bad idea. What did you do?", [
      c("voice", "Raised the concern before building", 3, ["raised", "said", "explained", "asked"]),
      c("evidence", "Made a substantive rather than aesthetic case", 3, ["because", "risk", "cost", "data", "user"]),
      c("professionalism", "Delivered once the decision was made", 2, ["built it", "went ahead", "documented", "accepted"]),
    ]),

    // --- MID --------------------------------------------------------------
    mcq(
      "MID",
      "Your API writes to the database and then publishes an event. The process crashes between the two. What pattern prevents the inconsistency?",
      [
        "Publish the event first, then write",
        "The transactional outbox: write the event to the same database transaction, then relay it",
        "Retry the publish in a catch block",
        "Use a larger transaction timeout",
      ],
      1,
      "Only one atomic commit can span both. Writing the event into the same transaction and relaying it separately is what makes the two consistent.",
    ),
    mcq(
      "MID",
      "Which is the least effective response to database connection pool exhaustion under load?",
      [
        "Finding and fixing slow queries holding connections",
        "Raising the pool size well above what the database can serve",
        "Adding a request timeout so callers do not queue indefinitely",
        "Reducing connection hold time by moving work outside the transaction",
      ],
      1,
      "A larger pool moves the queue from your process to the database, where it is worse. The other three address the actual cause.",
    ),
    mcq(
      "MID",
      "You need to process 10,000 records without exhausting memory. Which approach is correct?",
      [
        "Load all records, then map over them",
        "Stream or page through them in batches, processing each batch before fetching the next",
        "Increase the Node heap limit",
        "Use `Promise.all` over all 10,000 promises",
      ],
      1,
      "Both loading everything and `Promise.all` over everything hold the whole set at once. Batching bounds both memory and concurrency.",
    ),
    mcq(
      "MID",
      "What does a p99 latency of 4s alongside a p50 of 40ms most likely indicate?",
      [
        "The service is uniformly slow",
        "A minority of requests hit a different path — a cold cache, a lock, or an unindexed query",
        "The measurement is wrong",
        "The network is saturated",
      ],
      1,
      "A wide gap between percentiles points to a distinct slow path rather than general slowness. Averages hide exactly this.",
    ),
    mcq(
      "MID",
      "When is it correct for an API to return 429 rather than 503?",
      [
        "When the database is down",
        "When the client has exceeded a rate limit that applies to them specifically",
        "When a deploy is in progress",
        "When the request is malformed",
      ],
      1,
      "429 says 'you, slow down'; 503 says 'we are unavailable'. Confusing them misleads client retry logic.",
    ),
    mcq(
      "MID",
      "Your JWTs are valid for 24 hours and you need to be able to revoke access immediately. What is the sound approach?",
      [
        "Shorten the expiry to one hour and accept the gap",
        "Use short-lived access tokens with a refresh token checked against server-side state",
        "Add the user id to a blocklist checked on every request",
        "Rotate the signing key whenever a user is revoked",
      ],
      1,
      "A blocklist works but reintroduces a lookup on every request, and rotating keys revokes everyone. Short access tokens plus a checkable refresh token is the standard balance.",
    ),
    mcq(
      "MID",
      "What problem does a dead-letter queue solve?",
      [
        "It speeds up message processing",
        "It isolates messages that repeatedly fail so they stop blocking or endlessly retrying",
        "It guarantees message ordering",
        "It deduplicates messages",
      ],
      1,
      "Without one, a poison message either blocks the queue or retries forever. The DLQ is also where you go to find out what actually went wrong.",
    ),
    spoken("CONCEPTUAL", "MID", "Explain the difference between at-least-once and exactly-once delivery, and what you actually do in practice.", [
      c("reality", "Knows exactly-once is largely unattainable end to end", 3, ["at least once", "not really", "hard", "impossible", "effectively"]),
      c("mitigation", "Uses idempotency to make duplicates harmless", 3, ["idempotent", "dedupe", "key", "unique", "same effect"]),
      c("tradeoff", "Understands the ordering and throughput cost", 2, ["ordering", "throughput", "cost", "partition"]),
    ]),
    spoken("CONCEPTUAL", "MID", "How do you design an API's error responses so clients can act on them programmatically?", [
      c("structure", "Uses stable machine-readable codes", 3, ["code", "stable", "machine", "enum", "type"]),
      c("detail", "Separates what the client shows from what it branches on", 3, ["message", "human", "field", "details", "branch"]),
      c("consistency", "Applies one shape across the API", 2, ["consistent", "same shape", "every endpoint", "standard"]),
    ]),
    spoken("CONCEPTUAL", "MID", "Explain what happens to in-flight requests when you deploy, and how you make deploys invisible to users.", [
      c("draining", "Describes graceful shutdown and connection draining", 3, ["drain", "sigterm", "graceful", "finish", "stop accepting"]),
      c("readiness", "Uses health and readiness signals", 3, ["health check", "readiness", "load balancer", "remove", "ready"]),
      c("rollout", "Rolls out incrementally", 2, ["rolling", "canary", "one at a time", "blue green"]),
    ]),
    spoken("CONCEPTUAL", "MID", "How do you decide what to put in a database transaction and what to keep outside it?", [
      c("scope", "Keeps transactions short and focused", 3, ["short", "minimal", "hold", "lock", "duration"]),
      c("exclusions", "Keeps network calls out of transactions", 3, ["external", "http", "email", "outside", "third party"]),
      c("correctness", "Knows what must be atomic", 2, ["atomic", "together", "consistent", "both"]),
    ]),
    typed("SCENARIO", "MID", "A customer reports that their webhook receives some events twice and occasionally out of order. Write your explanation to them and what you would change.", [
      c("explanation", "Explains at-least-once honestly", 3, ["at least once", "retry", "duplicate", "not guaranteed", "network"]),
      c("client-side", "Tells them how to consume safely", 3, ["idempotency", "event id", "dedupe", "timestamp", "sequence"]),
      c("improvement", "Improves the delivery side too", 2, ["ordering", "signature", "id", "delivery log", "replay"]),
    ]),
    typed("SCENARIO", "MID", "Memory on your service grows steadily and it restarts every two days. Write your plan to find the cause.", [
      c("evidence", "Captures heap evidence rather than guessing", 3, ["heap snapshot", "profile", "compare", "growth", "memory"]),
      c("suspects", "Names plausible retention causes", 3, ["listener", "cache", "closure", "global", "unbounded", "map"]),
      c("interim", "Keeps the service up while investigating", 2, ["restart", "alert", "limit", "monitor"]),
    ]),
    typed("SCENARIO", "MID", "Your team wants to move from a monolith to services. Write what you would extract first and how you would decide.", [
      c("criteria", "Chooses by coupling and change rate", 3, ["boundary", "coupling", "changes often", "independent", "data"]),
      c("caution", "Avoids splitting on shared data", 3, ["shared database", "data ownership", "distributed monolith", "chatty"]),
      c("proof", "Treats the first extraction as a learning exercise", 2, ["first", "learn", "small", "low risk", "prove"]),
    ]),
    typed("SCENARIO", "MID", "An endpoint that was fine for a year has started timing out, with no code change. Write your hypotheses and how you would test each.", [
      c("data-growth", "Considers data volume crossing a threshold", 3, ["data grew", "table size", "index", "plan changed", "rows"]),
      c("external", "Considers dependencies and load changes", 3, ["traffic", "downstream", "third party", "neighbour", "load"]),
      c("method", "Tests hypotheses with evidence", 2, ["explain", "metrics", "compare", "history", "confirm"]),
    ]),
    typed("CODING", "MID", "Write a function that processes an array of jobs with a maximum of 5 running concurrently, returning results in the original order and not stopping on a single failure.", [
      c("concurrency", "Bounds concurrency correctly", 3, ["limit", "5", "pool", "worker", "semaphore"]),
      c("ordering", "Preserves input order in the output", 3, ["index", "order", "position", "settled"]),
      c("resilience", "Captures failures rather than aborting", 2, ["allsettled", "catch", "error", "continue"]),
    ]),
    typed("CODING", "MID", "Write an endpoint that accepts a file upload, validates type and size, stores it, and returns a URL. State what you check and why.", [
      c("validation", "Validates content rather than trusting the client", 3, ["magic bytes", "mime", "size", "extension", "not trust"]),
      c("storage", "Stores outside the web root with a safe name", 3, ["random name", "not user filename", "path traversal", "bucket"]),
      c("limits", "Bounds resource use", 2, ["max size", "stream", "timeout", "limit"]),
    ]),
    typed("CODING", "MID", "Write a graceful shutdown handler: stop accepting new requests, finish in-flight ones, close the database pool, and exit with a timeout backstop.", [
      c("sequence", "Orders the steps correctly", 3, ["stop accepting", "close server", "in-flight", "then", "pool"]),
      c("signals", "Handles the right signals", 2, ["sigterm", "sigint", "process.on"]),
      c("backstop", "Forces exit if draining stalls", 3, ["timeout", "force", "exit", "settimeout", "backstop"]),
    ]),
    typed("CODING", "MID", "Write a query and endpoint that returns each customer with their three most recent orders, without issuing one query per customer.", [
      c("single-query", "Avoids the per-row query pattern", 3, ["join", "lateral", "window", "in (", "single query", "batch"]),
      c("limiting", "Limits to three per customer correctly", 3, ["row_number", "partition", "limit 3", "rank", "top"]),
      c("shape", "Assembles the nested response", 2, ["group", "map", "nest", "reduce"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Tell me about a time you were on call and something broke that you did not build. How did you handle it?", [
      c("method", "Navigated unfamiliar code under pressure", 3, ["logs", "dashboard", "runbook", "traced", "narrowed"]),
      c("escalation", "Knew when to bring others in", 3, ["escalated", "called", "asked", "woke"]),
      c("followup", "Improved the situation afterwards", 2, ["runbook", "documented", "alert", "handover"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Describe the most difficult code review you have given. What made it difficult?", [
      c("substance", "Had a genuine, significant concern", 3, ["design", "security", "risk", "fundamental", "approach"]),
      c("delivery", "Delivered it constructively", 3, ["conversation", "in person", "suggested", "explained", "not just comments"]),
      c("outcome", "Reached a resolution", 2, ["agreed", "changed", "compromise", "outcome"]),
    ]),

    // --- SENIOR -----------------------------------------------------------
    mcq(
      "SENIOR",
      "Your service must call three downstream services to build a response. Which failure strategy is generally soundest?",
      [
        "Fail the whole request if any downstream fails",
        "Set per-call timeouts and degrade gracefully where a downstream is non-essential",
        "Retry each until it succeeds",
        "Call them sequentially to reduce load",
      ],
      1,
      "Coupling your availability to the product of three others is how a service becomes fragile. Timeouts plus partial responses keep the core path alive.",
    ),
    mcq(
      "SENIOR",
      "What is the primary risk of retries without jitter across many clients?",
      [
        "Slower recovery for individual clients",
        "Synchronised retry waves that repeatedly overwhelm a recovering service",
        "Duplicate requests",
        "Increased memory use",
      ],
      1,
      "Every client backs off by the same amount and returns at the same instant. Randomised jitter is what spreads the load and lets the service actually recover.",
    ),
    mcq(
      "SENIOR",
      "You are sharding a database by customer id. What is the hardest problem this creates?",
      [
        "Slower single-row lookups",
        "Queries and transactions that need to span shards, and rebalancing when a shard grows hot",
        "Increased storage cost",
        "Loss of indexing",
      ],
      1,
      "Cross-shard joins and transactions lose the guarantees you relied on, and a hot shard cannot be fixed by adding hardware to the others.",
    ),
    spoken("CONCEPTUAL", "SENIOR", "How would you design an authorisation system for a product with organisations, teams, roles and per-resource sharing?", [
      c("model", "Chooses a coherent model", 3, ["rbac", "abac", "relationship", "policy", "role", "permission"]),
      c("evaluation", "Considers where checks happen and their cost", 3, ["every request", "cache", "latency", "centralised", "middleware"]),
      c("auditability", "Can answer 'who can see this'", 2, ["audit", "explain", "why", "list", "trace"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "Explain how you would approach capacity planning for a service facing a known traffic event.", [
      c("baseline", "Starts from measured current capacity", 3, ["load test", "current", "measure", "headroom", "baseline"]),
      c("bottleneck", "Identifies the binding constraint", 3, ["database", "connections", "cpu", "bottleneck", "limit"]),
      c("contingency", "Plans degradation, not just scaling", 2, ["shed", "queue", "degrade", "feature flag", "fallback"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "What is your approach to schema design when requirements are still changing weekly?", [
      c("stability", "Identifies what is genuinely stable", 3, ["core", "stable", "entity", "invariant", "unlikely to change"]),
      c("flexibility", "Uses controlled flexibility rather than a free-for-all", 3, ["jsonb", "additive", "nullable", "migration", "constrained"]),
      c("discipline", "Avoids schemas that cannot be queried", 2, ["query", "index", "not everything json", "structure"]),
    ]),
    typed("SCENARIO", "SENIOR", "Your service's database is at 85% CPU at peak and the business expects to triple traffic in six months. Write your plan.", [
      c("analysis", "Finds what is consuming CPU before scaling", 3, ["slow query", "top queries", "explain", "index", "profile"]),
      c("layers", "Considers caching and read paths before sharding", 3, ["cache", "read replica", "denormalise", "before shard"]),
      c("sequence", "Sequences by cost and reversibility", 2, ["cheapest first", "reversible", "phase", "buy time"]),
    ]),
    typed("SCENARIO", "SENIOR", "A postmortem finds the same root cause as one from eight months ago. Write how you would respond, beyond fixing the bug again.", [
      c("systemic", "Asks why the first fix did not hold", 3, ["why", "did not hold", "action item", "not done", "systemic"]),
      c("process", "Fixes the follow-through mechanism", 3, ["tracked", "owner", "prioritised", "verify", "closed"]),
      c("culture", "Avoids blaming individuals", 2, ["blameless", "system", "not person"]),
    ]),
    typed("SCENARIO", "SENIOR", "You must migrate a live table of 400 million rows to a new schema with no downtime. Write the plan.", [
      c("strategy", "Uses dual-write or backfill with a cutover", 3, ["dual write", "backfill", "shadow", "batch", "cutover"]),
      c("verification", "Verifies correctness before switching", 3, ["compare", "checksum", "sample", "verify", "reconcile"]),
      c("rollback", "Can retreat at each step", 2, ["rollback", "reversible", "keep old", "feature flag"]),
    ]),
    typed("CODING", "SENIOR", "Write a distributed lock using your datastore of choice: acquisition with expiry, safe release by the owner only, and behaviour when the holder dies. State the failure modes you accept.", [
      c("ownership", "Releases only if still the owner", 3, ["token", "owner", "compare", "lua", "conditional"]),
      c("expiry", "Handles the holder dying", 3, ["ttl", "expiry", "timeout", "lease", "renew"]),
      c("honesty", "States the guarantees it does not provide", 3, ["not safe", "clock", "gc pause", "fencing", "assumption"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about a time you inherited a service nobody wanted to own. How did you approach it?", [
      c("assessment", "Understood it before changing it", 3, ["read", "mapped", "traced", "documented", "understood"]),
      c("stabilisation", "Made it operable first", 3, ["monitoring", "alert", "runbook", "stabilise", "tests"]),
      c("outcome", "Left it in a better state", 2, ["handover", "team", "reliable", "improved"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Describe a time your technical judgement was overruled and the outcome proved you right. How did you handle it at the time and afterwards?", [
      c("conduct", "Committed to the decision despite disagreeing", 3, ["disagree and commit", "supported", "went along", "did my best"]),
      c("preparation", "Left a record and mitigations", 3, ["documented", "wrote down", "monitoring", "prepared", "flagged"]),
      c("grace", "Handled being right without gloating", 2, ["did not", "moved on", "helped fix", "no i told you"]),
    ]),

    // --- STAFF ------------------------------------------------------------
    mcq(
      "STAFF",
      "Which is the most reliable indicator that a service boundary was drawn in the wrong place?",
      [
        "The service has fewer than 1,000 lines of code",
        "Most changes to it require a coordinated change in another service",
        "It has its own database",
        "It is written in a different language",
      ],
      1,
      "A boundary exists to let one thing change without the other. If changes always come in pairs, the boundary is cutting across the real seam.",
    ),
    mcq(
      "STAFF",
      "Your organisation has 30 services and no consistent approach to authentication between them. What should be addressed first?",
      [
        "Rewriting the oldest services",
        "Establishing one mechanism with a paved-road library, then migrating by risk",
        "Requiring every team to design their own to fit their needs",
        "Putting an API gateway in front and considering it solved",
      ],
      1,
      "One mechanism plus a library people want to use is what actually converges an estate. A gateway alone leaves service-to-service calls unaddressed.",
    ),
    mcq(
      "STAFF",
      "What is the most honest reason to adopt an event-streaming platform organisation-wide?",
      [
        "It is the industry standard",
        "Multiple consumers genuinely need the same events and point-to-point integration has become unmanageable",
        "It improves latency",
        "It removes the need for databases",
      ],
      1,
      "The justification is integration topology, not speed. Adopted without that pressure, it adds significant operational burden for little return.",
    ),
    spoken("CONCEPTUAL", "STAFF", "How do you think about the trade-off between platform standardisation and team autonomy?", [
      c("nuance", "Rejects a blanket answer", 3, ["depends", "some things", "not everything", "balance"]),
      c("criteria", "Has criteria for what must be standard", 3, ["security", "observability", "deploy", "interop", "on-call"]),
      c("mechanism", "Uses paved roads over mandates", 2, ["paved road", "easier", "default", "opt out", "support"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How would you establish reliability targets for a product that has never had them?", [
      c("user-first", "Derives targets from user experience", 3, ["user", "journey", "critical", "what matters", "symptom"]),
      c("realism", "Sets targets from measured reality, not aspiration", 3, ["current", "measure", "baseline", "achievable", "data"]),
      c("consequence", "Ties targets to actual decisions", 2, ["error budget", "freeze", "prioritise", "consequence"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "What is your view on build versus buy for infrastructure such as queues, search and authentication?", [
      c("default", "Defaults to buying non-differentiating infrastructure", 3, ["buy", "managed", "not our business", "differentiator"]),
      c("exceptions", "Knows when building is justified", 3, ["scale", "cost", "specific", "when", "exception"]),
      c("hidden-cost", "Counts operational cost honestly", 2, ["on-call", "upgrade", "expertise", "hidden", "total cost"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How do you approach making a system understandable to engineers who did not build it?", [
      c("artefacts", "Names concrete artefacts that help", 3, ["diagram", "adr", "runbook", "readme", "onboarding"]),
      c("code", "Makes the code itself legible", 3, ["naming", "structure", "boundaries", "obvious", "conventional"]),
      c("verification", "Tests understanding rather than assuming it", 2, ["new joiner", "asked", "feedback", "onboarding time"]),
    ]),
    typed("SCENARIO", "STAFF", "The business wants to expose a public API for third-party developers. Write what has to exist before launch that does not exist for an internal API.", [
      c("contract", "Treats the contract as permanent", 3, ["versioning", "cannot break", "deprecation", "stability", "forever"]),
      c("operations", "Adds the operational surface", 3, ["rate limit", "keys", "quota", "abuse", "status page", "docs"]),
      c("support", "Plans the human side", 2, ["support", "sdk", "sandbox", "changelog", "developer"]),
    ]),
    typed("SCENARIO", "STAFF", "An outage lasted four hours because the only person who understood the system was unreachable. Write your response as the engineering leader.", [
      c("immediate", "Addresses the single point of failure", 3, ["bus factor", "documentation", "runbook", "second person", "pairing"]),
      c("systemic", "Looks for other instances of the same risk", 3, ["audit", "elsewhere", "which systems", "map", "other"]),
      c("humane", "Avoids blaming the absent person", 2, ["not their fault", "system", "we allowed"]),
    ]),
    typed("SCENARIO", "STAFF", "Cloud spend has doubled in a year while traffic grew 20%. You have been asked to fix it without harming reliability. Write your approach.", [
      c("attribution", "Establishes where the money goes first", 3, ["tag", "attribute", "breakdown", "per service", "measure"]),
      c("targets", "Goes after the largest, safest wins", 3, ["biggest", "idle", "over-provisioned", "storage", "egress", "retention"]),
      c("guardrails", "Prevents reliability regressions", 2, ["headroom", "load test", "gradual", "monitor", "not below"]),
    ]),
    typed("SCENARIO", "STAFF", "Two senior engineers have irreconcilable views on the data architecture and the team is stalled. Write how you would resolve it.", [
      c("clarification", "Separates facts from preferences", 3, ["assumptions", "criteria", "what do we know", "disagree about"]),
      c("resolution", "Uses evidence or a bounded experiment", 3, ["prototype", "spike", "data", "test", "timebox"]),
      c("decisiveness", "Makes a call when evidence runs out", 3, ["decide", "my call", "move on", "commit", "record"]),
    ]),
    typed("SCENARIO", "STAFF", "You discover a service has been logging full customer records for two years. Write your response plan.", [
      c("containment", "Stops the bleeding immediately", 3, ["stop", "disable", "redact", "first"]),
      c("obligation", "Recognises legal and disclosure duties", 3, ["gdpr", "regulator", "notify", "legal", "breach", "dpo"]),
      c("remediation", "Deals with the two years already stored", 3, ["purge", "retention", "backups", "who accessed", "audit"]),
    ]),
    typed("CODING", "STAFF", "Sketch the interface and delivery guarantees for an internal event bus used by 20 teams: schema evolution, replay, and consumer isolation. Justify the guarantees you choose.", [
      c("schema", "Handles schema evolution explicitly", 3, ["schema", "registry", "compatible", "version", "additive"]),
      c("guarantees", "States delivery and ordering guarantees plainly", 3, ["at least once", "ordering", "partition", "guarantee", "not"]),
      c("isolation", "Prevents one consumer harming others", 2, ["isolation", "lag", "independent", "dlq", "backpressure"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Tell me about a time you had to deliver bad technical news to executives. How did you approach it?", [
      c("clarity", "Was direct rather than hedging", 3, ["direct", "clear", "told them", "did not hide", "early"]),
      c("framing", "Framed it in business terms with options", 3, ["impact", "options", "cost", "timeline", "recommend"]),
      c("ownership", "Took responsibility where due", 2, ["we", "i", "own", "responsible"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Describe how you have changed an engineering culture, not just an architecture. What actually moved?", [
      c("specificity", "Names a concrete cultural change", 3, ["review", "on-call", "postmortem", "testing", "blameless", "ownership"]),
      c("mechanism", "Used incentives and defaults, not speeches", 3, ["default", "made it easy", "incentive", "modelled", "hired"]),
      c("evidence", "Can show it stuck", 2, ["still", "after i left", "measure", "sustained"]),
    ]),
  ],
};
