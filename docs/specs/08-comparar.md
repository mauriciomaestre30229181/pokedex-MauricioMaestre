# Fase 8 — Comparar 2 Pokémon

> Requisito Nivel 2: "Comparar 2 Pokémon lado a lado".
> Decisiones: la vista se abre **auto al elegir el 2°**; si se elige un 3° se
> **reemplaza el primero** (documentado).
> Status: **implementado** (14-ago-2026)

## Objetivo

Seleccionar **2 Pokémon** y verlos **lado a lado** con sus stats comparados.

## API a usar

Ninguna extra: detalles ya vienen de `/pokemon/{name|id}` (dos requests).

## Archivos creados/modificados

| Archivo | Responsabilidad |
|---|---|
| `components/PokeCard.tsx` | Botón "Comparar"/"✓ Seleccionado" bajo los tipos (`stopPropagation`) |
| `components/Comparador.tsx` | Vista lado a lado: sprites, tipos, altura/peso, corazón y **stats alineados fila a fila** |
| `app/page.tsx` | Estado `seleccion: Pokemon[]` (máx. 2) + vista de comparación |

## Flujo

1. Botón "Comparar" en cada `PokeCard` agrega/quita el Pokémon de `seleccion`.
2. Con 2 seleccionados se muestra `Comparador` automáticamente (prioridad:
   búsqueda > comparador > favoritos > tipo > lista).
3. Si hay 2 y se elige un 3° → **reemplaza el primero** (`[prev[1], nuevo]`).
4. Stats comparados con barras `base_stat / 255` (misma escala) en filas
   `grid-cols-[1fr_auto_1fr]`: barra A anclada a la derecha | nombre del stat | barra B.
5. "Quitar todos" limpia la selección y vuelve al grid.
6. Con 1 seleccionado, la barra del grid muestra "1 seleccionado — elige otro".

## Criterios de verificación (estado)

- [x] Se pueden elegir 2 Pokémon desde el grid (y deseleccionar tocando otra vez).
- [x] La vista de comparación muestra ambos lado a lado (2 columnas en escritorio).
- [x] Las barras de stats permiten comparar visualmente (misma escala, fila a fila).
- [x] Se puede deseleccionar y comparar otros dos.
- [x] Responsive: en móvil las 2 columnas se apilan sin romper el layout.
