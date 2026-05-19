import { CreatureData } from "@/types/game";

/**
 * Pokémon jugables originales de la serie.
 * Para agregar más: añadir entrada al array siguiendo el mismo esquema.
 * El campo `id` debe coincidir con la clave en SPRITE_MAP (sprites.ts).
 */
export const CREATURES: CreatureData[] = [
  {
    id: "pikachu",
    name: "Pikachu",
    element: "electric",
    description:
      "El Pokémon ratón más famoso del mundo. Almacena electricidad en sus mejillas y libera rayos devastadores.",
    specialName: "Impactrueno",
    specialDescription: "Lanza un rayo eléctrico que paraliza a los enemigos.",
    stats: {
      maxHp: 70,
      speed: 8,
      jumpForce: 13,
      attack: 7,
      maxEnergy: 100,
      canDoubleJump: true,
    },
    colors: {
      primary: "#FFD700",
      secondary: "#FFB800",
      accent: "#FF6666",
    },
  },
  {
    id: "charizard",
    name: "Charizard",
    element: "fire",
    description:
      "Dragón de fuego con alas poderosas. Sus llamas alcanzan temperaturas extremas capaces de derretir rocas.",
    specialName: "Lanzallamas",
    specialDescription: "Escupe una ola de fuego que atraviesa a todos los enemigos.",
    stats: {
      maxHp: 90,
      speed: 6,
      jumpForce: 12,
      attack: 10,
      maxEnergy: 100,
      canDoubleJump: true,
    },
    colors: {
      primary: "#FF8C42",
      secondary: "#FF4500",
      accent: "#FFD700",
    },
  },
  {
    id: "bulbasaur",
    name: "Bulbasaur",
    element: "plant",
    description:
      "Lleva una semilla en su espalda que florece con el tiempo. Sus lianas pueden atrapar y dañar enemigos.",
    specialName: "Látigo Cepa",
    specialDescription: "Lanza enredaderas que atrapan y dañan a los enemigos cercanos.",
    stats: {
      maxHp: 95,
      speed: 4,
      jumpForce: 11,
      attack: 7,
      maxEnergy: 100,
      canDoubleJump: false,
    },
    colors: {
      primary: "#78C850",
      secondary: "#4A9030",
      accent: "#90EE90",
    },
  },
  {
    id: "squirtle",
    name: "Squirtle",
    element: "water",
    description:
      "Tortuga acuática de gran resistencia. Su caparazón es casi impenetrable y puede disparar chorros de agua a alta presión.",
    specialName: "Pistola Agua",
    specialDescription: "Dispara un chorro de agua potente que empuja a los enemigos.",
    stats: {
      maxHp: 120,
      speed: 4,
      jumpForce: 10,
      attack: 6,
      maxEnergy: 100,
      canDoubleJump: false,
    },
    colors: {
      primary: "#7BBBD4",
      secondary: "#4488AA",
      accent: "#AADDFF",
    },
  },
  {
    id: "mewtwo",
    name: "Mewtwo",
    element: "electric", // usando electric para psíquico
    description:
      "Pokémon genéticamente creado. Posee poderes psíquicos sin igual y puede teletransportarse en un instante.",
    specialName: "Psíquico",
    specialDescription: "Teletransporte relámpago con onda de choque que daña a todo en pantalla.",
    stats: {
      maxHp: 80,
      speed: 7,
      jumpForce: 14,
      attack: 11,
      maxEnergy: 100,
      canDoubleJump: false,
    },
    colors: {
      primary: "#9B59B6",
      secondary: "#7D3C98",
      accent: "#C39BD3",
    },
  },
  {
    id: "gengar",
    name: "Gengar",
    element: "shadow",
    description:
      "El Pokémon sombra. Se esconde en la oscuridad y atemoriza a sus rivales con su sonrisa escalofriante.",
    specialName: "Bola Sombra",
    specialDescription: "Lanza una esfera de energía oscura que atraviesa todo.",
    stats: {
      maxHp: 75,
      speed: 7,
      jumpForce: 13,
      attack: 9,
      maxEnergy: 100,
      canDoubleJump: false,
    },
    colors: {
      primary: "#7B68EE",
      secondary: "#5A44C0",
      accent: "#C580FF",
    },
  },
  {
    id: "eevee",
    name: "Eevee",
    element: "rock",
    description:
      "Pokémon de evolución múltiple. Sorprende a sus enemigos con velocidad y una melena que libera energía.",
    specialName: "Venganza",
    specialDescription: "Se lanza como un rayo hacia el enemigo más cercano con daño doble.",
    stats: {
      maxHp: 85,
      speed: 6,
      jumpForce: 12,
      attack: 8,
      maxEnergy: 100,
      canDoubleJump: true,
    },
    colors: {
      primary: "#C8956C",
      secondary: "#A87050",
      accent: "#F5DEB3",
    },
  },
];
