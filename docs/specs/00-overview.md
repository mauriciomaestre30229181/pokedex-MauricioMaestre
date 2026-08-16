# Fase 0 — Visión general del proyecto

> Espec base. Antes de leer este spec, revisar `AGENTS.md`. Trabajar una fase a la vez.

## Objetivo

Construir una **Pokédex personalizada** (proyecto final LPR07304, Nivel 3) que consume la
**PokeAPI** y opcionalmente guarda favoritos en una **API FastAPI propia** (Clase 4).
Conecta la teoría de "construir APIs" (Clase 4) y "consumir APIs" (Clase 6).

## Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Datos | PokeAPI (pública, sin API key, ~100 req/min) |
| Backend (bonus) | FastAPI + Pydantic + Uvicorn, db en memoria |
| Idiomas | UI en español · código con hooks y componentes funcionales |
| Git | Local, sin GitHub |

## Arquitectura

```
pokemonProyecto/
├── app/                  # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx          # Pokédex principal (grid + búsqueda + filtros)
│   └── pokemon/[id]/     # detalle con evoluciones
├── components/           # PokeCard, Buscador, FiltroTipo, Comparador...
├── hooks/                # useFetch, useDebounce, useFavorites, useEvolutions
├── lib/                  # tipos TS de PokeAPI, constantes, utilidades
├── backend/              # FastAPI favoritos (main, models, database, routers)
├── docs/specs/           # este roadmap
├── AGENTS.md             # blueprint
└── docs/GUIA_RAPIDA.md   # comandos
```

## Fuentes teóricas

- **Clase 4** (`Clase4_APIs_FastAPI_LPR07304.md`): HTTP/REST, Pydantic, CRUD,
  params (path/query/body/header), estructura profesional, CORS, env vars.
- **Clase 6** (`Clase6_Consumo_APIs_PokeAPI_LPR07304.md`): fetch + async/await,
  `response.ok` + `try/catch`, estados loading/error, `Promise.all`, endpoints PokeAPI.
- **Tarea** (`Tarea_A_Realizar.md`): requisitos del Nivel 3 y bonus.

## Diseño (OBLIGATORIO antes de cualquier UI)

Cargar la skill `.opencode/skills/frontend-design-direction/SKILL.md` y definir:

1. **Propósito:** herramienta de consulta rápida de Pokémon (buscar, comparar, seguir).
2. **Audiencia:** fans/estudiantes que escanean una cuadrícula y comparan datos.
3. **Tono:** playful pero limpio (dominio de juego, no marketing).
4. **Detalle memorable:** UNA idea fuerte (ej. color por tipo de Pokémon, sprites protagonistas).
5. **Restricciones:** responsive explícito, sin gradientes morados genéricos, sin tarjetas
   dentro de tarjetas, paleta multidimensional, textos en español que no se desborden.

Aplicar también el **Review Checklist** de la skill al final de cada fase de UI.

## Fases (resumen)

| Fase | Entregable | Verificación mínima |
|---|---|---|
| 1 | Proyecto Next.js + tema | `npm run dev` muestra la página base |
| 2 | Grid 20 + `useFetch` | 20 Pokémon con imagen/nombre/tipo al cargar |
| 3 | Búsqueda con debounce | Escribir "pikachu" muestra su card/detalle |
| 4 | Filtro por tipo | Seleccionar "fire" filtra el grid |
| 5 | Paginación | Botones anterior/siguiente funcionan |
| 6 | Shiny toggle | Botón cambia sprite normal↔shiny |
| 7 | Favoritos | Persisten tras recargar (localStorage) |
| 8 | Comparador | 2 Pokémon lado a lado |
| 9 | Evoluciones | Detalle muestra la cadena evolutiva |
| 10 | Backend FastAPI | `/docs` con favoritos funcionales y conectados |
| 11 | Polish final | Responsive + checklist de la skill |

## Criterios transversales (en todas las fases)

- Estados **loading / error / no results** siempre visibles.
- `response.ok` verificado antes de `response.json()`.
- `try/catch` en toda request.
- `Promise.all` para requests paralelas (detalles del grid, evoluciones).
- Componentes en español semántico (`PokeCard`, `Buscador`, `FiltroTipo`).
