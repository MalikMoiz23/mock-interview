import type { BankDomain } from "../question-bank";
import { c, mcq, spoken, typed } from "./authoring";

/**
 * Backend — Python — depth tranche.
 *
 * Python-specific traps carry most of the beginner and junior weight, because
 * they are where self-taught candidates most often have confident but wrong
 * mental models. Senior and staff shift to service design, where the language
 * matters less than the judgement.
 */
export const BACKEND_PYTHON_DEPTH: BankDomain = {
  slug: "backend-python",
  name: "Backend — Python",
  blurb: "Builds services and data-handling code in Python.",
  questions: [
    // --- BEGINNER ---------------------------------------------------------
    mcq(
      "BEGINNER",
      "What does `dict.get('key')` do that `dict['key']` does not?",
      [
        "It searches case-insensitively",
        "It returns None instead of raising KeyError when the key is absent",
        "It is faster",
        "It removes the key after reading",
      ],
      1,
      "`get` also takes a default. Reaching for it everywhere hides genuine bugs, so use it where absence is expected, not to silence errors.",
    ),
    mcq(
      "BEGINNER",
      "What is the result of `'5' + 5` in Python?",
      [
        "10",
        "A TypeError, because str and int cannot be added",
        "'55'",
        "None",
      ],
      1,
      "Python refuses to guess. Unlike JavaScript it will not coerce silently, which is why this class of bug surfaces immediately rather than deep in a calculation.",
    ),
    mcq(
      "BEGINNER",
      "Why does `for i in range(len(items))` usually indicate a code smell?",
      [
        "range is slow",
        "Iterating the items directly, or with enumerate when the index is needed, is clearer and less error-prone",
        "It does not work with lists",
        "It skips the last element",
      ],
      1,
      "Index arithmetic is where off-by-one errors live. `for item in items` and `for i, item in enumerate(items)` say what you mean.",
    ),
    mcq(
      "BEGINNER",
      "What does `requirements.txt` (or a lock file) give a project?",
      [
        "Faster installation",
        "A record of which dependencies and versions the project needs, so another machine can reproduce the environment",
        "Automatic security patching",
        "Smaller package sizes",
      ],
      1,
      "Reproducibility is the point. Without pinned versions, 'works on my machine' becomes a genuine and unfixable statement.",
    ),
    mcq(
      "BEGINNER",
      "A function modifies a list passed into it and the caller sees the change. Why?",
      [
        "Python copies lists on assignment",
        "The list is passed by reference, so both names refer to the same object",
        "Lists are global by default",
        "The function returned the list",
      ],
      1,
      "Names bind to objects. Mutating in place is visible to every holder of that object; rebinding the local name is not.",
    ),
    mcq(
      "BEGINNER",
      "What does `f\"{name}\"` do?",
      [
        "Escapes the value for HTML",
        "Formats the value of `name` into the string at runtime",
        "Marks the string as a file path",
        "Makes the string immutable",
      ],
      1,
      "It is interpolation, not escaping. Putting untrusted values into SQL or HTML this way is exactly how injection bugs happen.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "What is a package or module in Python, and why not put all your code in one file?", [
      c("purpose", "Explains organisation and reuse", 3, ["organise", "reuse", "import", "separate", "structure"]),
      c("scale", "Relates it to working on something larger", 2, ["large", "team", "find", "navigate", "maintain"]),
      c("mechanics", "Knows how importing works", 2, ["import", "from", "module", "path"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What is the difference between an error you should catch and one you should let crash the program?", [
      c("expected", "Catches conditions that are expected and recoverable", 3, ["expected", "file missing", "network", "user input", "recover"]),
      c("bugs", "Lets programming errors surface", 3, ["bug", "should not happen", "crash", "fix", "hide"]),
      c("consequence", "Understands the cost of swallowing errors", 2, ["silent", "hidden", "worse", "later"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "Explain what a virtual environment is and what problem it solves on a machine with several projects.", [
      c("isolation", "Explains per-project dependency isolation", 3, ["isolate", "per project", "separate", "conflict", "version"]),
      c("problem", "Names the conflict it avoids", 3, ["two projects", "different version", "global", "break"]),
      c("practice", "Knows how it is used day to day", 2, ["activate", "venv", "install", "requirements"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A script that reads a file works on your machine and fails on a colleague's with a path error. Write what you would check and how you would make it portable.", [
      c("cause", "Identifies absolute or platform-specific paths", 3, ["absolute", "hardcoded", "backslash", "separator", "c:"]),
      c("fix", "Uses a portable path approach", 3, ["pathlib", "os.path", "join", "relative", "__file__"]),
      c("verification", "Checks it actually works elsewhere", 2, ["test", "ask them", "ci", "confirm"]),
    ]),
    typed("SCENARIO", "BEGINNER", "You are asked to write a script that will run every night unattended. Write what you would add that you would not bother with for a one-off script.", [
      c("observability", "Adds logging so failures are visible", 3, ["log", "logging", "output", "record", "timestamp"]),
      c("failure", "Handles and reports errors rather than dying silently", 3, ["exception", "exit code", "alert", "notify", "retry"]),
      c("safety", "Makes reruns safe", 2, ["idempotent", "rerun", "duplicate", "resume"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A function you wrote returns the wrong result for one specific input but you cannot see why. Write your debugging approach.", [
      c("isolation", "Reduces to the smallest failing case", 3, ["minimal", "smallest", "isolate", "reproduce", "just that input"]),
      c("inspection", "Inspects intermediate state", 3, ["print", "debugger", "breakpoint", "step", "log"]),
      c("hypothesis", "Forms and tests a specific hypothesis", 2, ["expected", "actual", "assume", "check"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a Python project you abandoned. Why did you stop, and would you do it differently?", [
      c("honesty", "Gives a real reason", 3, ["too big", "stuck", "lost interest", "hard"]),
      c("reflection", "Understands what went wrong", 3, ["scope", "should have", "smaller", "planned"]),
      c("growth", "Would approach it differently now", 2, ["now", "would", "next time"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Describe a time you helped someone else with their code. What did you do beyond giving them the answer?", [
      c("teaching", "Explained rather than solved for them", 3, ["explained", "showed", "why", "walked through", "understand"]),
      c("patience", "Met them where they were", 2, ["their level", "asked", "listened"]),
      c("outcome", "They could do it themselves afterwards", 2, ["they", "on their own", "learned"]),
    ]),

    // --- JUNIOR -----------------------------------------------------------
    mcq(
      "JUNIOR",
      "What does a Python generator give you over returning a list?",
      [
        "Faster iteration",
        "Values produced one at a time, so memory does not grow with the number of items",
        "Automatic sorting",
        "Thread safety",
      ],
      1,
      "It is lazy. That is what lets you iterate a ten-million-row file in constant memory, at the cost of being able to iterate it only once.",
    ),
    mcq(
      "JUNIOR",
      "Why is `assert` unsuitable for validating user input in production?",
      [
        "It is slower than an if statement",
        "Assertions can be disabled with the -O flag, removing the check entirely",
        "It cannot raise custom messages",
        "It only works in tests",
      ],
      1,
      "An assertion documents an invariant you believe holds. Validation must raise a real exception that cannot be optimised away.",
    ),
    mcq(
      "JUNIOR",
      "Your Django queryset triggers a database query inside a template loop. What is the fix?",
      [
        "Add caching to the template",
        "Use select_related or prefetch_related so the related rows are fetched in one or two queries",
        "Convert the queryset to a list",
        "Increase the connection pool",
      ],
      1,
      "This is N+1 in Django's clothing. `select_related` joins for forward relations, `prefetch_related` batches for reverse and many-to-many.",
    ),
    mcq(
      "JUNIOR",
      "What does `@staticmethod` change compared with a plain method?",
      [
        "It makes the method faster",
        "It receives neither the instance nor the class, so it is a plain function namespaced on the class",
        "It can only be called on the class, not an instance",
        "It caches the result",
      ],
      1,
      "It signals no dependence on instance or class state. `@classmethod` receives the class, which is what alternative constructors use.",
    ),
    mcq(
      "JUNIOR",
      "You need to compare two floating point results for equality. What should you do?",
      [
        "Use ==, floats are exact in Python",
        "Compare within a tolerance, using math.isclose or an explicit epsilon",
        "Round both to integers",
        "Convert to strings and compare",
      ],
      1,
      "Binary floating point cannot represent 0.1 exactly. For money, the right answer is usually Decimal or integer minor units rather than a tolerance at all.",
    ),
    mcq(
      "JUNIOR",
      "What is the practical difference between `list.sort()` and `sorted(list)`?",
      [
        "sorted is faster",
        "sort mutates the list in place and returns None; sorted returns a new sorted list",
        "sort cannot take a key function",
        "sorted only works on numbers",
      ],
      1,
      "Assigning the result of `.sort()` is a common bug — the variable becomes None. In-place mutation is also visible to every other holder of that list.",
    ),
    spoken("CONCEPTUAL", "JUNIOR", "Explain what happens when Python raises an exception inside a `with` block. What does the context manager guarantee?", [
      c("guarantee", "Knows cleanup runs regardless", 3, ["closed", "cleanup", "exit", "still runs", "guaranteed"]),
      c("mechanism", "Understands __enter__ and __exit__", 2, ["__enter__", "__exit__", "protocol", "dunder"]),
      c("propagation", "Knows the exception still propagates unless suppressed", 2, ["propagate", "re-raise", "suppress", "return true"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What is the difference between a shallow and a deep copy, and when has it mattered to you?", [
      c("distinction", "Explains nested objects being shared", 3, ["nested", "shared", "reference", "inner", "same object"]),
      c("consequence", "Names a bug it causes", 3, ["mutated", "unexpected", "both changed", "surprise"]),
      c("practice", "Knows how to do each", 2, ["copy", "deepcopy", "slice", "dict()"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "Explain what type hints give you in Python given they are not enforced at runtime.", [
      c("static", "Explains checking before running", 3, ["mypy", "static", "before", "catch", "checker"]),
      c("tooling", "Mentions editors and readability", 2, ["editor", "autocomplete", "documentation", "readable"]),
      c("limits", "Knows they are not validation", 3, ["not enforced", "runtime", "pydantic", "still validate", "erased"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A colleague's pull request wraps every function body in `try: ... except Exception: pass`. Write your review comment.", [
      c("problem", "Explains that failures become invisible", 3, ["silent", "hidden", "swallow", "never know", "debug"]),
      c("specificity", "Argues for catching specific, expected exceptions", 3, ["specific", "expected", "which exception", "narrow"]),
      c("tone", "Is constructive rather than dismissive", 2, ["suggest", "instead", "understand why", "happy to"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A data-processing script consumes 8GB of RAM on a 2GB file. Write what you suspect and how you would restructure it.", [
      c("cause", "Identifies loading everything and object overhead", 3, ["read()", "readlines", "all at once", "list", "overhead"]),
      c("restructure", "Moves to streaming or chunked processing", 3, ["generator", "iterate", "chunk", "line by line", "yield"]),
      c("measure", "Confirms with a measurement", 2, ["memory_profiler", "measure", "before after", "tracemalloc"]),
    ]),
    typed("SCENARIO", "JUNIOR", "You are asked to add a feature to a 2,000-line module with no tests. Write your approach before writing the feature.", [
      c("safety", "Adds characterisation tests around current behaviour", 3, ["test first", "characterisation", "current behaviour", "pin"]),
      c("understanding", "Builds understanding of the affected path", 3, ["read", "trace", "debugger", "which part"]),
      c("scope", "Keeps the change contained", 2, ["small", "not refactor", "separate", "focused"]),
    ]),
    typed("CODING", "JUNIOR", "Write a function that reads a large CSV and returns the total per category, without loading the whole file into memory. State your assumptions about the file.", [
      c("streaming", "Iterates rather than loading all rows", 3, ["csv.reader", "for row", "iterate", "generator", "not readlines"]),
      c("aggregation", "Accumulates correctly", 3, ["defaultdict", "dict", "+=", "get", "accumulate"]),
      c("robustness", "Handles malformed or missing values", 2, ["try", "skip", "missing", "invalid", "assume"]),
    ]),
    typed("CODING", "JUNIOR", "Write a retry decorator that retries a function on a specified exception type, with a delay between attempts and a maximum count.", [
      c("decorator", "Wraps correctly and preserves metadata", 3, ["functools.wraps", "wrapper", "*args", "**kwargs"]),
      c("selectivity", "Retries only the specified exceptions", 3, ["except", "exception type", "parameter", "raise"]),
      c("bounds", "Stops and re-raises after the maximum", 2, ["attempts", "range", "raise", "last"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you chose a library and later regretted it. What would you check next time?", [
      c("decision", "Explains the original reasoning", 2, ["chose", "because", "quick", "popular"]),
      c("problem", "Names what went wrong concretely", 3, ["unmaintained", "bug", "slow", "heavy", "abandoned"]),
      c("criteria", "Has better criteria now", 3, ["now check", "maintained", "issues", "alternatives", "size"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Describe a time you had to work to a coding standard you disagreed with. How did you handle it?", [
      c("compliance", "Followed it while raising the concern", 3, ["followed", "raised", "discussed", "team"]),
      c("perspective", "Understood the reason behind it", 2, ["consistency", "reason", "understood", "why"]),
      c("maturity", "Did not quietly ignore it", 2, ["did not", "consistent", "team over"]),
    ]),

    // --- MID --------------------------------------------------------------
    mcq(
      "MID",
      "Your FastAPI endpoint is declared `async def` but calls a synchronous database driver. What happens under load?",
      [
        "The driver is run in a thread pool automatically",
        "The blocking call stalls the event loop, so all concurrent requests slow down",
        "FastAPI raises an error",
        "Only that request is slow",
      ],
      1,
      "Blocking inside a coroutine blocks the loop. Either use an async driver, or declare the endpoint `def` so the framework runs it in a thread pool.",
    ),
    mcq(
      "MID",
      "Which statement about the GIL is accurate for a typical web service?",
      [
        "It prevents any concurrency in Python",
        "It limits CPU-bound parallelism within one process, but I/O-bound work still overlaps",
        "It applies only to threads created with the threading module",
        "It was removed in Python 3",
      ],
      1,
      "The GIL is released around I/O. That is why threads help an I/O-bound service and why CPU-bound work needs processes instead.",
    ),
    mcq(
      "MID",
      "You need to run a Django management command that updates 10 million rows. What is the safest approach?",
      [
        "One `update()` over the full queryset",
        "Batched updates with a bounded transaction per batch and progress that survives a restart",
        "Loop over objects and call save() on each",
        "Raise the database statement timeout",
      ],
      1,
      "A single statement holds locks for the duration; per-object save is N queries. Batching bounds both lock time and the cost of a failure.",
    ),
    mcq(
      "MID",
      "What does `functools.lru_cache` on a method taking `self` risk?",
      [
        "Nothing, it is a standard pattern",
        "It keeps instances alive in the cache, leaking memory for long-lived processes",
        "It disables the method for subclasses",
        "It makes the method synchronous",
      ],
      1,
      "The cache holds a reference to `self` as part of the key, so instances are never collected. `cached_property` or a per-instance cache avoids it.",
    ),
    mcq(
      "MID",
      "Your Celery worker processes a task twice after a broker reconnect. What must be true of the task?",
      [
        "It must be faster",
        "It must be idempotent, because acknowledgement is not guaranteed exactly once",
        "It must run in a transaction",
        "It must have a longer timeout",
      ],
      1,
      "Message brokers give at-least-once delivery in the general case. Designing the task so a repeat is harmless is more robust than trying to eliminate duplicates.",
    ),
    mcq(
      "MID",
      "Which is the strongest reason to use Pydantic at an API boundary rather than plain dataclasses?",
      [
        "Dataclasses are deprecated",
        "Pydantic validates and coerces untrusted input at runtime; dataclasses do not check anything",
        "Pydantic is faster",
        "Dataclasses cannot be nested",
      ],
      1,
      "A dataclass type hint is documentation. At a trust boundary you need something that actually rejects a string where an integer was promised.",
    ),
    mcq(
      "MID",
      "A test passes alone and fails in the suite. What is the most likely cause?",
      [
        "The test framework is faulty",
        "Shared state between tests — a module-level variable, database row, or unreset mock",
        "The test is too slow",
        "Insufficient assertions",
      ],
      1,
      "Order-dependent failures almost always mean leaked state. Randomising test order surfaces these rather than hiding them.",
    ),
    spoken("CONCEPTUAL", "MID", "Explain how you structure a Python service so business logic can be tested without a database or network.", [
      c("separation", "Separates logic from I/O", 3, ["pure", "separate", "boundary", "adapter", "layer"]),
      c("injection", "Passes dependencies rather than importing them", 3, ["inject", "parameter", "protocol", "interface", "pass in"]),
      c("payoff", "Explains the testing benefit concretely", 2, ["fast", "no database", "unit", "in memory"]),
    ]),
    spoken("CONCEPTUAL", "MID", "What is the difference between concurrency and parallelism in Python, and which tool would you reach for in each case?", [
      c("distinction", "Distinguishes overlapping from simultaneous", 3, ["overlap", "same time", "interleave", "cores"]),
      c("tools", "Maps tools to problems correctly", 3, ["asyncio", "threading", "multiprocessing", "io bound", "cpu bound"]),
      c("gil", "Relates it to the GIL accurately", 2, ["gil", "released", "processes", "bypass"]),
    ]),
    spoken("CONCEPTUAL", "MID", "How do you decide what to log, at what level, in a Python service?", [
      c("levels", "Uses levels with intent", 3, ["debug", "info", "warning", "error", "level"]),
      c("content", "Includes actionable context", 3, ["context", "id", "structured", "correlation", "what happened"]),
      c("discipline", "Avoids logging secrets and noise", 2, ["pii", "secret", "noise", "redact", "not every"]),
    ]),
    spoken("CONCEPTUAL", "MID", "Explain what happens during a Django or SQLAlchemy migration on a table that is being written to concurrently.", [
      c("locking", "Understands lock acquisition and queuing", 3, ["lock", "queue", "block", "wait", "exclusive"]),
      c("danger", "Knows which operations are dangerous", 3, ["add column with default", "index", "rewrite", "not null", "long"]),
      c("mitigation", "Names safe alternatives", 2, ["concurrently", "nullable first", "batch", "lock timeout"]),
    ]),
    typed("SCENARIO", "MID", "A Python service uses 2GB of memory at start and 6GB after a day. Write your plan to find and fix the cause.", [
      c("evidence", "Collects heap evidence rather than guessing", 3, ["tracemalloc", "objgraph", "snapshot", "compare", "profile"]),
      c("suspects", "Names plausible retention causes", 3, ["cache", "unbounded", "global", "lru_cache", "list grows", "reference"]),
      c("containment", "Keeps the service healthy meanwhile", 2, ["restart", "limit", "alert", "monitor"]),
    ]),
    typed("SCENARIO", "MID", "Your team's test suite takes 40 minutes because every test hits a real database. Write how you would restructure it.", [
      c("layering", "Separates fast unit tests from integration tests", 3, ["unit", "integration", "split", "layer", "few"]),
      c("technique", "Uses transactions, fixtures or fakes appropriately", 3, ["transaction rollback", "fixture", "fake", "in memory", "factory"]),
      c("balance", "Keeps genuine database coverage", 2, ["still test", "some", "critical", "real database"]),
    ]),
    typed("SCENARIO", "MID", "A scheduled job silently produced no output for three weeks and nobody noticed. Write what you would put in place.", [
      c("detection", "Alerts on absence, not only on failure", 3, ["dead man", "heartbeat", "expected", "no output", "absence"]),
      c("ownership", "Gives the alert a destination and owner", 3, ["owner", "on-call", "channel", "who"]),
      c("verification", "Checks the alert actually fires", 2, ["test the alert", "verify", "simulate"]),
    ]),
    typed("CODING", "MID", "Write an async function that fetches a list of URLs with bounded concurrency, a per-request timeout, and returns results paired with their URL including failures.", [
      c("bounding", "Bounds concurrency with a semaphore", 3, ["semaphore", "limit", "async with", "gather"]),
      c("timeout", "Applies a per-request timeout", 3, ["timeout", "wait_for", "asyncio", "client timeout"]),
      c("results", "Pairs outcomes with inputs including errors", 2, ["return_exceptions", "tuple", "url", "error"]),
    ]),
    typed("CODING", "MID", "Write a context manager that acquires a database advisory lock, releases it reliably, and raises a clear error if the lock cannot be taken within a timeout.", [
      c("protocol", "Implements the context manager correctly", 3, ["contextmanager", "__enter__", "__exit__", "yield", "try finally"]),
      c("release", "Releases even when the body raises", 3, ["finally", "always", "release", "exception"]),
      c("timeout", "Fails clearly rather than hanging", 2, ["timeout", "raise", "could not acquire", "clear"]),
    ]),
    typed("CODING", "MID", "Write a function that safely deserialises untrusted JSON into a typed settings object, rejecting unknown fields and reporting every problem at once.", [
      c("validation", "Validates types and required fields", 3, ["pydantic", "validate", "type", "required", "schema"]),
      c("strictness", "Rejects unexpected fields deliberately", 3, ["extra", "forbid", "unknown", "reject"]),
      c("errors", "Reports all errors together", 2, ["all errors", "collect", "list", "validationerror"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Tell me about a time a Python dependency upgrade broke production. What did you change about how you upgrade?", [
      c("incident", "Describes the failure honestly", 3, ["broke", "production", "incident", "what happened"]),
      c("cause", "Identifies why it was not caught", 3, ["no test", "not pinned", "transitive", "staging", "did not read"]),
      c("process", "Changed the process afterwards", 2, ["pin", "lock", "changelog", "staging", "canary"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Describe a time you had to optimise Python code. How did you decide what to optimise?", [
      c("measurement", "Profiled before optimising", 3, ["profile", "cprofile", "measure", "hotspot", "timing"]),
      c("approach", "Fixed the algorithm before micro-optimising", 3, ["algorithm", "complexity", "query", "structure", "not micro"]),
      c("result", "Quantifies the outcome", 2, ["from", "to", "faster", "percent", "measured"]),
    ]),

    // --- SENIOR -----------------------------------------------------------
    mcq(
      "SENIOR",
      "You are choosing between threads, processes and asyncio for a service doing many outbound HTTP calls and light CPU work. Which fits best?",
      [
        "Processes, to bypass the GIL",
        "asyncio, because the work is I/O-bound and coroutines scale to many concurrent calls cheaply",
        "Threads, because they are simpler than asyncio",
        "It makes no measurable difference",
      ],
      1,
      "Coroutines carry far less overhead per concurrent operation than threads. Processes would pay memory and IPC cost for parallelism the workload does not need.",
    ),
    mcq(
      "SENIOR",
      "Your Django application must support a tenant-per-schema model. What is the main long-term cost?",
      [
        "Slower queries within a tenant",
        "Migrations and connection management must handle hundreds of schemas, and tooling assumes one",
        "Tenants cannot be isolated",
        "It prevents the use of an ORM",
      ],
      1,
      "Isolation is excellent; operations are where it hurts. A migration that takes two seconds becomes an hour, and every tool has to be taught about schemas.",
    ),
    mcq(
      "SENIOR",
      "What is the most defensible reason to introduce a task queue rather than running work in-process?",
      [
        "It is faster",
        "Work must survive process restarts, be retried independently, and scale separately from request handling",
        "It reduces code complexity",
        "It removes the need for a database",
      ],
      1,
      "Durability and independent scaling are the justification. Complexity strictly increases — you have added a broker, workers and a new class of failure.",
    ),
    spoken("CONCEPTUAL", "SENIOR", "How would you design the boundary between a Python monolith and a first extracted service?", [
      c("seam", "Picks a seam with clear data ownership", 3, ["data", "owns", "boundary", "coupling", "independent"]),
      c("interface", "Defines the contract explicitly", 3, ["contract", "api", "schema", "version", "explicit"]),
      c("migration", "Moves incrementally with a fallback", 2, ["strangler", "proxy", "dual", "fallback", "gradual"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "Explain how you would approach performance work on a Python service where the obvious hotspots are already optimised.", [
      c("measurement", "Measures the real system rather than micro-benchmarks", 3, ["production", "profile", "trace", "real traffic", "flame"]),
      c("systemic", "Looks beyond the language at architecture", 3, ["query", "n+1", "network", "serialisation", "architecture", "cache"]),
      c("tradeoff", "Knows when to stop or change language", 2, ["rewrite", "c extension", "cost", "diminishing", "enough"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "What is your approach to dependency and supply-chain risk in a Python codebase?", [
      c("inventory", "Knows what is actually depended on", 3, ["lock", "transitive", "sbom", "audit", "inventory"]),
      c("policy", "Has criteria for adding and upgrading", 3, ["criteria", "maintained", "pin", "cadence", "review"]),
      c("detection", "Automates vulnerability detection", 2, ["scanning", "dependabot", "alert", "cve"]),
    ]),
    typed("SCENARIO", "SENIOR", "A Python service is CPU-bound and horizontal scaling has become too expensive. Write your options in order of cost and risk.", [
      c("measurement", "Establishes where CPU actually goes", 3, ["profile", "flame", "which function", "measure"]),
      c("cheap-first", "Exhausts algorithmic and caching wins first", 3, ["algorithm", "cache", "avoid work", "batch", "cheapest"]),
      c("escalation", "Considers native extensions or another language honestly", 2, ["rust", "c", "cython", "numpy", "rewrite", "cost"]),
    ]),
    typed("SCENARIO", "SENIOR", "Your team wants to adopt strict typing across a 200,000-line untyped Python codebase. Write your plan.", [
      c("incremental", "Adopts gradually rather than all at once", 3, ["gradual", "module by module", "strict per file", "incremental"]),
      c("priority", "Types the highest-value surfaces first", 3, ["boundary", "core", "most changed", "public", "first"]),
      c("enforcement", "Prevents backsliding", 2, ["ci", "fail", "ratchet", "no new untyped"]),
    ]),
    typed("SCENARIO", "SENIOR", "A regulator requires you to prove which code processed a given customer's data on a given day. Write what you would need in place.", [
      c("traceability", "Ties deployments to code versions", 3, ["version", "commit", "deploy log", "immutable", "artefact"]),
      c("data-lineage", "Tracks what touched the data", 3, ["audit log", "lineage", "access log", "who", "when"]),
      c("retention", "Keeps evidence long enough", 2, ["retention", "archive", "period", "immutable"]),
    ]),
    typed("CODING", "SENIOR", "Write a rate limiter usable across multiple Python processes. State your algorithm, its storage, and its behaviour under a datastore outage.", [
      c("algorithm", "Chooses and justifies a real algorithm", 3, ["token bucket", "sliding window", "leaky", "fixed window", "atomic"]),
      c("distribution", "Works correctly across processes", 3, ["redis", "atomic", "lua", "incr", "shared"]),
      c("degradation", "Decides fail-open or fail-closed deliberately", 3, ["fail open", "fail closed", "outage", "fallback", "decide"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about a time you had to convince a team to abandon an approach they had already invested months in.", [
      c("evidence", "Made the case with evidence", 3, ["data", "showed", "measured", "prototype", "cost"]),
      c("empathy", "Respected the sunk effort and the people", 3, ["their work", "not wasted", "learned", "respect"]),
      c("outcome", "Reports what actually happened", 2, ["agreed", "changed", "partly", "did not"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Describe how you have handled being the most experienced Python engineer on a team. What did you deliberately not do?", [
      c("restraint", "Avoided doing everything themselves", 3, ["did not", "let them", "resisted", "stepped back"]),
      c("enablement", "Raised the level of others", 3, ["taught", "reviewed", "paired", "documented", "standards"]),
      c("humility", "Stayed open to being wrong", 2, ["asked", "learned from", "not always right"]),
    ]),

    // --- STAFF ------------------------------------------------------------
    mcq(
      "STAFF",
      "Your organisation runs Python, Go and Java services. What is the strongest argument for consolidating on fewer languages?",
      [
        "One language is objectively better",
        "Shared tooling, libraries and on-call capability compound; three ecosystems triple that investment",
        "Polyglot systems cannot share data",
        "Hiring is impossible otherwise",
      ],
      1,
      "The cost is in the surrounding investment, not the syntax. That argument only holds where teams genuinely share tooling and people.",
    ),
    mcq(
      "STAFF",
      "What most reliably signals that a shared internal Python library has become a liability?",
      [
        "It has many contributors",
        "Teams pin to old versions and work around it rather than upgrading",
        "It has more than 10,000 lines",
        "It depends on third-party packages",
      ],
      1,
      "Version pinning as avoidance means upgrading costs more than the value it delivers. That is the library failing its users, not the users being lazy.",
    ),
    mcq(
      "STAFF",
      "You must choose a Python version upgrade strategy across 40 services. Which is soundest?",
      [
        "Upgrade all services simultaneously in one coordinated release",
        "Upgrade a low-risk service first to find the real problems, then automate the pattern across the rest",
        "Wait until the old version reaches end of life",
        "Let each team decide independently with no deadline",
      ],
      1,
      "The first upgrade is where you learn what actually breaks. Simultaneous upgrades multiply unknowns; no deadline means it never happens.",
    ),
    spoken("CONCEPTUAL", "STAFF", "How do you think about the long-term maintainability of a Python codebase that will outlive its original team?", [
      c("legibility", "Prioritises conventional, obvious code", 3, ["conventional", "boring", "obvious", "readable", "standard"]),
      c("constraints", "Uses tooling to enforce rather than document", 3, ["lint", "type", "ci", "format", "enforced"]),
      c("knowledge", "Captures why, not just what", 2, ["adr", "comment why", "documentation", "context"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "What is your view on when a Python service should be rewritten in a faster language?", [
      c("evidence", "Requires measured, sustained cost", 3, ["measured", "cost", "profile", "sustained", "data"]),
      c("alternatives", "Exhausts cheaper options first", 3, ["cache", "algorithm", "extension", "partial", "hot path"]),
      c("organisation", "Counts the people cost of a new ecosystem", 2, ["hiring", "expertise", "on-call", "two stacks"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How would you establish testing standards across teams with very different current practices?", [
      c("assessment", "Understands why practices differ", 3, ["why", "context", "different", "listened", "constraints"]),
      c("minimum", "Sets a floor rather than a uniform ideal", 3, ["minimum", "floor", "critical", "not everything", "risk based"]),
      c("support", "Makes compliance achievable", 2, ["tooling", "template", "help", "time", "fixture"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How do you evaluate whether an internal platform team is delivering value rather than creating friction?", [
      c("metrics", "Measures adoption and time saved", 3, ["adoption", "voluntary", "time to", "lead time", "measure"]),
      c("signal", "Treats avoidance as a failure signal", 3, ["work around", "bypass", "shadow", "avoid", "fork"]),
      c("feedback", "Listens to consuming teams directly", 2, ["survey", "talk", "feedback", "ask"]),
    ]),
    typed("SCENARIO", "STAFF", "Your company must migrate 40 Python services off a database vendor within 12 months for licensing reasons. Write your programme plan.", [
      c("inventory", "Establishes real dependency and usage first", 3, ["inventory", "audit", "which services", "features used", "assess"]),
      c("abstraction", "Reduces coupling before migrating", 3, ["abstraction", "orm", "vendor specific", "isolate", "adapter"]),
      c("sequencing", "Sequences by risk with verification", 3, ["low risk first", "dual write", "verify", "rollback", "phased"]),
    ]),
    typed("SCENARIO", "STAFF", "An internal Python framework built by a since-departed engineer underpins 15 services and nobody understands it. Write your plan.", [
      c("assessment", "Establishes what it actually does", 3, ["read", "map", "document", "tests", "understand"]),
      c("options", "Weighs owning it against replacing it", 3, ["adopt", "replace", "wrap", "standard", "options"]),
      c("risk", "Stabilises before deciding", 2, ["freeze", "tests", "pin", "contain"]),
    ]),
    typed("SCENARIO", "STAFF", "A team proposes moving all Python services to serverless functions to cut costs. Write your assessment.", [
      c("scrutiny", "Tests the cost claim with real numbers", 3, ["measure", "cost model", "actually", "compare", "traffic shape"]),
      c("fit", "Knows which workloads suit it", 3, ["cold start", "long running", "connection", "bursty", "stateful"]),
      c("consequence", "Considers operational and lock-in effects", 2, ["lock-in", "observability", "local dev", "debug"]),
    ]),
    typed("SCENARIO", "STAFF", "Two teams have built incompatible internal APIs for the same customer concept and both have production traffic. Write your resolution.", [
      c("facts", "Establishes usage and cost before choosing", 3, ["traffic", "consumers", "usage", "data", "who"]),
      c("path", "Defines a single target with a migration route", 3, ["canonical", "one", "migrate", "adapter", "deprecate"]),
      c("politics", "Handles the ownership dispute explicitly", 2, ["owner", "agree", "escalate", "decision"]),
    ]),
    typed("SCENARIO", "STAFF", "You must decide whether to keep an ageing Django monolith or invest in decomposition. Write the analysis you would present.", [
      c("evidence", "Grounds it in delivery and incident data", 3, ["lead time", "incidents", "deploy", "coupling", "data"]),
      c("honesty", "Considers that keeping it may be correct", 3, ["may be fine", "not automatic", "cost of split", "modular monolith"]),
      c("proposal", "Recommends something specific and bounded", 2, ["recommend", "first step", "bounded", "measure"]),
    ]),
    typed("CODING", "STAFF", "Sketch the interface for an internal Python library that every service will use for outbound HTTP: timeouts, retries, tracing and metrics. Explain what you make impossible.", [
      c("defaults", "Makes the safe path the default", 3, ["default timeout", "required", "cannot", "safe default"]),
      c("observability", "Builds in tracing and metrics", 3, ["trace", "metric", "propagate", "header", "span"]),
      c("constraint", "Deliberately removes dangerous options", 3, ["no infinite", "cannot disable", "impossible", "forbid"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Tell me about a time you set technical direction that turned out to be wrong. How did you find out and what did you do?", [
      c("admission", "Owns the wrong call", 3, ["wrong", "my decision", "mistake", "misjudged"]),
      c("detection", "Had a mechanism that surfaced it", 3, ["feedback", "measured", "someone told", "data", "review"]),
      c("correction", "Reversed it without ego", 2, ["changed", "reversed", "told", "quickly"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Describe how you decide where to spend your own time when you could contribute to many things at once.", [
      c("leverage", "Chooses by leverage rather than interest", 3, ["leverage", "highest impact", "unblocks", "only i", "multiplier"]),
      c("delegation", "Hands off what others can do", 3, ["delegate", "someone else", "grow", "not me"]),
      c("discipline", "Says no explicitly", 2, ["said no", "declined", "not this quarter", "prioritise"]),
    ]),
  ],
};
