import type { BankDomain } from "../question-bank";
import { c, mcq, spoken, typed } from "./authoring";

/**
 * Data Engineering — depth tranche.
 *
 * Weighted towards correctness under reprocessing, late data and schema change,
 * because a pipeline that is merely fast and wrong is the characteristic
 * failure of this discipline and it fails silently.
 */
export const DATA_ENGINEERING_DEPTH: BankDomain = {
  slug: "data-engineering",
  name: "Data Engineering",
  blurb: "Builds the pipelines and models that turn raw data into something trustworthy.",
  questions: [
    // --- BEGINNER ---------------------------------------------------------
    mcq(
      "BEGINNER",
      "What does an INNER JOIN return when a row on the left has no match on the right?",
      ["The row with nulls", "Nothing — that row is excluded", "An error", "The row duplicated"],
      1,
      "Rows without a match are dropped. This is the most common cause of a report quietly losing records after a join is added.",
    ),
    mcq(
      "BEGINNER",
      "Why does `NULL = NULL` not evaluate to true in SQL?",
      [
        "It is a bug in most databases",
        "NULL means unknown, and two unknowns cannot be proven equal",
        "NULL is a string",
        "It only works inside a WHERE clause",
      ],
      1,
      "`IS NULL` is the correct test. This is also why `NOT IN` against a list containing NULL returns no rows, which surprises people regularly.",
    ),
    mcq(
      "BEGINNER",
      "What does ORDER BY do to a query's cost on a large table?",
      [
        "Nothing, sorting is free",
        "It can require sorting the whole result set, which is expensive without a supporting index",
        "It reduces the rows scanned",
        "It always uses an index",
      ],
      1,
      "Sorting millions of rows spills to disk. An index in the same order lets the database read them already sorted.",
    ),
    mcq(
      "BEGINNER",
      "A column stores amounts as a floating point number. What is the risk for financial reporting?",
      [
        "It uses more storage",
        "Rounding error accumulates, so totals disagree with the source system",
        "It cannot store negative values",
        "It is slower to sum",
      ],
      1,
      "Binary floating point cannot represent most decimal fractions exactly. Money belongs in a decimal type or in integer minor units.",
    ),
    mcq(
      "BEGINNER",
      "What is the purpose of a staging layer in a warehouse?",
      [
        "To make queries faster",
        "To hold raw source data as loaded, so transformations can be re-run and audited against it",
        "To store only the final reporting tables",
        "To back up the source system",
      ],
      1,
      "Keeping the raw landing is what makes reprocessing possible. Transforming on the way in destroys the evidence you need when a number is questioned.",
    ),
    mcq(
      "BEGINNER",
      "Two systems both call something a 'customer' but count different numbers. What is the most likely cause?",
      [
        "One system has a bug",
        "They define the entity differently — one may include prospects, deleted records, or test accounts",
        "The database is corrupted",
        "One is out of date",
      ],
      1,
      "Definitional mismatch is far more common than data loss. This is why an agreed definition matters more than the query.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "What is the difference between a database used by an application and a data warehouse? Why not just query the application's database?", [
      c("purpose", "Distinguishes transactional from analytical use", 3, ["transaction", "analytic", "reporting", "oltp", "olap"]),
      c("impact", "Knows heavy queries harm the live system", 3, ["slow", "load", "lock", "production", "impact"]),
      c("shape", "Mentions the data being modelled differently", 2, ["denormalised", "history", "shape", "joined", "aggregated"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What would make you distrust a number on a dashboard, even when the pipeline reports success?", [
      c("scepticism", "Names plausible silent failures", 3, ["partial", "late", "duplicate", "filter", "join", "definition"]),
      c("checks", "Proposes concrete verification", 3, ["compare", "source", "row count", "reconcile", "spot check"]),
      c("context", "Considers whether the number is plausible", 2, ["expected", "trend", "sense", "magnitude"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "Explain what happens when a pipeline is re-run for a day that has already been processed. Why does that matter?", [
      c("risk", "Identifies duplication as the danger", 3, ["duplicate", "twice", "double", "append"]),
      c("idempotency", "Knows re-runs should be safe", 3, ["idempotent", "overwrite", "replace", "delete then insert", "merge"]),
      c("why", "Explains why re-runs happen at all", 2, ["failure", "backfill", "fix", "late data"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A daily table has 100,000 rows every day and 40,000 today, with no pipeline error. Write how you would investigate.", [
      c("scope", "Determines whether the loss is real or partial load", 3, ["source", "compare", "count", "partial", "upstream"]),
      c("segmentation", "Looks for which subset is missing", 3, ["which", "group by", "segment", "region", "type"]),
      c("timing", "Considers late arrival and cut-off", 2, ["late", "timezone", "cut off", "window"]),
    ]),
    typed("SCENARIO", "BEGINNER", "You are asked to produce 'last month's sales'. Write the questions you would ask before writing any SQL.", [
      c("definition", "Clarifies what counts as a sale", 3, ["refund", "cancelled", "status", "gross", "net", "tax"]),
      c("boundaries", "Clarifies the time boundary and timezone", 3, ["timezone", "calendar month", "order date", "paid date", "boundary"]),
      c("audience", "Asks what decision it supports", 2, ["what for", "who", "decision", "compare"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A stakeholder says your report disagrees with a number they calculated in a spreadsheet. Write how you would resolve it.", [
      c("respect", "Treats their number as possibly correct", 3, ["might be right", "check both", "understand theirs", "not assume"]),
      c("reconciliation", "Compares definitions and filters methodically", 3, ["definition", "filter", "date range", "compare", "step by step"]),
      c("resolution", "Documents the agreed definition", 2, ["document", "agree", "definition", "write down"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time you had to check your own work carefully before sharing it. What did you check?", [
      c("method", "Describes concrete verification", 3, ["checked", "compared", "sample", "recalculated", "cross"]),
      c("motivation", "Understands the cost of being wrong", 2, ["decision", "trust", "wrong", "important"]),
      c("outcome", "Found or ruled out problems", 2, ["found", "correct", "confident"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Describe a time you had to say a piece of data could not answer the question being asked.", [
      c("honesty", "Declined to over-claim", 3, ["cannot", "not enough", "does not", "would not support"]),
      c("clarity", "Explained the limitation understandably", 3, ["explained", "because", "we only have", "missing"]),
      c("help", "Offered what could be answered", 2, ["instead", "could", "alternative", "proxy"]),
    ]),

    // --- JUNIOR -----------------------------------------------------------
    mcq(
      "JUNIOR",
      "You add a row-level filter to a fact table query and the total drops more than expected. What should you check first?",
      [
        "The database version",
        "Whether the filter column contains NULLs, which the condition silently excludes",
        "The index on the column",
        "The query timeout",
      ],
      1,
      "A condition such as `status != 'cancelled'` drops NULL status rows too, because the comparison is unknown rather than true.",
    ),
    mcq(
      "JUNIOR",
      "What does a window function let you do that GROUP BY does not?",
      [
        "Filter rows",
        "Compute an aggregate across a set of rows while keeping every individual row in the output",
        "Join two tables",
        "Sort the result",
      ],
      1,
      "GROUP BY collapses rows; a window keeps them. That is what makes running totals and per-group rankings possible in one pass.",
    ),
    mcq(
      "JUNIOR",
      "Your pipeline reads a source table that has a column added upstream. What is the safest behaviour?",
      [
        "Fail immediately",
        "Continue, but detect and record the schema change so it can be reviewed",
        "Silently ignore the new column forever",
        "Automatically add it to every downstream table",
      ],
      1,
      "Failing on every additive change makes the pipeline brittle; ignoring changes forever means you miss a column you needed. Detection plus a review step is the balance.",
    ),
    mcq(
      "JUNIOR",
      "What is the practical purpose of partitioning a large table by date?",
      [
        "It compresses the data",
        "Queries filtered by date can skip entire partitions, and old partitions can be dropped cheaply",
        "It enforces uniqueness",
        "It removes the need for indexes",
      ],
      1,
      "Partition pruning is the read benefit and cheap retention is the write benefit. Partitioning on a column queries do not filter by gives neither.",
    ),
    mcq(
      "JUNIOR",
      "A daily incremental load uses `WHERE updated_at >= yesterday`. What does it miss?",
      [
        "Nothing",
        "Records whose updated_at was set by the source before the extract but committed after it, and hard-deleted rows",
        "Records updated twice",
        "Records with null ids",
      ],
      1,
      "Clock and commit-order gaps let rows fall between watermarks, and a deletion has no updated_at at all. Overlapping windows plus a periodic full reconcile cover both.",
    ),
    mcq(
      "JUNIOR",
      "Why is `SELECT DISTINCT` a poor fix for duplicate rows in a pipeline?",
      [
        "It is slow",
        "It hides the cause — usually a join fan-out — and will silently collapse legitimately distinct rows later",
        "It does not work on large tables",
        "It changes column order",
      ],
      1,
      "The duplicates are a symptom. Suppressing them means the underlying grain error stays and produces wrong aggregates elsewhere.",
    ),
    spoken("CONCEPTUAL", "JUNIOR", "Explain what 'grain' means for a table and what goes wrong when it is unclear.", [
      c("definition", "Defines grain as what one row represents", 3, ["one row", "represents", "level", "per order", "unique"]),
      c("consequence", "Names double counting as the failure", 3, ["double count", "fan out", "wrong total", "duplicate"]),
      c("discipline", "States it explicitly when modelling", 2, ["declare", "document", "define first", "primary key"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What is the difference between batch and streaming processing, and how would you choose?", [
      c("distinction", "Explains bounded versus continuous", 3, ["batch", "stream", "continuous", "window", "scheduled"]),
      c("criteria", "Chooses on freshness requirement and cost", 3, ["freshness", "latency", "how fresh", "cost", "complexity"]),
      c("honesty", "Knows streaming is harder to operate", 2, ["harder", "complex", "state", "replay", "debug"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "Explain what a data contract between a producing team and your pipeline should specify.", [
      c("schema", "Covers schema and change process", 3, ["schema", "fields", "types", "change", "notice"]),
      c("semantics", "Covers meaning, not just structure", 3, ["meaning", "definition", "nullable", "units", "when set"]),
      c("operations", "Covers timing and volume expectations", 2, ["frequency", "sla", "volume", "late", "availability"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A source system starts sending records with a timestamp two hours in the future. Write what you would do.", [
      c("detection", "Notices and quantifies rather than dropping silently", 3, ["detect", "how many", "log", "quarantine", "alert"]),
      c("investigation", "Suspects timezone or clock skew", 3, ["timezone", "utc", "clock", "skew", "offset"]),
      c("handling", "Decides deliberately what to do with them", 2, ["reject", "flag", "clamp", "accept", "document"]),
    ]),
    typed("SCENARIO", "JUNIOR", "You must backfill two years of history into a pipeline designed for daily increments. Write your approach.", [
      c("safety", "Avoids disturbing the daily path", 3, ["separate", "parallel", "not overwrite", "isolated", "test"]),
      c("chunking", "Processes in bounded chunks", 3, ["chunk", "batch", "month", "resumable", "progress"]),
      c("verification", "Verifies the result against the source", 2, ["reconcile", "count", "compare", "sample", "checksum"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A dashboard query takes four minutes and business users refresh it constantly. Write your options.", [
      c("diagnosis", "Finds what makes it slow", 3, ["explain", "plan", "scan", "join", "measure"]),
      c("precompute", "Considers aggregation or materialisation", 3, ["materialised", "aggregate", "pre-compute", "summary table", "cache"]),
      c("tradeoff", "Weighs freshness against speed", 2, ["freshness", "stale", "refresh", "trade-off"]),
    ]),
    typed("CODING", "JUNIOR", "Given `sessions(user_id, started_at, ended_at)`, write SQL for the number of users active on each day of a date range, counting a user once per day.", [
      c("calendar", "Generates the full date range including empty days", 3, ["generate_series", "calendar", "date range", "left join", "all days"]),
      c("overlap", "Handles sessions spanning days correctly", 3, ["between", "overlap", "started", "ended", "span"]),
      c("distinct", "Counts each user once per day", 2, ["count(distinct", "unique", "per day"]),
    ]),
    typed("CODING", "JUNIOR", "Write SQL that returns, for each customer, their first and most recent order date and their total number of orders, including customers with no orders.", [
      c("join", "Uses an outer join so zero-order customers appear", 3, ["left join", "outer", "coalesce", "including"]),
      c("aggregation", "Aggregates the three values correctly", 3, ["min", "max", "count", "group by"]),
      c("nulls", "Handles the no-order case sensibly", 2, ["null", "coalesce", "0", "count(order"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you delivered data that turned out to be wrong. How did you find out and what did you do?", [
      c("discovery", "Describes how the error surfaced", 3, ["found", "someone", "noticed", "checked"]),
      c("response", "Corrected and communicated promptly", 3, ["told", "corrected", "immediately", "flagged"]),
      c("prevention", "Added a check afterwards", 2, ["test", "check", "validation", "now"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Describe a time you pushed back on a data request. What was your reasoning?", [
      c("reason", "Had a substantive reason", 3, ["cannot answer", "misleading", "privacy", "wrong data", "cost"]),
      c("communication", "Explained rather than refused", 3, ["explained", "why", "alternative", "offered"]),
      c("outcome", "Reached a workable result", 2, ["instead", "agreed", "different"]),
    ]),

    // --- MID --------------------------------------------------------------
    mcq(
      "MID",
      "Records can arrive up to three days late. Your pipeline processes only yesterday's partition. What is the consequence?",
      [
        "Nothing, late records are rare",
        "Historic days are permanently understated unless earlier partitions are reprocessed",
        "The pipeline will fail",
        "Records are duplicated",
      ],
      1,
      "The number was right when computed and wrong forever after. A rolling reprocess window, or event-time partitioning, is what fixes it.",
    ),
    mcq(
      "MID",
      "What problem does a slowly changing dimension type 2 solve?",
      [
        "It makes dimension queries faster",
        "It preserves history, so a fact joins to the attribute values that were true at the time",
        "It removes duplicate dimension rows",
        "It compresses the dimension table",
      ],
      1,
      "Overwriting in place retroactively rewrites history — last year's sales get attributed to this year's sales region. Type 2 keeps both versions with validity dates.",
    ),
    mcq(
      "MID",
      "Your join between orders and order_items produces more revenue than the source system reports. What is the most likely cause?",
      [
        "The source system is wrong",
        "Order-level amounts are being summed once per item row after the join fan-out",
        "A missing index",
        "Currency conversion",
      ],
      1,
      "Joining to a finer grain multiplies the coarser table's values. Aggregate before joining, or sum only the item-level amounts.",
    ),
    mcq(
      "MID",
      "A pipeline reads from a paginated API. What is the classic correctness failure?",
      [
        "Rate limiting",
        "Records shift between pages while paging, so some are read twice and others missed",
        "The API returns JSON",
        "Pages are returned out of order",
      ],
      1,
      "Offset paging over changing data is unstable. Cursor or snapshot-based paging, or paging over an immutable ordering, avoids it.",
    ),
    mcq(
      "MID",
      "Which is the strongest reason to store raw source data even after transforming it?",
      [
        "Storage is cheap",
        "Transformation logic changes and contains bugs; without the raw data you cannot reprocess or prove what arrived",
        "It is required by law",
        "It makes queries faster",
      ],
      1,
      "The transformation is the part most likely to be wrong. Discarding the input means every past bug is permanent.",
    ),
    mcq(
      "MID",
      "What does 'exactly once' realistically mean in a data pipeline?",
      [
        "Each record is read from the source exactly once",
        "The observable end state is as if each record were processed once, usually achieved with idempotent writes",
        "The pipeline never retries",
        "Duplicates are impossible",
      ],
      1,
      "Delivery is at-least-once in practice. The guarantee is reconstructed at the write step through deduplication keys or merges.",
    ),
    mcq(
      "MID",
      "You need to detect data quality problems before consumers do. Which check is most valuable per unit of effort?",
      [
        "Checking every column for nulls",
        "Volume and distribution checks against recent history, plus uniqueness on the declared grain",
        "Comparing row counts to the previous run only",
        "Validating column data types",
      ],
      1,
      "Volume anomalies catch partial loads and grain violations catch fan-out — the two failures that most often reach a dashboard silently.",
    ),
    spoken("CONCEPTUAL", "MID", "Explain the difference between event time and processing time, and what breaks when a pipeline conflates them.", [
      c("distinction", "Defines both clearly", 3, ["event time", "processing", "when it happened", "when we saw"]),
      c("breakage", "Names a concrete resulting bug", 3, ["late", "wrong day", "attributed", "window", "restated"]),
      c("handling", "Describes watermarks or reprocessing windows", 2, ["watermark", "allowed lateness", "window", "reprocess"]),
    ]),
    spoken("CONCEPTUAL", "MID", "How would you design a warehouse model so that a definition change does not require rebuilding everything?", [
      c("layering", "Separates raw, cleaned and business layers", 3, ["layer", "staging", "raw", "mart", "intermediate"]),
      c("centralisation", "Defines metrics once", 3, ["single definition", "metric layer", "one place", "reuse", "dry"]),
      c("reprocessing", "Keeps rebuild cheap and targeted", 2, ["incremental", "rebuild", "lineage", "downstream"]),
    ]),
    spoken("CONCEPTUAL", "MID", "What is data lineage, and what can you do with it that you cannot do without it?", [
      c("definition", "Explains tracing data through transformations", 3, ["trace", "upstream", "downstream", "flow", "source"]),
      c("impact", "Uses it for impact analysis", 3, ["impact", "who depends", "break", "before changing"]),
      c("incidents", "Uses it during incidents", 2, ["incident", "which reports", "affected", "root"]),
    ]),
    spoken("CONCEPTUAL", "MID", "Explain how you would make a pipeline's failures useful rather than merely loud.", [
      c("actionability", "Alerts carry enough context to act", 3, ["context", "which", "what failed", "runbook", "actionable"]),
      c("severity", "Distinguishes urgent from informational", 3, ["severity", "page", "ticket", "not everything", "threshold"]),
      c("fatigue", "Addresses alert fatigue explicitly", 2, ["fatigue", "ignored", "noise", "tune"]),
    ]),
    typed("SCENARIO", "MID", "Finance says a revenue figure changed retroactively for a closed month. Write how you would investigate and what you would change.", [
      c("cause", "Suspects late data or a dimension overwrite", 3, ["late", "restated", "scd", "overwrite", "reprocess", "changed"]),
      c("evidence", "Uses history or snapshots to prove what changed", 3, ["snapshot", "audit", "version", "compare", "history"]),
      c("policy", "Establishes a close and restatement policy", 3, ["freeze", "closed", "restate", "policy", "immutable"]),
    ]),
    typed("SCENARIO", "MID", "A source team plans to rename a column next week and 30 downstream models use it. Write your response.", [
      c("impact", "Quantifies the blast radius with lineage", 3, ["lineage", "which models", "impact", "search", "30"]),
      c("negotiation", "Proposes a compatible transition", 3, ["both columns", "deprecation", "period", "alias", "phased"]),
      c("prevention", "Improves the change process afterwards", 2, ["contract", "notice", "process", "review"]),
    ]),
    typed("SCENARIO", "MID", "Your warehouse bill has doubled and the largest cost is a single hourly model rebuilt in full. Write your options.", [
      c("incrementality", "Makes the model incremental", 3, ["incremental", "merge", "only new", "partition", "not full"]),
      c("frequency", "Questions whether hourly is needed", 3, ["hourly", "who needs", "frequency", "daily", "actually"]),
      c("measurement", "Verifies the saving without breaking correctness", 2, ["measure", "compare", "verify", "cost per"]),
    ]),
    typed("SCENARIO", "MID", "You are asked to give a marketing team direct warehouse access. Write what you would put in place first.", [
      c("access", "Restricts to appropriate data", 3, ["role", "view", "column", "pii", "least privilege", "mask"]),
      c("cost", "Prevents runaway query cost", 3, ["quota", "limit", "cost", "timeout", "monitor"]),
      c("guidance", "Reduces misinterpretation", 2, ["documentation", "definition", "curated", "training", "certified"]),
    ]),
    typed("CODING", "MID", "Write the merge logic for an incremental load where source records can be inserted, updated or deleted, and the same key may appear several times in one batch.", [
      c("deduplication", "Reduces to one row per key before merging", 3, ["row_number", "latest", "dedupe", "qualify", "max"]),
      c("merge", "Handles insert, update and delete", 3, ["merge", "matched", "not matched", "delete", "upsert"]),
      c("determinism", "Uses a deterministic tie-break", 2, ["order by", "sequence", "version", "tie"]),
    ]),
    typed("CODING", "MID", "Given `price_changes(product_id, price, valid_from)`, write SQL producing a type 2 dimension with valid_from and valid_to, where the current row has an open end.", [
      c("window", "Uses LEAD to derive the end date", 3, ["lead", "over", "partition by", "order by"]),
      c("boundaries", "Sets the open-ended current row correctly", 3, ["null", "infinity", "current", "9999", "open"]),
      c("integrity", "Avoids gaps or overlaps", 2, ["no overlap", "contiguous", "gap", "adjacent"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Tell me about a time you had to tell a leader their favourite metric was misleading. How did it go?", [
      c("courage", "Raised it despite the discomfort", 3, ["told", "raised", "uncomfortable", "anyway"]),
      c("evidence", "Demonstrated rather than asserted", 3, ["showed", "example", "data", "walked through"]),
      c("outcome", "Reports the real result", 2, ["changed", "did not", "partly", "accepted"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Describe the worst data incident you have been involved in. What was the impact and what changed afterwards?", [
      c("impact", "Honest about consequences", 3, ["decisions", "customers", "reported", "wrong", "impact"]),
      c("response", "Describes containment and correction", 3, ["stopped", "corrected", "communicated", "restated"]),
      c("change", "Systemic improvement followed", 2, ["check", "test", "process", "monitoring"]),
    ]),

    // --- SENIOR -----------------------------------------------------------
    mcq(
      "SENIOR",
      "Which is the strongest argument for a data mesh style of ownership?",
      [
        "It reduces infrastructure cost",
        "Domain teams understand their data best, and a central team becomes a bottleneck as domains multiply",
        "It removes the need for governance",
        "It makes pipelines faster",
      ],
      1,
      "The argument is organisational scaling. It demands more governance rather than less, and without platform investment it produces inconsistent silos.",
    ),
    mcq(
      "SENIOR",
      "You must support both sub-second dashboards and full-history analysis on the same data. What approach is soundest?",
      [
        "One table optimised for both",
        "Separate serving layers fed from the same governed source, each optimised for its access pattern",
        "Move everything to a streaming system",
        "Cache the dashboards more aggressively",
      ],
      1,
      "The access patterns are genuinely different. What must be shared is the definition and lineage, not the physical layout.",
    ),
    mcq(
      "SENIOR",
      "What most reliably prevents a warehouse from becoming an untrusted swamp?",
      [
        "Stronger naming conventions",
        "Ownership, tests and documented definitions attached to each dataset, enforced in the deployment path",
        "A more expensive warehouse product",
        "Restricting who can create tables",
      ],
      1,
      "Trust comes from someone being accountable and from checks that run. Naming and gatekeeping without ownership just slow down the decay.",
    ),
    spoken("CONCEPTUAL", "SENIOR", "How would you design for GDPR-style deletion requests across a warehouse with two years of partitioned history and backups?", [
      c("scope", "Recognises history, backups and derived tables", 3, ["backup", "derived", "downstream", "partition", "everywhere"]),
      c("technique", "Proposes a workable mechanism", 3, ["crypto shredding", "key", "tombstone", "rewrite partition", "pseudonymise"]),
      c("proof", "Can demonstrate compliance", 2, ["audit", "log", "prove", "evidence", "report"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "Explain how you would decide between ELT in the warehouse and transformation in a separate processing engine.", [
      c("criteria", "Uses data volume, cost and skills", 3, ["volume", "cost", "sql", "skills", "compute"]),
      c("coupling", "Considers portability and lock-in", 2, ["lock-in", "portable", "vendor", "migrate"]),
      c("pragmatism", "Accepts a mixed answer", 2, ["both", "depends", "mostly", "some"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "What does a good data platform give teams that they would otherwise each build badly?", [
      c("capabilities", "Names concrete shared capabilities", 3, ["ingestion", "orchestration", "testing", "lineage", "catalogue", "access"]),
      c("consistency", "Argues for consistent definitions and access control", 3, ["consistent", "definition", "governance", "access", "once"]),
      c("adoption", "Knows it must be easier than the alternative", 2, ["easier", "adopt", "self-serve", "friction"]),
    ]),
    typed("SCENARIO", "SENIOR", "Your organisation has three competing 'customer' tables owned by three teams, all in production. Write your plan to converge them.", [
      c("understanding", "Establishes why three exist before merging", 3, ["why", "different needs", "definition", "history", "understand"]),
      c("target", "Defines one canonical model with extensions", 3, ["canonical", "one", "core", "extension", "conformed"]),
      c("migration", "Migrates consumers without a big bang", 2, ["view", "alias", "gradual", "deprecate", "parallel"]),
    ]),
    typed("SCENARIO", "SENIOR", "A machine learning team wants features computed from your pipelines, and their training results differ from production. Write your diagnosis and fix.", [
      c("skew", "Identifies training-serving skew", 3, ["skew", "different code", "training", "serving", "point in time"]),
      c("leakage", "Considers future data leaking into features", 3, ["leakage", "future", "as of", "point in time", "timestamp"]),
      c("fix", "Proposes a shared, versioned feature definition", 2, ["feature store", "shared", "one definition", "versioned"]),
    ]),
    typed("SCENARIO", "SENIOR", "An upstream system will be replaced in six months and every downstream model reads it directly. Write your plan.", [
      c("decoupling", "Inserts an abstraction before the change", 3, ["view", "interface", "abstraction", "contract", "decouple"]),
      c("parallel", "Runs old and new in parallel to compare", 3, ["parallel", "compare", "reconcile", "shadow", "both"]),
      c("cutover", "Plans a reversible cutover", 2, ["cutover", "rollback", "flag", "phased"]),
    ]),
    typed("CODING", "SENIOR", "Design the write path for a pipeline that must be safely re-runnable for any historical date while a daily run is also executing. Show the key logic and state your locking.", [
      c("isolation", "Prevents the two runs corrupting each other", 3, ["lock", "partition", "isolated", "separate", "atomic swap"]),
      c("idempotency", "Makes any re-run produce the same result", 3, ["delete insert", "merge", "overwrite partition", "idempotent"]),
      c("atomicity", "Consumers never see a half-written state", 2, ["atomic", "swap", "transaction", "staging table"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about a time you had to rebuild trust in data after a serious failure. What did you actually do?", [
      c("acknowledgement", "Owned the failure publicly", 3, ["admitted", "told", "transparent", "owned"]),
      c("mechanism", "Made correctness visible going forward", 3, ["tests", "monitoring", "published", "checks", "sla"]),
      c("patience", "Recognises trust returns slowly", 2, ["time", "gradually", "consistently", "months"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Describe how you have handled a stakeholder who wanted the data to say something it did not.", [
      c("integrity", "Did not bend the numbers", 3, ["would not", "refused", "honest", "integrity"]),
      c("understanding", "Explored what they actually needed", 3, ["what are you", "underlying", "question behind", "asked"]),
      c("resolution", "Found a legitimate way forward", 2, ["different analysis", "caveat", "context", "instead"]),
    ]),

    // --- STAFF ------------------------------------------------------------
    mcq(
      "STAFF",
      "What is the most reliable early sign that a data platform investment is failing?",
      [
        "The number of tables is growing",
        "Teams are extracting data out of the platform to work around it",
        "Storage costs are rising",
        "There are open support tickets",
      ],
      1,
      "Exfiltration is the market signal. It means the platform costs more to use than to bypass, which no amount of governance policy will fix.",
    ),
    mcq(
      "STAFF",
      "You must set a company-wide policy on metric definitions. Which approach is most likely to hold?",
      [
        "A published glossary maintained by the data team",
        "Definitions expressed as code in a shared semantic layer that every tool queries through",
        "Mandatory review of all new dashboards",
        "Naming standards enforced in code review",
      ],
      1,
      "A glossary drifts from what the queries actually do. Only a definition that is executed stays true.",
    ),
    mcq(
      "STAFF",
      "Which consideration should dominate a warehouse platform migration decision?",
      [
        "Benchmark performance on a standard query set",
        "Total cost including migration effort, retraining, and what breaks in the surrounding ecosystem",
        "The vendor's market position",
        "Support for the newest SQL features",
      ],
      1,
      "Benchmarks rarely reflect your workload and migrations routinely cost more than the licence difference they were meant to save.",
    ),
    spoken("CONCEPTUAL", "STAFF", "How do you decide what governance is worth its cost, given governance always slows people down?", [
      c("proportionality", "Scales control to risk", 3, ["risk based", "sensitive", "proportional", "not everything", "tier"]),
      c("mechanism", "Prefers automated to procedural control", 3, ["automated", "in the pipeline", "not review", "default", "enforced"]),
      c("value", "Ties governance to a real harm avoided", 2, ["harm", "regulator", "incident", "why", "cost of not"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How would you build an organisation's confidence that its data is trustworthy, as a measurable property?", [
      c("measurement", "Defines measurable quality signals", 3, ["freshness", "completeness", "test pass", "sla", "incidents"]),
      c("visibility", "Publishes the state openly", 3, ["dashboard", "published", "visible", "status", "certified"]),
      c("accountability", "Attaches ownership to each dataset", 2, ["owner", "accountable", "team", "on-call"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "What is your view on centralised versus embedded data engineers, and how would you structure a 60-person organisation?", [
      c("tradeoffs", "Names the real trade-offs of each", 3, ["bottleneck", "consistency", "context", "silo", "duplication"]),
      c("hybrid", "Proposes a considered structure", 3, ["platform", "embedded", "hub and spoke", "central", "federated"]),
      c("evolution", "Expects the structure to change with scale", 2, ["as we grow", "stage", "evolve", "revisit"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How do you think about the trade-off between data freshness and system complexity?", [
      c("challenge", "Interrogates the stated freshness need", 3, ["who needs", "actually", "decision", "how often", "questioned"]),
      c("cost", "Names the operational cost of low latency", 3, ["streaming", "state", "on-call", "complexity", "cost"]),
      c("tiering", "Applies different freshness per use case", 2, ["tier", "some", "not everything", "per use"]),
    ]),
    typed("SCENARIO", "STAFF", "The board wants a single number for company performance, and four departments each compute it differently. Write how you would resolve it.", [
      c("process", "Runs a definitional reconciliation, not a technical one", 3, ["definition", "reconcile", "workshop", "agree", "why different"]),
      c("authority", "Establishes who owns the definition", 3, ["owner", "authoritative", "cfo", "single owner", "decides"]),
      c("implementation", "Makes the agreed definition the only executable one", 2, ["semantic layer", "one query", "certified", "deprecate"]),
    ]),
    typed("SCENARIO", "STAFF", "A regulator requires you to reproduce any report exactly as it was published 18 months ago. Write what has to be true of your platform.", [
      c("immutability", "Preserves the data as it was", 3, ["snapshot", "immutable", "versioned", "time travel", "as of"]),
      c("code", "Preserves the transformation version too", 3, ["code version", "commit", "pinned", "reproducible"]),
      c("proof", "Can demonstrate the reproduction", 2, ["audit", "evidence", "rerun", "verify"]),
    ]),
    typed("SCENARIO", "STAFF", "Data engineering is seen as a ticket queue by the rest of the business. Write how you would change that perception.", [
      c("diagnosis", "Understands why the queue formed", 3, ["why", "no self serve", "bottleneck", "expectation", "listened"]),
      c("enablement", "Shifts work to self-service where safe", 3, ["self serve", "curated", "documentation", "training", "tooling"]),
      c("partnership", "Engages upstream in decisions", 2, ["embedded", "planning", "early", "partner", "roadmap"]),
    ]),
    typed("SCENARIO", "STAFF", "A vendor offers a platform that would replace half your pipeline stack at a cost equal to two engineers. Write your evaluation.", [
      c("scope", "Establishes exactly what it replaces", 3, ["which", "scope", "what remains", "gap", "coverage"]),
      c("exit", "Considers lock-in and exit cost", 3, ["lock-in", "exit", "portable", "our data", "leave"]),
      c("realism", "Counts the integration and migration cost", 2, ["migration", "integration", "hidden", "not just licence"]),
    ]),
    typed("SCENARIO", "STAFF", "You must present a three-year data strategy to a sceptical executive team. Write its structure and the hardest question you expect.", [
      c("outcomes", "Frames it around business outcomes", 3, ["outcome", "decision", "revenue", "cost", "capability"]),
      c("staging", "Delivers value incrementally rather than in year three", 3, ["phase", "first six months", "incremental", "quick", "milestone"]),
      c("candour", "Anticipates the sceptical question honestly", 2, ["why now", "what if", "risk", "cost", "expect"]),
    ]),
    typed("CODING", "STAFF", "Define the interface and guarantees of a company-wide data contract system: schema, semantics, SLAs and what happens on breach. Show the shape.", [
      c("contract", "Covers schema and semantics, not just types", 3, ["schema", "meaning", "nullable", "units", "definition"]),
      c("enforcement", "Enforces at the producing side", 3, ["ci", "producer", "block", "validate", "before publish"]),
      c("breach", "Defines consequences and escalation", 2, ["breach", "alert", "quarantine", "escalate", "sla"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Tell me about a data initiative you killed. How did you decide, and how did you handle the team that built it?", [
      c("decision", "Made the call on evidence", 3, ["not used", "cost", "data", "adoption", "measured"]),
      c("humanity", "Handled the people well", 3, ["team", "explained", "redeploy", "not their fault", "credit"]),
      c("learning", "Extracted value from the effort", 2, ["learned", "reused", "kept", "informed"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Describe how you have influenced a company to treat data as a product rather than a byproduct.", [
      c("framing", "Articulated what product thinking means here", 3, ["consumer", "sla", "owner", "roadmap", "quality", "product"]),
      c("evidence", "Demonstrated value concretely", 3, ["showed", "example", "one dataset", "pilot", "measured"]),
      c("persistence", "Acknowledges it takes sustained effort", 2, ["over time", "repeatedly", "gradually", "years"]),
    ]),
  ],
};
