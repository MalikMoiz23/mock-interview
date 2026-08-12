import type { BankDomain } from "../question-bank";
import { c, mcq, spoken, typed } from "./authoring";

/**
 * UI/UX Design — depth tranche.
 *
 * The CODING type is used here for detailed specification tasks, matching the
 * existing bank: a designer's equivalent of writing code is specifying states,
 * behaviour and edge cases precisely enough for an engineer to build without
 * guessing.
 */
export const UIUX_DEPTH: BankDomain = {
  slug: "uiux-design",
  name: "UI/UX Design",
  blurb: "Designs how a product works and how it feels to use.",
  questions: [
    // --- BEGINNER ---------------------------------------------------------
    mcq(
      "BEGINNER",
      "Why should a form show validation errors next to the field rather than only at the top?",
      [
        "It looks tidier",
        "The user has to connect the error to the field to fix it; a distant message forces them to hunt",
        "Top messages are not accessible",
        "It reduces the number of errors",
      ],
      1,
      "Both is often best: a summary for orientation plus an inline message at the point of repair, with the field programmatically associated with its error.",
    ),
    mcq(
      "BEGINNER",
      "What is the main purpose of a loading state?",
      [
        "To make the wait feel shorter",
        "To tell the user the system received their action and is working, so they do not repeat it",
        "To hide the interface while data loads",
        "To meet accessibility requirements",
      ],
      1,
      "Without acknowledgement people tap again. Perceived speed matters too, but the primary job is confirming the system heard them.",
    ),
    mcq(
      "BEGINNER",
      "A user clicks 'Delete' and the item disappears immediately. What is the main design risk?",
      [
        "The animation is too fast",
        "There is no way back from a mistake, and confirmation dialogs are often clicked through without reading",
        "The action is too slow",
        "The button is too small",
      ],
      1,
      "Undo is usually better than confirm: it does not interrupt the common case and genuinely protects the rare mistake.",
    ),
    mcq(
      "BEGINNER",
      "What does 'affordance' mean in interface design?",
      [
        "How much the design costs to build",
        "The visual and behavioural cues that suggest how something can be used",
        "The amount of white space around an element",
        "How well a design scales to other screens",
      ],
      1,
      "A button that looks pressable affords pressing. Flat designs that strip these cues make people hunt for what is interactive.",
    ),
    mcq(
      "BEGINNER",
      "Why is it a problem to design only for the ideal case?",
      [
        "It takes less time",
        "Real use includes empty, loading, error, partial and overflowing states, and undesigned states get invented by engineers",
        "Ideal cases are hard to test",
        "Stakeholders prefer edge cases",
      ],
      1,
      "The states you do not design still ship. They just ship as whatever the developer improvised under deadline.",
    ),
    mcq(
      "BEGINNER",
      "A stakeholder asks you to remove a step from a flow to increase conversion. What should you establish first?",
      [
        "Whether the visual design can absorb it",
        "What that step is for and what happens downstream if the information is not collected",
        "How long the change will take",
        "Whether competitors have that step",
      ],
      1,
      "Steps usually exist for a reason, even a bad one. Removing it may move the failure to support or to fulfilment rather than eliminating it.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "What is the difference between something being simple and something being easy to use?", [
      c("distinction", "Separates visual simplicity from usability", 3, ["looks simple", "hidden", "fewer options", "still hard", "not the same"]),
      c("example", "Gives a concrete example", 3, ["for example", "i used", "app", "remote"]),
      c("cost", "Knows simplifying can hide necessary function", 2, ["hidden", "cannot find", "power user", "too far"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "How would you tell whether a design is working, without asking users if they like it?", [
      c("behaviour", "Observes behaviour rather than opinion", 3, ["watch", "observe", "complete", "task", "behaviour"]),
      c("measures", "Names concrete signals", 3, ["completion", "time", "errors", "abandon", "support tickets"]),
      c("scepticism", "Knows stated preference is unreliable", 2, ["say", "not what they do", "unreliable", "polite"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What does consistency give a user, and when is it worth breaking?", [
      c("value", "Explains learned expectations transferring", 3, ["learn once", "predictable", "expect", "familiar", "no relearn"]),
      c("exception", "Knows when to break it deliberately", 3, ["destructive", "stand out", "different because", "warning", "deliberate"]),
      c("discipline", "Distinguishes deliberate from careless inconsistency", 2, ["accidental", "reason", "on purpose", "justify"]),
    ]),
    typed("SCENARIO", "BEGINNER", "Users complain that they cannot find the settings in your app. Write how you would investigate and what you would consider changing.", [
      c("evidence", "Finds out where they actually look", 3, ["watch", "test", "where do they", "analytics", "ask"]),
      c("cause", "Considers naming and location separately", 3, ["name", "label", "location", "icon", "expect"]),
      c("validation", "Tests the change rather than assuming", 2, ["test", "verify", "before after", "few users"]),
    ]),
    typed("SCENARIO", "BEGINNER", "You are asked to design a screen that shows a user's order history. Write everything you would need to know before starting.", [
      c("content", "Asks what an order contains and how many", 3, ["how many", "fields", "status", "what information"]),
      c("purpose", "Asks what users are trying to do", 3, ["why", "looking for", "task", "reorder", "track"]),
      c("states", "Asks about empty and extreme cases", 2, ["none", "empty", "thousands", "long", "cancelled"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A developer tells you your design cannot be built in the time available. Write how you would respond.", [
      c("understanding", "Finds out what specifically is expensive", 3, ["which part", "why", "what is hard", "asked"]),
      c("priority", "Identifies what must survive a cut", 3, ["essential", "core", "must have", "priority", "keep"]),
      c("collaboration", "Works towards a shared solution", 2, ["together", "alternative", "simpler version", "phase"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time you changed your design because of something you observed rather than something you were told.", [
      c("observation", "Describes real observation", 3, ["watched", "saw", "noticed", "test"]),
      c("change", "Made a concrete change", 3, ["changed", "moved", "removed", "added"]),
      c("humility", "Was willing to abandon their own idea", 2, ["i thought", "was wrong", "assumed"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Describe a product you find badly designed. Be specific about what fails and for whom.", [
      c("specificity", "Names a concrete failure", 3, ["specific", "when i", "the step", "button"]),
      c("empathy", "Considers who is affected", 3, ["for someone", "older", "new user", "not everyone"]),
      c("charity", "Considers why it might be that way", 2, ["probably", "constraint", "reason", "maybe"]),
    ]),

    // --- JUNIOR -----------------------------------------------------------
    mcq(
      "JUNIOR",
      "A designer proposes replacing a labelled 'Save' button with an autosave that shows no confirmation. What is the main risk?",
      [
        "Autosave is slower",
        "Users lose the sense that their work is safe, and have no moment where they know a change was committed",
        "Autosave cannot be undone",
        "It requires more server capacity",
      ],
      1,
      "Autosave is usually right, but it has to replace the reassurance the button provided — a visible saved state, and an undo for the mistakes it now commits instantly.",
    ),
    mcq(
      "JUNIOR",
      "What does WCAG require as the minimum contrast ratio for normal body text at AA?",
      ["3:1", "4.5:1", "7:1", "2:1"],
      1,
      "Large text drops to 3:1 and AAA raises normal text to 7:1. Non-text elements such as focus indicators and icons need 3:1.",
    ),
    mcq(
      "JUNIOR",
      "A user's session times out while they are filling in a long form. What is the best design response?",
      [
        "Increase the timeout",
        "Warn before expiry, preserve what they entered, and restore it after re-authentication",
        "Remove the timeout entirely",
        "Show an error and return them to the start",
      ],
      1,
      "The timeout may exist for a security reason you cannot remove. Preserving the work is what turns a data-loss event into a minor interruption.",
    ),
    mcq(
      "JUNIOR",
      "What is the strongest argument against an infinite scroll on a search results page?",
      [
        "It is harder to build",
        "Users cannot bookmark or return to a position, and it removes the sense of how much there is",
        "It uses more data",
        "It does not work on mobile",
      ],
      1,
      "It also makes anything below the list — a footer, filters — effectively unreachable. It suits browsing feeds far better than goal-directed search.",
    ),
    mcq(
      "JUNIOR",
      "A design uses a red asterisk to mark required fields. What is the accessibility issue?",
      [
        "Red is culturally insensitive",
        "The meaning depends on colour and on a convention not everyone knows, and it may not be announced by a screen reader",
        "Asterisks are too small",
        "It should be a different symbol",
      ],
      1,
      "Marking with a visible word, or programmatically marking the field as required, works regardless of colour perception or prior convention knowledge.",
    ),
    mcq(
      "JUNIOR",
      "Which is the strongest first move when a form of 12 fields has high abandonment?",
      [
        "Split it across three pages",
        "Establish which fields are genuinely required and remove or defer the rest",
        "Add a progress bar",
        "Make the fields visually smaller",
      ],
      1,
      "Splitting or decorating a form that asks too much only redistributes the burden. Reducing what is asked is the change that moves the number.",
    ),
    spoken("CONCEPTUAL", "JUNIOR", "What is a design system, and what makes one succeed or fail in practice?", [
      c("definition", "More than a component library", 3, ["components", "principles", "tokens", "guidance", "patterns"]),
      c("adoption", "Identifies adoption as the deciding factor", 3, ["adoption", "used", "easier", "contribute", "ignored"]),
      c("governance", "Considers how it evolves", 2, ["contribute", "request", "governance", "version", "owner"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "How do you decide when a design needs research versus when you can rely on established patterns?", [
      c("patterns", "Uses conventions where they exist", 3, ["convention", "established", "known", "do not reinvent", "standard"]),
      c("novelty", "Researches where the problem is genuinely new", 3, ["new", "unknown", "specific to", "our users", "risky"]),
      c("cost", "Weighs research cost against decision risk", 2, ["cost", "time", "how risky", "reversible"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "Explain what a user flow is and why you would produce one before any visual design.", [
      c("definition", "Describes the path through decisions and states", 3, ["steps", "path", "decision", "states", "journey"]),
      c("value", "Reveals gaps before visuals lock them in", 3, ["missing", "edge", "before", "cheaper", "gaps"]),
      c("communication", "Aligns stakeholders early", 2, ["shared", "agree", "engineer", "discuss"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A client insists their homepage must contain everything 'above the fold'. Write your response.", [
      c("premise", "Challenges the fold assumption with evidence", 3, ["people scroll", "evidence", "not true", "research", "myth"]),
      c("underlying", "Finds what they actually fear", 3, ["what worries", "why", "miss", "underlying", "goal"]),
      c("alternative", "Offers a way to meet the goal", 2, ["hierarchy", "priority", "signal", "instead"]),
    ]),
    typed("SCENARIO", "JUNIOR", "Analytics show users repeatedly using a feature in a way you did not design for. Write how you would respond.", [
      c("curiosity", "Investigates why rather than blocking it", 3, ["why", "what are they", "need", "understand", "talk to"]),
      c("opportunity", "Treats it as a signal about an unmet need", 3, ["unmet", "workaround", "real need", "opportunity"]),
      c("response", "Considers supporting it properly", 2, ["support", "design for", "make it", "official"]),
    ]),
    typed("SCENARIO", "JUNIOR", "You are asked to redesign a screen that a small group of expert users rely on daily. Write your approach.", [
      c("caution", "Recognises expert efficiency is at stake", 3, ["expert", "muscle memory", "efficiency", "daily", "slower"]),
      c("research", "Observes their actual workflow", 3, ["watch", "observe", "shadow", "how they use", "interview"]),
      c("transition", "Plans for the disruption of change", 2, ["gradual", "opt in", "training", "keep old", "notice"]),
    ]),
    typed("CODING", "JUNIOR", "Write the complete specification for a file upload component: all states, constraints, feedback and failure handling.", [
      c("states", "Covers idle, selecting, uploading, success and error", 3, ["idle", "progress", "success", "error", "cancel"]),
      c("constraints", "Specifies limits and how they are communicated", 3, ["size", "type", "before upload", "message", "limit"]),
      c("recovery", "Handles failure and retry", 2, ["retry", "partial", "cancel", "remove", "network"]),
    ]),
    typed("CODING", "JUNIOR", "Specify a confirmation pattern for deleting an item that appears in a list: interaction, wording, keyboard behaviour and recovery.", [
      c("recovery", "Prefers undo where possible", 3, ["undo", "recover", "restore", "reversible", "toast"]),
      c("wording", "Specifies unambiguous button labels", 3, ["delete", "cancel", "not yes/no", "specific", "name"]),
      c("keyboard", "Specifies focus and escape behaviour", 2, ["focus", "escape", "default", "tab", "return focus"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you had to design something without access to users. How did you reduce the risk?", [
      c("substitutes", "Found proxies for real users", 3, ["support tickets", "sales", "analytics", "competitor", "internal"]),
      c("humility", "Treated decisions as assumptions", 3, ["assumption", "hypothesis", "unsure", "documented"]),
      c("validation", "Planned to validate later", 2, ["after launch", "measure", "test later", "monitor"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Describe a time you received contradictory feedback from several people. How did you resolve it?", [
      c("synthesis", "Looked for the underlying concern", 3, ["underlying", "why", "actually", "common", "behind"]),
      c("authority", "Established who decides", 3, ["decision maker", "owner", "asked", "who decides"]),
      c("evidence", "Used evidence rather than seniority", 2, ["data", "test", "user", "research"]),
    ]),

    // --- MID --------------------------------------------------------------
    mcq(
      "MID",
      "An A/B test shows a new checkout increases conversion 2% but support tickets rise. What is the correct reading?",
      [
        "Ship it; conversion is the primary metric",
        "The test measured a short-term metric and missed a downstream cost; evaluate the net effect before deciding",
        "Reject it; support cost always outweighs conversion",
        "Run the test for longer",
      ],
      1,
      "Optimising one metric while another degrades is how local improvements damage the whole. Quantify both before committing.",
    ),
    mcq(
      "MID",
      "Users say they want a feature but do not use it after launch. What does this most likely indicate?",
      [
        "The feature was built badly",
        "The stated want did not reflect a real job they were trying to do, or the cost of using it exceeded the benefit",
        "Users are irrational",
        "Marketing failed",
      ],
      1,
      "People predict their own future behaviour poorly. Asking about past behaviour is far more reliable than asking about hypothetical wants.",
    ),
    mcq(
      "MID",
      "Your team runs a usability test and the participant completes every task but complains throughout. How should this be recorded?",
      [
        "As a pass, since all tasks were completed",
        "As a real finding — completion under frustration predicts abandonment when the user is not being observed",
        "As invalid, since the participant was biased",
        "As a pass with a note about participant attitude",
      ],
      1,
      "In a test people persist because someone is watching. The friction they voiced is the signal; task completion under observation is a weak measure on its own.",
    ),
    mcq(
      "MID",
      "What is the main limitation of a usability test conducted with a clickable prototype?",
      [
        "Participants cannot use a keyboard",
        "It cannot surface problems caused by real data, real latency and real consequences of action",
        "It is too expensive",
        "It only works for mobile",
      ],
      1,
      "Prototypes are excellent for flow and comprehension. They cannot tell you how the design behaves with a name that is 60 characters long or a five-second wait.",
    ),
    mcq(
      "MID",
      "A dashboard is requested showing 'all the key metrics'. There are 40 candidates. What is the strongest approach?",
      [
        "Show all 40 with filters",
        "Establish what decisions the dashboard should support, and show only what changes a decision",
        "Show the top 10 by popularity",
        "Build several dashboards, one per team",
      ],
      1,
      "A dashboard is a decision tool, not a data dump. Metrics that no one would act on are noise that hides the ones that matter.",
    ),
    mcq(
      "MID",
      "Which is the strongest reason to specify focus order and keyboard behaviour in a design, rather than leaving it to engineering?",
      [
        "Engineers dislike making those decisions",
        "Focus order is a design decision about sequence and priority, and undesigned it follows arbitrary DOM order",
        "It is faster to build",
        "It is required by design tools",
      ],
      1,
      "The keyboard path is a real path through the interface. Leaving it undesigned means one group of users gets whatever the markup happened to produce.",
    ),
    spoken("CONCEPTUAL", "MID", "Explain the difference between qualitative and quantitative research, and what each cannot tell you.", [
      c("distinction", "Maps each to the questions it answers", 3, ["why", "how many", "behaviour", "reason", "scale"]),
      c("limits", "Names what each cannot do", 3, ["cannot size", "cannot explain", "sample", "no context", "correlation"]),
      c("combination", "Uses them together", 2, ["together", "then", "follow up", "combine"]),
    ]),
    spoken("CONCEPTUAL", "MID", "How do you approach designing for users whose context is very different from your own?", [
      c("humility", "Rejects designing from personal intuition", 3, ["not me", "my assumptions", "different", "not the user"]),
      c("method", "Uses research and direct contact", 3, ["research", "interview", "observe", "field", "talk to"]),
      c("verification", "Validates with actual members of that group", 2, ["test with", "validate", "check", "feedback"]),
    ]),
    spoken("CONCEPTUAL", "MID", "What is your view on personas, and how do you avoid them becoming fiction?", [
      c("scepticism", "Aware they are often invented", 3, ["made up", "fiction", "stereotype", "demographic", "not useful"]),
      c("grounding", "Grounds them in real evidence", 3, ["research", "interviews", "data", "actual", "evidence"]),
      c("alternative", "Prefers behavioural framing where appropriate", 2, ["jobs", "behaviour", "segment", "scenario", "task"]),
    ]),
    spoken("CONCEPTUAL", "MID", "How do you measure the impact of design work in a way an executive would accept?", [
      c("outcomes", "Ties design to business outcomes", 3, ["conversion", "retention", "support cost", "time", "revenue"]),
      c("attribution", "Honest about attribution difficulty", 3, ["hard to attribute", "confound", "many factors", "before after"]),
      c("baseline", "Establishes a baseline beforehand", 2, ["baseline", "before", "measure first", "control"]),
    ]),
    typed("SCENARIO", "MID", "Engineering says your design will take four weeks; the business has two. Write how you would handle it.", [
      c("decomposition", "Breaks the design into value tiers", 3, ["core", "phase", "must", "later", "split"]),
      c("integrity", "Protects what makes it work at all", 3, ["cannot cut", "would break", "essential", "worse than nothing"]),
      c("collaboration", "Works with engineering on the estimate", 2, ["what is expensive", "together", "alternative", "cheaper way"]),
    ]),
    typed("SCENARIO", "MID", "Support tickets show users misunderstanding a term used throughout your product. Write your plan.", [
      c("evidence", "Establishes what users actually think it means", 3, ["ask", "test", "what do they think", "tickets", "research"]),
      c("scope", "Recognises the change touches many places", 3, ["everywhere", "consistent", "documentation", "emails", "all surfaces"]),
      c("transition", "Handles users who learned the old term", 2, ["both", "transition", "notice", "gradual"]),
    ]),
    typed("SCENARIO", "MID", "You inherit a product where every team ships their own patterns and nothing is consistent. Write your first 90 days.", [
      c("audit", "Inventories what exists before prescribing", 3, ["audit", "inventory", "screenshot", "catalogue", "what exists"]),
      c("priority", "Starts with the highest-frequency patterns", 3, ["most used", "buttons", "forms", "highest", "first"]),
      c("adoption", "Wins teams over rather than mandating", 2, ["with teams", "easier", "help", "contribute", "not mandate"]),
    ]),
    typed("CODING", "MID", "Specify a complete data table for a list that can contain 10 or 100,000 rows: sorting, filtering, selection, pagination, empty and error states, and keyboard behaviour.", [
      c("scale", "Handles both extremes deliberately", 3, ["pagination", "virtualise", "server side", "10", "100,000"]),
      c("states", "Covers empty, loading, error and no-results distinctly", 3, ["empty", "no results", "loading", "error", "different"]),
      c("keyboard", "Specifies keyboard and screen reader behaviour", 3, ["keyboard", "focus", "sort announcement", "aria", "tab"]),
    ]),
    typed("CODING", "MID", "Write the complete specification for a multi-step form with save-and-resume: navigation, validation timing, progress, and what happens if the user leaves.", [
      c("navigation", "Specifies moving between steps and back", 3, ["back", "next", "jump", "step", "review"]),
      c("validation", "Specifies when validation runs", 3, ["on blur", "on submit", "per step", "timing", "before advancing"]),
      c("persistence", "Specifies save, resume and abandonment", 2, ["save", "resume", "draft", "leave", "expire"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Tell me about a time you had to advocate for a user group with no voice in the organisation.", [
      c("advocacy", "Represented a real underrepresented group", 3, ["accessibility", "older", "low literacy", "new users", "disabled"]),
      c("evidence", "Made the case with evidence", 3, ["data", "research", "showed", "example", "how many"]),
      c("outcome", "Achieved something concrete", 2, ["changed", "shipped", "prioritised", "partly"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Describe a time you killed your own design after investing significant work in it.", [
      c("evidence", "Killed it for a real reason", 3, ["testing showed", "data", "did not work", "users"]),
      c("detachment", "Not attached to their own output", 3, ["let go", "not precious", "my idea", "wrong"]),
      c("outcome", "What replaced it was better", 2, ["instead", "better", "simpler", "worked"]),
    ]),

    // --- SENIOR -----------------------------------------------------------
    mcq(
      "SENIOR",
      "You must choose between a design system that constrains teams tightly and one that offers loose guidance. What should drive the decision?",
      [
        "The size of the design team",
        "How much consistency the product genuinely needs versus how much teams need to solve novel problems",
        "Which is faster to build",
        "Industry best practice",
      ],
      1,
      "A tight system suits a coherent product surface; loose guidance suits varied products under one brand. Choosing without that context produces either sprawl or constant escape hatches.",
    ),
    mcq(
      "SENIOR",
      "What most reliably indicates that a design organisation is being used as a decoration service?",
      [
        "Designers work in a separate team",
        "Design is engaged after requirements and scope are already fixed",
        "Designers are outnumbered by engineers",
        "There is no research function",
      ],
      1,
      "When the problem is already defined, the only remaining contribution is appearance. The lever is being present when the problem is framed.",
    ),
    mcq(
      "SENIOR",
      "A leader asks you to prove design's return on investment. What is the soundest response?",
      [
        "Refuse; design value cannot be quantified",
        "Agree, and tie specific design changes to measured outcomes while being honest about attribution limits",
        "Present industry benchmarks",
        "Point to customer satisfaction scores",
      ],
      1,
      "Refusing cedes the argument. Measuring what can be measured, and saying plainly what cannot, is far more credible than either extreme.",
    ),
    spoken("CONCEPTUAL", "SENIOR", "How would you build a research practice in an organisation that has never done research?", [
      c("start", "Starts small with a visible win", 3, ["small", "one study", "quick", "show value", "pilot"]),
      c("access", "Solves participant access as a first-class problem", 3, ["recruit", "access", "customers", "panel", "support"]),
      c("embedding", "Makes it routine rather than exceptional", 2, ["cadence", "regular", "part of", "everyone watches"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "What is your approach to designing for accessibility at organisational scale rather than per feature?", [
      c("systemic", "Builds it into components and tooling", 3, ["design system", "components", "accessible by default", "tokens", "built in"]),
      c("process", "Puts it in the definition of done", 3, ["definition of done", "review", "ci", "checklist", "gate"]),
      c("capability", "Builds team knowledge", 2, ["training", "champions", "education", "capability"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "How do you handle the tension between a strong design vision and genuine user research that contradicts it?", [
      c("primacy", "Lets evidence win over preference", 3, ["evidence", "users", "not my taste", "wrong", "data"]),
      c("nuance", "Interrogates the research too", 3, ["how was it tested", "prototype", "sample", "asked wrong", "context"]),
      c("synthesis", "Finds a path that serves both", 2, ["both", "adapt", "keep the intent", "different execution"]),
    ]),
    typed("SCENARIO", "SENIOR", "Two teams have shipped two different date pickers. Neither wants to give theirs up. Write how you would resolve it.", [
      c("facts", "Compares them on real criteria", 3, ["accessibility", "usage", "coverage", "compare", "criteria"]),
      c("decision", "Chooses or builds a third deliberately", 3, ["one", "best of", "new", "decide", "canonical"]),
      c("migration", "Makes migration cheap for the losing team", 2, ["help", "migrate", "codemod", "support", "timeline"]),
    ]),
    typed("SCENARIO", "SENIOR", "Your company is entering a market where your existing patterns are culturally unfamiliar. Write your approach.", [
      c("research", "Researches locally rather than assuming", 3, ["local", "research", "in market", "users there", "not assume"]),
      c("adaptation", "Knows what must adapt beyond translation", 3, ["not just translation", "conventions", "reading", "colour", "payment", "names"]),
      c("capability", "Builds ongoing local input", 2, ["local team", "ongoing", "hire", "partner"]),
    ]),
    typed("SCENARIO", "SENIOR", "A redesign you led has launched and key metrics have dropped. Write what you would do in the first week.", [
      c("evidence", "Establishes what actually changed and for whom", 3, ["which metric", "segment", "where", "funnel", "data"]),
      c("openness", "Considers that the redesign is at fault", 3, ["may be", "our fault", "honest", "not defensive"]),
      c("action", "Decides between fix, partial revert and hold", 2, ["revert", "fix", "wait", "learning curve", "decide"]),
    ]),
    typed("CODING", "SENIOR", "Specify the interaction and accessibility contract for a complex component your design system will own — a combobox with async results, multi-select and keyboard-only operation.", [
      c("keyboard", "Specifies full keyboard operation", 3, ["arrow", "enter", "escape", "home", "type ahead", "tab"]),
      c("announcements", "Specifies what assistive technology announces", 3, ["aria", "live", "announce", "count", "selected", "role"]),
      c("async", "Handles loading, no results and race conditions", 2, ["loading", "no results", "stale", "debounce", "cancel"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about a time you changed how a team worked, not just what they shipped.", [
      c("change", "Changed a process or ritual", 3, ["process", "ritual", "how we", "started", "stopped"]),
      c("resistance", "Handled resistance", 3, ["resistance", "sceptical", "convinced", "showed"]),
      c("durability", "It persisted", 2, ["still", "after", "kept", "sustained"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Describe a time you had to design something you believed was bad for users but good for the business.", [
      c("honesty", "Names the tension without evasion", 3, ["uncomfortable", "bad for", "tension", "conflict"]),
      c("agency", "Tried to shift it", 3, ["pushed back", "proposed", "alternative", "raised", "argued"]),
      c("resolution", "Describes what they did in the end", 2, ["did it", "refused", "compromise", "mitigated", "left"]),
    ]),

    // --- STAFF ------------------------------------------------------------
    mcq(
      "STAFF",
      "You are defining how design operates across 10 product teams. Which structure most often fails?",
      [
        "Embedded designers with a central systems team",
        "A central design team that all teams must queue for",
        "Designers reporting into product with a design community of practice",
        "A hybrid with rotating central support",
      ],
      1,
      "A queue makes design a service function and removes it from problem framing. The other structures keep designers close to the decisions.",
    ),
    mcq(
      "STAFF",
      "Which is the strongest indicator that a design system is genuinely healthy?",
      [
        "It has many components",
        "Teams contribute back to it and adoption is voluntary rather than enforced",
        "It has comprehensive documentation",
        "It is used by every team",
      ],
      1,
      "Voluntary adoption plus contribution means it is serving real needs. Enforced usage with no contribution means it is being tolerated.",
    ),
    mcq(
      "STAFF",
      "A company wants to unify the experience across five products built by five independent teams. What is the biggest risk?",
      [
        "The visual work will take too long",
        "Imposing consistency where the products serve genuinely different users and tasks, making all five worse",
        "Teams will resist on principle",
        "The design system will become too large",
      ],
      1,
      "Consistency is a means, not an end. Unifying navigation across products with different mental models can degrade every one of them.",
    ),
    spoken("CONCEPTUAL", "STAFF", "How do you decide what design should standardise across an organisation and what should stay local to teams?", [
      c("principle", "Has a coherent dividing principle", 3, ["shared surface", "brand", "cross-product", "local", "context specific"]),
      c("cost", "Recognises the cost of over-standardising", 3, ["worse", "does not fit", "friction", "escape", "generic"]),
      c("evolution", "Expects to revisit the line", 2, ["revisit", "evolve", "as we", "review"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "What is your view on how AI-assisted tooling changes the design discipline?", [
      c("balance", "Neither dismissive nor uncritical", 3, ["useful for", "not for", "depends", "some tasks", "still need"]),
      c("judgement", "Identifies what remains human", 3, ["problem framing", "judgement", "context", "trade-off", "users", "which problem"]),
      c("risk", "Names concrete risks", 2, ["homogenise", "plausible but wrong", "unverified", "average", "accessibility"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How would you build design's credibility with an engineering-led executive team?", [
      c("language", "Speaks in outcomes they already value", 3, ["metric", "cost", "revenue", "risk", "rework"]),
      c("evidence", "Brings evidence rather than assertion", 3, ["data", "showed", "test", "measured", "before after"]),
      c("delivery", "Earns credibility by shipping", 2, ["shipped", "delivered", "practical", "buildable"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How do you grow designers beyond craft into influence?", [
      c("exposure", "Puts them in front of decisions", 3, ["stakeholder", "present", "meetings", "early", "involved"]),
      c("skills", "Develops framing and communication", 3, ["framing", "communication", "narrative", "business", "argue"]),
      c("support", "Backs them rather than doing it for them", 2, ["backed", "let them", "coached", "debrief"]),
    ]),
    typed("SCENARIO", "STAFF", "The company has decided on a rebrand that will change every surface of the product. Write your programme plan.", [
      c("inventory", "Establishes the full surface area", 3, ["audit", "inventory", "every surface", "email", "legacy", "scope"]),
      c("sequencing", "Sequences to avoid a half-rebranded product", 3, ["tokens", "system first", "coordinated", "phased", "cutover"]),
      c("users", "Considers user disruption and communication", 2, ["users", "notice", "communicate", "confusion", "recognition"]),
    ]),
    typed("SCENARIO", "STAFF", "An accessibility lawsuit is filed against your product. Write your immediate and long-term response.", [
      c("immediate", "Establishes the actual gap urgently", 3, ["audit", "assess", "critical journey", "scope", "immediately"]),
      c("remediation", "Fixes by user impact, with a credible plan", 3, ["priority", "plan", "timeline", "owner", "critical first"]),
      c("systemic", "Prevents recurrence structurally", 2, ["design system", "definition of done", "training", "ci", "ongoing"]),
    ]),
    typed("SCENARIO", "STAFF", "Two years of user research sits unread and teams keep asking questions it already answers. Write how you would fix this.", [
      c("access", "Makes findings findable at the point of need", 3, ["searchable", "repository", "tagged", "findable", "when they need"]),
      c("format", "Changes the format to something consumable", 3, ["short", "not reports", "summary", "atomic", "insight"]),
      c("habit", "Builds the habit of looking", 2, ["ritual", "before", "prompt", "part of", "kickoff"]),
    ]),
    typed("SCENARIO", "STAFF", "Product leadership wants to ship a dark pattern that would measurably increase conversion. Write your response.", [
      c("position", "Objects clearly and on principle", 3, ["would not", "object", "misleading", "deceptive", "trust"]),
      c("argument", "Argues in business terms too", 3, ["churn", "trust", "regulatory", "brand", "long term", "refund"]),
      c("alternative", "Offers a legitimate route to the goal", 2, ["instead", "alternative", "test", "honest version"]),
    ]),
    typed("SCENARIO", "STAFF", "You must cut the design team by a third while maintaining coverage. Write your plan.", [
      c("prioritisation", "Decides what stops explicitly", 3, ["stop", "not cover", "priority", "explicit", "no longer"]),
      c("leverage", "Uses systems and enablement to stretch capacity", 3, ["design system", "templates", "enable engineers", "self serve", "patterns"]),
      c("humanity", "Handles the people well", 2, ["transparent", "support", "honest", "fair"]),
    ]),
    typed("CODING", "STAFF", "Define the governance model for a design system used by 10 teams: contribution, review, versioning, deprecation and dispute resolution. Justify each choice.", [
      c("contribution", "Makes contributing genuinely possible", 3, ["contribute", "propose", "review", "path", "template"]),
      c("versioning", "Handles breaking change and migration", 3, ["version", "breaking", "deprecate", "migration", "notice"]),
      c("disputes", "Has a way to settle disagreements", 2, ["decide", "escalate", "council", "owner", "tie break"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Tell me about a time your design organisation was wrong about something important. How did you find out?", [
      c("admission", "Owns an organisational failure", 3, ["we were wrong", "missed", "assumed", "collectively"]),
      c("discovery", "Had a mechanism that surfaced it", 3, ["research", "data", "customers", "support", "someone said"]),
      c("correction", "Changed how they work as a result", 2, ["now", "changed", "process", "since"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Describe how you have influenced product strategy, not just product execution.", [
      c("level", "Operated at the level of what to build", 3, ["what to build", "strategy", "which problem", "direction", "not how"]),
      c("contribution", "Brought something only design could", 3, ["research", "user insight", "unmet need", "reframed", "evidence"]),
      c("outcome", "Changed a real decision", 2, ["decided", "changed direction", "shipped instead", "dropped"]),
    ]),
  ],
};
