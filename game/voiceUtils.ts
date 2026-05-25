// ── Normalizer ────────────────────────────────────────────────────────────────

export function normalizeVoiceText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")   // strip combining diacriticals
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Matchers ──────────────────────────────────────────────────────────────────

function matches(text: string, words: string[]): boolean {
  return words.some((word) => {
    if (!word) return false;
    if (word.length <= 4) return new RegExp(`(^|\\s)${word}(\\s|$)`).test(text);
    return text.includes(word);
  });
}

// Any token in the transcript that starts with one of these stems → match.
// Handles partial transcription: "izquier..." recognised as "izquier".
function stemMatch(text: string, stems: string[]): boolean {
  const tokens = text.split(/\s+/);
  return stems.some((stem) => tokens.some((t) => t.startsWith(stem)));
}

// ── Word lists ─────────────────────────────────────────────────────────────────
// Primarias + variantes fonéticas del ASR español (es-ES / es-MX / es-419),
// errores comunes de transcripción e inglés de respaldo.

const LEFT_WORDS = [
  // Primarias España/LatAm
  "izquierda", "izquierdo", "esquierda", "isquierda", "iquierda",
  "izquier", "isquier", "izquiera",
  // Frases comunes
  "a la izquierda", "hacia la izquierda", "hacia izquierda",
  "para la izquierda", "mueve izquierda", "mueve a la izquierda",
  "ir izquierda", "ve izquierda", "vete izquierda",
  "lado izquierdo", "lado izquierda",
  "pa la izquierda", "pa izquierda",
  // Sinónimos de retroceso (LatAm informal)
  "atras", "para atras", "ve atras", "pa atras", "pa atrás",
  "pa´tras", "pa tras", "vamos atras",
  "retrocede", "retroceder", "retroceso", "retroce",
  "regresa", "regresar", "vuelve", "volver", "regreso",
  "reversa", "reverso",
  // Abreviaturas / números
  "izq", "2", "dos",
  // Inglés (Chrome suele transcribir en inglés en es-ES)
  "left", "go left", "move left", "back",
];

const LEFT_STEMS = [
  "izquie", "isquie", "esquie", "atra", "retro", "regres", "revers",
];

const RIGHT_WORDS = [
  // Primarias
  "derecha", "derecho", "derechas", "derechos", "dercha",
  // Frases
  "a la derecha", "hacia la derecha", "hacia derecha",
  "para la derecha", "mueve derecha", "mueve a la derecha",
  "ir derecha", "ve derecha", "vete derecha",
  "lado derecho", "lado derecha",
  "pa la derecha", "pa derecha",
  // Sinónimos de avance (LatAm informal)
  "adelante", "pa adelante", "pa´lante", "palante", "pa lante",
  "pa´ adelante", "vamos adelante",
  "avanza", "avanzar", "avance", "avancemos",
  "sigue", "continua", "continuar", "continuo", "siguiente",
  "corre", "correr", "camina", "caminar",
  "muevete", "mueve",
  // Abreviaturas / números
  "der", "3", "tres",
  // Inglés
  "right", "go right", "move right", "forward", "go", "run", "ahead",
];

const RIGHT_STEMS = [
  "derech", "adelan", "avanz", "camin", "palant",
];

const JUMP_WORDS = [
  // Primarias
  "salta", "salto", "saltar", "saltando", "saltate", "saltate",
  // Variantes fonéticas del ASR (salta → alta, falta, malta…)
  "alta", "alto",
  // Sinónimos
  "arriba", "sube", "subir", "subete",
  "brinca", "brincar", "brinco", "brincos", "brincate",
  "vuela", "volar", "vuelo", "vuelas",
  "flota", "flotar",
  "trepa", "trepar",
  "eleva", "elevate",
  "upa", "upa upa",
  // Frases LatAm
  "para arriba", "hacia arriba", "ve arriba",
  "pa arriba", "pa´rriba", "pa rriba",
  "vamos arriba",
  "da un salto", "da salto",
  "un salto", "salta ya",
  // Números
  "1", "uno", "un",
  // Inglés
  "jump", "up", "hop", "leap", "spring",
  "go up", "jump now",
];

const JUMP_STEMS = [
  "salt", "arrib", "brinc", "vuel", "elev", "trop",
];

const STOP_WORDS = [
  // Primarias
  "para", "parar",
  "detente", "detener", "detente ya",
  "quieto", "quieta", "quedo",
  "espera", "esperar", "aguarda",
  "frena", "frenar", "frena ya",
  "basta", "basta ya",
  // Frases
  "no te muevas", "no muevas", "no te muev",
  "queda quieto", "quedate quieto",
  "para ya", "alto ahi",
  "ni te muevas",
  // Números
  "0", "cero",
  // Inglés
  "stop", "halt", "wait", "freeze",
  "no more", "hold on", "stay",
];

const STOP_STEMS = [
  "quiet", "deten", "fren", "bast",
];

const SPECIAL_WORDS = [
  // Primarias
  "habilidad", "habilidades",
  "especial", "especiales",
  "poder", "poderes",
  "super",
  // Acciones
  "ataque", "ataques", "ataca",
  "magia", "magico",
  "activar", "activa", "activa ya",
  "lanza", "lanzar",
  "usar", "usa", "usa ya", "usala",
  "dispara", "disparar",
  "suelta", "sueltas",
  "mi poder", "usa tu especial", "usa el poder", "usa tu poder",
  // Nombres de ataques Pokémon
  "trueno", "rayo", "electrico", "impactrueno", "voltio",
  "fuego", "llama", "llamarada", "lanzallamas",
  "agua", "hidro", "pistola",
  "planta", "enredadera", "vid", "latigo",
  "psiquico", "telekinesis", "poder mental",
  "sombra", "tinieblas", "bola sombra",
  "venganza", "golpe",
  // Coloquiales / onomatopeya
  "boom", "pum", "zas", "echa",
  // Números
  "4", "cuatro",
  // Inglés
  "special", "attack", "ability", "power", "fire", "skill",
  "use skill", "use special", "use power",
];

const SPECIAL_STEMS = [
  "habilid", "especi", "activ", "dispar", "trueno", "ataq", "magi", "lanz",
];

// ── Public API ────────────────────────────────────────────────────────────────

export type VoiceCommandType = "left" | "right" | "jump" | "stop" | "special" | null;

export function classifyVoiceCommand(transcript: string): VoiceCommandType {
  const text = normalizeVoiceText(transcript);
  if (!text) return null;

  // Orden: dirección/acción primero; STOP al final para que "para atras"→left,
  // "para arriba"→jump y "para" solo→stop funcionen correctamente.
  if (matches(text, LEFT_WORDS)    || stemMatch(text, LEFT_STEMS))    return "left";
  if (matches(text, RIGHT_WORDS)   || stemMatch(text, RIGHT_STEMS))   return "right";
  if (matches(text, JUMP_WORDS)    || stemMatch(text, JUMP_STEMS))    return "jump";
  if (matches(text, STOP_WORDS)    || stemMatch(text, STOP_STEMS))    return "stop";
  if (matches(text, SPECIAL_WORDS) || stemMatch(text, SPECIAL_STEMS)) return "special";

  return null;
}

// Legacy helpers kept for backwards-compat
export function getMovementVoiceKey(transcript: string): string | null {
  const cmd = classifyVoiceCommand(transcript);
  if (cmd === "left")  return "ArrowLeft";
  if (cmd === "right") return "ArrowRight";
  if (cmd === "jump")  return "ArrowUp";
  return null;
}

export function isSpecialVoiceCommand(transcript: string): boolean {
  return classifyVoiceCommand(transcript) === "special";
}

// ── JSGF grammar ──────────────────────────────────────────────────────────────
// Guía al motor ASR del navegador hacia nuestro vocabulario.
// Incluye variantes de España y Latinoamérica.

export const VOICE_GRAMMAR = `#JSGF V1.0 UTF-8 es;
grammar novarun;
public <left> =
  izquierda | izquierdo | esquierda | isquierda | izquier |
  atras | atrás | pa atras | pa atrás | palante |
  retrocede | regresa | reversa | dos | 2 | left | back |
  ve atras | mueve izquierda | pa la izquierda;
public <right> =
  derecha | derecho | adelante | pa adelante | palante |
  avanza | sigue | continua | corre | camina |
  tres | 3 | right | forward | go | mueve derecha | pa la derecha;
public <jump> =
  salta | salto | saltar | alta | alto | arriba | pa arriba |
  sube | brinca | vuela | upa | brinco |
  uno | 1 | jump | up | hop | para arriba | pa arriba | salta ya;
public <stop> =
  para | detente | quieto | espera | frena | basta |
  cero | 0 | stop | halt | wait | freeze | para ya | frena ya;
public <special> =
  habilidad | especial | poder | ataque | ataca | magia | activar | lanza |
  usa | dispara | fuego | trueno | agua | psiquico | sombra | boom |
  cuatro | 4 | special | attack | ability | fire | skill | use skill | usala;
public <command> =
  <left> | <right> | <jump> | <stop> | <special>;
`;
