# GUÍA RÁPIDA — Pokédex UJAP

> Documentación resumida con lo importante para arrancar el proyecto.
> Detalle de cada fase en `docs/specs/`. Blueprint en `AGENTS.md`.

## Requisitos previos

- **Node.js** v18+ (visto: v24) y npm
- **Python** 3.10+ (visto: 3.14)
- Git (opcional, local)

## Frontend (Next.js + TypeScript + Tailwind)

### Instalación inicial (una vez)

```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*"
```

> Si la carpeta ya tiene archivos (teoría, docs), create-next-app los conserva si no chocan.

### Arrancar en desarrollo

```bash
npm run dev          # → http://localhost:3000
```

### Otros comandos útiles

```bash
npm run build        # build de producción
npm run lint         # eslint
npm start            # servir el build (tras npm run build)
```

## Backend (FastAPI — favoritos + proxy PokeAPI, bonus)

### Crear y activar el venv (una vez)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows (PowerShell/CMD)
source venv/Scripts/activate # Windows con Git Bash
```

### Instalar dependencias

```bash
pip install -r requirements.txt   # o: pip install fastapi uvicorn httpx
```

### Arrancar el servidor

```bash
uvicorn main:app --reload --port 8001    # desde la carpeta backend/ (con venv activo)
```

- API: http://127.0.0.1:8001
- **Swagger UI:** http://127.0.0.1:8001/docs (documentación interactiva)
- ReDoc: http://127.0.0.1:8001/redoc

> `--reload` reinicia el servidor solo al guardar cambios.
> El frontend (localhost:3000) y el backend (127.0.0.1:8001) deben correr a la vez
> para el login y los favoritos por cuenta. El backend ya incluye CORS para localhost:3000.

### Endpoints del backend

| Método | Endpoint | Uso |
|---|---|---|
| POST | `/api/v1/auth/registro` | Crear cuenta `{ username, password }` → `{ username, token }` |
| POST | `/api/v1/auth/login` | Iniciar sesión → `{ username, token }` |
| GET | `/api/v1/favoritos` | Listar favoritos (Bearer token) |
| POST | `/api/v1/favoritos` | Guardar `{ pokemon_id, nombre }` (Bearer token) |
| DELETE | `/api/v1/favoritos/{id}` | Quitar favorito (Bearer token) |
| GET | `/api/v1/debug/usuarios` | **Solo desarrollo:** lista usuarios registrados en memoria |
| GET | `/api/v1/pokeapi/pokedex?limit=&offset=` | Lista + 20 detalles en 1 respuesta (proxy PokeAPI) |
| GET | `/api/v1/pokeapi/lote?ids=1,2,3` | Detalles resumidos por ids (proxy PokeAPI) |
| GET | `/api/v1/pokeapi/pokemon?limit=&offset=` | Lista paginada (proxy PokeAPI) |
| GET | `/api/v1/pokeapi/pokemon/{name\|id}` | Datos de un Pokémon (proxy PokeAPI) |
| GET | `/api/v1/pokeapi/type/{tipo}` | Pokémon de un tipo (proxy PokeAPI) |
| GET | `/api/v1/pokeapi/pokemon-species/{id}` | Especie / evoluciones (proxy PokeAPI) |
| GET | `/api/v1/pokeapi/evolution-chain/{id}` | Cadena evolutiva (proxy PokeAPI) |

> Favoritos por cuenta: la sesión se guarda en `sessionStorage` (se pierde al cerrar el
> navegador) y los favoritos en `localStorage["favoritos:{usuario}"]`, sincronizados con
> el backend. Si el backend está apagado, los cambios se guardan igual en local.
>
> **IMPORTANTE — DB en memoria:** los usuarios, tokens y favoritos del backend se guardan
> **solo en memoria** (`backend/database.py`) y se pierden al reiniciar el proceso
> (por ejemplo, al editar un `.py` con `--reload`). No toques archivos del backend durante
> una demo o se borrarán las cuentas. El endpoint `/api/v1/debug/usuarios` te deja
> comprobar cuántos usuarios están vivos en el proceso actual.

## PokeAPI (cheat sheet)

> La PokeAPI **solo se consume desde el backend** (`/api/v1/pokeapi/...`), nunca desde el
> navegador. Las rutas de la PokeAPI se reescriben a nuestro servidor automáticamente.

| Endpoint (PokeAPI original) | Uso |
|---|---|
| `/pokemon/{name\|id}` | Datos de un Pokémon |
| `/pokemon?limit=20&offset=0` | Lista paginada |
| `/type/{tipo}` | Pokémon de un tipo |
| `/pokemon-species/{id}` | Evoluciones (`evolution_chain`) |

Campos clave: `sprites.front_default` · `sprites.front_shiny` · `types[].type.name` · `stats[].base_stat` · `abilities[].ability.name`

## Orden de trabajo (fases)

| Fase | Spec | Verificación mínima |
|---|---|---|
| 0 | `docs/specs/00-overview.md` | Leer visión y diseño |
| 1 | `01-setup.md` | `npm run dev` muestra "Pokédex UJAP" |
| 2 | `02-grid.md` | 20 Pokémon al cargar |
| 3 | `03-busqueda.md` | "pikachu" muestra detalle |
| 4 | `04-filtro-tipo.md` | "fire" filtra el grid |
| 5 | `05-paginacion.md` | Anterior/siguiente funcionan |
| 6 | `06-shiny.md` | Toggle normal ↔ shiny |
| 7 | `07-favoritos.md` | Favoritos por cuenta (login + localStorage) |
| 8 | `08-comparar.md` | 2 Pokémon lado a lado |
| 9 | `09-evoluciones.md` | Cadena evolutiva en el detalle |
| 10 | `10-backend.md` | `/docs` + favoritos conectados |
| 11 | `11-polish.md` | Responsive + checklist de diseño |

## Reglas de oro (Clase 6)

- Verificar `response.ok` antes de leer JSON · `try/catch` siempre.
- Mostrar loading / error / no results (nunca pantalla en blanco).
- `Promise.all` para requests en paralelo; `allSettled` para tolerar fallos.
- API keys solo en `.env` (nunca hardcodear; `.env` en `.gitignore`).

## Estructura del proyecto

```
pokemonProyecto/
├── app/            # Next.js App Router (page.tsx, layout.tsx)
├── components/     # PokeCard, Buscador, FiltroTipo, Comparador...
├── hooks/          # useFetch, useDebounce, useFavorites, useEvolutions
├── lib/            # tipos TS, constantes, apiFavoritos
├── backend/        # FastAPI (main.py, models.py, database.py, routers/)
├── docs/
│   ├── specs/      # roadmap por fases (00 → 11)
│   └── GUIA_RAPIDA.md
├── .opencode/      # skills del proyecto (frontend-design-direction, pokedex)
└── AGENTS.md
```
