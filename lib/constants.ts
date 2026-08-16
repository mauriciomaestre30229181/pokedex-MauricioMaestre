export const BACKEND_URL = "http://127.0.0.1:8001";

// La PokeAPI se consume SOLO a través de nuestro backend (proxy en /api/v1/pokeapi).
export const BASE_URL = `${BACKEND_URL}/api/v1/pokeapi`;

export const LIMITE_POR_PAGINA = 20;

export const MAX_COINCIDENCIAS = 12;

export const ESTADISTICAS_ES: Record<string, string> = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "At. Esp.",
  "special-defense": "Def. Esp.",
  speed: "Velocidad",
};
