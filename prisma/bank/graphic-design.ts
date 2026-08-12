import type { BankDomain } from "../question-bank";
import { c, mcq, spoken, typed } from "./authoring";

/**
 * Graphic Design — depth tranche.
 *
 * Multiple choice covers the craft knowledge that is genuinely right or wrong —
 * colour modes, resolution, production. The long-form questions test the part
 * that actually separates designers: reading a brief, defending a decision, and
 * working with clients who cannot articulate what they want.
 */
export const GRAPHIC_DESIGN_DEPTH: BankDomain = {
  slug: "graphic-design",
  name: "Graphic Design",
  blurb: "Creates visual work for brand, print and digital.",
  questions: [
    // --- BEGINNER ---------------------------------------------------------
    mcq(
      "BEGINNER",
      "You need a logo to appear crisp at any size, from a business card to a vehicle wrap. Which format should the master file be?",
      ["A high-resolution PNG", "A vector file such as AI, EPS or SVG", "A 300dpi JPEG", "A layered PSD"],
      1,
      "Vectors are mathematical descriptions, so they scale without loss. Raster masters force a resolution decision you cannot undo.",
    ),
    mcq(
      "BEGINNER",
      "What does 'bleed' mean in print production?",
      [
        "The area of a page left intentionally blank",
        "Artwork extended beyond the trim line so a slight cutting variance does not leave a white edge",
        "Ink spreading into the paper fibres",
        "The gap between columns of text",
      ],
      1,
      "Usually 3mm. Without it, a fractionally misaligned guillotine leaves a white sliver along the edge of every copy.",
    ),
    mcq(
      "BEGINNER",
      "Which pairing is usually the safest starting point for a two-typeface layout?",
      [
        "Two sans-serifs of similar weight",
        "One serif and one sans-serif with clearly different roles",
        "Two display typefaces",
        "Two scripts",
      ],
      1,
      "Contrast is what makes a pairing read as deliberate. Two similar faces look like a mistake rather than a decision.",
    ),
    mcq(
      "BEGINNER",
      "What does 'tracking' adjust?",
      [
        "The space between two specific characters",
        "The overall letter spacing across a run of text",
        "The vertical space between lines",
        "The width of the text column",
      ],
      1,
      "Kerning is the pair-by-pair adjustment; tracking is uniform across a range. Tightening tracking on small text quickly harms legibility.",
    ),
    mcq(
      "BEGINNER",
      "A client sends a 72dpi image at 500×300px for a full-page A4 print advert. What is the correct response?",
      [
        "Upscale it in Photoshop to 300dpi",
        "Explain that it lacks the pixel data for print and request the original or an alternative",
        "Apply a sharpening filter",
        "Print it and see how it looks",
      ],
      1,
      "Upscaling invents pixels; it does not recover detail. The honest answer is that the source is insufficient for the output size.",
    ),
    mcq(
      "BEGINNER",
      "Why is a design usually stronger when it uses a limited palette?",
      [
        "It costs less to print",
        "Fewer colours make hierarchy and relationships clearer, and each colour retains meaning",
        "It is easier to reproduce on screen",
        "Clients prefer fewer colours",
      ],
      1,
      "When everything is emphasised, nothing is. A restrained palette lets one accent actually direct attention.",
    ),
    spoken("CONCEPTUAL", "BEGINNER", "What is alignment, and why does a layout feel wrong when it is slightly off?", [
      c("mechanism", "Explains the eye detecting relationships", 3, ["edge", "line up", "invisible line", "relationship", "eye"]),
      c("effect", "Describes the felt effect of misalignment", 3, ["untidy", "unsettled", "wrong", "amateur", "noticeable"]),
      c("practice", "Names how alignment is achieved deliberately", 2, ["grid", "guides", "consistent", "same edge"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "How do you decide what should be the biggest element on a page?", [
      c("purpose", "Starts from what the piece must achieve", 3, ["message", "purpose", "what should they", "first", "goal"]),
      c("audience", "Considers who is looking and how", 3, ["audience", "glance", "distance", "context", "passing"]),
      c("hierarchy", "Describes building order deliberately", 2, ["hierarchy", "second", "then", "order"]),
    ]),
    spoken("CONCEPTUAL", "BEGINNER", "What does a grid do for a layout, and when would you break it?", [
      c("function", "Explains structure and consistency", 3, ["structure", "consistent", "align", "rhythm", "decisions"]),
      c("breaking", "Breaks it deliberately for emphasis", 3, ["break", "emphasis", "stand out", "deliberate", "one element"]),
      c("discipline", "Distinguishes breaking from ignoring", 2, ["on purpose", "not random", "reason", "know the rule"]),
    ]),
    typed("SCENARIO", "BEGINNER", "A client says your design 'needs more energy'. Write exactly what you would ask and how you would proceed.", [
      c("clarification", "Turns the vague word into specifics", 3, ["what do you mean", "example", "show me", "which part", "compared to"]),
      c("reference", "Seeks visual references", 3, ["reference", "example", "like", "show", "competitor"]),
      c("direction", "Proposes concrete interpretations", 2, ["colour", "contrast", "movement", "type", "options"]),
    ]),
    typed("SCENARIO", "BEGINNER", "You are given a brief with no budget, no deadline and no audience specified. Write what you would establish before starting.", [
      c("audience", "Establishes who it is for", 3, ["who", "audience", "age", "customers", "for whom"]),
      c("purpose", "Establishes what success looks like", 3, ["goal", "what should", "action", "why", "achieve"]),
      c("constraints", "Establishes practical constraints", 2, ["deadline", "budget", "format", "where", "print or"]),
    ]),
    typed("SCENARIO", "BEGINNER", "You notice a spelling error in a design after it has been approved but before it goes to print. Write what you do.", [
      c("promptness", "Raises it immediately", 3, ["immediately", "straight away", "tell", "flag", "stop"]),
      c("ownership", "Takes responsibility without excuses", 3, ["my", "own", "sorry", "responsible", "not blame"]),
      c("process", "Improves proofing afterwards", 2, ["proof", "check", "second pair", "process", "sign off"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Tell me about a piece of work where the constraints were tight. How did they affect the outcome?", [
      c("constraint", "Names a real constraint", 3, ["budget", "one colour", "deadline", "size", "no photography"]),
      c("response", "Worked within it creatively", 3, ["instead", "used", "solved", "made it"]),
      c("reflection", "Honest about the result", 2, ["better", "worse", "learned", "would"]),
    ]),
    spoken("BEHAVIORAL", "BEGINNER", "Describe how you take a piece of work from brief to finished. What does your process actually look like?", [
      c("research", "Starts with understanding rather than software", 3, ["brief", "research", "questions", "reference", "understand"]),
      c("exploration", "Explores before committing", 3, ["sketch", "options", "rough", "several", "iterate"]),
      c("refinement", "Refines and checks", 2, ["refine", "feedback", "check", "detail", "proof"]),
    ]),

    // --- JUNIOR -----------------------------------------------------------
    mcq(
      "JUNIOR",
      "A brand colour is specified as a Pantone. Why does it also need CMYK and RGB definitions?",
      [
        "Pantone is being discontinued",
        "Pantone cannot be reproduced in process printing or on screen, so the nearest equivalents must be specified rather than left to chance",
        "CMYK is more accurate",
        "It is required by brand guidelines",
      ],
      1,
      "If you do not specify the conversions, every printer and developer picks their own, and the brand colour drifts across applications.",
    ),
    mcq(
      "JUNIOR",
      "What is the practical problem with setting long body text in a light weight at small size?",
      [
        "It uses more ink",
        "Thin strokes at small sizes reduce legibility, especially in print and for readers with lower vision",
        "Light weights are not available in all typefaces",
        "It looks dated",
      ],
      1,
      "It photographs well in a presentation and fails in the hand. Body text needs a weight that survives the reproduction method.",
    ),
    mcq(
      "JUNIOR",
      "You are asked to place white text over a photograph. What is the most robust approach?",
      [
        "Choose a bold typeface",
        "Control the background — a gradient, scrim or selected area — so contrast is guaranteed regardless of the image",
        "Add a drop shadow",
        "Increase the text size",
      ],
      1,
      "Any technique that depends on this particular photograph breaks when the image is swapped. Controlling the background makes it repeatable.",
    ),
    mcq(
      "JUNIOR",
      "What does overprinting black text on a coloured background avoid?",
      [
        "Ink saturation problems",
        "A white halo if the colour plates shift slightly during printing",
        "Colour banding",
        "Moiré patterns",
      ],
      1,
      "Knocking out the background behind small black type leaves it vulnerable to registration error. Overprint is the standard treatment.",
    ),
    mcq(
      "JUNIOR",
      "A client wants their logo enlarged on every piece of collateral. What is the professional response?",
      [
        "Comply; it is their brand",
        "Establish what they are worried about — usually recognition — and show how hierarchy achieves it better than size alone",
        "Refuse on design principle",
        "Enlarge it slightly as a compromise",
      ],
      1,
      "The request is usually a symptom of a fear about visibility. Addressing the fear directly leads somewhere; arguing about size does not.",
    ),
    mcq(
      "JUNIOR",
      "What is the main risk of designing a layout entirely with placeholder Latin text?",
      [
        "It is not accessible",
        "Real content is a different length and shape, so the layout may collapse when it arrives",
        "Clients cannot read it",
        "It cannot be printed",
      ],
      1,
      "Real headlines run to three lines and real names are longer than 'John Smith'. Designing with realistic content surfaces those problems early.",
    ),
    spoken("CONCEPTUAL", "JUNIOR", "What makes a logo work, beyond looking good in a presentation?", [
      c("reproduction", "Works across sizes and media", 3, ["small", "favicon", "embroidery", "one colour", "reproduce"]),
      c("distinctiveness", "Distinguishable from competitors", 3, ["distinct", "recognisable", "different", "memorable", "silhouette"]),
      c("longevity", "Not tied to a passing trend", 2, ["timeless", "trend", "date", "years"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "How do you present work to a client so that feedback is useful rather than a matter of taste?", [
      c("framing", "Frames it against the brief", 3, ["brief", "objective", "audience", "because", "goal"]),
      c("rationale", "Explains decisions before showing", 3, ["rationale", "why", "explain", "reasoning", "led to"]),
      c("questions", "Asks directed questions", 2, ["does this", "specific", "ask", "which", "guide"]),
    ]),
    spoken("CONCEPTUAL", "JUNIOR", "What does 'on brand' actually mean, and how would you check something is?", [
      c("system", "Sees brand as a system, not a logo", 3, ["tone", "type", "colour", "photography", "system", "voice"]),
      c("check", "Has a concrete way of checking", 3, ["guidelines", "compare", "side by side", "without the logo", "recognisable"]),
      c("judgement", "Knows guidelines cannot cover everything", 2, ["judgement", "spirit", "not covered", "interpret"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A print run has come back and the colours look noticeably different from your proof. Write how you would investigate.", [
      c("evidence", "Compares against the correct reference", 3, ["proof", "compare", "which proof", "contract proof", "reference"]),
      c("causes", "Considers real production causes", 3, ["paper", "stock", "profile", "cmyk", "press", "coating", "rgb"]),
      c("resolution", "Handles it professionally with the printer", 2, ["printer", "discuss", "reprint", "evidence", "client"]),
    ]),
    typed("SCENARIO", "JUNIOR", "You are handed a brand guideline that specifies a colour combination failing contrast requirements for digital use. Write your response.", [
      c("problem", "Explains the accessibility consequence", 3, ["contrast", "readable", "wcag", "cannot read", "low vision"]),
      c("respect", "Does not simply ignore the guideline", 3, ["guideline", "brand", "work with", "raise", "custodian"]),
      c("solution", "Proposes a compliant extension", 2, ["digital palette", "darker", "variant", "extend", "alternative"]),
    ]),
    typed("SCENARIO", "JUNIOR", "A client keeps requesting small changes after sign-off and the project has run well over. Write how you would handle it.", [
      c("boundary", "Addresses scope explicitly", 3, ["scope", "sign off", "rounds", "agreed", "additional"]),
      c("professionalism", "Stays constructive rather than resentful", 3, ["happy to", "explain", "options", "cost", "understand"]),
      c("prevention", "Prevents recurrence in future projects", 2, ["contract", "rounds", "upfront", "next time", "agree"]),
    ]),
    typed("CODING", "JUNIOR", "Write the complete file handover specification for a logo delivered to a client: formats, colour variants, minimum sizes and usage notes.", [
      c("formats", "Covers vector and raster for print and screen", 3, ["svg", "eps", "ai", "png", "pdf", "vector", "raster"]),
      c("variants", "Covers colour, mono and reversed versions", 3, ["one colour", "reversed", "black", "white", "mono", "cmyk", "rgb"]),
      c("usage", "Specifies minimum size and clear space", 2, ["minimum size", "clear space", "exclusion", "do not", "misuse"]),
    ]),
    typed("CODING", "JUNIOR", "Write a complete typographic specification for a long-form article page: sizes, leading, measure, weights and hierarchy across three breakpoints.", [
      c("readability", "Specifies measure and leading for reading", 3, ["measure", "characters", "line length", "leading", "line height"]),
      c("hierarchy", "Defines a clear, limited hierarchy", 3, ["h1", "h2", "body", "caption", "scale", "levels"]),
      c("responsive", "Adapts sensibly across sizes", 2, ["breakpoint", "mobile", "smaller", "scale", "adjust"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Tell me about a time a client rejected your work entirely. What did you do next?", [
      c("composure", "Handled it without defensiveness", 3, ["listened", "not defensive", "asked", "calm"]),
      c("diagnosis", "Established the real reason", 3, ["why", "underlying", "brief", "misunderstood", "expected"]),
      c("recovery", "Got to a good outcome", 2, ["went back", "new direction", "approved", "resolved"]),
    ]),
    spoken("BEHAVIORAL", "JUNIOR", "Describe a piece of work where you had to follow someone else's visual system rather than your own instincts.", [
      c("discipline", "Worked within the system faithfully", 3, ["followed", "system", "guidelines", "consistent", "not my taste"]),
      c("craft", "Still found room to do good work", 3, ["within", "still", "found", "made it work"]),
      c("perspective", "Understands why consistency matters", 2, ["recognition", "consistency", "brand", "bigger than"]),
    ]),

    // --- MID --------------------------------------------------------------
    mcq(
      "MID",
      "Why does a grid help a layout even when the finished design does not look grid-like?",
      [
        "It speeds up production",
        "It gives every placement decision a reason, so the relationships feel intentional rather than arbitrary",
        "It is required by most design software",
        "It guarantees accessibility",
      ],
      1,
      "The grid is scaffolding for decisions. A viewer cannot see it but does perceive the consistency of relationships it produces.",
    ),
    mcq(
      "MID",
      "You must design for a language you cannot read. What is the most important safeguard?",
      [
        "Use a translation tool to check the text",
        "Have a native reader review the final layout, since line breaks, emphasis and typography can change meaning",
        "Increase the type size",
        "Use only images",
      ],
      1,
      "Layout decisions carry meaning. A break in the wrong place, or emphasis on the wrong word, is invisible to you and obvious to a reader.",
    ),
    mcq(
      "MID",
      "A campaign must work as a billboard, a social post and an email header. What should drive the design?",
      [
        "Designing the billboard first and scaling it down",
        "Designing a system whose elements can be recomposed per format, with the core idea legible in each",
        "Designing the smallest format first",
        "Producing three unrelated designs",
      ],
      1,
      "Scaling one composition produces a bad version in every other format. What travels between formats is the idea and the system, not the arrangement.",
    ),
    mcq(
      "MID",
      "What is the most defensible reason to reject a trend-led direction for a brand identity?",
      [
        "Trends are inherently bad design",
        "The identity must still function in five years, and a strongly dated look will require expensive replacement",
        "Clients dislike trends",
        "Trends are harder to execute",
      ],
      1,
      "Trend can be right for a campaign with a short life. For an identity, the replacement cost and loss of accumulated recognition is the argument.",
    ),
    mcq(
      "MID",
      "A client asks why they should pay for brand guidelines as well as a logo. What is the strongest answer?",
      [
        "It is standard industry practice",
        "Without them, everyone who touches the brand invents their own version and the identity dissolves within a year",
        "Guidelines make the logo look better",
        "It protects the designer legally",
      ],
      1,
      "The value is consistency at scale across people you will never meet. A logo alone survives exactly as long as the person who commissioned it remembers the intent.",
    ),
    mcq(
      "MID",
      "What is the practical risk of designing with a typeface without checking its licence?",
      [
        "It may not render correctly",
        "Desktop, web, app and broadcast use are licensed separately, and the client can face a claim for use you enabled",
        "It may lack certain glyphs",
        "It cannot be embedded in a PDF",
      ],
      1,
      "Licensing is a real commercial exposure that lands on the client. Establishing the required uses before selecting is part of the job.",
    ),
    spoken("CONCEPTUAL", "MID", "How do you critique your own work? What do you actually do?", [
      c("distance", "Creates distance from the work", 3, ["leave it", "next day", "print", "different context", "flip"]),
      c("criteria", "Judges against the brief, not taste", 3, ["brief", "does it", "audience", "objective", "purpose"]),
      c("ruthlessness", "Willing to discard", 2, ["start again", "cut", "kill", "not attached"]),
    ]),
    spoken("CONCEPTUAL", "MID", "What is the difference between a brand identity and a visual style, and why does the distinction matter commercially?", [
      c("scope", "Identity is broader and strategic", 3, ["values", "positioning", "voice", "behaviour", "who they are"]),
      c("style", "Style is one expression of it", 3, ["expression", "look", "surface", "one", "changes"]),
      c("commercial", "Ties it to business consequence", 2, ["recognition", "equity", "value", "consistency", "cost"]),
    ]),
    spoken("CONCEPTUAL", "MID", "How do you decide when a design is finished?", [
      c("criteria", "Uses the brief rather than exhaustion", 3, ["brief", "achieves", "objective", "does the job"]),
      c("subtraction", "Tests by removing rather than adding", 3, ["remove", "take away", "nothing left", "subtract"]),
      c("pragmatism", "Accepts constraints of time and budget", 2, ["deadline", "good enough", "diminishing", "budget"]),
    ]),
    spoken("CONCEPTUAL", "MID", "How would you approach designing for an audience whose culture you do not share?", [
      c("humility", "Does not design from assumption", 3, ["not assume", "my culture", "research", "do not know"]),
      c("research", "Researches meaning, not just aesthetics", 3, ["meaning", "colour", "symbol", "convention", "research", "taboo"]),
      c("validation", "Has it reviewed by that audience", 2, ["review", "native", "local", "check with", "test"]),
    ]),
    typed("SCENARIO", "MID", "You are given two days to produce 14 assets across print and digital for a campaign. Write how you would approach it.", [
      c("system", "Builds a reusable system rather than 14 designs", 3, ["system", "master", "template", "components", "reuse"]),
      c("sequencing", "Establishes the hardest format first", 3, ["hardest", "first", "most constrained", "sets", "then adapt"]),
      c("realism", "Flags risk rather than silently over-committing", 2, ["flag", "risk", "which first", "prioritise", "cannot"]),
    ]),
    typed("SCENARIO", "MID", "A client's in-house team keeps producing off-brand material despite having guidelines. Write your diagnosis and plan.", [
      c("diagnosis", "Assumes a usability problem, not incompetence", 3, ["hard to use", "cannot find", "no templates", "why", "unusable"]),
      c("tooling", "Gives them working tools", 3, ["templates", "assets", "presets", "library", "easy"]),
      c("support", "Adds training and a point of contact", 2, ["training", "walk through", "ask", "review", "help"]),
    ]),
    typed("SCENARIO", "MID", "A client asks you to closely imitate a competitor's identity. Write your response.", [
      c("risk", "Names legal and strategic risk", 3, ["legal", "trademark", "confusion", "risk", "copy"]),
      c("strategy", "Argues distinctiveness serves them better", 3, ["stand out", "distinct", "differentiate", "why would", "recognition"]),
      c("understanding", "Finds what they actually admire", 2, ["what do you like", "which part", "underlying", "quality"]),
    ]),
    typed("CODING", "MID", "Write a complete brand guideline section for typography: the typefaces, licensing scope, hierarchy, minimum sizes, digital fallbacks and what is not permitted.", [
      c("completeness", "Covers hierarchy and application", 3, ["hierarchy", "heading", "body", "sizes", "weights", "leading"]),
      c("practical", "Covers licensing and fallbacks", 3, ["licence", "fallback", "web font", "system font", "substitute"]),
      c("prohibitions", "States what must not be done", 2, ["do not", "never", "not permitted", "avoid", "stretch"]),
    ]),
    typed("CODING", "MID", "Critique this brief and rewrite it: 'We need a fresh, modern rebrand that appeals to everyone and stands out.'", [
      c("critique", "Identifies the specific failures", 3, ["everyone", "vague", "modern means", "no audience", "unmeasurable"]),
      c("questions", "Asks what is missing", 3, ["who", "why now", "what problem", "competitors", "success"]),
      c("rewrite", "Produces something actionable", 2, ["rewrite", "specific", "audience", "objective", "measurable"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Tell me about a time you had to defend a design decision to someone senior who disagreed.", [
      c("substance", "Had a reasoned case", 3, ["because", "brief", "audience", "evidence", "research"]),
      c("delivery", "Argued respectfully", 3, ["listened", "explained", "showed", "options"]),
      c("outcome", "Reports the real result including losing", 2, ["they decided", "changed", "kept", "compromise"]),
    ]),
    spoken("BEHAVIORAL", "MID", "Describe a project where you had to compromise your design standards. How did you feel about it and what did you do?", [
      c("honesty", "Names a real compromise", 3, ["compromise", "not proud", "had to", "budget", "deadline"]),
      c("mitigation", "Protected what mattered most", 3, ["protected", "at least", "core", "made sure"]),
      c("perspective", "Mature about professional reality", 2, ["reality", "client", "learned", "trade-off"]),
    ]),

    // --- SENIOR -----------------------------------------------------------
    mcq(
      "SENIOR",
      "A company with five product lines and no visual consistency asks you to 'unify' them. What should you establish first?",
      [
        "Which product line has the best existing design",
        "Whether the products serve the same audiences and whether unification serves the business or merely tidiness",
        "The budget available",
        "Which typefaces are already licensed",
      ],
      1,
      "Unification can destroy equity a product line has built. A branded house and a house of brands are both legitimate; the choice is strategic.",
    ),
    mcq(
      "SENIOR",
      "What is the strongest justification for a rebrand to a sceptical board?",
      [
        "The current identity looks dated",
        "A specific business problem the identity is causing — confusion with a competitor, a shifted market, or an inability to extend",
        "Competitors have rebranded recently",
        "The design team wants to",
      ],
      1,
      "Looking dated is a symptom. The board will fund a solution to a business problem, not a matter of taste.",
    ),
    mcq(
      "SENIOR",
      "Which is the most reliable measure that a rebrand has succeeded?",
      [
        "Positive feedback on social media at launch",
        "Sustained improvement in the specific business measures the rebrand was intended to address",
        "Design award recognition",
        "Internal enthusiasm",
      ],
      1,
      "Launch reaction is dominated by unfamiliarity and is a poor predictor. What matters is whether the problem it was commissioned to solve moved.",
    ),
    spoken("CONCEPTUAL", "SENIOR", "How do you build a visual system that many people, including non-designers, will apply without your involvement?", [
      c("constraint", "Constrains choices deliberately", 3, ["limited", "constrain", "fewer options", "hard to get wrong", "defaults"]),
      c("tooling", "Provides working templates and assets", 3, ["template", "asset", "library", "ready", "preset"]),
      c("governance", "Plans for questions and evolution", 2, ["who decides", "review", "request", "update", "owner"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "How do you set and maintain a quality bar across a team of designers with different levels of experience?", [
      c("standards", "Makes the bar explicit", 3, ["explicit", "criteria", "examples", "what good looks like", "reference"]),
      c("critique", "Uses structured critique", 3, ["critique", "review", "regular", "against brief", "constructive"]),
      c("growth", "Raises capability rather than only rejecting", 2, ["teach", "pair", "feedback", "grow", "why"]),
    ]),
    spoken("CONCEPTUAL", "SENIOR", "What is your view on how design should be priced and scoped for clients?", [
      c("value", "Considers value rather than only hours", 3, ["value", "outcome", "not hourly", "impact", "scope"]),
      c("scope", "Defines rounds and boundaries", 3, ["rounds", "scope", "revisions", "defined", "change"]),
      c("relationship", "Protects the working relationship", 2, ["clear upfront", "trust", "expectations", "no surprises"]),
    ]),
    typed("SCENARIO", "SENIOR", "You are leading a rebrand and the founder wants their personal aesthetic preferences to drive it. Write how you would handle it.", [
      c("reframe", "Moves the conversation to audience and objectives", 3, ["audience", "customers", "objective", "not us", "who is it for"]),
      c("respect", "Takes the founder's instinct seriously", 3, ["listen", "their vision", "understand", "why", "founder"]),
      c("evidence", "Introduces evidence into the decision", 2, ["test", "research", "show", "compare", "data"]),
    ]),
    typed("SCENARIO", "SENIOR", "Your identity work has launched and is being criticised publicly. Write how you and the client should respond.", [
      c("composure", "Does not respond defensively in public", 3, ["not defensive", "calm", "do not argue", "measured"]),
      c("substance", "Separates real problems from noise", 3, ["real issue", "legitimate", "noise", "assess", "which"]),
      c("perspective", "Knows launch reaction is unrepresentative", 2, ["unfamiliar", "settles", "always happens", "time"]),
    ]),
    typed("SCENARIO", "SENIOR", "A long-standing client's business has changed and their identity no longer fits, but they have not asked for help. Write how you would raise it.", [
      c("evidence", "Grounds it in their business change", 3, ["your business", "changed", "no longer", "customers", "observed"]),
      c("tact", "Raises it without implying past failure", 3, ["worked well", "evolved", "not wrong", "grown"]),
      c("proposal", "Offers a proportionate next step", 2, ["review", "small", "audit", "conversation", "not full rebrand"]),
    ]),
    typed("CODING", "SENIOR", "Specify a flexible identity system for a company with six sub-brands: what is fixed, what varies, and how a new sub-brand is added.", [
      c("architecture", "Defines a coherent brand architecture", 3, ["endorsed", "masterbrand", "sub-brand", "relationship", "hierarchy"]),
      c("variation", "States precisely what may vary", 3, ["fixed", "varies", "colour", "logo lockup", "rules"]),
      c("extension", "Defines how new entries are added", 2, ["new sub-brand", "process", "who approves", "template", "extend"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Tell me about the most difficult client relationship you have managed. What did you do?", [
      c("diagnosis", "Understood the underlying dynamic", 3, ["why", "pressure", "insecure", "understood", "their situation"]),
      c("action", "Changed how they worked together", 3, ["changed", "structure", "meetings", "written", "boundaries"]),
      c("outcome", "Honest about whether it worked", 2, ["improved", "ended", "still", "resolved"]),
    ]),
    spoken("BEHAVIORAL", "SENIOR", "Describe a time your work had to serve a business goal you personally disagreed with.", [
      c("honesty", "Names the conflict plainly", 3, ["disagreed", "uncomfortable", "did not like"]),
      c("professionalism", "Handled it without sabotage or resentment", 3, ["still did", "best work", "raised", "professional"]),
      c("limits", "Knows where their own line is", 2, ["would not", "line", "refuse", "if it had been"]),
    ]),

    // --- STAFF ------------------------------------------------------------
    mcq(
      "STAFF",
      "You are building a design function from scratch in a company that has only used freelancers. What matters most in the first six months?",
      [
        "Hiring senior designers quickly",
        "Establishing how design gets involved in decisions, and delivering visible value on something that matters",
        "Producing brand guidelines",
        "Selecting design tooling",
      ],
      1,
      "Without a route into decisions, even excellent designers become a production service. Credibility comes from a visible win, not from a document.",
    ),
    mcq(
      "STAFF",
      "What most reliably indicates a design leader is failing their team?",
      [
        "The team works long hours",
        "Designers are consistently brought in after decisions are made and have no path to change that",
        "The team has no formal process",
        "Work is criticised by stakeholders",
      ],
      1,
      "A leader's core job is securing the conditions for good work. Persistent late involvement means that job is not being done.",
    ),
    mcq(
      "STAFF",
      "A company wants to reduce design cost by templating everything. What is the strongest counter-position?",
      [
        "Templates always produce worse work",
        "Templating is right for high-volume repetitive output and wrong for work that must differentiate; the split should be deliberate",
        "Design cost cannot be reduced",
        "Templates require more designers to maintain",
      ],
      1,
      "Refusing wholesale loses the argument and the budget. Segmenting the work is both honest and preserves capacity where it matters.",
    ),
    spoken("CONCEPTUAL", "STAFF", "How do you make the commercial case for design investment to a finance-driven leadership team?", [
      c("translation", "Speaks in their measures", 3, ["cost", "conversion", "rework", "speed", "revenue", "risk"]),
      c("evidence", "Uses their own data", 3, ["our data", "measured", "before after", "specific", "example"]),
      c("honesty", "Does not overclaim", 2, ["cannot attribute", "partly", "honest", "limits"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "What is your view on how generative tools change what a design team should be doing?", [
      c("balance", "Neither dismissive nor uncritical", 3, ["useful", "not for", "some work", "depends", "still need"]),
      c("shift", "Identifies where human judgement remains", 3, ["judgement", "strategy", "which problem", "taste", "direction", "context"]),
      c("risk", "Names concrete risks", 2, ["generic", "sameness", "licensing", "rights", "quality"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How would you assess whether a brand is actually working, two years after launch?", [
      c("measures", "Uses real measures rather than opinion", 3, ["recognition", "recall", "consistency", "audit", "research", "share"]),
      c("application", "Audits how it is actually used in the wild", 3, ["audit", "in the wild", "how it is used", "drift", "collateral"]),
      c("adjustment", "Willing to evolve it", 2, ["evolve", "adjust", "extend", "fix", "refresh"]),
    ]),
    spoken("CONCEPTUAL", "STAFF", "How do you develop designers into people who can hold their own with executives?", [
      c("exposure", "Gives them real exposure", 3, ["present", "in the room", "meetings", "own it", "stakeholder"]),
      c("skills", "Develops argument and framing", 3, ["framing", "narrative", "business", "rehearse", "articulate"]),
      c("backing", "Supports without rescuing", 2, ["backed", "let them", "debrief", "not rescue"]),
    ]),
    typed("SCENARIO", "STAFF", "Two acquired companies must merge under one identity within a year, and both have loyal customers. Write your plan.", [
      c("equity", "Assesses what equity exists on both sides", 3, ["equity", "recognition", "research", "what do customers", "value"]),
      c("architecture", "Chooses a considered brand architecture", 3, ["endorsed", "transition", "dual", "phased", "architecture"]),
      c("transition", "Plans customer communication and phasing", 2, ["communicate", "phase", "notice", "internal", "customers"]),
    ]),
    typed("SCENARIO", "STAFF", "The company wants to cut the design team by half while doubling output. Write your response.", [
      c("honesty", "States plainly what is not possible", 3, ["not possible", "cannot", "trade-off", "honest", "something gives"]),
      c("leverage", "Identifies genuine leverage", 3, ["templates", "system", "automation", "prioritise", "stop doing"]),
      c("choice", "Forces an explicit prioritisation decision", 2, ["what stops", "choose", "priority", "explicit", "decide"]),
    ]),
    typed("SCENARIO", "STAFF", "Design work is consistently good but the company keeps shipping inconsistent output. Write your diagnosis and plan.", [
      c("diagnosis", "Looks past design quality to the system", 3, ["not design", "process", "who ships", "no system", "downstream"]),
      c("mechanism", "Fixes it structurally", 3, ["templates", "components", "review", "gate", "tooling", "default"]),
      c("ownership", "Establishes accountability for output", 2, ["owner", "accountable", "who", "responsible"]),
    ]),
    typed("SCENARIO", "STAFF", "A junior designer's work is consistently below standard and previous feedback has not changed it. Write how you would handle it.", [
      c("diagnosis", "Establishes why, not just that", 3, ["why", "understand", "capability", "clarity", "asked", "support"]),
      c("clarity", "Makes the standard and gap explicit", 3, ["specific", "examples", "what good", "clear", "measurable"]),
      c("fairness", "Gives a real chance with a real timeline", 2, ["support", "timeline", "plan", "check in", "honest"]),
    ]),
    typed("SCENARIO", "STAFF", "Leadership wants to launch a new visual direction in six weeks for an investor event. Write your assessment.", [
      c("realism", "States what is genuinely achievable", 3, ["achievable", "cannot", "six weeks", "realistic", "partial"]),
      c("scope", "Proposes a bounded deliverable", 3, ["event only", "key assets", "not full", "subset", "then"]),
      c("risk", "Names the cost of a rushed identity", 2, ["rushed", "redo", "cost", "half", "risk"]),
    ]),
    typed("CODING", "STAFF", "Define the operating model for a design function serving eight teams: how work is requested, prioritised, reviewed and measured. Justify each choice.", [
      c("intake", "Defines how work arrives without a pure queue", 3, ["embedded", "intake", "not queue", "planning", "early"]),
      c("prioritisation", "Has explicit prioritisation criteria", 3, ["criteria", "impact", "priority", "who decides", "capacity"]),
      c("quality", "Defines review and measurement", 2, ["critique", "review", "measure", "outcome", "standard"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Tell me about a time you had to rebuild a design team's credibility inside a company.", [
      c("state", "Describes the starting position honestly", 3, ["not trusted", "decoration", "late", "ignored"]),
      c("action", "Took concrete action", 3, ["delivered", "showed", "changed how", "one project", "proved"]),
      c("evidence", "Credibility measurably changed", 2, ["now", "involved earlier", "asked", "different"]),
    ]),
    spoken("BEHAVIORAL", "STAFF", "Describe the hardest hiring decision you have made in a design team.", [
      c("difficulty", "Names a genuinely hard trade-off", 3, ["strong portfolio but", "trade-off", "torn", "risk"]),
      c("criteria", "Had explicit criteria", 3, ["criteria", "what we needed", "gap", "team", "growth"]),
      c("outcome", "Honest about how it turned out", 2, ["worked", "did not", "learned", "in hindsight"]),
    ]),
  ],
};
