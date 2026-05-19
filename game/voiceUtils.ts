export function normalizeVoiceText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getMovementVoiceKey(transcript: string): string | null {
  const text = normalizeVoiceText(transcript);
  if (!text) return null;

  const left = ["izquierda", "izq", "atras", "retrocede", "mueve izquierda", "ir izquierda", "2", "dos"];
  const right = ["derecha", "der", "adelante", "avanza", "mueve derecha", "ir derecha", "3", "tres"];
  const jump = ["salto", "salta", "saltar", "arriba", "brinca", "sube", "alto", "1", "uno"];

  const match = (list: string[]) => 
    list.some((c) => new RegExp(`(^|\\s)${c}(\\s|$)`).test(text));

  if (match(left)) return "ArrowLeft";
  if (match(right)) return "ArrowRight";
  if (match(jump)) return "ArrowUp";
  
  return null;
}

export function isSpecialVoiceCommand(transcript: string) {
  const text = normalizeVoiceText(transcript);
  if (!text) return false;

  const specials = [
    "habilidad", "especial", "poder", "super", "ataque", "magia", 
    "fuego", "trueno", "activar", "lanza", "usar", "4", "cuatro"
  ];

  return specials.some((c) => new RegExp(`(^|\\s)${c}(\\s|$)`).test(text));
}
