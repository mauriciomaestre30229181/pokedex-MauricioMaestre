# Fase 6 — Shiny toggle

> Requisito Nivel 2: "Shiny toggle (`front_shiny`)".
> Status: **implementado** (14-ago-2026)

## Objetivo

Alternar entre el sprite **normal** (`sprites.front_default`) y el **shiny**
(`sprites.front_shiny`) con un botón.

## API a usar

Ninguna extra: ambos sprites vienen en `/pokemon/{name|id}`.

```
data.sprites.front_default   → sprite normal
data.sprites.front_shiny     → sprite shiny
```

## Archivos creados/modificados

| Archivo | Responsabilidad |
|---|---|
| `hooks/useShiny.ts` | Estado `boolean` compartido para la vista (`{ shiny, alternar }`) |
| `components/PokeCard.tsx` | Prop `shiny?: boolean` → sprite según estado |
| `components/PokeDetalle.tsx` | Toggle individual "Shiny"/"Normal" bajo el sprite (`useShiny` interno) |
| `app/page.tsx` | Toggle global "Shiny" en la barra del grid |

## Flujo

1. En el grid, un **toggle global** en la barra del contador (`aria-pressed`)
   cambia todas las cards (evita un estado por tarjeta).
2. En el detalle, un **botón individual** ("Shiny" ↔ "Normal") con `aria-pressed`.
3. El sprite mostrado: `shiny ? front_shiny ?? front_default : front_default ?? front_shiny`
   (fallback si falta uno de los sprites).

## Detalle

- Algunos Pokémon shiny usan el mismo sprite que el normal; no es un error.
- El estado activo se ve por el color (acento) y por `aria-pressed`, no solo por el sprite.

## Criterios de verificación (estado)

- [x] En el detalle, el botón alterna sprite normal ↔ shiny.
- [x] En el grid, el toggle global cambia todas las cards.
- [x] El sprite mostrado corresponde al estado (`front_shiny` cuando toca).
- [x] El estado es claro visualmente (color + `aria-pressed`).
