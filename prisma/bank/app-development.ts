import type { BankDomain } from "../question-bank";
import { c, mcq, spoken, typed } from "./authoring";

/**
 * App Development (Mobile) — depth tranche.
 *
 * Mobile's distinguishing constraints drive the content: the OS can kill you at
 * any moment, the network is unreliable, the device is shared and personal, and
 * a bad release cannot simply be rolled back.
 */
export const APP_DEV_DEPTH: BankDomain = {
  slug: "app-development",
  name: "App Development (Mobile)",
  blurb: "Builds mobile applications for phones and tablets.",
  questions: [
    // --- BEGINNER ---------------------------------------------------------
    mcq(
      "BEGINNER",
      "Why should an app show something on screen before its data has loaded?",
      [
        "It reduces network usage",
        "A blank screen gives the user no signal that anything is happening, and feels broken",
        "It is required by app stores",
        "It makes the request faster",
      ],
      1,
      "Perceived responsiveness is what users judge. A skeleton or spinner within a moment of the tap changes the experience even though the data arrives at the same time.",
    ),
    mcq(
      "BEGINNER",
      "What is the risk of hard-coding a screen's layout in fixed pixel sizes?",
      [
        "It uses more memory",
        "It breaks across the wide range of screen sizes, densities and system font sizes users actually have",
        "It is slower to render",
        "It prevents dark mode",
      ],
      1,
      "Users who have increased their system font size are a large group, and a fixed-height row clips their text entirely.",
    ),
    mcq(
      "BEGINNER",
      "When should an app request a permission such as camera access?",
      [
        "On first launch, so everything is granted upfront",
        "At the moment the feature needing it is used, with context explaining why",
        "During installation",
        "Only after the user complains",
      ],
      1,
      "Asking upfront without context produces refusals that are hard to recover from. Asking in context, at the point of obvious need, is both more respectful and more effective.",
    ),
    mcq(
      "BEGINNER",
      "Your app makes an API call every time the user scrolls to the bottom of a list. What must you guard against?",
      [
        "The list becoming too long",
        "Firing the same request repeatedly while one is already in flight",
        "The API changing its response format",
        "The user scrolling upwards",
      ],
      1,
      "Scroll events fire continuously, so without a guard the app issues many duplicate requests and may append the same page several times.",
    ),
    mcq(
      "BEGINNER",
      "What is the correct way to handle a failed network request in a mobile app?",
      [
        "Retry silently forever",
        "Tell the user what happened and offer a way to retry, distinguishing offline from server error",
        "Close the screen",
        "Show the raw error message",
      ],
      1,
      "The user needs to know whether to check their connection or wait. A raw error tells them nothing and an infinite silent retry drains their battery.",
    ),
    mcq(
      "BEGINNER",
      "Why is it important to release resources such as listeners and observers when a screen is destroyed?",
      [
        "It makes the app smaller",
        "Otherwise they keep references alive, leaking memory and sometimes updating destroyed views",
        "It is required to publish to the store",
        "It speeds up navigation",
      ],
      1,
      "Leaked observers are a common source of crashes that only appear after a user navigates back and forth several times.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "What is the difference between an app being closed by the user and being killed by the operating system?", [
      c("mechanism", "Knows the OS reclaims memory from background apps", 3, ["background", "memory", "reclaim", "killed", "os decides"]),
      c("state", "Understands unsaved state is lost", 3, ["state", "lost", "restore", "save", "unsaved"]),
      c("handling", "Knows the app should restore gracefully", 2, ["restore", "where they left", "save", "persist"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "Why does a mobile app need to think about battery, when a website mostly does not?", [
      c("causes", "Names real battery consumers", 3, ["location", "gps", "network", "wake", "background", "polling"]),
      c("consequence", "Knows users uninstall over battery", 2, ["uninstall", "complain", "review", "blame"]),
      c("mitigation", "Names how to reduce drain", 2, ["batch", "less often", "stop when background", "efficient"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What makes testing a mobile app harder than testing a website?", [
      c("fragmentation", "Names device and OS variety", 3, ["devices", "os version", "screen size", "manufacturer", "fragmentation"]),
      c("conditions", "Names real-world conditions", 3, ["network", "offline", "interruption", "call", "battery", "permission"]),
      c("distribution", "Knows fixes cannot ship instantly", 2, ["store", "review", "update", "cannot rollback", "days"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A user says the app 'is slow' but you cannot reproduce it. Write how you would turn that into something actionable.", [
      c("specifics", "Pins down where and when", 3, ["which screen", "when", "always", "device", "steps"]),
      c("environment", "Considers device and network", 3, ["device", "os version", "connection", "wifi", "old phone"]),
      c("measurement", "Proposes measuring rather than guessing", 2, ["instrument", "timing", "profile", "log", "measure"]),
    ]),
    typed("SCENARIO", "BEGINNER", "Your app needs to show a list of items that the user can also use offline. Write what you would do.", [
      c("storage", "Persists the data locally", 3, ["local", "database", "cache", "store", "disk"]),
      c("freshness", "Handles stale data honestly", 3, ["stale", "last updated", "refresh", "sync", "when online"]),
      c("feedback", "Tells the user they are offline", 2, ["offline indicator", "banner", "message", "aware"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A tester reports the app crashes when they rotate the screen while a form is filled in. Write what you would investigate.", [
      c("cause", "Knows rotation can recreate the screen", 3, ["recreate", "destroy", "configuration change", "rebuild"]),
      c("state", "Identifies state not being preserved", 3, ["state", "saved", "restore", "lost", "instance state"]),
      c("verification", "Would test the fix on a real device", 2, ["test", "device", "rotate", "confirm"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about an app you use daily that frustrates you. What exactly is wrong and how would you fix it?", [
      c("specificity", "Names a concrete problem, not a vague dislike", 3, ["specific", "when i", "every time", "screen"]),
      c("diagnosis", "Reasons about why it might be that way", 2, ["probably", "because", "maybe they"]),
      c("solution", "Proposes something realistic", 2, ["would", "instead", "could"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Describe something you built for a phone. What did you discover that surprised you?", [
      c("experience", "Describes real hands-on work", 3, ["built", "made", "app", "screen"]),
      c("surprise", "Names a genuine mobile-specific surprise", 3, ["did not expect", "surprised", "harder", "different"]),
      c("learning", "Took something forward", 2, ["learned", "now", "since"]),
    ]),

    // --- JUNIOR -----------------------------------------------------------
    mcq(
      "JUNIOR",
      "What does 'optimistic UI' mean and what is its main risk?",
      [
        "Showing a loading spinner immediately; the risk is a slow network",
        "Updating the interface as if the action succeeded before the server confirms; the risk is having to undo it visibly if it fails",
        "Preloading the next screen; the risk is memory use",
        "Caching responses; the risk is stale data",
      ],
      1,
      "It makes an app feel instant, but the rollback must be designed. Silently reverting a user's action is worse than a brief wait.",
    ),
    mcq(
      "JUNIOR",
      "Your list stutters while scrolling through 500 items with images. What is the most likely cause?",
      [
        "The list has too many items",
        "Work on the main thread per row — decoding full-size images or laying out complex views without recycling",
        "The images are too small",
        "The device is too old",
      ],
      1,
      "Frames must be produced in about 16ms. Decoding a large image or inflating a complex view synchronously blows that budget every row.",
    ),
    mcq(
      "JUNIOR",
      "Why is a deep link a security consideration, not just navigation?",
      [
        "Deep links are slow",
        "They are an externally callable entry point, so another app can invoke a screen with attacker-controlled parameters",
        "They require internet access",
        "They break the back stack",
      ],
      1,
      "A deep link that opens a screen assuming the user is authenticated, or that trusts an id parameter, is an exposed API without validation.",
    ),
    mcq(
      "JUNIOR",
      "Users on poor networks are creating duplicate orders. Each tap on 'Pay' sends a request. What is the correct fix?",
      [
        "Disable the button after the first tap",
        "Disable the button and send an idempotency key so a retried request cannot create a second order",
        "Add a confirmation dialog",
        "Increase the request timeout",
      ],
      1,
      "Disabling alone loses to a retry or an app restart. The server must be able to recognise the repeat.",
    ),
    mcq(
      "JUNIOR",
      "Where should a user's authentication token be stored on a device?",
      [
        "In plain application preferences",
        "In the platform's secure storage — Keychain or Keystore-backed storage",
        "In a file in the app's documents directory",
        "In memory only, requiring login on every launch",
      ],
      1,
      "Secure storage is hardware-backed and protected from other apps and from backups. Plain preferences are readable on a compromised device.",
    ),
    mcq(
      "JUNIOR",
      "What is the practical consequence of not handling the case where a permission is permanently denied?",
      [
        "The app crashes",
        "The permission request no longer shows a dialog, so the feature appears silently broken with no path to recovery",
        "The OS uninstalls the app",
        "The permission is granted automatically",
      ],
      1,
      "After a permanent denial the system stops prompting. The app must detect it and direct the user to settings, or the feature is simply dead.",
    ),
    spoken("CONCEPTUAL", "JUNIOR", "Explain what happens between a user tapping a button and a new screen appearing, and where time can be lost.", [
      c("pipeline", "Describes the sequence of work", 3, ["handler", "navigate", "layout", "render", "frame"]),
      c("blocking", "Identifies main-thread work as the danger", 3, ["main thread", "blocking", "synchronous", "jank", "16ms"]),
      c("data", "Considers waiting on data", 2, ["network", "database", "load", "await"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "How would you decide what an app should do the very first time a new user opens it?", [
      c("value", "Gets the user to value quickly", 3, ["value", "quickly", "not long", "purpose", "why"]),
      c("restraint", "Avoids demanding everything upfront", 3, ["not all permissions", "later", "defer", "skip", "no wall"]),
      c("orientation", "Orients without a lecture", 2, ["brief", "show", "in context", "few screens"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What is the difference between caching for speed and storing for offline use?", [
      c("purpose", "Distinguishes the two intents", 3, ["speed", "offline", "available", "temporary", "durable"]),
      c("lifetime", "Understands eviction versus persistence", 3, ["evicted", "cleared", "persist", "guaranteed", "ttl"]),
      c("design", "Designs differently for each", 2, ["sync", "conflict", "queue", "explicit"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "Why does an app need to handle being interrupted — a call, a notification, the user switching away — and what should it do?", [
      c("lifecycle", "Knows the app can be paused or killed", 3, ["background", "pause", "killed", "lifecycle", "resume"]),
      c("state", "Preserves user progress", 3, ["save", "restore", "draft", "progress", "not lose"]),
      c("resources", "Releases what should not run in background", 2, ["stop", "release", "camera", "location", "timer"]),
    ]),
    typed("SCENARIO", "JUNIOR", "Your app must show a list that could contain five items or fifty thousand. Write how you would build it.", [
      c("recycling", "Renders only what is visible", 3, ["recycle", "virtualise", "lazy", "visible", "windowing"]),
      c("paging", "Loads incrementally from the server", 3, ["page", "cursor", "load more", "incremental", "chunk"]),
      c("states", "Handles empty, loading, error and end", 2, ["empty", "loading", "error", "end of list"]),
    ]),
    typed("SCENARIO", "JUNIOR", "Your app was rejected by the store for requesting a permission it does not visibly use. Write your response.", [
      c("audit", "Establishes why the permission is declared", 3, ["why", "which library", "audit", "check", "sdk"]),
      c("removal", "Removes it if genuinely unused", 3, ["remove", "not needed", "drop", "unnecessary"]),
      c("justification", "Justifies it clearly if genuinely needed", 2, ["explain", "justify", "in context", "resubmit"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A user reports that the app logs them out every few days and they find it infuriating. Write how you would investigate.", [
      c("mechanism", "Examines token lifetime and refresh", 3, ["token", "expiry", "refresh", "session", "lifetime"]),
      c("storage", "Checks whether storage is being cleared", 3, ["keychain", "cleared", "backup", "reinstall", "storage"]),
      c("balance", "Weighs security against friction", 2, ["security", "convenience", "trade-off", "biometric"]),
    ]),
    typed("CODING", "JUNIOR", "Write the logic for a screen that loads data, showing distinct states for loading, empty, error and success, and allowing retry. Describe the state model.", [
      c("states", "Models the states explicitly rather than with booleans", 3, ["sealed", "enum", "state", "loading", "error", "success"]),
      c("empty", "Distinguishes empty from error", 3, ["empty", "no results", "different", "not error"]),
      c("retry", "Provides a working retry path", 2, ["retry", "reload", "button", "again"]),
    ]),
    typed("CODING", "JUNIOR", "Write a function that caches API responses on disk with a time-to-live and returns cached data immediately while refreshing in the background.", [
      c("staleness", "Returns cached data then updates", 3, ["return cached", "then", "refresh", "background", "stale while"]),
      c("expiry", "Respects a TTL", 3, ["ttl", "timestamp", "expired", "age"]),
      c("failure", "Falls back to cache when the network fails", 2, ["offline", "fallback", "keep cached", "error"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a bug that only appeared on one type of device. How did you track it down?", [
      c("method", "Narrowed systematically", 3, ["which devices", "os version", "narrowed", "pattern", "logs"]),
      c("access", "Got access to the failing condition", 3, ["borrowed", "emulator", "farm", "user logs", "crash report"]),
      c("outcome", "Found and confirmed the cause", 2, ["was", "because", "fixed", "confirmed"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Describe a time you had to cut a feature to ship an app on time. How did you decide what to cut?", [
      c("criteria", "Cut by user value", 3, ["core", "value", "most used", "essential", "nice to have"]),
      c("communication", "Agreed it rather than deciding alone", 3, ["discussed", "product", "agreed", "told"]),
      c("outcome", "Reflects on whether it was right", 2, ["right call", "later added", "nobody missed", "should have"]),
    ]),

    // --- MID --------------------------------------------------------------
    mcq(
      "MID",
      "Your crash rate jumps from 0.2% to 3% after a release, concentrated on one OS version. What is the first thing to establish?",
      [
        "Which developer wrote the change",
        "The stack trace and the specific device and OS conditions the crashes share",
        "Whether to roll back the entire release",
        "Whether users have updated",
      ],
      1,
      "The shared conditions point at the cause far faster than reading the diff. Staged rollout should then be halted while you investigate.",
    ),
    mcq(
      "MID",
      "A background sync runs every 15 minutes and users report heavy battery drain. What is the soundest change?",
      [
        "Reduce the interval to every 30 minutes",
        "Use the platform's deferrable background scheduling so the OS batches the work with other wakeups",
        "Move the sync to a separate process",
        "Only sync when the app is in the foreground",
      ],
      1,
      "Each independent wakeup costs radio and CPU startup. Letting the OS coalesce the work is far cheaper than any fixed interval you pick yourself.",
    ),
    mcq(
      "MID",
      "Which is the strongest reason to keep business logic out of view controllers or activities?",
      [
        "It reduces file size",
        "Those classes are owned by the OS lifecycle and are hard to test, so logic there cannot be verified cheaply",
        "It is required by the platform",
        "It improves rendering performance",
      ],
      1,
      "Lifecycle-owned classes need a device or heavy harness to instantiate. Logic extracted from them is testable in milliseconds.",
    ),
    mcq(
      "MID",
      "Your app must work in a country with expensive, intermittent mobile data. Which change matters most?",
      [
        "Reducing the app's install size",
        "Minimising and batching network use, caching aggressively, and making every screen usable from cache",
        "Adding a dark theme to save battery",
        "Supporting older OS versions",
      ],
      1,
      "Install size matters once; data cost recurs every session. Designing for cache-first is what makes the app usable at all.",
    ),
    mcq(
      "MID",
      "What is the main correctness risk when syncing offline changes back to a server?",
      [
        "The requests are slow",
        "Conflicting edits made on the device and the server, with no defined rule for which wins",
        "The device runs out of storage",
        "The user closes the app",
      ],
      1,
      "Without an explicit conflict policy, last-write-wins silently discards someone's work. The rule must be a product decision, not an accident.",
    ),
    mcq(
      "MID",
      "Why is a staged rollout more valuable for mobile than for a web application?",
      [
        "Mobile users are more tolerant",
        "You cannot instantly roll back an installed app, so limiting exposure is the main available control",
        "App stores require it",
        "Mobile releases are less tested",
      ],
      1,
      "On the web you redeploy in minutes. On mobile the bad version stays on devices, so exposure control and remote flags carry the weight.",
    ),
    spoken("CONCEPTUAL", "MID", "Explain how you decide between one cross-platform app and two native apps.", [
      c("criteria", "Uses concrete criteria", 3, ["team", "platform features", "performance", "budget", "ui fidelity"]),
      c("honesty", "Acknowledges cross-platform costs", 3, ["bridge", "native module", "lag behind", "debugging", "still need native"]),
      c("context", "Ties it to the specific product", 2, ["depends", "this product", "our team", "roadmap"]),
    ]),
    spoken("CONCEPTUAL", "MID", "How do you think about what should be configurable from the server rather than shipped in the binary?", [
      c("agility", "Recognises the cost of a store release", 3, ["cannot change", "store", "days", "remote", "flag"]),
      c("candidates", "Names good candidates", 3, ["feature flag", "endpoint", "copy", "thresholds", "kill switch"]),
      c("risk", "Notes the risk of over-configuring", 2, ["too much", "untested combination", "complexity", "cannot reason"]),
    ]),
    spoken("CONCEPTUAL", "MID", "Explain how you would approach app performance work, from complaint to confirmed fix.", [
      c("measurement", "Measures on real devices", 3, ["profile", "real device", "trace", "low end", "measure"]),
      c("targets", "Knows what to look at", 3, ["frame", "startup", "main thread", "allocation", "jank"]),
      c("verification", "Confirms improvement in the field", 2, ["field data", "before after", "percentile", "monitor"]),
    ]),
    spoken("CONCEPTUAL", "MID", "What does accessibility mean for a mobile app specifically?", [
      c("assistive", "Names platform assistive technology", 3, ["voiceover", "talkback", "screen reader", "labels"]),
      c("settings", "Respects system settings", 3, ["font size", "dynamic type", "contrast", "reduce motion"]),
      c("interaction", "Considers touch targets and gestures", 2, ["target size", "gesture", "alternative", "thumb"]),
    ]),
    typed("SCENARIO", "MID", "Your app's startup time has grown to four seconds and users are dropping off before the first screen. Write your plan.", [
      c("measurement", "Breaks startup into measurable phases", 3, ["trace", "phases", "measure", "cold start", "profile"]),
      c("deferral", "Defers non-essential initialisation", 3, ["defer", "lazy", "background", "after first frame", "not on startup"]),
      c("verification", "Confirms with field data across devices", 2, ["field", "percentile", "low end", "monitor"]),
    ]),
    typed("SCENARIO", "MID", "You must support a legacy OS version used by 8% of your users, and it is blocking a library upgrade. Write your analysis.", [
      c("data", "Quantifies the cost and the users", 3, ["8%", "revenue", "who", "measure", "segment"]),
      c("options", "Explores options short of dropping support", 3, ["conditional", "polyfill", "separate path", "feature detect", "older build"]),
      c("decision", "Makes a recommendation with consequences stated", 2, ["recommend", "drop", "notify", "timeline"]),
    ]),
    typed("SCENARIO", "MID", "Analytics show users abandon your signup at the permission request for notifications. Write what you would change.", [
      c("timing", "Moves the request to a moment of value", 3, ["later", "in context", "after", "when they", "not upfront"]),
      c("priming", "Explains the value before the system dialog", 3, ["explain", "pre-prompt", "why", "benefit", "prime"]),
      c("respect", "Handles refusal gracefully", 2, ["still works", "no", "later", "settings"]),
    ]),
    typed("CODING", "MID", "Write the logic that queues user actions while offline and syncs them when connectivity returns, including ordering and failure handling.", [
      c("durability", "Persists the queue across restarts", 3, ["persist", "disk", "database", "survive", "restart"]),
      c("ordering", "Preserves or reasons about order", 3, ["order", "sequence", "fifo", "dependency"]),
      c("failure", "Handles permanent versus transient failure", 2, ["retry", "give up", "conflict", "dead letter", "surface"]),
    ]),
    typed("CODING", "MID", "Write the logic handling a token expiring mid-session: a request returns 401, and several requests may be in flight at once.", [
      c("single-refresh", "Refreshes once, not per request", 3, ["single", "one refresh", "lock", "shared", "queue"]),
      c("replay", "Retries the failed requests after refresh", 3, ["retry", "replay", "resume", "original"]),
      c("terminal", "Handles refresh failure by logging out cleanly", 2, ["logout", "sign out", "cannot refresh", "clear"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Tell me about a release that went badly. What did it change about your release process?", [
      c("incident", "Describes the failure concretely", 3, ["crash", "broke", "users", "release"]),
      c("response", "Describes how it was contained", 3, ["halted", "flag", "hotfix", "rollout", "expedited"]),
      c("process", "Changed the process afterwards", 2, ["staged", "flag", "checklist", "monitoring", "now"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Describe a time you disagreed with a design because of a platform constraint. How did you resolve it?", [
      c("constraint", "Names a real platform constraint", 3, ["platform", "guideline", "gesture", "not possible", "performance"]),
      c("collaboration", "Worked with the designer on an alternative", 3, ["alternative", "together", "prototype", "showed", "option"]),
      c("outcome", "Reached something that worked", 2, ["agreed", "shipped", "compromise"]),
    ]),

    // --- SENIOR -----------------------------------------------------------
    mcq(
      "SENIOR",
      "You own an app with 2 million users and a rising crash rate. What gives you the most control over risk?",
      [
        "A longer QA cycle before each release",
        "Staged rollout with automated halt on crash-rate regression, plus server-side flags for new features",
        "More unit tests",
        "Releasing less often",
      ],
      1,
      "Releasing less often makes each release larger and riskier. Exposure control plus a kill switch limits blast radius regardless of what slipped through.",
    ),
    mcq(
      "SENIOR",
      "Which is the strongest argument for a modular app architecture at scale?",
      [
        "Smaller app size",
        "Build times and team independence — modules can be built, tested and owned separately",
        "Better runtime performance",
        "Easier store submission",
      ],
      1,
      "The payoff is in developer feedback loops and ownership boundaries. Runtime gains are marginal and app size can get worse.",
    ),
    mcq(
      "SENIOR",
      "What is the most significant long-term risk of relying on a cross-platform framework for a core product?",
      [
        "It cannot access native APIs",
        "Platform changes arrive first natively, so you are structurally behind on new OS capabilities and breakages",
        "It performs poorly on all devices",
        "App stores reject cross-platform apps",
      ],
      1,
      "Every OS release is a dependency on someone else's timeline. That is manageable, but it must be a considered acceptance rather than a surprise.",
    ),
    spoken("CONCEPTUAL", "SENIOR", "How would you design an offline-first architecture for an app where multiple devices edit the same data?", [
      c("model", "Chooses a conflict model deliberately", 3, ["crdt", "last write", "operational", "version vector", "merge"]),
      c("visibility", "Makes sync state visible to the user", 3, ["pending", "synced", "conflict", "indicator", "user sees"]),
      c("recovery", "Handles conflicts without silent data loss", 2, ["never lose", "surface", "both versions", "resolve"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "How do you approach privacy in a mobile app beyond meeting store requirements?", [
      c("minimisation", "Collects less by default", 3, ["minimise", "only what", "do not collect", "need", "purpose"]),
      c("transparency", "Makes it understandable to the user", 3, ["clear", "plain", "explain", "control", "consent"]),
      c("supply", "Considers third-party SDKs collecting data", 2, ["sdk", "third party", "audit", "what they send"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "What is your approach to app release engineering for a team shipping every two weeks?", [
      c("automation", "Automates build, sign and submit", 3, ["ci", "automated", "fastlane", "pipeline", "signing"]),
      c("safety", "Uses staged rollout and monitoring", 3, ["staged", "phased", "monitor", "halt", "crash rate"]),
      c("branching", "Handles release branches and hotfixes", 2, ["release branch", "hotfix", "cherry pick", "train"]),
    ]),
    typed("SCENARIO", "SENIOR", "Your app's install size has grown to 180MB and installs are falling in emerging markets. Write your plan.", [
      c("analysis", "Establishes what is actually large", 3, ["analyse", "breakdown", "assets", "libraries", "measure"]),
      c("techniques", "Names real size reduction techniques", 3, ["app bundle", "on demand", "dynamic feature", "compress", "webp", "remove unused"]),
      c("evidence", "Ties it back to install conversion", 2, ["conversion", "measure", "before after", "market"]),
    ]),
    typed("SCENARIO", "SENIOR", "A third-party SDK in your app is found to be sending data to an undisclosed endpoint. Write your response.", [
      c("containment", "Removes or disables it promptly", 3, ["remove", "disable", "flag", "urgent", "block"]),
      c("assessment", "Establishes what was sent and for how long", 3, ["what data", "how long", "which users", "traffic", "audit"]),
      c("obligation", "Recognises disclosure duties", 2, ["legal", "notify", "regulator", "store", "users"]),
    ]),
    typed("SCENARIO", "SENIOR", "Your team wants to rewrite the app in a new framework, citing developer experience. Write your assessment.", [
      c("scrutiny", "Separates developer preference from user value", 3, ["users", "what problem", "evidence", "preference", "actually"]),
      c("cost", "Counts the true rewrite cost", 3, ["feature parity", "months", "bugs", "regression", "two apps"]),
      c("middle", "Considers incremental adoption", 2, ["incremental", "one screen", "hybrid", "trial", "new features"]),
    ]),
    typed("CODING", "SENIOR", "Design the data and sync layer for an app that must work fully offline for a week and reconcile on reconnect. Sketch the interfaces and the conflict rules.", [
      c("local-first", "Treats local storage as the source of truth", 3, ["local first", "source of truth", "read from local", "write local"]),
      c("changelog", "Tracks changes for reconciliation", 3, ["change log", "version", "timestamp", "operation", "delta"]),
      c("rules", "States explicit conflict rules", 3, ["conflict", "rule", "server wins", "merge", "user decides"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about a mobile architecture decision you had to live with for years. How has it held up?", [
      c("decision", "Describes a genuinely consequential choice", 3, ["architecture", "chose", "years", "foundation"]),
      c("consequence", "Honest about how it aged", 3, ["held up", "regret", "still", "cost us", "worked"]),
      c("learning", "Draws a transferable lesson", 2, ["learned", "now i", "would"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Describe how you have handled the tension between shipping quickly and the fact that mobile releases are hard to reverse.", [
      c("awareness", "Takes irreversibility seriously", 3, ["cannot roll back", "installed", "days", "stuck"]),
      c("mechanism", "Uses flags and staged rollout", 3, ["flag", "staged", "kill switch", "remote", "percentage"]),
      c("judgement", "Still ships rather than freezing", 2, ["still fast", "not blocked", "balance", "confidence"]),
    ]),

    // --- STAFF ------------------------------------------------------------
    mcq(
      "STAFF",
      "You are setting mobile engineering standards across several product teams. Which is most likely to be adopted?",
      [
        "A comprehensive style guide",
        "Shared modules and templates that make the standard approach the fastest way to start",
        "Mandatory architecture review for each feature",
        "A quarterly compliance audit",
      ],
      1,
      "Standards are adopted when they save work. Review gates make the standards team the bottleneck and generate resentment rather than consistency.",
    ),
    mcq(
      "STAFF",
      "What most reliably indicates that a mobile codebase is becoming unmaintainable?",
      [
        "It exceeds 100,000 lines",
        "Build and test feedback times have grown to the point that engineers stop running them locally",
        "It has multiple architectures",
        "It supports two platforms",
      ],
      1,
      "Once the feedback loop breaks, quality degrades everywhere at once because verification has effectively stopped.",
    ),
    mcq(
      "STAFF",
      "Which consideration should dominate a decision to unify two acquired mobile apps into one?",
      [
        "Engineering effort to merge the codebases",
        "Whether the two user bases actually want the same product, and the cost of migrating them",
        "Which codebase is newer",
        "Which team is larger",
      ],
      1,
      "Forced migration loses users. The engineering merge is tractable; convincing two audiences that one app serves them both often is not.",
    ),
    spoken("CONCEPTUAL", "STAFF", "How would you structure mobile teams for an organisation with one app and six product areas?", [
      c("ownership", "Gives teams end-to-end feature ownership", 3, ["feature team", "own", "vertical", "end to end"]),
      c("platform", "Provides shared foundations centrally", 3, ["platform", "core", "shared", "release", "infrastructure"]),
      c("coordination", "Handles the single release train", 2, ["release train", "coordinate", "cadence", "integration"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "What is your view on how much of a mobile product should be rendered from server-driven configuration?", [
      c("motivation", "Understands the release-cycle motivation", 3, ["release cycle", "cannot update", "change without", "agility"]),
      c("cost", "Names the real costs", 3, ["complexity", "debugging", "versioning", "offline", "performance", "testing"]),
      c("boundary", "Draws a defensible line", 2, ["some", "layout", "not everything", "depends"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How do you think about supporting an app in markets with very different device and network conditions from your own?", [
      c("evidence", "Uses real field data rather than assumptions", 3, ["field data", "analytics", "device mix", "percentile", "actual"]),
      c("practice", "Changes how the team develops and tests", 3, ["low end device", "throttle", "test on", "budget", "dogfood"]),
      c("product", "Accepts product differences may be needed", 2, ["lite", "different", "adapt", "market specific"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How would you evaluate whether to invest in a mobile platform team?", [
      c("evidence", "Looks for duplicated effort across teams", 3, ["duplicate", "each team", "reinvent", "inconsistent", "measure"]),
      c("value", "Defines what it would own and deliver", 3, ["build time", "release", "shared", "own", "deliver"]),
      c("risk", "Guards against it becoming a bottleneck", 2, ["bottleneck", "self serve", "not gatekeeper", "adoption"]),
    ]),
    typed("SCENARIO", "STAFF", "The company wants to launch in a market requiring data residency and a different app store. Write your technical and organisational plan.", [
      c("technical", "Addresses residency across the whole stack", 3, ["region", "storage", "backup", "analytics", "third party"]),
      c("distribution", "Handles a different store and build", 3, ["store", "separate build", "services", "no google", "variant"]),
      c("organisation", "Plans ownership and support", 2, ["team", "support", "language", "on-call", "ownership"]),
    ]),
    typed("SCENARIO", "STAFF", "Your app's monolithic codebase takes 25 minutes to build and engineers batch their work. Write your plan.", [
      c("cost", "Quantifies the compounding cost", 3, ["engineer hours", "batching", "larger changes", "cost", "context switch"]),
      c("modularisation", "Proposes modularisation with incremental build", 3, ["module", "incremental", "cache", "parallel", "remote build"]),
      c("sequencing", "Sequences without stopping delivery", 2, ["incremental", "one module", "alongside", "not freeze"]),
    ]),
    typed("SCENARIO", "STAFF", "A platform vendor announces a policy change that breaks a core feature of your app in six months. Write your response plan.", [
      c("assessment", "Establishes the true impact quickly", 3, ["which features", "how many users", "revenue", "assess", "scope"]),
      c("options", "Explores compliance and alternatives", 3, ["alternative api", "redesign", "comply", "different approach", "options"]),
      c("influence", "Engages the vendor and the industry", 2, ["feedback", "vendor", "appeal", "other companies", "raise"]),
    ]),
    typed("SCENARIO", "STAFF", "Leadership wants to cut the mobile team in half and rely on a responsive website instead. Write your assessment.", [
      c("analysis", "Uses data on how users actually engage", 3, ["usage", "retention", "revenue", "sessions", "data"]),
      c("capability", "Names what genuinely requires an app", 3, ["push", "offline", "camera", "background", "performance", "biometric"]),
      c("honesty", "Concedes where the web would suffice", 2, ["could work", "some", "honest", "depends"]),
    ]),
    typed("SCENARIO", "STAFF", "Crash-free rate has sat at 98.5% for a year and nobody treats it as urgent. Write how you would change that.", [
      c("translation", "Converts the number into human terms", 3, ["how many users", "per day", "sessions", "actual people", "translate"]),
      c("attribution", "Ties crashes to business outcomes", 3, ["retention", "churn", "reviews", "revenue", "correlate"]),
      c("action", "Proposes an achievable target and ownership", 2, ["target", "owner", "budget", "quarter", "top crashes"]),
    ]),
    typed("CODING", "STAFF", "Define the interface and guarantees of a shared mobile networking layer used by six teams: retries, auth refresh, caching, and observability. State what teams cannot override.", [
      c("defaults", "Makes safe behaviour the default", 3, ["default timeout", "retry policy", "automatic", "built in"]),
      c("auth", "Handles token refresh centrally and correctly", 3, ["refresh", "single flight", "401", "centralised"]),
      c("constraint", "Names what is deliberately not overridable", 3, ["cannot", "mandatory", "telemetry", "certificate", "no infinite"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Tell me about a time you had to make a call that traded user experience for engineering sustainability.", [
      c("tradeoff", "Names both sides honestly", 3, ["users would", "but", "sustainability", "cost", "trade"]),
      c("decision", "Made and owned the call", 3, ["decided", "my call", "chose", "committed"]),
      c("mitigation", "Reduced the user cost where possible", 2, ["minimised", "communicated", "phased", "small group"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Describe how you have built mobile engineering capability in an organisation that had none.", [
      c("start", "Describes the starting position", 3, ["no one", "outsourced", "first", "nothing"]),
      c("building", "Built people and foundations, not just an app", 3, ["hired", "trained", "standards", "pipeline", "foundation"]),
      c("durability", "It survived their involvement", 2, ["still", "after", "team now", "own"]),
    ]),
  ],
};
