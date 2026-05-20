// ── Normalizer ────────────────────────────────────────────────────────────────

export function normalizeVoiceText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")   // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Matcher ───────────────────────────────────────────────────────────────────

function matches(text: string, words: string[]): boolean {
  return words.some((word) => {
    if (!word) return false;
    // Numbers / single characters — must be isolated word
    if (word.length <= 1) return text === word || new RegExp(`(^|\\s)${word}(\\s|$)`).test(text);
    // Short words (2–4 chars) — word boundary
    if (word.length <= 4) return new RegExp(`(^|\\s)${word}(\\s|$)`).test(text);
    // Longer words — substring is fine (handles "la izquierda" → contains "izquierda")
    return text.includes(word);
  });
}

// ── Word lists ─────────────────────────────────────────────────────────────────
// Large lists = more chances for the browser model to match something it heard.
// Phonetic variants cover common misrecognitions by Spanish ASR.

const LEFT_WORDS = [
  // Primary
  "izquierda", "izquierdo", "esquierda", "isquierda", "iquierda",
  // Phrases
  "a la izquierda", "hacia izquierda", "hacia la izquierda",
  "mueve izquierda", "ir izquierda", "ve izquierda", "vete izquierda",
  "mueve a la izquierda",
  // Synonyms
  "atras", "atrás", "para atras", "para atrás",
  "retrocede", "retroceder", "retroceso",
  "regresa", "regresar", "vuelve",
  "reversa", "reverso",
  "izq",
  // Numbers
  "2", "dos",
  // English fallback (Chrome often catches these)
  "left", "back",
];

const RIGHT_WORDS = [
  // Primary
  "derecha", "derecho", "derechas",
  // Phrases
  "a la derecha", "hacia derecha", "hacia la derecha",
  "mueve derecha", "ir derecha", "ve derecha", "vete derecha",
  "mueve a la derecha",
  // Synonyms
  "adelante", "avanza", "avanzar", "avance", "avancemos",
  "sigue", "continua", "continúa", "continuar", "siguiente",
  "der",
  // Numbers
  "3", "tres",
  // English
  "right", "forward", "go",
];

const JUMP_WORDS = [
  // Primary
  "salta", "salto", "saltar", "saltando",
  // Synonyms
  "arriba", "sube", "subir", "súbete",
  "brinca", "brincar", "brincate",
  "vuela", "volar", "vuelo",
  "flota", "flotar",
  "trepa", "trepar",
  "alto", "eleva",
  // Phrases
  "para arriba", "hacia arriba",
  // Numbers
  "1", "uno",
  // English
  "jump", "up", "hop",
];

const STOP_WORDS = [
  "para", "parar", "detente", "detener", "stop",
  "quieto", "quieta", "quedo",
  "espera", "esperar", "aguarda",
  "no te muevas", "no muevas",
  "0", "cero",
  // English
  "stop", "halt", "wait",
];

const SPECIAL_WORDS = [
  "habilidad", "habilidades",
  "especial", "especiales",
  "poder", "poderes",
  "super",
  "ataque", "ataques",
  "magia", "magico",
  "activar", "activa",
  "lanza", "lanzar",
  "usar", "usa",
  "dispara", "disparar",
  // Element-specific (players might say the attack name)
  "fuego", "llama", "llamarada",
  "trueno", "electrico", "rayo",
  "agua", "hidro",
  "planta", "enredadera", "vid",
  "psiquico", "telekinesis",
  "sombra", "tinieblas",
  // Numbers
  "4", "cuatro",
  // English
  "special", "attack", "ability", "power", "fire",
];

// ── Public API ────────────────────────────────────────────────────────────────

export type VoiceCommandType = "left" | "right" | "jump" | "stop" | "special" | null;

export function classifyVoiceCommand(transcript: string): VoiceCommandType {
  const text = normalizeVoiceText(transcript);
  if (!text) return null;

  // Order matters: stop before left/right to catch "para" before it matches anything else
  if (matches(text, STOP_WORDS))    return "stop";
  if (matches(text, LEFT_WORDS))    return "left";
  if (matches(text, RIGHT_WORDS))   return "right";
  if (matches(text, JUMP_WORDS))    return "jump";
  if (matches(text, SPECIAL_WORDS)) return "special";

  return null;
}

// Legacy helpers kept for backwards-compat (used nowhere critical now)
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

// ── JSGF grammar string (exported for use in VoiceSpecialButton) ──────────────

export const VOICE_GRAMMAR = `#JSGF V1.0 UTF-8 es;
grammar novarun;
public <command> =
  izquierda | izquierdo | esquierda | atras | retrocede | regresa | reversa | dos | 2 | left | back |
  derecha | derecho | adelante | avanza | sigue | continua | tres | 3 | right | forward |
  salta | salto | saltar | arriba | sube | brinca | vuela | uno | 1 | jump | up |
  para | detente | stop | quieto | espera | cero | 0 |
  habilidad | especial | poder | ataque | magia | activar | lanza | fuego | trueno | cuatro | 4 | special | attack ;
`;
