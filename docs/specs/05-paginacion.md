# Fase 5 — Paginación

> Requisito Nivel 3: "Paginación (anterior/siguiente)".
> Status: **implementado** (14-ago-2026)

## Objetivo

Navegar el catálogo con botones **Anterior / Siguiente** (20 Pokémon por página)
usando `limit` y `offset` de PokeAPI.

## API a usar

```
GET https://pokeapi.co/api/v2/pokemon?limit=20&offset={offset}
→ data.count (total de Pokémon), data.next, data.previous
```

## Archivos creados/modificados

| Archivo | Responsabilidad |
|---|---|
| `components/Paginacion.tsx` | Botones anterior/siguiente + "Página X de Y"; oculto si hay 1 página |
| `lib/pokeapi.ts` | `especiesDeTipo(resp, limite, offset)` pagina el resultado del tipo |
| `app/page.tsx` | Estados `offset` (lista) y `offsetTipo` (tipo); `useFetch` con `limit=20&offset=` |

## Flujo

1. `offset` inicial = 0; `offsetTipo` inicial = 0 (independientes).
2. `useFetch` se re-ejecuta al cambiar la URL (el hook ya depende de la URL).
3. **Siguiente:** `offset += 20`; **Anterior:** `offset -= 20`, deshabilitado en la página 1.
4. "Página N" y total estimado `ceil(count / 20)` (68 para 1351 Pokémon).
5. El tope se aplica con el `disabled` de la última página (no se sobrepasa `count`).
6. Al cambiar de página se muestra "Cargando Pokémon…" y scroll suave al tope
   (se omite el montaje inicial con un `ref`).
7. Contador con rango real: `1351 Pokémon · mostrando 1–20` (pág. 2 → `21–40`).

## Integración con fases previas

- Con filtro de tipo (Fase 4): `especiesDeTipo` pagina dentro del tipo con
  `offsetTipo` propio; al cambiar el tipo se resetea `offsetTipo` a 0.
- Con búsqueda (Fase 3): la paginación solo aparece en la vista de grid (no en detalle).
- Con favoritos (Fase 7): no se pagina (se muestran todos).

## Criterios de verificación (estado)

- [x] "Siguiente" avanza 20 Pokémon; "Anterior" regresa.
- [x] En la primera página, "Anterior" está deshabilitado.
- [x] En la última página, "Siguiente" está deshabilitado.
- [x] Al cambiar de página se muestra el estado de carga.
- [x] El scroll vuelve al tope al paginar (sin saltos confusos).
