# Fase 9 — Evoluciones del Pokémon

> Requisito Nivel 3: "Evoluciones del Pokémon".
> Status: **implementado** (14-ago-2026)

## Objetivo

Mostrar la **cadena evolutiva** de un Pokémon en su página de detalle (ej.
Charmander → Charmeleon → Charizard).

## API a usar

```
GET https://pokeapi.co/api/v2/pokemon-species/{id}
→ data.evolution_chain.url   ("https://pokeapi.co/api/v2/evolution-chain/{id}")

GET https://pokeapi.co/api/v2/evolution-chain/{id}
→ data.chain: { species: { name, url }, evolves_to: [ { species: {...}, evolves_to: [...] } ] }
```

La cadena es una **lista enlazada** (puede haber ramas y una especie puede tener
múltiples evoluciones).

## Flujo

1. Desde el detalle (con `pokemon.id` como species id), pedir `/pokemon-species/{id}`.
2. Extraer `evolution_chain.url` y pedir la cadena.
3. `aplanarCadena` recorre `evolves_to` **en profundidad** (DFS) y recolecta todas
   las especies (soporta ramas: Eevee → 8 evoluciones).
4. Con `Promise.all`, pedir `/pokemon/{name}` de cada evolución para obtener sprites.
5. Se muestran en orden con flechas (→) y la evolución **actual resaltada**.

## Hook `useEvolutions(speciesId)`

```ts
// entrada: speciesId (number | null)
// salida: { data: Evolucion[] | null, loading, error }
// Evolucion = { id, name, sprite, esActual }
```

Encapsula los 3 pasos (species → chain → detalles con `Promise.all`) con cleanup
(`activo`) y estados loading/error.

## Archivos creados/modificados

| Archivo | Responsabilidad |
|---|---|
| `lib/types.ts` | `PokemonEspecie`, `CadenaEslabon`, `RespuestaCadena`, `Evolucion` |
| `lib/pokeapi.ts` | `obtenerEspecie`, `obtenerCadenaEvolutiva`, `aplanarCadena` |
| `hooks/useEvolutions.ts` | Lógica de la cadena evolutiva |
| `components/Evoluciones.tsx` | Render con sprites, flechas y "Actual" resaltado |
| `components/PokeDetalle.tsx` | Sección "Evoluciones" (loading/error incl.) |

## Criterios de verificación (estado)

- [x] El detalle de un Pokémon muestra su cadena evolutiva completa.
- [x] Las cadenas con ramas (ej. Eevee → 9 eslabones) no se rompen.
- [x] Las imágenes cargan en paralelo (`Promise.all`, no bloquean la UI).
- [x] El Pokémon actual se distingue en la cadena (borde + etiqueta "Actual").
- [x] Estados loading/error para cuando la API falle.
