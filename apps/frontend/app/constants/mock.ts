import { C } from "./colors";

export const sessions = [
  {
    id: "s1",
    title: "Dieta para diabetes tipo 2",
    project: "Vanessa Nutrióloga",
    ts: "14:31",
    tokens: 2840,
    cost: 0.0031,
    msgs: 8,
  },
  {
    id: "s2",
    title: "Cotización salón 200 personas",
    project: "Salón Eventos GDL",
    ts: "13:55",
    tokens: 1420,
    cost: 0.0015,
    msgs: 5,
  },
  {
    id: "s3",
    title: "Propiedades Zona Diamante",
    project: "Inmobiliaria Mar Azul",
    ts: "12:10",
    tokens: 3200,
    cost: 0.0035,
    msgs: 11,
  },
  {
    id: "s4",
    title: "Limpieza dental preventiva",
    project: "Clínica Dental CDMX",
    ts: "11:30",
    tokens: 980,
    cost: 0.001,
    msgs: 4,
  },
];

export const docs = [
  {
    id: "d1",
    name: "Manual Nutrición Clínica.pdf",
    size: "4.2 MB",
    chunks: 342,
    status: "indexed",
    ts: "Apr 28",
    type: "pdf",
    color: C.crimson,
  },
  {
    id: "d2",
    name: "Catálogo Salón 2026.pdf",
    size: "2.1 MB",
    chunks: 180,
    status: "indexed",
    ts: "Apr 27",
    type: "pdf",
    color: C.blue,
  },
  {
    id: "d3",
    name: "Listado Propiedades Q2.xlsx",
    size: "890 KB",
    chunks: 97,
    status: "indexed",
    ts: "Apr 25",
    type: "file",
    color: C.yellow,
  },
  {
    id: "d4",
    name: "Protocolos Dentales.pdf",
    size: "1.4 MB",
    chunks: 210,
    status: "processing",
    ts: "Apr 29",
    type: "pdf",
    color: C.crimson,
  },
  {
    id: "d5",
    name: "https://vanessa-nutri.com/guia",
    size: "—",
    chunks: 0,
    status: "processing",
    ts: "Apr 29",
    type: "url",
    color: C.blue,
  },
  {
    id: "d6",
    name: "intro-bran-ai-demo.mp4",
    size: "38 MB",
    chunks: 62,
    status: "indexed",
    ts: "Apr 22",
    type: "video",
    color: C.crimsonMid,
  },
  {
    id: "d7",
    name: "foto-menu-nutricion.jpg",
    size: "1.2 MB",
    chunks: 12,
    status: "indexed",
    ts: "Apr 21",
    type: "image",
    color: C.green,
  },
];

export const chatMessages = [
  {
    role: "user",
    text: "¿Cuál es la dieta recomendada para un paciente con diabetes tipo 2 y sobrepeso?",
  },
  {
    role: "assistant",
    text: "Para un paciente con diabetes tipo 2 y sobrepeso, el protocolo recomendado incluye una dieta hipocalórica moderada con control estricto de carbohidratos de índice glucémico alto.",
  },
  {
    role: "user",
    text: "¿Qué alimentos deben evitarse completamente?",
  },
  {
    role: "assistant",
    text: "Los alimentos a evitar incluyen azúcares refinados, harinas blancas, bebidas azucaradas, frituras y alimentos ultraprocesados.",
  },
];

export const days30 = Array.from({ length: 30 }, (_, i) =>
  Math.round(80000 + i * 8000 + (Math.random() - 0.5) * 20000)
);

export const costs30 = days30.map((tokens) =>
  Number((tokens / 1000000 * 1.1).toFixed(4))
);
