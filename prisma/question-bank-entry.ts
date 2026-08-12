import type { BankDomain, BankQuestion, Criterion } from "./question-bank";

/**
 * Entry-level long-form questions.
 *
 * Measured gap: beginner papers draw only from BEGINNER and JUNIOR, and almost
 * every conceptual, scenario and behavioural question written so far sits at
 * MID or above. That left pools of 2, 1 and sometimes 0 against a paper that
 * needs 2, 1 and 1 — so those sections were identical for every candidate
 * while the multiple choice rotated freely. This file exists to give the
 * long-form sections the same room to vary.
 */

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
  difficulty: BankQuestion["difficulty"],
  prompt: string,
  criteria: Criterion[],
): BankQuestion => ({
  type: "SCENARIO",
  answerMode: "TYPED",
  difficulty,
  prompt,
  timeLimitSec: 330,
  criteria,
});

const c = (key: string, label: string, weight: number, keywords: string[]): Criterion => ({
  key, label, weight, keywords,
});

/** Behavioural prompts that work for someone with no professional experience. */
const OWNERSHIP = [
  c("specifics", "A real, specific situation rather than a generality", 3, ["when i", "we were", "the project", "last", "once"]),
  c("action", "What they personally did", 3, ["i did", "i tried", "i decided", "i asked", "i built"]),
  c("reflection", "What they took from it", 2, ["learned", "next time", "now i", "would"]),
];

const DIAGNOSIS = [
  c("method", "An ordered method rather than guessing", 3, ["first", "then", "check", "narrow", "step"]),
  c("evidence", "Looks at real evidence", 3, ["log", "error", "console", "read", "test", "reproduce"]),
  c("help", "Knows when and how to ask for help", 2, ["ask", "colleague", "search", "documentation"]),
];

function entry(slug: string, name: string, qs: BankQuestion[]): BankDomain {
  return { slug, name, blurb: "", questions: qs };
}

export const ENTRY_DOMAINS: BankDomain[] = [
  entry("fullstack-development", "Full Stack Development", [
    spoken("CONCEPTUAL", "BEGINNER", "What is the difference between the frontend and the backend? Explain it as you would to someone non-technical, then say which part you enjoy more and why.", [
      c("clarity", "Explains it plainly without jargon", 3, ["browser", "server", "user sees", "behind", "data"]),
      c("boundary", "Knows where the line is", 3, ["request", "api", "database", "sends", "returns"]),
      c("preference", "Honest, reasoned preference", 2, ["prefer", "enjoy", "because", "like"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What does it mean for a website to be 'slow', and what are the different things that could be causing it?", [
      c("dimensions", "Separates different kinds of slow", 3, ["load", "response", "render", "first", "interact"]),
      c("causes", "Names several plausible causes", 3, ["image", "database", "network", "javascript", "query", "server"]),
      c("measurement", "Would measure rather than guess", 2, ["measure", "check", "tool", "find out"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What does version control give you beyond a backup of your files?", [
      c("history", "Understands history and blame", 3, ["history", "who", "when", "why", "revert"]),
      c("collaboration", "Understands parallel work", 3, ["branch", "merge", "together", "conflict", "team"]),
      c("safety", "Enables safe experimentation", 2, ["try", "safe", "undo", "experiment"]),
    ]),
    typed("BEGINNER", "You are given a bug report that just says 'the site is broken'. Write out the questions you would ask and what you would check yourself before replying.", DIAGNOSIS),
    typed("JUNIOR", "You have two days to finish a feature and you realise on day one it will take four. Write what you do.", [
      c("timing", "Raises it immediately", 3, ["straight away", "immediately", "as soon", "tell", "flag"]),
      c("options", "Brings options, not just a problem", 3, ["could", "option", "cut", "scope", "partial"]),
      c("honesty", "Does not hide or over-promise", 2, ["honest", "realistic", "not", "cannot"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about something you built outside of coursework. What made you build it, and what was the hardest part?", OWNERSHIP),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time you were stuck on a problem for a long time. How did you get unstuck?", OWNERSHIP),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you had to learn something new quickly to finish a piece of work.", OWNERSHIP),
  ]),

  entry("frontend-react", "Frontend — React / TypeScript", [
    spoken("CONCEPTUAL", "BEGINNER", "What is a component, and how do you decide what should be its own component?", [
      c("definition", "Explains reuse and encapsulation", 3, ["reuse", "piece", "own", "self contained", "render"]),
      c("criteria", "Has a rule for splitting", 3, ["repeated", "responsibility", "too big", "separate", "reuse"]),
      c("example", "Grounded example", 2, ["button", "card", "form", "i made"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "Why does a web page need to work on a phone as well as a laptop, and what changes?", [
      c("awareness", "Names real differences", 3, ["screen", "touch", "small", "network", "slower"]),
      c("technique", "Knows some techniques", 3, ["responsive", "breakpoint", "flex", "media query", "stack"]),
      c("testing", "Would test on a real device", 2, ["test", "device", "check", "phone"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What does accessibility mean to you in practice, and what is the first thing you would check on a page?", [
      c("breadth", "Beyond just screen readers", 3, ["keyboard", "contrast", "label", "focus", "alt"]),
      c("first", "Has a concrete first check", 3, ["first", "tab", "keyboard", "start"]),
      c("motivation", "Understands who it serves", 2, ["users", "everyone", "cannot", "disab"]),
    ]),
    typed("BEGINNER", "A page you built looks correct on your machine and broken on a colleague's. Write how you would find out why.", DIAGNOSIS),
    typed("JUNIOR", "A designer hands you a layout that will not work on narrow screens. Write how you would handle the conversation and what you would propose.", [
      c("specifics", "Names the actual problem", 3, ["narrow", "overflow", "fixed", "column", "small"]),
      c("collaboration", "Engages rather than complies or refuses", 3, ["ask", "show", "discuss", "together", "suggest"]),
      c("proposal", "Brings a concrete alternative", 2, ["instead", "could", "stack", "propose"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about the first interface you built that other people actually used. What did you learn from their reaction?", OWNERSHIP),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time you had to rewrite something you had already finished. Why?", OWNERSHIP),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a piece of feedback on your code that changed how you work.", OWNERSHIP),
  ]),

  entry("backend-node", "Backend — Node.js / APIs", [
    spoken("CONCEPTUAL", "BEGINNER", "What happens between someone typing a URL and the page appearing? Take it as far as you can.", [
      c("chain", "Describes several real steps", 3, ["dns", "request", "server", "response", "render", "browser"]),
      c("honesty", "Says where their knowledge ends", 2, ["not sure", "think", "believe", "roughly"]),
      c("depth", "More than one layer", 2, ["then", "after", "next"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What is a database, and why not just store everything in files?", [
      c("purpose", "Understands structured querying", 3, ["query", "search", "structure", "relation", "find"]),
      c("concurrency", "Mentions many users at once", 2, ["same time", "concurrent", "lock", "multiple"]),
      c("integrity", "Mentions consistency or safety", 2, ["consistent", "transaction", "corrupt", "backup", "integrity"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What does it mean for user input to be untrusted, and where should it be checked?", [
      c("threat", "Understands input as an attack surface", 3, ["attack", "malicious", "anyone", "inject", "trust"]),
      c("placement", "Checks on the server", 3, ["server", "backend", "both", "not just"]),
      c("examples", "Concrete examples", 2, ["sql", "script", "length", "type", "validat"]),
    ]),
    typed("BEGINNER", "Your API returns 500 for one particular user but works for everyone else. Write how you would investigate.", DIAGNOSIS),
    typed("JUNIOR", "You are asked to add a field to an API response that mobile clients already consume. Write what you check before shipping it.", [
      c("compat", "Thinks about existing clients", 3, ["existing", "break", "old", "client", "backwards"]),
      c("additive", "Knows adding is usually safe", 2, ["additive", "adding", "safe", "ignore"]),
      c("verification", "Would verify rather than assume", 2, ["test", "check", "confirm", "ask"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time your code did something you did not expect. How did you work out what was happening?", OWNERSHIP),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a project where you had to work with someone else's code.", OWNERSHIP),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you disagreed with how something was being done on a project.", OWNERSHIP),
  ]),

  entry("backend-python", "Backend — Python", [
    spoken("CONCEPTUAL", "BEGINNER", "What is a function, and how do you decide when to pull code out into one?", [
      c("purpose", "Reuse and naming", 3, ["reuse", "repeat", "name", "once", "call"]),
      c("criteria", "Has a rule", 3, ["twice", "long", "does one thing", "readable", "separate"]),
      c("naming", "Cares about the name", 2, ["name", "describes", "clear"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What is an exception, and what should happen when one occurs in a program users depend on?", [
      c("definition", "Understands error signalling", 3, ["error", "raise", "stops", "unexpected", "signal"]),
      c("handling", "Handle what you can, surface the rest", 3, ["catch", "handle", "log", "message", "user"]),
      c("nuance", "Does not swallow everything", 2, ["not", "silent", "hide", "all"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What does it mean to say a piece of code is 'testable', and what makes code hard to test?", [
      c("properties", "Names what makes it testable", 3, ["pure", "input", "output", "inject", "separate", "small"]),
      c("obstacles", "Names real obstacles", 3, ["global", "network", "database", "time", "random", "hard coded"]),
      c("practice", "Has done it", 2, ["i", "we", "refactor", "changed"]),
    ]),
    typed("BEGINNER", "A script you wrote worked last week and fails today. Nothing in your code changed. Write how you would investigate.", DIAGNOSIS),
    typed("JUNIOR", "You inherit a script with no tests that you must change. Write what you do before changing it.", [
      c("safety", "Establishes a safety net first", 3, ["test", "before", "characteris", "record", "output"]),
      c("understanding", "Reads and understands first", 3, ["read", "understand", "run", "trace"]),
      c("increments", "Small steps", 2, ["small", "one", "step", "gradual"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about the most complicated thing you have built in Python. What made it complicated?", OWNERSHIP),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time you automated something tedious.", OWNERSHIP),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you had to make code someone else wrote work.", OWNERSHIP),
  ]),

  entry("app-development", "App Development (Mobile)", [
    spoken("CONCEPTUAL", "BEGINNER", "What makes designing for a phone different from designing for a computer?", [
      c("constraints", "Names real constraints", 3, ["screen", "touch", "thumb", "battery", "network", "interrupt"]),
      c("context", "Considers where people use phones", 3, ["moving", "outside", "distracted", "one hand", "anywhere"]),
      c("consequence", "Draws a design consequence", 2, ["bigger", "fewer", "simple", "so"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "Why does an app need to handle losing its internet connection, and what should it do?", [
      c("reality", "Treats offline as normal", 3, ["normal", "happens", "train", "lift", "signal"]),
      c("behaviour", "Says what the app should do", 3, ["message", "retry", "cache", "queue", "save"]),
      c("antipattern", "Knows what not to do", 2, ["not crash", "not blank", "not spinner", "forever"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What should an app do the first time it is opened by a brand new user?", [
      c("value", "Gets them to value quickly", 3, ["quick", "value", "straight", "without", "minimal"]),
      c("permissions", "Defers permission requests", 3, ["permission", "later", "when", "context", "explain"]),
      c("empty", "Handles empty state", 2, ["empty", "nothing", "first", "example"]),
    ]),
    typed("BEGINNER", "A tester says your app 'crashes sometimes'. Write how you would turn that into something you can fix.", DIAGNOSIS),
    typed("JUNIOR", "Your app must show a list that could contain five items or five thousand. Write how you would approach it.", [
      c("scale", "Recognises the difference matters", 3, ["thousand", "many", "large", "scroll", "memory"]),
      c("technique", "Names a technique", 3, ["paginat", "recycle", "virtual", "lazy", "load more"]),
      c("ux", "Considers the small case too", 2, ["empty", "few", "small", "both"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about an app you use every day. What would you change about it, and why?", [
      c("observation", "Specific, considered observation", 3, ["annoying", "notice", "every time", "wish"]),
      c("reasoning", "Reasons about why it is that way", 3, ["because", "maybe", "trade", "reason"]),
      c("humility", "Considers they might be wrong", 2, ["might", "perhaps", "unless", "could be"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about something you built that you had to test on a real device. What did you find?", OWNERSHIP),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you shipped something and immediately found a problem.", OWNERSHIP),
  ]),

  entry("uiux-design", "UI/UX Design", [
    spoken("CONCEPTUAL", "BEGINNER", "What makes a form pleasant to fill in? Think of one you have used that was awful.", [
      c("principles", "Names real principles", 3, ["fewer", "label", "error", "clear", "order", "group"]),
      c("example", "Concrete bad example", 3, ["once", "i had to", "it made me", "awful", "gave up"]),
      c("empathy", "Thinks from the user's side", 2, ["frustrat", "confus", "why", "expect"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What is the difference between a user wanting something and a user needing it? Why does the distinction matter to a designer?", [
      c("distinction", "Grasps stated versus underlying", 3, ["say", "actually", "underneath", "really", "behind"]),
      c("consequence", "Knows why it matters", 3, ["build wrong", "waste", "solve", "problem"]),
      c("method", "How they would find out", 2, ["ask", "why", "observe", "watch"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What is a user flow and how does it differ from a wireframe?", [
      c("distinction", "Path versus screen", 3, ["path", "steps", "journey", "screen", "layout"]),
      c("purpose", "Knows what each is for", 3, ["before", "decide", "structure", "agree"]),
      c("sequence", "Knows the order of work", 2, ["first", "then", "after"]),
    ]),
    typed("BEGINNER", "You are asked to improve a page you have never seen, with no brief. Write what you would do first.", [
      c("understand", "Understands purpose and audience first", 3, ["who", "what", "purpose", "goal", "ask"]),
      c("evidence", "Looks for data or observation", 3, ["data", "analytics", "watch", "user", "test"]),
      c("restraint", "Does not redesign immediately", 2, ["before", "not straight", "first", "understand"]),
    ]),
    typed("JUNIOR", "Three stakeholders give you three contradictory pieces of feedback on the same screen. Write how you would proceed.", [
      c("surface", "Surfaces the contradiction openly", 3, ["conflict", "contradict", "together", "raise"]),
      c("criteria", "Resolves against a shared goal", 3, ["goal", "user", "objective", "which", "criteria"]),
      c("decision", "Gets to a decision", 2, ["decide", "agree", "recommend", "propose"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Walk me through something you designed. Why does it look the way it does?", [
      c("intent", "Decisions were intentional", 3, ["because", "chose", "wanted", "so that"]),
      c("audience", "Considered who it was for", 3, ["user", "audience", "they", "reader"]),
      c("critique", "Can critique their own work", 2, ["would change", "weak", "now"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time you watched someone use something you made.", OWNERSHIP),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a design decision you made that you could not fully justify at the time.", OWNERSHIP),
  ]),

  entry("graphic-design", "Graphic Design", [
    spoken("CONCEPTUAL", "BEGINNER", "How do you decide which typeface to use for a piece of work?", [
      c("criteria", "Has real criteria", 3, ["legib", "tone", "audience", "context", "pair", "size"]),
      c("context", "Considers where it will be seen", 3, ["print", "screen", "small", "far", "poster"]),
      c("restraint", "Not purely taste", 2, ["not just", "because", "suit", "appropriate"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What does colour do in a design beyond making it look nice?", [
      c("function", "Colour as a functional tool", 3, ["hierarchy", "attention", "group", "meaning", "mood", "brand"]),
      c("accessibility", "Aware not everyone sees it the same", 2, ["contrast", "colour blind", "read", "accessib"]),
      c("restraint", "Knows too much is a problem", 2, ["too many", "limit", "palette", "few"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What does it mean for a design to be 'on brand', and how would you check?", [
      c("system", "Brand as a system", 3, ["guideline", "system", "consistent", "typography", "palette", "tone"]),
      c("check", "Concrete way to verify", 3, ["compare", "guideline", "existing", "side by side", "check"]),
      c("judgement", "Knows rules can bend", 2, ["but", "sometimes", "spirit", "depends"]),
    ]),
    typed("BEGINNER", "A client asks for 'something more modern' with no other direction. Write what you would ask and what you would bring back.", [
      c("questions", "Turns vagueness into specifics", 3, ["what", "which", "example", "show me", "mean"]),
      c("references", "Uses references to align", 3, ["reference", "moodboard", "example", "show"]),
      c("options", "Returns with options", 2, ["options", "directions", "two", "three"]),
    ]),
    typed("JUNIOR", "You have finished a design and notice a mistake after it has gone to print. Write what you do.", [
      c("ownership", "Owns it immediately", 3, ["tell", "immediately", "own", "my", "raise"]),
      c("assessment", "Assesses severity honestly", 3, ["how bad", "noticeable", "cost", "reprint", "impact"]),
      c("prevention", "Prevents a repeat", 2, ["checklist", "proof", "next time", "process"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a piece of design work you are proud of. What made it work?", OWNERSHIP),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time you had to work to a very tight deadline.", OWNERSHIP),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time a client rejected your work. What happened next?", OWNERSHIP),
  ]),

  entry("devops-cloud", "DevOps / Cloud Infrastructure", [
    spoken("CONCEPTUAL", "BEGINNER", "What does 'deploying' actually mean, and what can go wrong during it?", [
      c("definition", "Understands getting code to users", 3, ["server", "live", "users", "release", "running"]),
      c("risks", "Names real risks", 3, ["downtime", "break", "config", "database", "rollback", "half"]),
      c("safety", "Knows deploys should be reversible", 2, ["rollback", "revert", "undo", "back"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "Why do teams keep separate environments rather than working directly on the live system?", [
      c("risk", "Understands the blast radius", 3, ["users", "break", "real", "live", "risk"]),
      c("testing", "Environment as a rehearsal", 3, ["test", "try", "before", "safe", "practice"]),
      c("limits", "Knows they drift", 2, ["different", "not the same", "drift", "still"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What would you want to know about a system before being put on call for it?", [
      c("operational", "Asks operational questions", 3, ["alert", "runbook", "escalate", "dashboard", "common"]),
      c("architecture", "Wants to understand the shape", 2, ["depend", "architecture", "what talks", "database"]),
      c("humility", "Knows what they will not know", 2, ["ask", "who", "help", "unfamiliar"]),
    ]),
    typed("BEGINNER", "A deploy has gone out and the site is down. You are the only person available. Write exactly what you do, in order.", [
      c("priority", "Restores service before diagnosing", 3, ["rollback", "revert", "first", "restore", "back"]),
      c("communication", "Tells people", 3, ["tell", "inform", "notify", "status"]),
      c("afterwards", "Investigates afterwards", 2, ["then", "after", "once", "investigate"]),
    ]),
    typed("JUNIOR", "You notice a server has been at 95% disk usage for a week and nobody has mentioned it. Write what you do.", [
      c("urgency", "Treats it as urgent", 3, ["urgent", "soon", "fill", "before", "now"]),
      c("investigation", "Finds out what is filling it", 3, ["what", "logs", "which", "largest", "growing"]),
      c("durability", "Fixes it lastingly", 2, ["rotate", "clean", "alert", "monitor", "automate"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time something you were responsible for broke. What did you do?", OWNERSHIP),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a manual task you found tedious and what you did about it.", OWNERSHIP),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you had to fix something under time pressure.", OWNERSHIP),
  ]),

  entry("data-engineering", "Data Engineering", [
    spoken("CONCEPTUAL", "BEGINNER", "What could make a number on a dashboard wrong, even when nothing has crashed?", [
      c("causes", "Names several silent causes", 3, ["duplicate", "missing", "filter", "late", "timezone", "definition"]),
      c("silence", "Understands why it goes unnoticed", 3, ["no error", "silent", "looks fine", "nobody"]),
      c("checking", "Would verify against a source", 2, ["compare", "source", "check", "reconcile"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What is the difference between data and information? Why does it matter to someone building pipelines?", [
      c("distinction", "Raw versus interpreted", 3, ["raw", "context", "meaning", "answer", "decision"]),
      c("relevance", "Connects to the job", 3, ["question", "who", "use", "decision", "purpose"]),
      c("example", "Concrete example", 2, ["for example", "such as", "like"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "Someone asks you for 'all the data'. What do you ask them before writing any query?", [
      c("purpose", "Asks what decision it serves", 3, ["what for", "decision", "question", "why", "use"]),
      c("scope", "Narrows scope", 3, ["which", "period", "columns", "how much", "filter"]),
      c("pushback", "Willing to redirect the request", 2, ["instead", "rather", "suggest", "better"]),
    ]),
    typed("BEGINNER", "A report that ran fine all month produced no rows this morning. Write how you would investigate.", DIAGNOSIS),
    typed("JUNIOR", "You are asked to combine data from two systems that disagree about what a 'customer' is. Write how you would approach it.", [
      c("definition", "Establishes definitions first", 3, ["definition", "what counts", "mean", "agree", "differ"]),
      c("stakeholders", "Involves the people who own them", 3, ["ask", "owner", "team", "business", "confirm"]),
      c("documentation", "Writes the decision down", 2, ["document", "record", "note", "decide"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time you found a mistake in data you were given.", OWNERSHIP),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about something you analysed where the answer surprised you.", OWNERSHIP),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you had to explain a technical result to someone non-technical.", OWNERSHIP),
  ]),

  entry("qa-automation", "QA / Test Automation", [
    spoken("CONCEPTUAL", "BEGINNER", "How would you test a login page? Talk me through what you would try.", [
      c("happy", "Covers the working case", 2, ["correct", "valid", "works", "logs in"]),
      c("unhappy", "Goes well beyond the happy path", 3, ["wrong", "empty", "blank", "long", "special", "case"]),
      c("thinking", "Thinks about abuse and edges", 3, ["many times", "brute", "sql", "space", "unicode", "lock"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What is the difference between a bug and a feature request? Who decides?", [
      c("distinction", "Behaviour versus expectation", 3, ["expected", "supposed", "spec", "intended", "different"]),
      c("greyarea", "Acknowledges the grey area", 3, ["depends", "unclear", "argue", "not always"]),
      c("decision", "Knows it is a shared decision", 2, ["product", "team", "discuss", "owner"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "Why can a tester never say a piece of software is bug free?", [
      c("logic", "Understands you cannot prove absence", 3, ["cannot prove", "absence", "infinite", "never know", "only"]),
      c("practical", "Explains what testing does give", 3, ["confidence", "risk", "reduce", "found", "evidence"]),
      c("communication", "Would phrase it honestly to a manager", 2, ["tell", "say", "instead", "confidence"]),
    ]),
    typed("BEGINNER", "You find a bug an hour before a release everyone is waiting for. Write what you do.", [
      c("assessment", "Assesses severity first", 3, ["how bad", "severity", "impact", "many", "workaround"]),
      c("communication", "Raises it clearly and immediately", 3, ["tell", "raise", "immediately", "inform"]),
      c("decision", "Knows it is not their decision alone", 2, ["decide", "team", "product", "together"]),
    ]),
    typed("JUNIOR", "A developer keeps rejecting your bugs as 'works as designed'. Write how you would handle it.", [
      c("evidence", "Brings evidence and expectations", 3, ["spec", "expected", "user", "example", "show"]),
      c("relationship", "Not adversarial", 3, ["together", "understand", "ask", "talk"]),
      c("escalation", "Knows when to widen the conversation", 2, ["product", "owner", "clarify", "decide"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time you found a problem nobody else had noticed.", OWNERSHIP),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a time you had to explain a problem to someone who did not believe you.", OWNERSHIP),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time you were responsible for checking something and missed a problem.", OWNERSHIP),
  ]),
];
