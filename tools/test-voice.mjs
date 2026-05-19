import { getMovementVoiceKey, isSpecialVoiceCommand } from "../game/voiceUtils.js";

const testCases = [
  // Movimiento
  { input: "izquierda", expected: "ArrowLeft" },
  { input: "ve a la izquierda", expected: "ArrowLeft" },
  { input: "derecha", expected: "ArrowRight" },
  { input: "avanza por favor", expected: "ArrowRight" },
  { input: "salta ahora", expected: "ArrowUp" },
  { input: "brinca", expected: "ArrowUp" },
  { input: "arriba", expected: "ArrowUp" },
  { input: "retrocede", expected: "ArrowLeft" },
  { input: "sube", expected: "ArrowUp" },

  // Especiales
  { input: "usa la habilidad especial", expected: "Special" },
  { input: "lanza poder", expected: "Special" },
  { input: "fuego!", expected: "Special" },
  { input: "ataque", expected: "Special" },
  { input: "activar", expected: "Special" },

  // Negativos o ruido
  { input: "hola que tal", expected: null },
  { input: "me gusta el juego", expected: null },
  { input: "derechazo", expected: null }, // no debería matchear parcial sin espacio
];

console.log("--- INICIANDO VERIFICACIÓN DE COMANDOS DE VOZ ---");
let pass = 0;
let fail = 0;

for (const { input, expected } of testCases) {
  const moveKey = getMovementVoiceKey(input);
  const isSpecial = isSpecialVoiceCommand(input);
  
  const result = moveKey || (isSpecial ? "Special" : null);

  if (result === expected) {
    console.log(`✅ [PASS] Input: "${input}" -> Result: ${result}`);
    pass++;
  } else {
    console.error(`❌ [FAIL] Input: "${input}" -> Expected: ${expected}, but got: ${result}`);
    fail++;
  }
}

console.log("\n--- RESULTADOS ---");
console.log(`Pasadós: ${pass}`);
console.log(`Fallados: ${fail}`);

if (fail > 0) {
  process.exit(1);
} else {
  console.log("¡Todos los comandos funcionan correctamente en la lógica!");
}
