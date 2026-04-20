import type { InquirySupportState, ScreenAction, ScreenStep } from "@/content/screen-scenes";
import {
  experienceScene,
  homeScene,
  inquiryScene,
  preserveScene,
  processScene,
} from "@/content/screen-scenes";

export const siteLocales = ["en", "es"] as const;
export type SiteLocale = (typeof siteLocales)[number];

export type GlobalSiteContent = {
  brandDescriptor: string;
  headerTagline: string;
  headerInquireLabel: string;
  mobileHeaderInquireLabel: string;
  adminEntryLabel: string;
  navigation: {
    home: string;
    experience: string;
    process: string;
    preserve: string;
    inquire: string;
  };
  routeLabels: {
    previous: string;
    next: string;
    nextPagePrefix: string;
  };
  sceneLabels: {
    tapImageHint: string;
    arrowInstruction: string;
    activeState: string;
  };
  languageLabels: {
    en: string;
    es: string;
  };
};

export type EditableSceneAction = ScreenAction;

export type EditableSceneStep = Omit<ScreenStep, "image">;

export type EditableSceneContent = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: EditableSceneAction;
  secondaryAction?: EditableSceneAction;
  stageLabel: string;
  compactNote: string;
  steps: EditableSceneStep[];
};

export type EditableInquirySupportState = Omit<InquirySupportState, "image">;

export type InquiryFormStepContent = {
  chip: string;
  title: string;
  description: string;
};

export type InquiryFieldCopy = {
  fullNameLabel: string;
  fullNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  regionLabel: string;
  regionPlaceholder: string;
  filmForLabel: string;
  filmForPlaceholder: string;
  relationshipLabel: string;
  relationshipPlaceholder: string;
  stillLivingLabel: string;
  stillLivingPlaceholder: string;
  stillLivingYes: string;
  stillLivingNo: string;
  stillLivingPreferNot: string;
  timelineLabel: string;
  timelinePlaceholder: string;
  storyImportanceLabel: string;
  storyImportancePlaceholder: string;
  filmingLocationLabel: string;
  filmingLocationPlaceholder: string;
  faithContextLabel: string;
  faithContextPlaceholder: string;
  faithContextCentral: string;
  faithContextPresent: string;
  faithContextNotReally: string;
  faithContextNotSure: string;
  extraNotesLabel: string;
  extraNotesPlaceholder: string;
  submittingLabel: string;
};

export type EditableInquiryContent = {
  eyebrow: string;
  title: string;
  description: string;
  trustPoints: string[];
  supportStates: EditableInquirySupportState[];
  formSteps: InquiryFormStepContent[];
  fieldCopy: InquiryFieldCopy;
  previousButtonLabel: string;
  nextButtonLabel: string;
  submitButtonLabel: string;
  progressionLabel: string;
  mediaNote: string;
  nextHeading: string;
  nextBody: string;
  footerNote: string;
  successEyebrow: string;
  successTitle: string;
  successBody: string;
  successResetLabel: string;
  successReturnLabel: string;
};

export type ResolvedSceneStep = EditableSceneStep & {
  image: string;
  objectPosition: string;
};

export type ResolvedSceneContent = Omit<EditableSceneContent, "steps"> & {
  steps: ResolvedSceneStep[];
};

export type ResolvedInquirySupportState = EditableInquirySupportState & {
  image: string;
  objectPosition: string;
};

export type ResolvedInquiryContent = Omit<EditableInquiryContent, "supportStates"> & {
  supportStates: ResolvedInquirySupportState[];
};

export type SiteContent = {
  global: GlobalSiteContent;
  home: EditableSceneContent;
  experience: EditableSceneContent;
  process: EditableSceneContent;
  preserve: EditableSceneContent;
  inquire: EditableInquiryContent;
};

export type SiteContentDocument = {
  locales: Record<SiteLocale, SiteContent>;
};

export type SiteContentPageKey = keyof SiteContent;

export type SiteContentFieldConfig = {
  path: string;
  label: string;
  type: "text" | "textarea" | "list";
  description?: string;
  rows?: number;
};

export type SiteContentSectionConfig = {
  id: string;
  title: string;
  description?: string;
  fields: SiteContentFieldConfig[];
};

export type SiteContentPageConfig = {
  key: SiteContentPageKey;
  label: string;
  sections: SiteContentSectionConfig[];
};

function toEditableScene(scene: {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: ScreenAction;
  secondaryAction?: ScreenAction;
  stageLabel?: string;
  compactNote?: string;
  steps: ScreenStep[];
}): EditableSceneContent {
  return {
    eyebrow: scene.eyebrow,
    title: scene.title,
    description: scene.description,
    primaryAction: scene.primaryAction,
    secondaryAction: scene.secondaryAction,
    stageLabel: scene.stageLabel ?? "Scene progression",
    compactNote: scene.compactNote ?? "Scroll or tap through the states inside this screen.",
    steps: scene.steps.map(({ image: _image, ...step }) => step),
  };
}

const defaultEnglishGlobalContent: GlobalSiteContent = {
  brandDescriptor: "Legacy Documentary Studio",
  headerTagline: "Private by design",
  headerInquireLabel: "Inquire Now",
  mobileHeaderInquireLabel: "Inquire",
  adminEntryLabel: "Admin",
  navigation: {
    home: "Home",
    experience: "The Experience",
    process: "How It Works",
    preserve: "What We Preserve",
    inquire: "Inquire",
  },
  routeLabels: {
    previous: "Previous",
    next: "Next",
    nextPagePrefix: "Next Page",
  },
  sceneLabels: {
    tapImageHint: "Tap image to view details.",
    arrowInstruction: "Use the arrows to move through the scene.",
    activeState: "Active state",
  },
  languageLabels: {
    en: "English",
    es: "Español",
  },
};

const defaultSpanishGlobalContent: GlobalSiteContent = {
  brandDescriptor: "Estudio Documental de Legado",
  headerTagline: "Privado por diseño",
  headerInquireLabel: "Iniciar consulta",
  mobileHeaderInquireLabel: "Consultar",
  adminEntryLabel: "Admin",
  navigation: {
    home: "Inicio",
    experience: "La Experiencia",
    process: "Cómo Funciona",
    preserve: "Lo Que Preservamos",
    inquire: "Consultar",
  },
  routeLabels: {
    previous: "Anterior",
    next: "Siguiente",
    nextPagePrefix: "Página siguiente",
  },
  sceneLabels: {
    tapImageHint: "Toca la imagen para ver detalles.",
    arrowInstruction: "Usa las flechas para recorrer la escena.",
    activeState: "Estado activo",
  },
  languageLabels: {
    en: "English",
    es: "Español",
  },
};

export const defaultInquiryFormSteps: InquiryFormStepContent[] = [
  {
    chip: "Contact",
    title: "Private contact.",
    description: "Enough detail to respond personally and with the right urgency.",
  },
  {
    chip: "Story",
    title: "Story context.",
    description: "Who this film is for and why the timing matters right now.",
  },
  {
    chip: "Notes",
    title: "Practical notes.",
    description: "Location, values, and anything that helps us follow up with care.",
  },
];

const defaultSpanishInquiryFormSteps: InquiryFormStepContent[] = [
  {
    chip: "Contacto",
    title: "Contacto privado.",
    description: "La información justa para responder de forma personal y con la urgencia adecuada.",
  },
  {
    chip: "Historia",
    title: "Contexto de la historia.",
    description: "Para quién es esta película y por qué el momento importa ahora.",
  },
  {
    chip: "Notas",
    title: "Notas prácticas.",
    description: "Lugar, valores y cualquier dato que nos ayude a responder con cuidado.",
  },
];

const defaultEnglishInquiryFieldCopy: InquiryFieldCopy = {
  fullNameLabel: "Full Name",
  fullNamePlaceholder: "Your full name",
  emailLabel: "Email Address",
  emailPlaceholder: "name@email.com",
  phoneLabel: "Phone Number",
  phonePlaceholder: "Best number to reach you",
  regionLabel: "Region",
  regionPlaceholder: "City, state, or region",
  filmForLabel: "Who is this film for?",
  filmForPlaceholder: "Parent, grandparent, spouse, loved one",
  relationshipLabel: "Relationship to you",
  relationshipPlaceholder: "Father, grandmother, husband",
  stillLivingLabel: "Are they still living?",
  stillLivingPlaceholder: "Select an option",
  stillLivingYes: "Yes",
  stillLivingNo: "No",
  stillLivingPreferNot: "Prefer not to say",
  timelineLabel: "Timing",
  timelinePlaceholder: "As soon as possible, this season, flexible",
  storyImportanceLabel: "Why does this feel important now?",
  storyImportancePlaceholder: "Share as much or as little as feels right.",
  filmingLocationLabel: "Preferred filming location",
  filmingLocationPlaceholder: "Home, family property, meaningful place",
  faithContextLabel: "Faith or family values",
  faithContextPlaceholder: "Select an option",
  faithContextCentral: "Central to the story",
  faithContextPresent: "Present, but not central",
  faithContextNotReally: "Not especially",
  faithContextNotSure: "Not sure yet",
  extraNotesLabel: "Anything else we should know?",
  extraNotesPlaceholder: "Sensitivities, hopes for the film, or any practical notes.",
  submittingLabel: "Submitting...",
};

const defaultSpanishInquiryFieldCopy: InquiryFieldCopy = {
  fullNameLabel: "Nombre completo",
  fullNamePlaceholder: "Tu nombre completo",
  emailLabel: "Correo electrónico",
  emailPlaceholder: "nombre@correo.com",
  phoneLabel: "Número de teléfono",
  phonePlaceholder: "Mejor número para contactarte",
  regionLabel: "Región",
  regionPlaceholder: "Ciudad, estado o región",
  filmForLabel: "¿Para quién es esta película?",
  filmForPlaceholder: "Madre, padre, abuelo, pareja, ser querido",
  relationshipLabel: "Relación contigo",
  relationshipPlaceholder: "Padre, abuela, esposo",
  stillLivingLabel: "¿La persona sigue con vida?",
  stillLivingPlaceholder: "Selecciona una opción",
  stillLivingYes: "Sí",
  stillLivingNo: "No",
  stillLivingPreferNot: "Prefiero no decirlo",
  timelineLabel: "Momento ideal",
  timelinePlaceholder: "Lo antes posible, esta temporada, flexible",
  storyImportanceLabel: "¿Por qué esto se siente importante ahora?",
  storyImportancePlaceholder: "Comparte tanto o tan poco como desees.",
  filmingLocationLabel: "Lugar preferido para filmar",
  filmingLocationPlaceholder: "Casa, propiedad familiar, lugar significativo",
  faithContextLabel: "Fe o valores familiares",
  faithContextPlaceholder: "Selecciona una opción",
  faithContextCentral: "Es central en la historia",
  faithContextPresent: "Está presente, pero no es central",
  faithContextNotReally: "No especialmente",
  faithContextNotSure: "Aún no estoy seguro",
  extraNotesLabel: "¿Algo más que debamos saber?",
  extraNotesPlaceholder: "Sensibilidades, deseos para la película o notas prácticas.",
  submittingLabel: "Enviando...",
};

export const defaultSiteContent: SiteContent = {
  global: defaultEnglishGlobalContent,
  home: toEditableScene(homeScene),
  experience: toEditableScene(experienceScene),
  process: toEditableScene(processScene),
  preserve: toEditableScene(preserveScene),
  inquire: {
    eyebrow: inquiryScene.eyebrow,
    title: inquiryScene.title,
    description: inquiryScene.description,
    trustPoints: [...inquiryScene.trustPoints],
    supportStates: inquiryScene.supportStates.map(({ image: _image, ...state }) => state),
    formSteps: defaultInquiryFormSteps.map((step) => ({ ...step })),
    fieldCopy: { ...defaultEnglishInquiryFieldCopy },
    previousButtonLabel: "Previous",
    nextButtonLabel: "Next",
    submitButtonLabel: "Submit Inquiry",
    progressionLabel: "Inquiry progression",
    mediaNote: "Each state keeps the inquiry compact without losing context.",
    nextHeading: "What happens next",
    nextBody:
      "Once the essentials are in place, the next move is a private conversation about fit, timing, and the tone the film should hold.",
    footerNote: "Reviewed personally with discretion before any follow-up.",
    successEyebrow: "Inquiry received",
    successTitle: "Thank you for the trust.",
    successBody:
      "Your inquiry has been saved inside the private CAPSOUL dashboard for personal follow-up. We now keep the lead detail in-app while preserving the same compact screen-based submission flow.",
    successResetLabel: "Send another inquiry",
    successReturnLabel: "Return Home",
  },
};

export const defaultSpanishSiteContent: SiteContent = {
  global: defaultSpanishGlobalContent,
  home: {
    eyebrow: "Estudio Documental de Legado",
    title: "Preserva la voz.",
    description:
      "Películas documentales privadas que conservan presencia, humor, convicción y mensaje en la voz que una familia querrá volver a escuchar.",
    primaryAction: { label: "Comenzar aquí", href: "/inquire" },
    secondaryAction: { label: "Ver el proceso", href: "/how-it-works" },
    stageLabel: "Escena inicial",
    compactNote: "Desplázate o toca para recorrer los estados de la historia.",
    steps: [
      {
        label: "Reflexión",
        title: "Historias reunidas antes de filmar.",
        summary: "Las mejores películas empiezan con memoria y mensaje, no con la cámara.",
        detail:
          "Preparamos la conversación alrededor de valores, historias y las palabras que más importan.",
        bullets: ["Memoria antes de producción", "Preguntas hechas con cuidado", "Sin presión para actuar"],
        mediaLabel: "Antes de la cámara",
        mediaCaption: "La historia se aclara primero para que filmar se sienta sereno y personal.",
      },
      {
        label: "Presencia",
        title: "Filmado donde todavía se siente como esa persona.",
        summary: "El hogar o un lugar significativo mantiene el tono humano y natural.",
        detail:
          "El entorno sostiene la presencia, la cadencia y la calidez sin empujar el trabajo hacia la actuación.",
        bullets: ["Entorno significativo", "Dirección tranquila", "La voz y el carácter primero"],
        mediaLabel: "Atmósfera de filmación",
        mediaCaption: "El encuadre está pensado para sostener presencia real, no espectáculo.",
      },
      {
        label: "Estructura",
        title: "Capítulos trazados con contención.",
        summary: "El material se organiza en una película con claridad narrativa y calma editorial.",
        detail:
          "La pieza final es selectiva, emocionalmente clara y hecha para sentirse duradera, no exhaustiva.",
        bullets: ["Arquitectura narrativa", "Ritmo editorial", "Nada forzado"],
        mediaLabel: "Construcción editorial",
        mediaCaption: "Cada capítulo gana su lugar para que la película se sienta compuesta y perdurable.",
      },
      {
        label: "Legado",
        title: "Una película privada a la que la familia puede volver.",
        summary: "La pieza final se convierte en parte del archivo familiar, no en contenido desechable.",
        detail:
          "Está hecha para aniversarios, días comunes, momentos de pérdida y generaciones que aún vienen.",
        bullets: ["Privada por defecto", "Hecha para durar", "Volver a ella con el tiempo"],
        mediaLabel: "Después de la entrega",
        mediaCaption: "El resultado final se siente menos como contenido y más como una relación preservada.",
      },
    ],
  },
  experience: {
    eyebrow: "La Experiencia",
    title: "Guiado con cuidado.",
    description:
      "La experiencia está diseñada para sentirse tranquila, clara y emocionalmente considerada desde la primera conversación hasta la entrega final.",
    primaryAction: { label: "Consultar", href: "/inquire" },
    secondaryAction: { label: "Lo que preservamos", href: "/what-we-preserve" },
    stageLabel: "Estados de la experiencia",
    compactNote: "Esta pantalla recorre el tono emocional del proceso.",
    steps: [
      {
        label: "Preparación",
        title: "La preparación crea soltura.",
        summary: "La reflexión hace el trabajo emocional antes de que llegue el día de filmación.",
        detail:
          "Todo comienza aclarando capítulos, valores, contexto familiar y lo que la persona más quiere decir.",
        bullets: ["Preparación cuidadosa", "Expectativas compartidas", "Sin improvisación apresurada"],
        mediaLabel: "Antes de filmar",
        mediaCaption: "Una buena preparación reduce la presión y aumenta la profundidad.",
      },
      {
        label: "Dirección",
        title: "La dirección se mantiene calma y humana.",
        summary: "La cámara se guía con suavidad para que la persona suene como ella misma.",
        detail:
          "Nadie tiene que actuar. La conversación se orienta con ligereza, dejando espacio para pausas y emoción real.",
        bullets: ["Sin modo actuación", "Ritmo amable", "Confianza por encima de presión"],
        mediaLabel: "Durante la filmación",
        mediaCaption: "Las escenas más fuertes se sienten habitadas, no escenificadas.",
      },
      {
        label: "Edición",
        title: "La edición protege el tono.",
        summary: "Ritmo, estructura y contención convierten el material en una pieza heredable.",
        detail:
          "La forma final se construye para sentirse íntima, espaciosa y emocionalmente directa sin caer en sentimentalismo.",
        bullets: ["Narrativa selectiva", "Autoridad serena", "Claridad emocional"],
        mediaLabel: "Tono editorial",
        mediaCaption: "La contención es lo que hace que la película se sienta premium con los años.",
      },
      {
        label: "Entrega",
        title: "El resultado se siente duradero.",
        summary: "La entrega es el paso del proceso documental al archivo familiar.",
        detail:
          "La película final se prepara para revisitarse en privado y conservar sentido entre generaciones.",
        bullets: ["Archivo familiar", "Recuerdo privado", "Listo para el futuro"],
        mediaLabel: "Después de la entrega",
        mediaCaption: "La película está hecha para sostener significado mucho después del proceso.",
      },
    ],
  },
  process: {
    eyebrow: "Cómo Funciona",
    title: "Un proceso claro.",
    description:
      "La estructura se mantiene firme desde la consulta hasta la entrega final para que la familia siempre sepa qué viene después.",
    primaryAction: { label: "Comenzar con la consulta", href: "/inquire" },
    secondaryAction: { label: "La experiencia", href: "/the-experience" },
    stageLabel: "Secuencia del proceso",
    compactNote: "Esta es la progresión más explícita del recorrido.",
    steps: [
      {
        label: "Consulta",
        title: "La consulta marca el tono.",
        summary: "Compartes para quién es la película y por qué este momento importa.",
        detail:
          "El primer paso es sencillo a propósito: suficiente contexto para responder bien sin convertir la consulta en un proyecto.",
        bullets: ["Inicio sin presión", "Respuesta humana", "Conversación clara de encaje"],
        mediaLabel: "Paso 01",
        mediaCaption: "El comienzo debe sentirse discreto, no transaccional.",
      },
      {
        label: "Descubrimiento",
        title: "El descubrimiento define el marco.",
        summary: "Tono, lugar, prioridades y contexto familiar se alinean juntos.",
        detail:
          "Aquí decidimos qué debe sostener la película, qué puede quedar en segundo plano y cómo debe sentirse el trabajo.",
        bullets: ["Alineación de tono", "Lugar y tiempos", "Prioridades narrativas"],
        mediaLabel: "Paso 02",
        mediaCaption: "Un proceso premium se siente pensado antes de filmar.",
      },
      {
        label: "Reflexión",
        title: "La reflexión reúne el material.",
        summary: "Las preguntas y los capítulos se construyen antes de comenzar a filmar.",
        detail:
          "Este paso da profundidad a la conversación final sin cerrar el espacio para que la persona real conduzca el relato.",
        bullets: ["Guía de capítulos", "Claridad de mensaje", "Más profundidad, menos adivinanza"],
        mediaLabel: "Paso 03",
        mediaCaption: "La preparación aumenta la verdad en lugar de aplanarla.",
      },
      {
        label: "Filmación",
        title: "Filmar se siente compuesto.",
        summary: "La conversación se registra en un entorno que sostiene la presencia.",
        detail:
          "Cámara, sonido y dirección se mantienen lo bastante discretos para que la historia se sienta vivida, no producida para el lente.",
        bullets: ["Entorno sereno", "Guiado sin presión", "Presencia antes que actuación"],
        mediaLabel: "Paso 04",
        mediaCaption: "El encuadre sostiene su voz en lugar de competir con ella.",
      },
      {
        label: "Entrega",
        title: "La edición completa el legado.",
        summary: "La película final se estructura, se pule y se prepara para resguardo privado.",
        detail:
          "El orden narrativo, el ritmo emocional y el formato final convierten el proceso en algo que la familia puede conservar.",
        bullets: ["Contención editorial", "Entrega privada", "Hecha para volver a ella"],
        mediaLabel: "Paso 05",
        mediaCaption: "La meta no es contenido. Es una pieza del archivo familiar.",
      },
    ],
  },
  preserve: {
    eyebrow: "Lo Que Preservamos",
    title: "Capítulos de la historia.",
    description:
      "La película se articula alrededor de los temas que una familia más necesita volver a escuchar y sentir, no alrededor de un guion rígido.",
    primaryAction: { label: "Consultar", href: "/inquire" },
    secondaryAction: { label: "La experiencia", href: "/the-experience" },
    stageLabel: "Arquitectura de la historia",
    compactNote: "Cada capítulo puede activarse sin convertir la película en una lista.",
    steps: [
      {
        label: "Valores",
        title: "Lo que defendía.",
        summary: "Los valores revelan la arquitectura interior de una vida.",
        detail:
          "Las convicciones, los estándares y la manera en que una persona eligió vivir suelen convertirse en la columna emocional de la película.",
        bullets: ["Principios", "Estándares", "Carácter interior"],
        mediaLabel: "Capítulo 01",
        mediaCaption: "Los valores explican no solo lo que pasó, sino quién era.",
      },
      {
        label: "Raíces",
        title: "Dónde comenzó la historia.",
        summary: "La infancia y las raíces familiares vuelven tangible la historia en su propia voz.",
        detail:
          "Este capítulo da a las siguientes generaciones la textura del lugar, el contexto familiar y las circunstancias que moldearon una vida.",
        bullets: ["Historia de origen", "Entorno familiar", "Años formativos"],
        mediaLabel: "Capítulo 02",
        mediaCaption: "Las raíces dan escala y sentido a la historia posterior.",
      },
      {
        label: "Amor",
        title: "Cómo amó.",
        summary: "Matrimonio, vida familiar y afecto muestran el estilo de relación que perduró.",
        detail:
          "Aquí las generaciones futuras suelen escuchar cómo se vivió la devoción en la vida cotidiana, no solo en los grandes hitos.",
        bullets: ["Matrimonio", "Paternidad", "Ternura cotidiana"],
        mediaLabel: "Capítulo 03",
        mediaCaption: "El amor se entiende mejor cuando se oye en los detalles de la vida vivida.",
      },
      {
        label: "Creencia",
        title: "Lo que daba sentido a la vida.",
        summary: "La fe, la espiritualidad y la convicción pueden ser la capa más profunda de la identidad.",
        detail:
          "Cuando la creencia importa a la familia, debe estar en la película como una realidad vivida, no como un tema decorativo.",
        bullets: ["Fe", "Convicción", "Sentido en la dificultad"],
        mediaLabel: "Capítulo 04",
        mediaCaption: "La creencia suele explicar el tono de una vida más que los hechos solos.",
      },
      {
        label: "Mensaje",
        title: "Lo que quiere dejar hacia adelante.",
        summary: "El mensaje final suele ser la parte a la que la familia más vuelve.",
        detail:
          "Bendición, consejo, perspectiva y las palabras que deben acompañar a la siguiente generación reciben un lugar claro.",
        bullets: ["Bendición", "Consejo", "Mensaje familiar"],
        mediaLabel: "Capítulo 05",
        mediaCaption: "Aquí la película se convierte en una herencia de palabras, no solo de memoria.",
      },
    ],
  },
  inquire: {
    eyebrow: "Consultar",
    title: "Comienza el proceso.",
    description:
      "Una consulta privada y compacta diseñada para sentirse rápida, considerada y fácil de completar.",
    trustPoints: [
      "Revisado personalmente",
      "Sin obligación de reservar",
      "Un siguiente paso claro si se siente adecuado",
    ],
    supportStates: [
      {
        label: "Paso 01",
        title: "Para quién es.",
        body: "Comienza con la persona y la relación. Eso da el contexto emocional suficiente para empezar bien.",
      },
      {
        label: "Paso 02",
        title: "Por qué ahora se siente importante.",
        body: "El momento, la urgencia, la ternura y el contexto familiar ayudan a dar el tono correcto al trabajo.",
      },
      {
        label: "Paso 03",
        title: "Cómo continuamos.",
        body: "Una vez claros los puntos esenciales, el siguiente paso es una conversación serena sobre encaje, ritmo y lo que la película debe sostener.",
      },
    ],
    formSteps: defaultSpanishInquiryFormSteps.map((step) => ({ ...step })),
    fieldCopy: { ...defaultSpanishInquiryFieldCopy },
    previousButtonLabel: "Anterior",
    nextButtonLabel: "Siguiente",
    submitButtonLabel: "Enviar consulta",
    progressionLabel: "Progresión de la consulta",
    mediaNote: "Cada estado mantiene la consulta compacta sin perder contexto.",
    nextHeading: "Qué sigue",
    nextBody:
      "Cuando lo esencial está claro, el siguiente paso es una conversación privada sobre encaje, tiempos y el tono que la película debe sostener.",
    footerNote: "Revisado personalmente y con discreción antes de cualquier seguimiento.",
    successEyebrow: "Consulta recibida",
    successTitle: "Gracias por la confianza.",
    successBody:
      "Tu consulta se ha guardado dentro del panel privado de CAPSOUL para seguimiento personal. Ahora conservamos el detalle del prospecto dentro de la app, manteniendo el mismo flujo compacto basado en pantallas.",
    successResetLabel: "Enviar otra consulta",
    successReturnLabel: "Volver al inicio",
  },
};

export const defaultSiteContentDocument: SiteContentDocument = {
  locales: {
    en: defaultSiteContent,
    es: defaultSpanishSiteContent,
  },
};

export function cloneDefaultSiteContent(locale: SiteLocale = "en"): SiteContent {
  return JSON.parse(
    JSON.stringify(locale === "es" ? defaultSpanishSiteContent : defaultSiteContent),
  ) as SiteContent;
}

export function cloneDefaultSiteContentDocument(): SiteContentDocument {
  return JSON.parse(JSON.stringify(defaultSiteContentDocument)) as SiteContentDocument;
}

function createScenePageConfig(
  key: Exclude<SiteContentPageKey, "global" | "inquire">,
  label: string,
  scene: EditableSceneContent,
): SiteContentPageConfig {
  return {
    key,
    label,
    sections: [
      {
        id: `${key}-overview`,
        title: "Overview",
        fields: [
          { path: "eyebrow", label: "Eyebrow", type: "text" },
          { path: "title", label: "Headline", type: "text" },
          { path: "description", label: "Supporting text", type: "textarea", rows: 3 },
          { path: "primaryAction.label", label: "Primary CTA label", type: "text" },
          { path: "secondaryAction.label", label: "Secondary CTA label", type: "text" },
          { path: "stageLabel", label: "Stage label", type: "text" },
          { path: "compactNote", label: "Progress note", type: "text" },
        ],
      },
      ...scene.steps.map<SiteContentSectionConfig>((step, index) => ({
        id: `${key}-step-${index + 1}`,
        title: `State ${index + 1}`,
        description: step.label,
        fields: [
          { path: `steps.${index}.label`, label: "Chip label", type: "text" },
          { path: `steps.${index}.title`, label: "State headline", type: "text" },
          { path: `steps.${index}.summary`, label: "Media summary", type: "textarea", rows: 3 },
          { path: `steps.${index}.detail`, label: "Detail paragraph", type: "textarea", rows: 4 },
          { path: `steps.${index}.mediaLabel`, label: "Media eyebrow", type: "text" },
          { path: `steps.${index}.mediaCaption`, label: "Media caption", type: "textarea", rows: 3 },
          {
            path: `steps.${index}.bullets`,
            label: "Bullets",
            type: "list",
            description: "One item per line.",
            rows: 4,
          },
        ],
      })),
    ],
  };
}

export const siteContentEditorPages: SiteContentPageConfig[] = [
  {
    key: "global",
    label: "Global UI",
    sections: [
      {
        id: "global-brand",
        title: "Brand + utility",
        fields: [
          { path: "brandDescriptor", label: "Brand descriptor", type: "text" },
          { path: "headerTagline", label: "Header utility chip", type: "text" },
          { path: "headerInquireLabel", label: "Header inquire button", type: "text" },
          { path: "mobileHeaderInquireLabel", label: "Mobile header inquire button", type: "text" },
          { path: "adminEntryLabel", label: "Admin entry label", type: "text" },
        ],
      },
      {
        id: "global-navigation",
        title: "Navigation",
        fields: [
          { path: "navigation.home", label: "Home label", type: "text" },
          { path: "navigation.experience", label: "The Experience label", type: "text" },
          { path: "navigation.process", label: "How It Works label", type: "text" },
          { path: "navigation.preserve", label: "What We Preserve label", type: "text" },
          { path: "navigation.inquire", label: "Inquire label", type: "text" },
        ],
      },
      {
        id: "global-scene-ui",
        title: "Scene UI labels",
        fields: [
          { path: "routeLabels.previous", label: "Previous label", type: "text" },
          { path: "routeLabels.next", label: "Next label", type: "text" },
          { path: "routeLabels.nextPagePrefix", label: "Next-page prefix", type: "text" },
          { path: "sceneLabels.tapImageHint", label: "Tap image hint", type: "text" },
          { path: "sceneLabels.arrowInstruction", label: "Arrow instruction", type: "text" },
          { path: "sceneLabels.activeState", label: "Active state label", type: "text" },
        ],
      },
      {
        id: "global-language",
        title: "Language toggle labels",
        fields: [
          { path: "languageLabels.en", label: "English label", type: "text" },
          { path: "languageLabels.es", label: "Spanish label", type: "text" },
        ],
      },
    ],
  },
  createScenePageConfig("home", "Home", defaultSiteContent.home),
  createScenePageConfig("experience", "The Experience", defaultSiteContent.experience),
  createScenePageConfig("process", "How It Works", defaultSiteContent.process),
  createScenePageConfig("preserve", "What We Preserve", defaultSiteContent.preserve),
  {
    key: "inquire",
    label: "Inquire",
    sections: [
      {
        id: "inquire-overview",
        title: "Overview",
        fields: [
          { path: "eyebrow", label: "Eyebrow", type: "text" },
          { path: "title", label: "Headline", type: "text" },
          { path: "description", label: "Supporting text", type: "textarea", rows: 3 },
          {
            path: "trustPoints",
            label: "Trust points",
            type: "list",
            description: "One item per line.",
            rows: 4,
          },
        ],
      },
      {
        id: "inquire-form-buttons",
        title: "Form controls",
        fields: [
          { path: "previousButtonLabel", label: "Previous button", type: "text" },
          { path: "nextButtonLabel", label: "Next button", type: "text" },
          { path: "submitButtonLabel", label: "Submit button", type: "text" },
          { path: "fieldCopy.submittingLabel", label: "Submitting label", type: "text" },
          { path: "footerNote", label: "Footer note", type: "text" },
        ],
      },
      ...defaultSiteContent.inquire.supportStates.map<SiteContentSectionConfig>((state, index) => ({
        id: `inquire-support-${index + 1}`,
        title: `Support state ${index + 1}`,
        description: state.label,
        fields: [
          { path: `supportStates.${index}.label`, label: "Step label", type: "text" },
          { path: `supportStates.${index}.title`, label: "Support title", type: "text" },
          { path: `supportStates.${index}.body`, label: "Support body", type: "textarea", rows: 3 },
        ],
      })),
      ...defaultSiteContent.inquire.formSteps.map<SiteContentSectionConfig>((step, index) => ({
        id: `inquire-form-step-${index + 1}`,
        title: `Form step ${index + 1}`,
        description: step.chip,
        fields: [
          { path: `formSteps.${index}.chip`, label: "Chip label", type: "text" },
          { path: `formSteps.${index}.title`, label: "Step title", type: "text" },
          { path: `formSteps.${index}.description`, label: "Step description", type: "textarea", rows: 3 },
        ],
      })),
      {
        id: "inquire-field-copy-1",
        title: "Field copy: contact",
        fields: [
          { path: "fieldCopy.fullNameLabel", label: "Full name label", type: "text" },
          { path: "fieldCopy.fullNamePlaceholder", label: "Full name placeholder", type: "text" },
          { path: "fieldCopy.emailLabel", label: "Email label", type: "text" },
          { path: "fieldCopy.emailPlaceholder", label: "Email placeholder", type: "text" },
          { path: "fieldCopy.phoneLabel", label: "Phone label", type: "text" },
          { path: "fieldCopy.phonePlaceholder", label: "Phone placeholder", type: "text" },
          { path: "fieldCopy.regionLabel", label: "Region label", type: "text" },
          { path: "fieldCopy.regionPlaceholder", label: "Region placeholder", type: "text" },
        ],
      },
      {
        id: "inquire-field-copy-2",
        title: "Field copy: story",
        fields: [
          { path: "fieldCopy.filmForLabel", label: "Film-for label", type: "text" },
          { path: "fieldCopy.filmForPlaceholder", label: "Film-for placeholder", type: "text" },
          { path: "fieldCopy.relationshipLabel", label: "Relationship label", type: "text" },
          { path: "fieldCopy.relationshipPlaceholder", label: "Relationship placeholder", type: "text" },
          { path: "fieldCopy.stillLivingLabel", label: "Still-living label", type: "text" },
          { path: "fieldCopy.stillLivingPlaceholder", label: "Still-living placeholder", type: "text" },
          { path: "fieldCopy.stillLivingYes", label: "Still-living yes", type: "text" },
          { path: "fieldCopy.stillLivingNo", label: "Still-living no", type: "text" },
          { path: "fieldCopy.stillLivingPreferNot", label: "Still-living prefer-not", type: "text" },
          { path: "fieldCopy.timelineLabel", label: "Timeline label", type: "text" },
          { path: "fieldCopy.timelinePlaceholder", label: "Timeline placeholder", type: "text" },
          { path: "fieldCopy.storyImportanceLabel", label: "Story importance label", type: "text" },
          { path: "fieldCopy.storyImportancePlaceholder", label: "Story importance placeholder", type: "text" },
        ],
      },
      {
        id: "inquire-field-copy-3",
        title: "Field copy: practical notes",
        fields: [
          { path: "fieldCopy.filmingLocationLabel", label: "Filming location label", type: "text" },
          { path: "fieldCopy.filmingLocationPlaceholder", label: "Filming location placeholder", type: "text" },
          { path: "fieldCopy.faithContextLabel", label: "Faith / values label", type: "text" },
          { path: "fieldCopy.faithContextPlaceholder", label: "Faith / values placeholder", type: "text" },
          { path: "fieldCopy.faithContextCentral", label: "Faith option: central", type: "text" },
          { path: "fieldCopy.faithContextPresent", label: "Faith option: present", type: "text" },
          { path: "fieldCopy.faithContextNotReally", label: "Faith option: not especially", type: "text" },
          { path: "fieldCopy.faithContextNotSure", label: "Faith option: not sure", type: "text" },
          { path: "fieldCopy.extraNotesLabel", label: "Extra notes label", type: "text" },
          { path: "fieldCopy.extraNotesPlaceholder", label: "Extra notes placeholder", type: "text" },
        ],
      },
      {
        id: "inquire-follow-up",
        title: "Support panel copy",
        fields: [
          { path: "progressionLabel", label: "Progression label", type: "text" },
          { path: "mediaNote", label: "Media note", type: "textarea", rows: 3 },
          { path: "nextHeading", label: "Next-step heading", type: "text" },
          { path: "nextBody", label: "Next-step body", type: "textarea", rows: 3 },
        ],
      },
      {
        id: "inquire-success",
        title: "Success state",
        fields: [
          { path: "successEyebrow", label: "Success eyebrow", type: "text" },
          { path: "successTitle", label: "Success headline", type: "text" },
          { path: "successBody", label: "Success body", type: "textarea", rows: 4 },
          { path: "successResetLabel", label: "Reset button label", type: "text" },
          { path: "successReturnLabel", label: "Return button label", type: "text" },
        ],
      },
    ],
  },
];
