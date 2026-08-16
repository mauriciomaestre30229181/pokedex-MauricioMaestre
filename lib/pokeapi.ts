import { BASE_URL, MAX_COINCIDENCIAS } from "./constants";
import type {
  CadenaEslabon,
  Pokemon,
  PokemonEspecie,
  PokemonLista,
  PokemonResumen,
  RespuestaCadena,
  RespuestaPokedex,
  RespuestaLote,
  RespuestaTipo,
} from "./types";

async function pedirJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function obtenerLista(
  offset = 0,
  limite = 20
): Promise<PokemonLista> {
  return pedirJson<PokemonLista>(
    `${BASE_URL}/pokemon?limit=${limite}&offset=${offset}`
  );
}

export async function obtenerPokedex(
  offset = 0,
  limite = 20
): Promise<RespuestaPokedex> {
  return pedirJson<RespuestaPokedex>(
    `${BASE_URL}/pokedex?limit=${limite}&offset=${offset}`
  );
}

export async function obtenerDetalles(urls: string[]): Promise<Pokemon[]> {
  const ids = urls
    .map((url) => url.replace(/\/$/, "").split("/").pop())
    .filter(Boolean)
    .join(",");
  if (!ids) return [];
  const respuesta = await pedirJson<RespuestaLote>(`${BASE_URL}/lote?ids=${ids}`);
  return respuesta.results;
}

let cacheNombres: Promise<PokemonLista> | null = null;

export function obtenerTodosLosNombres(): Promise<PokemonLista> {
  if (!cacheNombres) {
    cacheNombres = obtenerLista(0, 10000);
  }
  return cacheNombres;
}

export function filtrarPorPrefijo(
  lista: PokemonLista | null,
  consulta: string
): PokemonResumen[] {
  if (!lista) return [];
  const q = consulta.trim().toLowerCase();
  if (!q) return [];
  return lista.results
    .filter((p) => p.name.startsWith(q) && !p.name.includes("-"))
    .slice(0, MAX_COINCIDENCIAS);
}

export async function obtenerPorTipo(tipo: string): Promise<RespuestaTipo> {
  return pedirJson<RespuestaTipo>(`${BASE_URL}/type/${tipo.trim().toLowerCase()}`);
}

export function especiesDeTipo(
  respuesta: RespuestaTipo | null,
  limite: number,
  offset = 0
): PokemonResumen[] {
  if (!respuesta) return [];
  return respuesta.pokemon
    .map((e) => e.pokemon)
    .filter((p) => !p.name.includes("-"))
    .slice(offset, offset + limite);
}

export async function obtenerEspecie(id: number): Promise<PokemonEspecie> {
  return pedirJson<PokemonEspecie>(`${BASE_URL}/pokemon-species/${id}`);
}

export async function obtenerCadenaEvolutiva(url: string): Promise<RespuestaCadena> {
  return pedirJson<RespuestaCadena>(url);
}

export function aplanarCadena(eslabon: CadenaEslabon): PokemonResumen[] {
  const resultado: PokemonResumen[] = [eslabon.species];
  for (const hijo of eslabon.evolves_to) {
    resultado.push(...aplanarCadena(hijo));
  }
  return resultado;
}
