export type NavItem = {
  label: string;
  href: string;
};

export type StoryPillar = {
  title: string;
  description: string;
  purpose: string;
  chapter: string;
  highlights: string[];
  image: string;
};

export type ProcessStep = {
  step: string;
  title: string;
  summary: string;
  details: string;
  cadence: string;
  reassurance: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const company = {
  name: "CAPSOUL",
  descriptor: "Legacy Documentary Studio",
  email: "hello@capsoulfilms.com",
  phone: "(555) 214-0118",
};

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "The Experience", href: "/the-experience" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "What We Preserve", href: "/what-we-preserve" },
  { label: "Inquire", href: "/inquire" },
];

export const homepage = {
  hero: {
    eyebrow: "Premium legacy documentaries",
    title: "Preserve the voice.",
    description:
      "Bespoke legacy documentaries for families who want to preserve a parent, grandparent, or loved one in their own voice while that presence can still be felt in full.",
    primaryCta: {
      label: "Inquire Now",
      href: "/inquire",
    },
    secondaryCta: {
      label: "View the Process",
      href: "/how-it-works",
    },
    note:
      "Reflection, filming, and editorial shaping handled with quiet precision.",
    chapterLabel: "Preserved chapters",
    chapters: [
      "Values and convictions",
      "Love story and family life",
      "Message for future generations",
    ],
    floatingCards: [
      {
        eyebrow: "Guided reflection",
        title: "Stories gathered before the camera arrives.",
        description:
          "The strongest conversations begin with space to remember well.",
      },
      {
        eyebrow: "Private archive",
        title: "Made for the family, not the feed.",
        description:
          "Every film is delivered as something intimate, lasting, and revisitable.",
      },
      {
        eyebrow: "Filmed with calm",
        title: "At home or somewhere that still feels like them.",
        description:
          "The setting should support presence, not compete with it.",
      },
    ],
  },
  brandStatement:
    "Not a montage. A guided conversation shaped into an heirloom of voice, character, and conviction.",
  anchor: {
    eyebrow: "An emotional anchor",
    title: "Why it matters.",
    description:
      "A CAPSOUL film keeps the pauses, humor, and blessings a family reaches for later.",
    asideTitle: "What CAPSOUL creates",
    asideDescription:
      "Private documentary films shaped with reflection, calm direction, and a bespoke edit.",
  },
  whyThisMatters: {
    intro:
      "A photograph holds a face. A film holds cadence, humor, and the words a family will want again.",
    points: [
      {
        title: "Presence is fragile",
        body: "Phrasing, humor, and conviction disappear faster than families expect.",
      },
      {
        title: "Family history thins",
        body: "Names, sacrifices, and traditions lose meaning when no one tells them in full.",
      },
      {
        title: "More than fragments",
        body: "Children and grandchildren inherit context, not just anecdotes.",
      },
    ],
  },
  whatWeCreate: {
    title: "What CAPSOUL creates",
    description:
      "Private documentary films shaped to be revisited.",
    differentiators: [
      "Reflection before filming.",
      "A calm conversation in a meaningful setting.",
      "A bespoke edit shaped around voice and message.",
      "A private film made to be revisited.",
    ],
  },
  processIntro:
    "Clear steps, calm pacing, and a human tone from first inquiry to final delivery.",
  preserveIntro:
    "Each chapter gives the conversation shape without turning it into a script.",
  heirloom: {
    title: "An heirloom your family can return to",
    description:
      "The finished film becomes part of the family archive, ready to revisit after loss, on an anniversary, or years later with the next generation.",
    points: [
      "A polished film centered on story and character",
      "Guidance and affection in the speaker's own words",
      "A private keepsake built to last",
    ],
  },
  trust: {
    title: "Steady hands through tender material",
    description:
      "Legacy work asks for discretion. We meet it with steadiness, restraint, and care.",
    points: [
      {
        title: "Gently guided",
        body: "No one is asked to perform. We make room for pauses and natural feeling.",
      },
      {
        title: "Professionally crafted",
        body: "Each film is shaped with the restraint an heirloom piece requires.",
      },
      {
        title: "Personally handled",
        body: "Faith, hardship, humor, marriage, and legacy appear only as they truly belong.",
      },
    ],
  },
  cta: {
    eyebrow: "A private heirloom",
    title: "Begin the process.",
    description:
      "If one person comes to mind immediately, this is the right time to begin with care, clarity, and discretion.",
    primaryCta: {
      label: "Start the Process",
      href: "/inquire",
    },
    secondaryCta: {
      label: "The Experience",
      href: "/the-experience",
    },
    note: "Handled personally from the first conversation onward.",
  },
  footer:
    "Private legacy documentaries preserving story, character, and guidance with care.",
};

export const experiencePage = {
  hero: {
    eyebrow: "The experience",
    title: "Guided with care.",
    description:
      "Meaningful stories come through trust, preparation, and calm conversation, not pressure or performance.",
  },
  philosophy:
    "Legacy lives in presence as much as biography. Families often want the humor, tenderness, and conviction they can hear again.",
  conversation:
    "No memorizing. No performance. We guide the conversation so it stays natural and still reaches what matters.",
  reflection:
    "A reflection guide helps revisit the chapters, relationships, and beliefs that shaped a life before filming.",
  distinction: [
    {
      title: "More than a family video",
      body: "It preserves meaning, not just a moment.",
    },
    {
      title: "More than an interview",
      body: "Narrative, pacing, and tone give the film intimacy and staying power.",
    },
    {
      title: "More than a questionnaire",
      body: "Themes guide the story so the real voice can lead.",
    },
  ],
  pillarsIntro:
    "These story pillars guide the conversation without turning it into a script.",
  sensitivity:
    "Some families arrive in celebration. Others arrive because time feels urgent. Both are met with steadiness.",
};

export const storyPillars: StoryPillar[] = [
  {
    title: "Values",
    description: "The principles they lived by.",
    purpose:
      "It preserves the inner architecture of a life.",
    chapter: "How they decided what mattered.",
    highlights: [
      "Standards they returned to",
      "Convictions they hope continue",
      "The tone of their character",
    ],
    image: "/visuals/hero-frame.svg",
  },
  {
    title: "Upbringing",
    description: "Where they came from and what marked them.",
    purpose:
      "Family history becomes tangible in their voice.",
    chapter: "Where the story began and what shaped it.",
    highlights: [
      "Family roots and setting",
      "Hardship, delight, and formation",
      "The context later generations rarely hear",
    ],
    image: "/visuals/conversation-frame.svg",
  },
  {
    title: "Love story",
    description: "How they met, what endured, and what partnership taught them.",
    purpose:
      "It shows later generations how love was lived.",
    chapter: "How devotion looked in ordinary life.",
    highlights: [
      "How they met and stayed",
      "What partnership taught them",
      "The style of love the family remembers",
    ],
    image: "/visuals/heirloom-frame.svg",
  },
  {
    title: "Parenthood",
    description: "What family meant and what they hoped to give.",
    purpose:
      "It becomes an inheritance of affection and perspective.",
    chapter: "What they tried to give the people they raised.",
    highlights: [
      "How care was expressed",
      "What they hoped the family would carry",
      "The tenderness beneath the role",
    ],
    image: "/visuals/hero-frame.svg",
  },
  {
    title: "Faith and convictions",
    description: "The beliefs that gave life meaning, when they matter to the family.",
    purpose:
      "For many families, this is the deepest layer of identity.",
    chapter: "The beliefs that steadied a life.",
    highlights: [
      "Faith, spirituality, or inner conviction",
      "How meaning was made from hardship",
      "What remained certain when life changed",
    ],
    image: "/visuals/conversation-frame.svg",
  },
  {
    title: "Message forward",
    description: "What they want family to remember and carry.",
    purpose:
      "These words often anchor the film.",
    chapter: "What they most want the next generation to hear.",
    highlights: [
      "Blessing, advice, and perspective",
      "The values they want carried forward",
      "Words a family can return to later",
    ],
    image: "/visuals/heirloom-frame.svg",
  },
];

export const processSteps: ProcessStep[] = [
  {
    step: "01",
    title: "Inquiry",
    summary:
      "You reach out, share who the film is for, and say why now matters.",
    details:
      "We listen and shape the next step.",
    cadence: "Quiet beginning",
    reassurance: "You do not need a finished plan to reach out.",
  },
  {
    step: "02",
    title: "Discovery",
    summary:
      "We discuss tone, priorities, logistics, and setting.",
    details:
      "The story focus becomes clear.",
    cadence: "Shared direction",
    reassurance: "Tone, timing, and location are aligned with care.",
  },
  {
    step: "03",
    title: "Reflection",
    summary:
      "A guide helps organize the chapters, values, and messages that matter most.",
    details:
      "Depth without scripting.",
    cadence: "Story gathered",
    reassurance: "Preparation brings depth without making anyone perform.",
  },
  {
    step: "04",
    title: "Filming day",
    summary:
      "We film at home or another meaningful place in a calm conversation.",
    details:
      "Steady, unobtrusive direction.",
    cadence: "Calm presence",
    reassurance: "The atmosphere stays warm, steady, and lightly guided.",
  },
  {
    step: "05",
    title: "Editing",
    summary:
      "We shape the material into a polished documentary with restraint.",
    details:
      "Pacing and tone turn it into an heirloom.",
    cadence: "Shaped with restraint",
    reassurance: "Narrative, pacing, and texture become the keepsake.",
  },
  {
    step: "06",
    title: "Final delivery",
    summary:
      "Your family receives a film prepared for private keeping.",
    details:
      "Made to return to in defining moments and ordinary ones.",
    cadence: "Ready to return to",
    reassurance: "Prepared for private keeping now and years from now.",
  },
];

export const faqs: FaqItem[] = [
  {
    question: "What kinds of stories do you capture?",
    answer:
      "Each film is tailored, but conversations often move through upbringing, values, marriage, parenthood, beliefs, hardship, and messages for future generations.",
  },
  {
    question: "Does the person need to be comfortable on camera?",
    answer:
      "No. The experience is built for real people, not performers. We guide gently so the focus stays on the story.",
  },
  {
    question: "Can family members be included?",
    answer:
      "Yes. Family voices or shared moments can be included when they support the central film.",
  },
  {
    question: "Can this be filmed at home?",
    answer:
      "Yes. Home is often the most natural setting, though other meaningful locations can work well too.",
  },
  {
    question: "Is this only for grandparents?",
    answer:
      "No. Many families commission a film for parents or grandparents, but it can be made for any loved one whose story deserves care.",
  },
  {
    question: "Can faith or spiritual beliefs be included?",
    answer:
      "Absolutely. Faith, spirituality, and family values can be included when they genuinely belong to the story.",
  },
  {
    question: "How long does the process take?",
    answer:
      "Timing depends on scheduling and editorial scope, but the process follows a clear sequence from consultation to delivery.",
  },
  {
    question: "How is the final film delivered?",
    answer:
      "The finished film is prepared for private family viewing and long-term keeping, with delivery formats expanding in a future phase.",
  },
];

export const footerLinks = {
  primary: navigation,
  secondary: [
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/inquire" },
  ],
};
