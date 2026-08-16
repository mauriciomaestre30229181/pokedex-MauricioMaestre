export interface PokemonResumen {
  name: string;
  url: string;
}

export interface PokemonLista {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonResumen[];
}

export interface RespuestaPokedex {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];
}

export interface RespuestaLote {
  results: Pokemon[];
}

export interface PokemonTipo {
  slot: number;
  type: { name: string; url: string };
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
}

export interface PokemonStat {
  base_stat: number;
  stat: { name: string; url: string };
}

export interface PokemonHabilidad {
  ability: { name: string; url: string };
  is_hidden: boolean;
}

export interface RespuestaTipo {
  pokemon: { pokemon: PokemonResumen }[];
}

export interface PokemonEspecie {
  id: number;
  name: string;
  evolution_chain: { url: string };
}

export interface CadenaEslabon {
  species: PokemonResumen;
  evolves_to: CadenaEslabon[];
}

export interface RespuestaCadena {
  chain: CadenaEslabon;
}

export interface Evolucion {
  id: number;
  name: string;
  sprite: string;
  esActual: boolean;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: PokemonSprites;
  types: PokemonTipo[];
  stats: PokemonStat[];
  abilities: PokemonHabilidad[];
}
