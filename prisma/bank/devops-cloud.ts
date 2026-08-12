import type { BankDomain } from "../question-bank";
import { c, mcq, spoken, typed } from "./authoring";

/**
 * DevOps / Cloud Infrastructure — depth tranche.
 *
 * Deliberately biased towards operating systems under failure rather than
 * naming tools. Anyone can list a stack; the distinguishing skill is knowing
 * what breaks first and what you give up to keep serving.
 */
export const DEVOPS_DEPTH: BankDomain = {
  slug: "devops-cloud",
  name: "DevOps / Cloud Infrastructure",
  blurb: "Builds and operates the infrastructure and delivery pipeline products run on.",
  questions: [
    // --- BEGINNER ---------------------------------------------------------
    mcq(
      "BEGINNER",
      "What does a reverse proxy sit in front of a service to do?",
      [
        "Encrypt the database",
        "Terminate TLS, route requests and shield the service from direct exposure",
        "Compile the application",
        "Store user sessions",
      ],
      1,
      "It is a single controlled entry point. That is also where rate limiting, header handling and certificate management naturally live.",
    ),
    mcq(
      "BEGINNER",
      "Why is `latest` a poor image tag to deploy?",
      [
        "It downloads more slowly",
        "It is not a fixed reference, so two deploys of 'the same' tag can run different code",
        "It is not supported by most registries",
        "It uses more disk space",
      ],
      1,
      "You lose the ability to say what is running and to roll back to a known state. Immutable tags such as a commit SHA fix both.",
    ),
    mcq(
      "BEGINNER",
      "What does a container image layer cache do for build times?",
      [
        "It compresses the final image",
        "Unchanged layers are reused, so only steps after the first change are rebuilt",
        "It caches the running container's memory",
        "It shares layers between different applications",
      ],
      1,
      "This is why dependency installation goes before copying source. Copy source first and every code change invalidates the install.",
    ),
    mcq(
      "BEGINNER",
      "A service is reachable on the server but not from outside. What should you check first?",
      [
        "The application code",
        "Whether the process binds to all interfaces rather than localhost, and whether the firewall or security group allows the port",
        "The database connection",
        "The DNS record's TTL",
      ],
      1,
      "Binding to 127.0.0.1 and a closed security group are the two overwhelmingly common causes, and both are checkable in seconds.",
    ),
    mcq(
      "BEGINNER",
      "What is the purpose of a `.dockerignore` file?",
      [
        "It lists files the container cannot read at runtime",
        "It keeps files such as node_modules and .git out of the build context, making builds faster and images smaller",
        "It hides secrets from the running container",
        "It specifies which layers to cache",
      ],
      1,
      "The whole context is sent to the builder. Without it you can ship your .git directory and any local secrets into the image.",
    ),
    mcq(
      "BEGINNER",
      "What does DNS TTL control?",
      [
        "How long a domain registration lasts",
        "How long resolvers cache a record, and therefore how quickly a change takes effect everywhere",
        "The timeout for a DNS query",
        "The maximum number of records",
      ],
      1,
      "Lowering the TTL before a planned change is the standard preparation. Doing it after the change is too late to help.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "What does it mean to say infrastructure should be reproducible, and why does it matter when something fails at 3am?", [
      c("reproducibility", "Explains rebuilding from a definition", 3, ["code", "rebuild", "same", "definition", "terraform"]),
      c("incident", "Connects it to recovery under pressure", 3, ["rebuild", "recover", "no one remembers", "3am", "quickly"]),
      c("drift", "Understands manual changes causing drift", 2, ["drift", "manual", "someone changed", "unknown"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "Explain what a backup is for, and why having one is not the same as being able to restore.", [
      c("purpose", "Names what backups protect against", 3, ["deletion", "corruption", "ransomware", "mistake", "failure"]),
      c("restore", "Distinguishes taking from restoring", 3, ["restore", "tested", "never tried", "how long", "practice"]),
      c("scope", "Considers what is and is not covered", 2, ["what is backed up", "retention", "point in time", "coverage"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What information would you want on a dashboard for a service you had never seen before?", [
      c("symptoms", "Prioritises user-visible symptoms", 3, ["error rate", "latency", "traffic", "availability", "users"]),
      c("saturation", "Includes resource headroom", 2, ["cpu", "memory", "disk", "connections", "queue"]),
      c("clarity", "Wants to tell healthy from unhealthy at a glance", 2, ["normal", "threshold", "baseline", "at a glance"]),
    ]),
    typed("SCENARIO", "BEGINNER", "You are asked to give a new developer access to the production environment on their first day. Write your response.", [
      c("caution", "Does not simply comply", 3, ["why", "need", "not yet", "question", "first day"]),
      c("principle", "Applies least privilege", 3, ["least privilege", "read only", "scoped", "minimum", "specific"]),
      c("process", "Suggests a proper access path", 2, ["request", "approval", "temporary", "audit", "onboarding"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A server's disk is filling at 2GB per day and will be full in three days. Write what you would do, in order.", [
      c("immediate", "Buys time safely", 3, ["what is growing", "du", "largest", "delete", "rotate", "extend"]),
      c("cause", "Finds the cause rather than only clearing space", 3, ["why", "logs", "growing", "cause", "leak"]),
      c("prevention", "Prevents recurrence", 2, ["rotation", "retention", "alert", "monitor"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A deploy needs to happen and the person who normally does it is unavailable. There is no documentation. Write what you would do.", [
      c("caution", "Does not improvise blindly on production", 3, ["not guess", "risk", "ask", "check", "careful"]),
      c("investigation", "Finds evidence of how it is done", 3, ["pipeline", "history", "scripts", "logs", "repository"]),
      c("record", "Documents it afterwards", 2, ["document", "write down", "runbook", "next time"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time you had to follow a process you did not fully understand. How did you handle it?", [
      c("care", "Did not proceed recklessly", 3, ["asked", "checked", "understood first", "careful"]),
      c("curiosity", "Sought to understand it", 2, ["why", "asked", "learned", "read"]),
      c("improvement", "Left it clearer for the next person", 2, ["documented", "note", "improved"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Describe something you set up yourself — a server, a home lab, a pipeline. What broke and what did you learn?", [
      c("initiative", "Built something independently", 3, ["set up", "built", "configured", "my own"]),
      c("failure", "Something genuinely went wrong", 3, ["broke", "failed", "wrong", "stuck"]),
      c("learning", "Extracted a real lesson", 2, ["learned", "now", "realised"]),
    ]),

    // --- JUNIOR -----------------------------------------------------------
    mcq(
      "JUNIOR",
      "Your pod restarts repeatedly with exit code 137. What does that indicate?",
      [
        "A configuration syntax error",
        "The process was killed, almost always by the out-of-memory killer hitting the memory limit",
        "The health check failed",
        "The image could not be pulled",
      ],
      1,
      "137 is 128 + 9, meaning SIGKILL. Either the limit is too low or the application is using more memory than expected.",
    ),
    mcq(
      "JUNIOR",
      "What is the practical difference between a container's resource request and its limit?",
      [
        "They are two names for the same thing",
        "The request is what the scheduler guarantees and places against; the limit is the ceiling before throttling or killing",
        "The request is a maximum and the limit is a minimum",
        "Limits apply only to CPU",
      ],
      1,
      "Requests drive placement, limits drive enforcement. Setting requests far below actual usage is how nodes become overcommitted and unstable.",
    ),
    mcq(
      "JUNIOR",
      "Why should a CI pipeline build an artifact once and promote it through environments?",
      [
        "It is faster",
        "Rebuilding per environment means the thing you tested is not the thing you shipped",
        "It uses less storage",
        "It is required by most CI tools",
      ],
      1,
      "Build once, deploy many. A rebuild can pick up a different dependency version and quietly invalidate every test that passed.",
    ),
    mcq(
      "JUNIOR",
      "A secret was committed to a repository and then removed in a later commit. What must you do?",
      [
        "Nothing, it is no longer in the current code",
        "Rotate the secret, because it remains in the history and in every clone",
        "Force push to remove the commit and consider it resolved",
        "Add it to .gitignore",
      ],
      1,
      "History rewriting does not reach clones, forks or caches. Assume it is compromised and rotate.",
    ),
    mcq(
      "JUNIOR",
      "What does Terraform state actually record, and why does losing it matter?",
      [
        "The Terraform version used",
        "The mapping between your configuration and the real resources, without which Terraform cannot tell what it already owns",
        "A backup of the infrastructure",
        "The order resources were created in",
      ],
      1,
      "Without state, a plan looks like a request to create everything again. This is why state is stored remotely with locking.",
    ),
    mcq(
      "JUNIOR",
      "Your alert fires whenever CPU exceeds 80% for one minute. Why is this a poor alert?",
      [
        "80% is too low a threshold",
        "High CPU is not itself a problem — it alerts on a cause that may have no user impact, producing noise",
        "One minute is too long",
        "CPU cannot be measured reliably",
      ],
      1,
      "Alert on symptoms users feel: errors and latency. Resource metrics belong on dashboards for diagnosis, not in the pager.",
    ),
    spoken("CONCEPTUAL", "JUNIOR", "Explain what happens to existing connections when you deploy a new version behind a load balancer, and how you avoid dropping them.", [
      c("mechanics", "Understands connection draining", 3, ["drain", "in flight", "existing", "finish", "graceful"]),
      c("signals", "Knows the shutdown sequence", 3, ["sigterm", "readiness", "deregister", "stop accepting", "grace period"]),
      c("verification", "Would confirm rather than assume", 2, ["test", "observe", "errors during deploy", "measure"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What is the difference between a metric, a log and a trace, and which would you reach for to answer 'why is this one request slow'?", [
      c("distinction", "Distinguishes the three accurately", 3, ["aggregate", "event", "span", "request", "time series"]),
      c("selection", "Picks tracing for a single slow request", 3, ["trace", "span", "single request", "where time"]),
      c("limits", "Knows what each is bad at", 2, ["cardinality", "volume", "cost", "sampling"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What would you want in place before agreeing to be on call for a system?", [
      c("documentation", "Wants runbooks and architecture context", 3, ["runbook", "documentation", "architecture", "diagram"]),
      c("tooling", "Wants access and observability", 3, ["access", "dashboard", "logs", "alert", "permissions"]),
      c("support", "Wants escalation and a sane rota", 2, ["escalation", "backup", "rota", "who to call"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A cron job on a single server is business-critical and that server is a pet nobody has rebuilt in three years. Write your plan.", [
      c("risk", "Names the single point of failure clearly", 3, ["single point", "cannot rebuild", "unknown", "risk", "bus factor"]),
      c("discovery", "Establishes what is actually on it", 3, ["audit", "what runs", "inventory", "document", "dependencies"]),
      c("migration", "Moves to something reproducible", 2, ["code", "container", "scheduled", "reproducible", "redundant"]),
    ]),
    typed("SCENARIO", "JUNIOR", "Developers say the staging environment is useless because it never matches production. Write how you would address it.", [
      c("gap", "Establishes where they actually differ", 3, ["compare", "difference", "config", "data", "scale"]),
      c("approach", "Uses shared definitions to converge them", 3, ["same code", "iac", "parameterise", "one definition"]),
      c("honesty", "Accepts some differences are unavoidable", 2, ["cannot fully", "cost", "data volume", "trade-off"]),
    ]),
    typed("SCENARIO", "JUNIOR", "Your team's deploys require a manual checklist of 12 steps and mistakes happen. Write your approach to fixing it.", [
      c("automation", "Automates the mechanical steps", 3, ["automate", "script", "pipeline", "one command"]),
      c("sequencing", "Automates the riskiest or most repeated first", 3, ["first", "most error", "riskiest", "incremental"]),
      c("safety", "Keeps verification and rollback", 2, ["verify", "rollback", "check", "abort"]),
    ]),
    typed("CODING", "JUNIOR", "Write a health check endpoint and explain what it should and should not verify. State what a load balancer does with each outcome.", [
      c("scope", "Checks the service itself, not the whole world", 3, ["own", "not dependencies", "shallow", "process"]),
      c("distinction", "Separates liveness from readiness", 3, ["liveness", "readiness", "restart", "traffic"]),
      c("consequence", "Explains the effect of each result", 2, ["remove", "restart", "200", "503", "traffic"]),
    ]),
    typed("CODING", "JUNIOR", "Write a Dockerfile for a compiled application that produces a small, non-root production image. Explain each decision.", [
      c("multistage", "Uses a build stage separate from runtime", 3, ["from", "as build", "multi-stage", "copy --from"]),
      c("security", "Runs as a non-root user", 3, ["user", "non-root", "adduser", "not root"]),
      c("size", "Keeps build tooling out of the final image", 2, ["slim", "alpine", "distroless", "no build tools"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you automated something and it caused a problem you had not anticipated.", [
      c("honesty", "Describes a genuine unintended consequence", 3, ["did not expect", "caused", "broke", "surprise"]),
      c("response", "Contained it and learned", 3, ["fixed", "reverted", "added a check", "learned"]),
      c("caution", "Now considers blast radius", 2, ["blast radius", "dry run", "limit", "test first"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Describe a time you had to explain an infrastructure problem to someone non-technical. How did you approach it?", [
      c("translation", "Avoided jargon", 3, ["analogy", "plain", "simple", "without"]),
      c("relevance", "Focused on impact rather than mechanism", 3, ["impact", "what it means", "how long", "affects"]),
      c("check", "Confirmed understanding", 2, ["asked", "understood", "questions"]),
    ]),

    // --- MID --------------------------------------------------------------
    mcq(
      "MID",
      "Your liveness probe checks that the database is reachable. The database briefly fails. What happens?",
      [
        "The service correctly stops receiving traffic",
        "Every replica is killed and restarted simultaneously, turning a brief dependency blip into an outage",
        "Only the affected pod restarts",
        "Nothing, liveness probes do not restart pods",
      ],
      1,
      "Liveness answers 'is this process wedged'. Dependency health belongs in readiness, which removes traffic without destroying the process.",
    ),
    mcq(
      "MID",
      "Autoscaling is driven by CPU but the real bottleneck is database connections. What is the consequence?",
      [
        "The system scales correctly anyway",
        "Scaling out adds instances that each open connections, exhausting the database faster",
        "CPU will eventually reflect the bottleneck",
        "Autoscaling will refuse to act",
      ],
      1,
      "Scaling on the wrong signal actively worsens the real constraint. This is a common way an autoscaler amplifies an incident.",
    ),
    mcq(
      "MID",
      "What is the main operational risk of a shared Kubernetes cluster with no resource limits?",
      [
        "Slower scheduling",
        "One workload can consume node resources and destabilise unrelated workloads",
        "Higher cloud costs only",
        "Images cannot be cached",
      ],
      1,
      "Without limits there is no isolation. A memory leak in one team's service evicts another team's pods.",
    ),
    mcq(
      "MID",
      "Which best describes the purpose of a canary deployment?",
      [
        "To deploy to a copy of production for testing",
        "To expose a small fraction of real traffic to the new version and compare its behaviour before proceeding",
        "To deploy at a quieter time of day",
        "To keep the previous version running indefinitely",
      ],
      1,
      "The value is in the comparison against real traffic. A canary with no automated metric comparison is just a slow rollout.",
    ),
    mcq(
      "MID",
      "You have alerts on CPU, memory and disk, but users report failures you never see. What is the fix?",
      [
        "Lower the thresholds",
        "Alert on user-facing symptoms — error rate and latency against an objective — rather than only on resources",
        "Add more resource metrics",
        "Increase alert frequency",
      ],
      1,
      "Resource alerts miss anything that fails without saturating a machine: a bad deploy, a dependency, a bug. Symptom alerts catch all of them.",
    ),
    mcq(
      "MID",
      "What does an infrastructure plan showing unexpected changes usually indicate?",
      [
        "A bug in the tool",
        "Configuration drift — someone changed the live resource outside the code",
        "The state file is corrupt",
        "A new provider version is required",
      ],
      1,
      "Applying blindly then reverts someone's emergency fix. Understand the drift before deciding which side is right.",
    ),
    mcq(
      "MID",
      "Which is the strongest reason to run your own database rather than a managed service?",
      [
        "It is always cheaper",
        "A specific requirement the managed offering cannot meet, and the team has the expertise to operate it",
        "It gives better performance",
        "It avoids vendor lock-in",
      ],
      1,
      "Backups, patching, failover and on-call are the real cost. Only a concrete unmet requirement plus genuine capability justifies taking them on.",
    ),
    spoken("CONCEPTUAL", "MID", "Explain what a service level objective is and how it changes the way a team makes decisions.", [
      c("definition", "Defines it as a measurable reliability target", 3, ["target", "measure", "percentage", "window", "indicator"]),
      c("budget", "Explains the error budget consequence", 3, ["error budget", "spend", "freeze", "risk", "remaining"]),
      c("realism", "Rejects an unexamined 100%", 2, ["not 100", "cost", "diminishing", "enough"]),
    ]),
    spoken("CONCEPTUAL", "MID", "How do you reduce the blast radius of a change to a system that many teams depend on?", [
      c("staging", "Rolls out progressively", 3, ["canary", "percentage", "region", "gradual", "cohort"]),
      c("reversibility", "Keeps the change reversible", 3, ["rollback", "flag", "revert", "toggle", "backward compatible"]),
      c("detection", "Detects harm quickly enough to matter", 2, ["monitor", "automated", "abort", "alert", "compare"]),
    ]),
    spoken("CONCEPTUAL", "MID", "Explain how you think about secrets management across build, deploy and runtime.", [
      c("storage", "Uses a real secret store", 3, ["secret manager", "vault", "kms", "not in code", "encrypted"]),
      c("access", "Scopes and rotates access", 3, ["least privilege", "rotate", "short lived", "per environment", "audit"]),
      c("leakage", "Considers where secrets escape", 2, ["logs", "environment", "image", "ci output", "exposed"]),
    ]),
    spoken("CONCEPTUAL", "MID", "What is the difference between high availability and disaster recovery, and what does each cost?", [
      c("distinction", "Distinguishes ongoing redundancy from recovery", 3, ["redundant", "failover", "restore", "region", "recover"]),
      c("objectives", "Uses recovery objectives", 3, ["rto", "rpo", "how long", "data loss", "target"]),
      c("cost", "Prices the difference honestly", 2, ["cost", "double", "expensive", "trade-off"]),
    ]),
    typed("SCENARIO", "MID", "An incident is ongoing, the cause is unknown, and three people are making changes at once. Write how you would take control.", [
      c("coordination", "Establishes a single coordinator", 3, ["incident commander", "one person", "coordinate", "stop", "roles"]),
      c("discipline", "Stops uncoordinated changes", 3, ["one change", "announce", "record", "no simultaneous"]),
      c("communication", "Keeps stakeholders informed separately", 2, ["comms", "updates", "status", "separate person"]),
    ]),
    typed("SCENARIO", "MID", "You inherit a cloud account with a bill that has doubled and no tagging. Write your approach to understanding and reducing it.", [
      c("attribution", "Establishes where money goes first", 3, ["cost explorer", "breakdown", "tag", "by service", "largest"]),
      c("waste", "Targets obvious waste before architecture", 3, ["idle", "unattached", "old snapshots", "oversized", "unused"]),
      c("governance", "Prevents it recurring", 2, ["tagging policy", "budget", "alert", "review"]),
    ]),
    typed("SCENARIO", "MID", "A team wants to run a stateful database inside your Kubernetes cluster. Write your assessment.", [
      c("concerns", "Names storage, failover and upgrade concerns", 3, ["persistent volume", "failover", "backup", "upgrade", "state"]),
      c("alternatives", "Compares with a managed offering", 3, ["managed", "rds", "operator", "compare", "why"]),
      c("conditions", "States what would make it acceptable", 2, ["if", "operator", "expertise", "backup tested", "conditions"]),
    ]),
    typed("SCENARIO", "MID", "Your CI pipeline is flaky: roughly one in eight runs fails for reasons unrelated to the change. Write your plan.", [
      c("measurement", "Quantifies and categorises the flakiness", 3, ["measure", "categorise", "which tests", "rate", "track"]),
      c("cause", "Attacks causes rather than adding retries", 3, ["shared state", "timing", "ordering", "resource", "not just retry"]),
      c("culture", "Recognises the cost of tolerated flakiness", 2, ["ignored", "trust", "rerun habit", "quarantine"]),
    ]),
    typed("CODING", "MID", "Write a deployment pipeline definition that builds once, runs tests, deploys to staging, waits for a check, then promotes the same artifact to production.", [
      c("artifact", "Promotes one immutable artifact", 3, ["build once", "same image", "digest", "promote", "tag"]),
      c("gates", "Includes verification between stages", 3, ["test", "approval", "smoke", "gate", "wait"]),
      c("rollback", "Can reverse a bad promotion", 2, ["rollback", "previous", "revert", "keep"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Tell me about a postmortem you ran or contributed to. What made it useful or useless?", [
      c("blameless", "Focused on system causes", 3, ["blameless", "system", "not person", "why"]),
      c("depth", "Went beyond the proximate cause", 3, ["five whys", "underlying", "deeper", "contributing"]),
      c("followthrough", "Actions were actually completed", 2, ["actions", "owner", "tracked", "completed", "did not"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Describe a time you refused to deploy something. What was the reasoning and what happened?", [
      c("judgement", "Had a defensible reason", 3, ["risk", "untested", "friday", "no rollback", "incident"]),
      c("communication", "Explained rather than blocked silently", 3, ["explained", "offered", "when", "conditions"]),
      c("outcome", "Reports the result honestly", 2, ["deployed later", "overruled", "agreed", "outcome"]),
    ]),

    // --- SENIOR -----------------------------------------------------------
    mcq(
      "SENIOR",
      "You must choose between multi-region active-active and active-passive. Which consideration matters most?",
      [
        "Cost of the second region",
        "Whether your data layer can tolerate concurrent writes in two places, and whether the business needs sub-minute failover",
        "Which region has lower latency",
        "The cloud provider's recommendation",
      ],
      1,
      "Active-active is a data problem before it is an infrastructure one. Without a write model that tolerates it, you get conflicts rather than resilience.",
    ),
    mcq(
      "SENIOR",
      "What is the most common reason a disaster recovery plan fails when actually used?",
      [
        "The backup data was corrupt",
        "It had never been exercised end to end, so undocumented dependencies and access gaps surface under pressure",
        "The recovery region was unavailable",
        "The team was too small",
      ],
      1,
      "Plans that are never rehearsed are hypotheses. The gaps are almost always credentials, DNS, and dependencies nobody listed.",
    ),
    mcq(
      "SENIOR",
      "Which is the strongest argument for a platform team providing an opinionated deployment path?",
      [
        "It gives the platform team control",
        "It removes repeated undifferentiated decisions from every team and makes good defaults automatic",
        "It reduces cloud spend",
        "It is required for compliance",
      ],
      1,
      "The value is in eliminating repeated low-value choices and encoding security and observability by default. Control as a goal produces a bottleneck.",
    ),
    spoken("CONCEPTUAL", "SENIOR", "How would you design an on-call rotation that is sustainable rather than merely staffed?", [
      c("load", "Treats alert volume as the primary lever", 3, ["alert volume", "actionable", "noise", "reduce", "pages per shift"]),
      c("fairness", "Considers rota size and compensation", 3, ["rota size", "frequency", "compensation", "time off", "handover"]),
      c("feedback", "Feeds operational pain back into priorities", 2, ["backlog", "fix", "priority", "toil", "budget"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "Explain how you would approach securing a cloud environment that grew without any security review.", [
      c("assessment", "Establishes exposure first", 3, ["public", "internet facing", "iam", "audit", "inventory"]),
      c("priority", "Fixes by real risk", 3, ["credentials", "public bucket", "over-permissive", "first", "highest"]),
      c("sustainability", "Prevents regression", 2, ["policy as code", "guardrail", "scc", "scan", "continuous"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "What is your view on Kubernetes for an organisation with 15 engineers and 6 services?", [
      c("scepticism", "Questions whether the complexity is warranted", 3, ["overkill", "complexity", "operational", "do you need", "simpler"]),
      c("alternatives", "Names simpler options", 3, ["managed", "ecs", "app service", "serverless", "vm"]),
      c("conditions", "States when it would be right", 2, ["if", "when", "growth", "already", "expertise"]),
    ]),
    typed("SCENARIO", "SENIOR", "A cloud provider region your product depends on has been degraded for two hours with no ETA. Write your decision process.", [
      c("assessment", "Establishes actual impact quickly", 3, ["what is affected", "impact", "users", "measure", "scope"]),
      c("options", "Weighs failover against waiting", 3, ["failover", "risk of failing over", "data", "wait", "partial"]),
      c("communication", "Manages stakeholders and customers", 2, ["status page", "customers", "internal", "updates"]),
    ]),
    typed("SCENARIO", "SENIOR", "Your organisation must reduce cloud spend by 30% in one quarter without reducing reliability. Write your plan.", [
      c("attribution", "Starts from where the money is", 3, ["breakdown", "largest", "attribute", "measure", "top"]),
      c("levers", "Uses commitment, rightsizing and waste in order", 3, ["rightsize", "reserved", "savings plan", "idle", "retention", "tier"]),
      c("protection", "Protects reliability explicitly", 2, ["headroom", "load test", "gradual", "monitor", "not below"]),
    ]),
    typed("SCENARIO", "SENIOR", "Compliance requires that no engineer can access customer data in production, but engineers must still debug production issues. Write how you would satisfy both.", [
      c("mechanism", "Proposes access without raw data exposure", 3, ["redact", "masked", "logs without pii", "aggregate", "synthetic"]),
      c("break-glass", "Provides an audited emergency path", 3, ["break glass", "approval", "time limited", "audited", "justification"]),
      c("observability", "Invests in debugging without data access", 2, ["tracing", "metrics", "reproduce", "staging", "correlation id"]),
    ]),
    typed("CODING", "SENIOR", "Write the sequence for a zero-downtime migration of a service from one cluster to another, including DNS, state, and rollback at each step.", [
      c("sequence", "Orders the steps so each is reversible", 3, ["parallel", "both running", "shift", "percentage", "step"]),
      c("traffic", "Handles DNS and connection draining realistically", 3, ["ttl", "weighted", "drain", "dns", "gradual"]),
      c("rollback", "Can retreat at every stage", 2, ["rollback", "revert", "keep old", "until"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about a time you reduced operational toil substantially. How did you identify it and what did you change?", [
      c("identification", "Measured toil rather than guessing", 3, ["measured", "tracked", "hours", "frequency", "tickets"]),
      c("solution", "Eliminated rather than merely automated", 3, ["removed", "root cause", "self-serve", "automated", "no longer needed"]),
      c("result", "Quantifies the outcome", 2, ["hours saved", "from", "to", "reduced by"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Describe a time you had to push an organisation to take reliability seriously before an incident forced it.", [
      c("case", "Made the case without a crisis", 3, ["before", "proactive", "risk", "data", "argued"]),
      c("evidence", "Used near misses or measurements", 3, ["near miss", "measured", "trend", "example", "showed"]),
      c("persistence", "Kept at it", 2, ["repeatedly", "eventually", "over time", "persisted"]),
    ]),

    // --- STAFF ------------------------------------------------------------
    mcq(
      "STAFF",
      "What is the clearest sign an internal platform is imposing more cost than it removes?",
      [
        "Teams file support tickets",
        "Teams build parallel deployment paths to avoid it",
        "The platform team is small",
        "Onboarding takes a day",
      ],
      1,
      "Avoidance is the decisive signal. Tickets mean it is being used; parallel paths mean it is not worth using.",
    ),
    mcq(
      "STAFF",
      "You must set a multi-cloud strategy. Which reasoning is soundest?",
      [
        "Multi-cloud avoids lock-in and should be the default",
        "Genuine multi-cloud doubles operational surface, so it needs a specific driver such as a regulatory or customer requirement",
        "Multi-cloud is cheaper through competition",
        "It is required for high availability",
      ],
      1,
      "Abstracting to the lowest common denominator forfeits the managed services that make a single cloud productive. The cost is real and immediate; the lock-in benefit is usually theoretical.",
    ),
    mcq(
      "STAFF",
      "Which metric best indicates an engineering organisation's delivery health?",
      [
        "Number of deploys per engineer",
        "Lead time from commit to production, alongside change failure rate",
        "Uptime percentage",
        "Infrastructure cost per service",
      ],
      1,
      "Speed without a failure-rate counterweight rewards recklessness. The pair together describes whether the organisation can change safely.",
    ),
    spoken("CONCEPTUAL", "STAFF", "How do you decide what an infrastructure platform should own versus what product teams should own?", [
      c("principle", "Has a coherent dividing principle", 3, ["undifferentiated", "shared", "commodity", "product specific", "boundary"]),
      c("autonomy", "Preserves team ability to move", 3, ["autonomy", "not blocked", "self serve", "escape hatch"]),
      c("evolution", "Expects the line to move over time", 2, ["evolve", "revisit", "as we", "change"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "What is your approach to reliability when the business genuinely cannot afford the ideal architecture?", [
      c("pragmatism", "Accepts constraints without giving up", 3, ["cheapest", "biggest risk", "what we can", "pragmatic"]),
      c("transparency", "Makes the accepted risk explicit", 3, ["explicit", "documented", "accepted", "leadership knows", "risk register"]),
      c("sequencing", "Buys the most reliability per pound", 2, ["highest value", "first", "cheap wins", "backup"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How would you build an engineering organisation's capability to operate what it builds?", [
      c("ownership", "Puts teams on call for their own services", 3, ["you build it", "on call", "own", "accountable"]),
      c("enablement", "Gives them the tools to succeed", 3, ["training", "runbook", "observability", "platform", "support"]),
      c("transition", "Sequences the change humanely", 2, ["gradual", "shadow", "support", "not overnight"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How do you evaluate whether to adopt a major new infrastructure technology across an organisation?", [
      c("problem", "Starts from a problem, not the technology", 3, ["what problem", "why", "need", "current pain"]),
      c("trial", "Proves it on something real and bounded", 3, ["pilot", "one team", "bounded", "evaluate", "criteria"]),
      c("commitment", "Counts the cost of half-adoption", 2, ["two ways", "half", "commit", "migrate fully", "worst of both"]),
    ]),
    typed("SCENARIO", "STAFF", "A major outage cost the company significant revenue and the board wants to know it cannot happen again. Write your response.", [
      c("honesty", "Refuses to promise the impossible", 3, ["cannot guarantee", "reduce", "honest", "likelihood", "never say never"]),
      c("specificity", "Names concrete mitigations for this cause", 3, ["specific", "this cause", "detect", "contain", "recover"]),
      c("systemic", "Addresses classes of failure, not just this one", 2, ["class", "similar", "elsewhere", "audit", "pattern"]),
    ]),
    typed("SCENARIO", "STAFF", "Your organisation has 200 microservices and adding a feature routinely requires changes to eight of them. Write your assessment.", [
      c("diagnosis", "Identifies wrong boundaries rather than too many services", 3, ["boundary", "coupling", "wrong seam", "distributed monolith"]),
      c("remedy", "Considers consolidation as a legitimate answer", 3, ["merge", "consolidate", "fewer", "redraw", "combine"]),
      c("evidence", "Uses change-coupling data", 2, ["which change together", "data", "measure", "history"]),
    ]),
    typed("SCENARIO", "STAFF", "You must migrate from a data centre to cloud within 18 months while the business ships features. Write your programme.", [
      c("sequencing", "Sequences by risk and dependency", 3, ["first", "low risk", "dependency", "order", "wave"]),
      c("coexistence", "Handles the hybrid period explicitly", 3, ["hybrid", "connectivity", "latency", "both", "during"]),
      c("delivery", "Protects ongoing feature work", 2, ["still ship", "capacity", "parallel", "team split"]),
    ]),
    typed("SCENARIO", "STAFF", "A security audit finds 400 findings across your infrastructure with 30 rated critical. Write your response plan.", [
      c("triage", "Distinguishes exploitable from theoretical", 3, ["exploitable", "exposed", "reachable", "context", "triage"]),
      c("execution", "Sequences by real risk with owners", 3, ["owner", "deadline", "first", "track", "priority"]),
      c("systemic", "Prevents the same classes recurring", 2, ["policy as code", "guardrail", "prevent", "class", "scan"]),
    ]),
    typed("SCENARIO", "STAFF", "Leadership proposes outsourcing all infrastructure operations to cut costs. Write your assessment.", [
      c("analysis", "Separates what can and cannot be outsourced", 3, ["commodity", "context", "product specific", "which parts", "knowledge"]),
      c("cost", "Counts coordination and knowledge loss", 3, ["hidden cost", "context", "handover", "slower", "knowledge"]),
      c("position", "Reaches a clear recommendation", 2, ["recommend", "some", "not", "conditions"]),
    ]),
    typed("CODING", "STAFF", "Define the interface and guarantees of a company-wide deployment platform: what every team gets by default, what they can override, and what they cannot. Justify the constraints.", [
      c("defaults", "Makes safe behaviour automatic", 3, ["default", "automatic", "built in", "observability", "rollback"]),
      c("flexibility", "Allows justified deviation", 3, ["override", "escape hatch", "opt out", "justify"]),
      c("nonnegotiable", "Names what cannot be bypassed and why", 3, ["cannot", "mandatory", "audit", "security", "compliance"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Tell me about a time you had to accept a reliability risk you were uncomfortable with. How did you handle it?", [
      c("clarity", "Made the risk explicit to decision makers", 3, ["documented", "told", "explicit", "understood", "wrote"]),
      c("mitigation", "Reduced what could be reduced", 3, ["mitigated", "monitoring", "limited", "contained", "prepared"]),
      c("acceptance", "Accepted the business decision professionally", 2, ["their call", "accepted", "moved on", "committed"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Describe how you have changed an organisation's relationship with failure. What is different now?", [
      c("culture", "Names a concrete cultural shift", 3, ["blameless", "postmortem", "safe to", "report", "learn"]),
      c("mechanism", "Used structure, not just words", 3, ["process", "template", "review", "time allocated", "modelled"]),
      c("evidence", "Can point to observable change", 2, ["people now", "more incidents reported", "faster", "measured"]),
    ]),
  ],
};
