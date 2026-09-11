/**
 * Catálogo de servicios para las páginas SEO /servicios/[slug].
 * Contenido específico y útil por servicio (no keywords recicladas).
 */

export type ServiceContent = {
  slug: string;
  /** Nombre corto (chips, listados). */
  name: string;
  /** H1 de la página. */
  h1: string;
  /** Meta title. */
  title: string;
  /** Meta description (~155 chars). */
  description: string;
  keywords: string[];
  /** Párrafo introductorio. */
  intro: string;
  /** Qué incluye normalmente el trabajo. */
  includes: string[];
  /** Cuándo lo necesitas (síntomas / casos). */
  whenYouNeedIt: string[];
  /** Qué mirar para elegir bien / consejos. */
  tips: string[];
  /** FAQ específico del servicio. */
  faqs: { q: string; a: string }[];
};

export const SERVICES: ServiceContent[] = [
  {
    slug: "pintura-de-vehiculos",
    name: "Pintura de vehículos",
    h1: "Pintura de vehículos",
    title: "Pintura de vehículos: cotiza pintura completa o por pieza",
    description:
      "Cotiza pintura automotriz completa o por pieza: preparación, fondo, color y barniz con acabado de fábrica. Envía fotos y recibe tu propuesta.",
    keywords: [
      "pintura de vehículos",
      "pintura automotriz",
      "pintar carro",
      "pintura completa de auto",
      "precio pintura de carro",
    ],
    intro:
      "La pintura automotriz devuelve el color y la protección del vehículo tras golpes, decoloración por sol o desgaste. Se puede hacer por pieza (una puerta, el capó) o completa, y el resultado depende tanto de la calidad del material como de la preparación de la superficie.",
    includes: [
      "Lijado y preparación de la superficie",
      "Aplicación de fondo (primer) y sellador",
      "Igualación de color y aplicación de base",
      "Barniz de protección y pulido final",
    ],
    whenYouNeedIt: [
      "El color se ve opaco, desteñido o con manchas por el sol",
      "Hay óxido o la pintura está levantada o descascarada",
      "Después de una reparación de latonería o desabolladura",
      "Quieres cambiar el color del vehículo",
    ],
    tips: [
      "Pide que igualen el color con código de fábrica para un acabado uniforme",
      "Pregunta si incluye barniz y garantía sobre la pintura",
      "Fotos con buena luz ayudan al taller a cotizar con más precisión",
    ],
    faqs: [
      {
        q: "¿Cuánto dura una pintura de calidad?",
        a: "Con buena preparación y barniz, años sin perder brillo. La duración baja mucho si se salta la preparación.",
      },
      {
        q: "¿Puedo pintar solo una pieza?",
        a: "Sí. Se puede pintar una sola pieza igualando el color; el taller difumina para que no se note el cambio.",
      },
    ],
  },
  {
    slug: "pintura-de-bumper",
    name: "Pintura de bumper",
    h1: "Pintura y reparación de bumper",
    title: "Pintura de bumper: repara y pinta parachoques rayados o partidos",
    description:
      "Cotiza reparación y pintura de bumper: rayones, roces, grietas o parachoques partido. Envía fotos del daño y recibe tu propuesta rápido.",
    keywords: [
      "pintura de bumper",
      "pintar bumper",
      "reparar bumper",
      "reparación de parachoques",
      "bumper rayado",
    ],
    intro:
      "El bumper (parachoques) es de las piezas que más sufre: roces al estacionar, golpes leves y rayones. En la mayoría de los casos se repara y se pinta sin necesidad de reemplazarlo, lo que sale más económico.",
    includes: [
      "Evaluación de si se repara o se reemplaza",
      "Relleno y lijado de rayones o grietas",
      "Imprimación específica para plásticos",
      "Pintura, igualación de color y barniz",
    ],
    whenYouNeedIt: [
      "Rayones profundos o roces por estacionar",
      "Grietas o el bumper partido tras un golpe leve",
      "Pintura del parachoques desgastada o descolorida",
    ],
    tips: [
      "Un bumper agrietado normalmente se repara; pregunta antes de reemplazar",
      "Incluye fotos de cerca y de lejos para dimensionar el daño",
    ],
    faqs: [
      {
        q: "¿Se puede reparar un bumper partido?",
        a: "En muchos casos sí, con soldadura plástica y relleno. El taller confirma viendo las fotos.",
      },
      {
        q: "¿Reparar o reemplazar el bumper?",
        a: "Reparar suele ser más económico si el daño no es estructural. El taller te recomienda según el caso.",
      },
    ],
  },
  {
    slug: "desabolladura-y-pintura",
    name: "Desabolladura y pintura",
    h1: "Desabolladura y pintura",
    title: "Desabolladura y pintura: saca abolladuras y deja el color como nuevo",
    description:
      "Cotiza desabolladura y pintura para golpes y abolladuras en puertas, guardafangos y capó. Envía fotos y recibe la propuesta del taller.",
    keywords: [
      "desabolladura y pintura",
      "sacar abolladuras",
      "reparación de golpes",
      "latonería y pintura",
      "enderezado de chasis",
    ],
    intro:
      "La desabolladura corrige golpes y hundimientos en la carrocería. Según el daño, se usa desabollado tradicional con relleno o técnicas sin pintura (PDR) cuando la pintura está intacta. Luego se pinta para devolver el acabado original.",
    includes: [
      "Diagnóstico del golpe y del estado de la pintura",
      "Enderezado o desabollado de la pieza",
      "Relleno, lijado y preparación",
      "Pintura, igualación de color y barniz",
    ],
    whenYouNeedIt: [
      "Golpes o abolladuras por choques leves",
      "Hundimientos por granizo o impactos",
      "Puertas o guardafangos deformados",
    ],
    tips: [
      "Si la pintura no se rompió, pregunta por desabollado sin pintura (PDR): es más económico",
      "Fotos desde varios ángulos ayudan a estimar mejor",
    ],
    faqs: [
      {
        q: "¿Qué es el desabollado sin pintura (PDR)?",
        a: "Una técnica para sacar abolladuras sin repintar, cuando la pintura sigue intacta. Es más rápida y económica.",
      },
      {
        q: "¿Siempre hay que pintar después?",
        a: "No siempre. Si la pintura no se dañó, a veces basta el desabollado. El taller lo evalúa con las fotos.",
      },
    ],
  },
  {
    slug: "reparacion-de-rayones",
    name: "Reparación de rayones",
    h1: "Reparación de rayones",
    title: "Reparación de rayones: elimina rayaduras y raspones de tu carro",
    description:
      "Cotiza reparación de rayones y raspones: desde rayaduras superficiales hasta profundas que llegan al metal. Envía fotos y recibe tu propuesta.",
    keywords: [
      "reparación de rayones",
      "quitar rayones del carro",
      "raspón de auto",
      "pulir rayones",
      "rayaduras en la pintura",
    ],
    intro:
      "No todos los rayones son iguales. Los superficiales muchas veces se corrigen puliendo; los profundos que llegan al fondo o al metal requieren relleno y pintura. Identificar el tipo evita pagar de más o quedar mal.",
    includes: [
      "Evaluación de la profundidad del rayón",
      "Pulido para rayones superficiales",
      "Relleno y lijado para rayones profundos",
      "Pintura localizada e igualación de color",
    ],
    whenYouNeedIt: [
      "Rayones de llave, roces o ramas",
      "Raspones al estacionar o en el tráfico",
      "Rayaduras que ya muestran el color de fondo o el metal",
    ],
    tips: [
      "Pasa la uña: si se traba, el rayón es profundo y necesita pintura, no solo pulido",
      "Una foto de cerca con buena luz define si es pulido o repintado",
    ],
    faqs: [
      {
        q: "¿El pulido quita cualquier rayón?",
        a: "Solo los superficiales. Si el rayón llega al fondo o al metal, hay que rellenar y pintar.",
      },
      {
        q: "¿Se nota la reparación?",
        a: "Con buena igualación de color y difuminado, no. Por eso importa que el taller trabaje con código de color.",
      },
    ],
  },
  {
    slug: "detailing",
    name: "Detailing y pulido",
    h1: "Detailing y pulido automotriz",
    title: "Detailing y pulido: recupera el brillo y protege la pintura",
    description:
      "Cotiza detailing y pulido: corrección de pintura, brillo, limpieza profunda y protección. Envía fotos de tu vehículo y recibe tu propuesta.",
    keywords: [
      "detailing",
      "pulido de carro",
      "corrección de pintura",
      "brillo de pintura",
      "detallado automotriz",
    ],
    intro:
      "El detailing va más allá de un lavado: corrige microrayas, recupera el brillo y protege la pintura. Incluye trabajo de pulido por capas y, opcionalmente, sellados o recubrimientos que alargan la vida del acabado.",
    includes: [
      "Lavado y descontaminación de la pintura",
      "Pulido por etapas (corrección de microrayas)",
      "Abrillantado y sellado de protección",
      "Detallado de interior según el paquete",
    ],
    whenYouNeedIt: [
      "La pintura se ve opaca o con microrayas (telarañas)",
      "Antes de vender el vehículo para presentarlo mejor",
      "Mantenimiento periódico para proteger el color",
    ],
    tips: [
      "Pregunta cuántas etapas de pulido incluye y si hay sellado o cerámico",
      "El detailing no repara golpes ni rayones profundos: para eso es pintura",
    ],
    faqs: [
      {
        q: "¿El detailing quita rayones?",
        a: "Corrige microrayas y telarañas superficiales. Los rayones profundos requieren pintura, no pulido.",
      },
      {
        q: "¿Cada cuánto conviene hacerlo?",
        a: "Depende del uso y la exposición al sol; un mantenimiento periódico conserva mejor el brillo y la protección.",
      },
    ],
  },
];

export function getService(slug: string): ServiceContent | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function allServiceSlugs(): string[] {
  return SERVICES.map((s) => s.slug);
}
