# Fase 4 — Filtrar por tipo

> Requisito Nivel 2: "Filtrar por tipo (fire, water, grass...)".
> Status: **implementado** (13-ago-2026)

## Objetivo

Permitir filtrar el grid por **tipo de Pokémon** (fire, water, grass…) mediante un
selector. El filtro convive con la búsqueda (se oculta cuando hay búsqueda activa) y
con la paginación futura (Fase 5).

## API a usar

```
GET https://pokeapi.co/api/v2/type/{tipo}
→ data.pokemon: [{ pokemon: { name, url } }]
```

**Comportamiento elegido:** `/type/{tipo}` devuelve ~100+ entradas (incluye variantes
con `-`). Se filtran las **especies base** (sin `-`) y se muestran las **primeras 20**
(`especiesDeTipo`), junto a un contador "N Pokémon de tipo «fire» · mostrando 20".
No se piden detalles de los demás.

## Lista de tipos a ofrecer

Los 18 tipos oficiales (en `lib/tipos.ts`, con su color de la paleta multidimensional):

```
normal  fire  water  electric  grass  ice  fighting  poison  ground
flying  psychic  bug  rock  ghost  dragon  dark  steel  fairy
```

## Archivos creados/modificados

| Archivo | Responsabilidad |
|---|---|
| `components/FiltroTipo.tsx` | Pills de color: "Todos" + 18 tipos con `COLORES_TIPOS`, `aria-pressed` |
| `hooks/useDetallesPokemon.ts` | Refactor: carga de detalles (`Promise.all`) compartida entre lista y tipo |
| `lib/types.ts` | `RespuestaTipo` |
| `lib/pokeapi.ts` | `obtenerPorTipo(tipo)` + `especiesDeTipo(resp, limite)` |
| `app/page.tsx` | Estado `tipo`; si está activo, `useFetch` de `/type/{tipo}` y grid desde `useDetallesPokemon` |
| `docs/specs/04-filtro-tipo.md` | Este spec |

> Nota: `lib/tipos.ts` ya existía desde la Fase 2 con `NOMBRE_TIPOS` y `COLORES_TIPOS`.

## Flujo

1. Pills de tipos arriba del grid, con "Todos" por defecto.
2. Al elegir un tipo se actualiza la fuente de datos:
   - `tipo = null` → lista paginada `/pokemon?limit=20&offset=0`.
   - `tipo = "fire"` → `/type/fire` → `especiesDeTipo(resp, 20)` → detalles con `Promise.all`.
3. `useDetallesPokemon` reutiliza el patrón de la Fase 2 (estados loading/error).
4. Estados loading/error/no-results igual que el grid:
   - Error en tipo → botón **Quitar filtro**.
   - Sin especies → "No se encontraron Pokémon de tipo «X»".
5. La búsqueda activa **oculta** las pills (el detalle/mini-grid de búsqueda tiene prioridad).

## Criterios de verificación (estado)

- [x] Seleccionar "fire" muestra solo Pokémon de fuego.
- [x] Volver a "Todos" restaura el grid normal.
- [x] Los badges de tipo en las tarjetas usan colores por tipo (de la Fase 2).
- [x] Si un tipo no tiene resultados, se muestra "no results".
- [x] Convive con la paginación (se integra en la Fase 5).
