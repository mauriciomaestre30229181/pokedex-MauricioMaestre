# Pokédex UJAP — Blueprint del Proyecto

Proyecto final de la clase **LPR07304** (UJAP 2026-2CR, Prof. María García). Nivel 3 en **Next.js**.

## Fuentes del proyecto

| Fuente | Rol |
|---|---|
| `Clase4_APIs_FastAPI_LPR07304.md` | Teoría de CONSTRUIR APIs (FastAPI, Pydantic, CRUD, CORS) → base del backend |
| `Clase6_Consumo_APIs_PokeAPI_LPR07304.md` | Teoría de CONSUMIR APIs (fetch, async/await, errores, PokeAPI) → base del frontend |
| `Tarea_A_Realizar.md` | Requisitos del entregable (Nivel 3 + bonus) |
| `docs/specs/` | Roadmap paso a paso (un spec por fase, 00 → 11) |
| `docs/GUIA_RAPIDA.md` | Comandos de arranque (frontend y backend), resumido |

## Stack y decisiones técnicas

- **Frontend:** Next.js (App Router) + **TypeScript** + **Tailwind CSS**
- **Datos:** PokeAPI (https://pokeapi.co — pública, sin API key). La consume **solo el backend** (proxy) por buena práctica: el navegador nunca habla con la PokeAPI directamente.
- **Backend (bonus):** FastAPI en `backend/` — API de favoritos + **proxy de la PokeAPI** conectando ambas clases
- **Idioma UI:** español
- **Git:** local, sin GitHub

## Arquitectura de carpetas

```
pokemonProyecto/
├── app/                    # Next.js App Router (páginas y layouts)
│   ├── layout.tsx
│   ├── page.tsx            # Pokédex principal (grid + búsqueda + filtros)
│   └── pokemon/[id]/       # (opcional) detalle con evoluciones
├── components/             # UI: PokeCard, Buscador, FiltroTipo, Comparador, etc.
├── hooks/                  # useFetch, useFavorites, useDebounce, useEvolutions
├── lib/                    # tipos TypeScript de PokeAPI, utilidades
├── backend/                # FastAPI (auth + favoritos por cuenta)
│   ├── main.py             # app + CORS + routers
│   ├── models.py           # modelos Pydantic
│   ├── database.py         # db en memoria
│   ├── routers/
│   │   ├── auth.py         # registro / login
│   │   ├── favoritos.py    # favoritos por usuario (Bearer token)
│   │   └── pokeapi.py      # PROXY de la PokeAPI (caché + reescritura de URLs)
│   └── requirements.txt
├── docs/specs/             # roadmap por fases
└── AGENTS.md               # este archivo
```

## Requisitos del entregable

### Nivel 2 (base)
- [x] Grid de los primeros 20 Pokémon al cargar
- [x] Filtrar por tipo (fire, water, grass...)
- [x] Comparar 2 Pokémon lado a lado
- [x] Shiny toggle (`front_shiny`)
- [x] Diseño responsive (mobile-friendly)

### Nivel 3 (avanzado)
- [x] `useState` / `useEffect` para el estado
- [x] Hook propio y reutilizable `useFetch`
- [x] Paginación (anterior/siguiente)
- [x] Favoritos con `localStorage` (por cuenta, con login — Fase 7)
- [x] Evoluciones del Pokémon
- [x] Barra de búsqueda con debounce

### Bonus
- [x] Backend FastAPI en `backend/` que guarda favoritos + frontend conectado

## Endpoints

### PokeAPI (vía proxy del backend — Fase 11)

El frontend **no** llama a `pokeapi.co` directamente: lo hace el backend en
`http://127.0.0.1:8001/api/v1/pokeapi/...`, que cachea las respuestas (24 h,
los datos no cambian) y reescribe las URLs internas para que apunten a nuestro
propio servidor. Optimización de carga: cliente `httpx` compartido (reutiliza
el handshake TLS) y endpoints de **lote** para que el grid no haga 21 peticiones.

| Endpoint (en nuestro backend) | Uso |
|---|---|
| `/api/v1/pokeapi/pokedex?limit=&offset=` | Lista + 20 detalles en UNA respuesta (grid por defecto) |
| `/api/v1/pokeapi/lote?ids=1,2,3` | Detalles resumidos por ids (filtro tipo, búsqueda, favoritos) |
| `/api/v1/pokeapi/pokemon/{name\|id}` | Datos de un Pokémon (sprites, types, stats, abilities) |
| `/api/v1/pokeapi/pokemon?limit=&offset=` | Lista paginada |
| `/api/v1/pokeapi/type/{tipo}` | Pokémon de un tipo |
| `/api/v1/pokeapi/pokemon-species/{id}` | Evoluciones (`evolution_chain`) |
| `/api/v1/pokeapi/evolution-chain/{id}` | Cadena evolutiva |

`pokedex` y `lote` devuelven solo los campos que usa la UI (`id`, `name`,
`height`, `weight`, `sprites`, `types`, `stats`, `abilities`) en vez del detalle
completo de la PokeAPI (~300 KB por Pokémon → ~15 KB). El modal y las
evoluciones usan el detalle completo vía `/pokemon/{id}`.

Campos clave del JSON: `sprites.front_default` · `sprites.front_shiny` · `types[].type.name` · `stats[].base_stat` · `abilities[].ability.name`

### FastAPI (bonus, backend/)

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/v1/auth/registro` | Crear cuenta → `{ username, token }` (409 si existe) |
| POST | `/api/v1/auth/login` | Iniciar sesión → `{ username, token }` (401 si falla) |
| GET | `/api/v1/favoritos` | Lista favoritos de la cuenta (requiere `Authorization: Bearer`) |
| POST | `/api/v1/favoritos` | Guardar favorito `{ pokemon_id, nombre }` |
| DELETE | `/api/v1/favoritos/{id}` | Quitar favorito |
| GET | `/api/v1/debug/usuarios` | **Solo desarrollo:** usuarios registrados en memoria (`{ total, usuarios }`) |

Favoritos por cuenta: la sesión vive en `sessionStorage` (se pierde al cerrar el
navegador); los favoritos se guardan en `localStorage["favoritos:{usuario}"]` y se
sincronizan con el backend.

> **DB en memoria:** `database.py` guarda usuarios, tokens y favoritos en variables de
> Python. Soporta varios usuarios a la vez, pero **todo se pierde al reiniciar el proceso**
> (p. ej. editar un `.py` con `--reload`). Para demo: no tocar archivos del backend con el
> servidor corriendo; verificar con `/api/v1/debug/usuarios`.

## Buenas prácticas (de la Clase 6)

- Verificar **siempre** `response.ok` antes de leer el JSON
- `try/catch` en todas las requests
- Mostrar estados: **loading / error / no results** (nunca pantalla en blanco)
- `Promise.all` para requests paralelas; `Promise.allSettled` para tolerancia a fallos
- API keys en variables de entorno (`.env` + `.gitignore`), **nunca hardcodear**
- PokeAPI: respeta el rate limit (~100 req/min), usa sprites oficiales

## Diseño

> **OBLIGATORIO:** antes de construir o mejorar cualquier UI, cargar la skill
> `.opencode/skills/frontend-design-direction/SKILL.md` y aplicar su dirección de diseño
> (propósito, audiencia, tono, detalle memorable, restricciones) y su checklist de revisión.

Principios base (según la skill): sin gradientes morados genéricos, sin tarjetas dentro de
tarjetas, paleta multidimensional, tipografía contextual, responsive explícito, animaciones
con propósito. La dirección concreta la fija la skill al iniciar la Fase 2 (grid).

## Roadmap por fases

| Fase | Spec | Entregable |
|---|---|---|
| 0 | `docs/specs/00-overview.md` | Visión, stack, arquitectura, diseño |
| 1 | `docs/specs/01-setup.md` | Proyecto Next.js + Tailwind + tokens de tema |
| 2 | `docs/specs/02-grid.md` | Hook `useFetch` + grid de 20 Pokémon + estados |
| 3 | `docs/specs/03-busqueda.md` | Búsqueda con debounce + detalle |
| 4 | `docs/specs/04-filtro-tipo.md` | Filtrar por tipo |
| 5 | `docs/specs/05-paginacion.md` | Paginación anterior/siguiente |
| 6 | `docs/specs/06-shiny.md` | Shiny toggle |
| 7 | `docs/specs/07-favoritos.md` | Favoritos por cuenta (login + localStorage) |
| 8 | `docs/specs/08-comparar.md` | Comparar 2 Pokémon |
| 9 | `docs/specs/09-evoluciones.md` | Evoluciones |
| 10 | `docs/specs/10-backend.md` | FastAPI favoritos + conexión |
| 11 | `docs/specs/11-polish.md` | Responsive final + proxy PokeAPI + revisión con la skill de diseño |

## Comandos

Todos los comandos de instalación/arranque están en `docs/GUIA_RAPIDA.md`.
Resumen:
- Frontend: `npm run dev` (http://localhost:3000)
- Backend: `venv/Scripts/python -m uvicorn main:app --reload --port 8001` desde `backend/` (http://localhost:8001/docs)

> **Nota:** el puerto del backend es **8001**. Si algún día levantas en 8000 y las
> rutas `/api/v1/pokeapi/...` devuelven 404, hay un proceso huérfano anterior en ese
> puerto sirviendo código viejo: reinicia el equipo para liberarlo. Actualiza también
> `BACKEND_URL` en `lib/constants.ts` y `BACKEND_PUBLIC` en `backend/routers/pokeapi.py`.

## Notas

- Mensajes del asistente: español
- Código: React con componentes funcionales y hooks, componentes en español semántico
- Trabajar una fase a la vez; verificar antes de pasar a la siguiente
