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

// ── Matcher ───────────────────────────────────────────────────────────────────

function matches(text: string, words: string[]): boolean {
  return words.some((word) => {
    if (!word) return false;
    if (word.length <= 1) return new RegExp(`(^|\\s)${word}(\\s|$)`).test(text);
    if (word.length <= 4) return new RegExp(`(^|\\s)${word}(\\s|$)`).test(text);
    return text.includes(word);
  });
}

// ── Word lists ─────────────────────────────────────────────────────────────────
// Cada lista incluye: palabras canónicas, variantes fonéticas comunes del ASR
// español, errores de transcripción frecuentes y equivalentes en inglés.

const LEFT_WORDS = [
  // Primarias
  "izquierda", "izquierdo", "esquierda", "isquierda", "iquierda",
  "izquier", "isquier",
  // Frases
  "a la izquierda", "hacia la izquierda", "hacia izquierda",
  "para la izquierda", "mueve izquierda", "mueve a la izquierda",
  "ir izquierda", "ve izquierda", "vete izquierda",
  "lado izquierdo", "lado izquierda",
  // Sinónimos de retroceso
  "atras", "atrás", "para atras", "para atrás", "ve atras", "ve atrás",
  "retrocede", "retroceder", "retroceso", "retroce",
  "regresa", "regresar", "vuelve", "volver", "regreso",
  "reversa", "reverso",
  // Abreviaturas / números
  "izq", "2", "dos",
  // Inglés (Chrome suele transcribir en inglés incluso en es-ES)
  "left", "go left", "move left", "back",
];

const RIGHT_WORDS = [
  // Primarias
  "derecha", "derecho", "derechas", "derechos",
  // Frases
  "a la derecha", "hacia la derecha", "hacia derecha",
  "para la derecha", "mueve derecha", "mueve a la derecha",
  "ir derecha", "ve derecha", "vete derecha",
  "lado derecho", "lado derecha",
  // Sinónimos de avance
  "adelante", "avanza", "avanzar", "avance", "avancemos",
  "sigue", "continua", "continuar", "continuo", "siguiente",
  "corre", "correr", "camin", "camina", "caminar",
  "muevete", "mueve",
  // Abreviaturas / números
  "der", "3", "tres",
  // Inglés
  "right", "go right", "move right", "forward", "go", "run", "ahead",
];

const JUMP_WORDS = [
  // Primarias
  "salta", "salto", "saltar", "saltando", "saltate",
  // Variantes fonéticas del ASR (salta → alta, falta, malta…)
  "alta", "alto",
  // Sinónimos
  "arriba", "sube", "subir", "subete", "subete",
  "brinca", "brincar", "brinco", "brincos", "brincate",
  "vuela", "volar", "vuelo", "vuelas",
  "flota", "flotar",
  "trepa", "trepar",
  "eleva", "elevate",
  "upa", "upa upa",
  // Frases
  "para arriba", "hacia arriba", "ve arriba",
  "da un salto", "da salto",
  // Números
  "1", "uno", "un",
  // Inglés
  "jump", "up", "hop", "leap", "spring",
  "go up", "jump now",
];

const STOP_WORDS = [
  // Primarias
  "para", "parar",
  "detente", "detener", "detente ya",
  "quieto", "quieta", "quedo",
  "espera", "esperar", "aguarda",
  "frena", "frenar",
  "basta", "alto",
  // Frases
  "no te muevas", "no muevas", "no te muev",
  "queda quieto", "quedate quieto",
  "no te muevas", "para ya",
  // Números
  "0", "cero",
  // Inglés
  "stop", "halt", "wait", "freeze",
  "no more", "hold on", "stay",
];

const SPECIAL_WORDS = [
  // Primarias
  "habilidad", "habilidades",
  "especial", "especiales",
  "poder", "poderes",
  "super",
  // Acciones
  "ataque", "ataques",
  "magia", "magico",
  "activar", "activa", "activa ya",
  "lanza", "lanzar",
  "usar", "usa", "usa ya",
  "dispara", "disparar",
  "suelta", "sueltas",
  // Nombres de ataques Pokémon (por si el jugador los nombra)
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
  "use skill", "use special",
];

// ── Public API ────────────────────────────────────────────────────────────────

export type VoiceCommandType = "left" | "right" | "jump" | "stop" | "special" | null;

export function classifyVoiceCommand(transcript: string): VoiceCommandType {
  const text = normalizeVoiceText(transcript);
  if (!text) return null;

  // Dirección/acción primero; STOP al final para que "para atras"→left,
  // "para arriba"→jump, y "para" solo→stop funcionen correctamente.
  if (matches(text, LEFT_WORDS))    return "left";
  if (matches(text, RIGHT_WORDS))   return "right";
  if (matches(text, JUMP_WORDS))    return "jump";
  if (matches(text, STOP_WORDS))    return "stop";
  if (matches(text, SPECIAL_WORDS)) return "special";

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
// Guía al modelo ASR del navegador hacia nuestro vocabulario.
// Cuantas más variantes haya aquí, mejor reconoce el motor de Chrome.

export const VOICE_GRAMMAR = `#JSGF V1.0 UTF-8 es;
grammar novarun;
public <left> =
  izquierda | izquierdo | esquierda | isquierda | atras | retrocede |
  regresa | reversa | dos | 2 | left | back | ve atras | mueve izquierda;
public <right> =
  derecha | derecho | adelante | avanza | sigue | continua | corre |
  tres | 3 | right | forward | go | mueve derecha;
public <jump> =
  salta | salto | saltar | arriba | sube | brinca | vuela | upa |
  uno | 1 | jump | up | hop | para arriba;
public <stop> =
  para | detente | quieto | espera | frena | basta |
  cero | 0 | stop | halt | wait | freeze;
public <special> =
  habilidad | especial | poder | ataque | magia | activar | lanza |
  usa | dispara | fuego | trueno | agua | psiquico | sombra | boom |
  cuatro | 4 | special | attack | ability | fire | skill;
public <command> =
  <left> | <right> | <jump> | <stop> | <special>;
`;
