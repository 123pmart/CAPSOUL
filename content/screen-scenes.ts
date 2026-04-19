export type ScreenAction = {
  label: string;
  href: string;
};

export type ScreenStep = {
  label: string;
  title: string;
  summary: string;
  detail: string;
  bullets: string[];
  image: string;
  mediaLabel: string;
  mediaCaption: string;
};

export type InquirySupportState = {
  label: string;
  title: string;
  body: string;
  image: string;
};

export const homeScene = {
  eyebrow: "Legacy Documentary Studio",
  title: "Preserve the voice.",
  description:
    "Private documentary films that keep presence, humor, conviction, and message in the voice a family will want again.",
  primaryAction: { label: "Begin Here", href: "/inquire" },
  secondaryAction: { label: "The Process", href: "/how-it-works" },
  stageLabel: "Opening scene",
  compactNote: "Scroll or tap through the chapter states.",
  steps: [
    {
      label: "Reflection",
      title: "Stories gathered before filming.",
      summary: "The strongest films begin with memory and message, not the camera.",
      detail:
        "We prepare the conversation around values, stories, and the words that matter most.",
      bullets: ["Memory before production", "Questions shaped with care", "No performance pressure"],
      image: "/visuals/conversation-frame.svg",
      mediaLabel: "Before the camera",
      mediaCaption: "The story is clarified first so filming can feel calm and personal.",
    },
    {
      label: "Presence",
      title: "Filmed where they still feel like themselves.",
      summary: "Home or another meaningful place keeps the tone human and unforced.",
      detail:
        "The setting supports presence, cadence, and warmth instead of pushing the work toward performance.",
      bullets: ["Meaningful environment", "Quiet direction", "Voice and character first"],
      image: "/visuals/hero-frame.svg",
      mediaLabel: "Filming atmosphere",
      mediaCaption: "The frame is designed to hold real presence rather than create spectacle.",
    },
    {
      label: "Structure",
      title: "Chapters shaped with restraint.",
      summary: "The material is organized into a film with narrative clarity and editorial calm.",
      detail:
        "The final piece is selective, emotionally clear, and shaped to feel lasting rather than exhaustive.",
      bullets: ["Story architecture", "Editorial pacing", "Nothing forced"],
      image: "/visuals/heirloom-frame.svg",
      mediaLabel: "Editorial shaping",
      mediaCaption: "Each chapter earns its place so the final film feels composed and enduring.",
    },
    {
      label: "Heirloom",
      title: "A private film the family can return to.",
      summary: "The finished piece becomes part of the family archive rather than disposable content.",
      detail:
        "It is built for anniversaries, ordinary days, moments of loss, and the generations still coming.",
      bullets: ["Private by default", "Built to last", "Revisited across time"],
      image: "/visuals/heirloom-frame.svg",
      mediaLabel: "After delivery",
      mediaCaption: "The end result is less a marketing asset and more a preserved relationship.",
    },
  ] as ScreenStep[],
};

export const experienceScene = {
  eyebrow: "The Experience",
  title: "Guided with care.",
  description:
    "The experience is structured to feel quiet, clear, and emotionally considerate from first conversation through final delivery.",
  primaryAction: { label: "Inquire", href: "/inquire" },
  secondaryAction: { label: "What We Preserve", href: "/what-we-preserve" },
  stageLabel: "Experience states",
  compactNote: "This screen moves through the emotional tone of the process.",
  steps: [
    {
      label: "Preparation",
      title: "Preparation creates ease.",
      summary: "Reflection does the emotional heavy lifting before filming day arrives.",
      detail:
        "The work begins by clarifying chapters, values, family context, and what the person most wants to say.",
      bullets: ["Thoughtful preparation", "Shared expectations", "No rushed improvisation"],
      image: "/visuals/conversation-frame.svg",
      mediaLabel: "Before filming",
      mediaCaption: "Good preparation reduces pressure and increases depth.",
    },
    {
      label: "Direction",
      title: "Direction stays calm and human.",
      summary: "The camera is guided gently so the speaker sounds like themselves.",
      detail:
        "No one is asked to perform. The conversation is shaped lightly, with room for pauses and real feeling.",
      bullets: ["No performance mode", "Gentle pacing", "Trust over pressure"],
      image: "/visuals/hero-frame.svg",
      mediaLabel: "During filming",
      mediaCaption: "The strongest scenes feel inhabited rather than staged.",
    },
    {
      label: "Edit",
      title: "The edit protects tone.",
      summary: "Pacing, structure, and restraint turn raw material into an heirloom piece.",
      detail:
        "The final shape is crafted to feel intimate, spacious, and emotionally direct without becoming sentimental noise.",
      bullets: ["Selective storytelling", "Quiet authority", "Emotional clarity"],
      image: "/visuals/heirloom-frame.svg",
      mediaLabel: "Editorial tone",
      mediaCaption: "Restraint is what keeps the film feeling premium years later.",
    },
    {
      label: "Delivery",
      title: "The result feels lasting.",
      summary: "Delivery is the handoff from documentary process to family archive.",
      detail:
        "The final film is prepared for private revisiting and intergenerational meaning rather than one-time consumption.",
      bullets: ["Family archive", "Private keepsake", "Ready for later life"],
      image: "/visuals/heirloom-frame.svg",
      mediaLabel: "After the handoff",
      mediaCaption: "The film is made to hold meaning long after the process ends.",
    },
  ] as ScreenStep[],
};

export const processScene = {
  eyebrow: "How It Works",
  title: "A clear process.",
  description:
    "The structure stays steady from inquiry to final handoff so families always know what comes next.",
  primaryAction: { label: "Start with Inquiry", href: "/inquire" },
  secondaryAction: { label: "The Experience", href: "/the-experience" },
  stageLabel: "Process sequence",
  compactNote: "This is the most explicit step progression in the experience.",
  steps: [
    {
      label: "Inquiry",
      title: "Inquiry sets the tone.",
      summary: "You share who the film is for and why now matters.",
      detail:
        "The first step is simple on purpose: enough context to respond well without turning inquiry into a project.",
      bullets: ["Low-pressure opening", "Human follow-up", "Clear fit conversation"],
      image: "/visuals/conversation-frame.svg",
      mediaLabel: "Step 01",
      mediaCaption: "The beginning should feel discreet, not transactional.",
    },
    {
      label: "Discovery",
      title: "Discovery shapes the frame.",
      summary: "Tone, setting, priorities, and family context are aligned together.",
      detail:
        "This is where we decide what the film must hold, what can stay secondary, and how the work should feel.",
      bullets: ["Tone alignment", "Location and timing", "Story priorities"],
      image: "/visuals/hero-frame.svg",
      mediaLabel: "Step 02",
      mediaCaption: "A premium process feels thoughtful before anything is filmed.",
    },
    {
      label: "Reflection",
      title: "Reflection gathers the material.",
      summary: "Questions and chapters are shaped before filming begins.",
      detail:
        "This step gives depth to the final conversation while keeping it open enough for the real person to lead.",
      bullets: ["Chapter guide", "Message clarity", "More depth, less guesswork"],
      image: "/visuals/conversation-frame.svg",
      mediaLabel: "Step 03",
      mediaCaption: "Preparation increases truth instead of flattening it.",
    },
    {
      label: "Filming",
      title: "Filming feels composed.",
      summary: "The conversation is recorded in a setting that supports presence.",
      detail:
        "Camera, sound, and direction stay quiet enough that the story feels lived, not produced for the lens.",
      bullets: ["Calm environment", "Guided without pressure", "Presence over performance"],
      image: "/visuals/hero-frame.svg",
      mediaLabel: "Step 04",
      mediaCaption: "The frame supports their voice instead of competing with it.",
    },
    {
      label: "Delivery",
      title: "Editing completes the heirloom.",
      summary: "The final film is shaped, polished, and prepared for private keeping.",
      detail:
        "Narrative order, emotional pacing, and the final delivery format turn the process into something a family can keep.",
      bullets: ["Editorial restraint", "Private final handoff", "Built to return to"],
      image: "/visuals/heirloom-frame.svg",
      mediaLabel: "Step 05",
      mediaCaption: "The goal is not content. It is a piece of the family archive.",
    },
  ] as ScreenStep[],
};

export const preserveScene = {
  eyebrow: "What We Preserve",
  title: "Story chapters.",
  description:
    "The film is shaped around the themes a family most needs to hear and feel again, not around a rigid script.",
  primaryAction: { label: "Inquire", href: "/inquire" },
  secondaryAction: { label: "The Experience", href: "/the-experience" },
  stageLabel: "Story architecture",
  compactNote: "Each chapter can activate without turning the film into a checklist.",
  steps: [
    {
      label: "Values",
      title: "What they stood for.",
      summary: "Values reveal the inner architecture of a life.",
      detail:
        "Convictions, standards, and the way a person chose to live often become the emotional backbone of the film.",
      bullets: ["Principles", "Standards", "Inner character"],
      image: "/visuals/hero-frame.svg",
      mediaLabel: "Chapter 01",
      mediaCaption: "Values explain not just what happened, but who they were.",
    },
    {
      label: "Roots",
      title: "Where the story began.",
      summary: "Upbringing and family roots make history tangible in their own voice.",
      detail:
        "This chapter gives later generations the texture of place, family context, and the conditions that shaped a life.",
      bullets: ["Origin story", "Family setting", "Formation years"],
      image: "/visuals/conversation-frame.svg",
      mediaLabel: "Chapter 02",
      mediaCaption: "Roots give the later story meaning and scale.",
    },
    {
      label: "Love",
      title: "How they loved.",
      summary: "Marriage, family life, and affection show the style of relationship that endured.",
      detail:
        "This is often where later generations hear how devotion looked in ordinary life, not only in major milestones.",
      bullets: ["Marriage", "Parenthood", "Ordinary tenderness"],
      image: "/visuals/heirloom-frame.svg",
      mediaLabel: "Chapter 03",
      mediaCaption: "Love becomes clearer when it is heard in the details of lived life.",
    },
    {
      label: "Belief",
      title: "What gave life meaning.",
      summary: "Faith, spirituality, and conviction can form the deepest layer of identity.",
      detail:
        "When belief matters to the family, it belongs in the film as a lived reality, not a decorative theme.",
      bullets: ["Faith", "Conviction", "Meaning through hardship"],
      image: "/visuals/conversation-frame.svg",
      mediaLabel: "Chapter 04",
      mediaCaption: "Belief often explains the tone of a life more clearly than facts alone.",
    },
    {
      label: "Message",
      title: "What they want carried forward.",
      summary: "The final message often becomes the part a family returns to most.",
      detail:
        "Blessing, instruction, perspective, and the words that should travel with the next generation are given a clear place.",
      bullets: ["Blessing", "Advice", "Family message"],
      image: "/visuals/heirloom-frame.svg",
      mediaLabel: "Chapter 05",
      mediaCaption: "This is where the film becomes an inheritance of words, not just memory.",
    },
  ] as ScreenStep[],
};

export const inquiryScene = {
  eyebrow: "Inquire",
  title: "Begin the process.",
  description:
    "A compact private inquiry designed to feel fast, thoughtful, and easy to complete.",
  trustPoints: [
    "Reviewed personally",
    "No obligation to book",
    "Clear next step if it feels right",
  ],
  supportStates: [
    {
      label: "Step 01",
      title: "Who this is for.",
      body: "Start with the person and the relationship. That gives the conversation enough emotional context to begin well.",
      image: "/visuals/conversation-frame.svg",
    },
    {
      label: "Step 02",
      title: "Why now feels important.",
      body: "Timing, urgency, tenderness, and family context all help shape the right tone for the work.",
      image: "/visuals/hero-frame.svg",
    },
    {
      label: "Step 03",
      title: "How we follow up.",
      body: "Once the essentials are clear, the next step is a calm conversation about fit, pacing, and what the film should hold.",
      image: "/visuals/heirloom-frame.svg",
    },
  ] as InquirySupportState[],
};
