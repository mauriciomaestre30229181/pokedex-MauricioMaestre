# Explicación del código — Pokédex UJAP

Proyecto final de la clase **LPR07304** (UJAP 2026-2CR). Une las dos clases más
importantes de la materia: **construir una API (Clase 4, FastAPI)** y
**consumir una API (Clase 6, PokeAPI + fetch)**.

---

## 1. Resumen del proyecto: dos apps conectadas

```
┌─────────────────────────────────────┐        ┌──────────────────────────────┐
│         FRONTEND (Next.js)          │        │   BACKEND (FastAPI, bonus)   │
│  app/ · components/ · hooks/ lib/   │        │        backend/              │
│                                     │        │                              │
│  Consume TU API (datos + favoritos) │  ◄──►  │  Registro / login            │
│  localhost:3000                     │  HTTP  │  Favoritos por usuario       │
│                                     │  JSON  │  PROXY de la PokeAPI (cache) │
└─────────────────────────────────────┘        └──────────────┬───────────────┘
                                                              │ HTTPS
                                                      ┌───────▼──────────┐
                                                      │ PokeAPI (pública) │
                                                      └──────────────────┘
```

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind. Pide los datos de
  los Pokémon y los favoritos a **tu** API (todo pasa por el backend).
- **Backend**: FastAPI. Es la API propia de la Clase 4, reutilizada como bonus
  del Nivel 3: guarda los favoritos por cuenta con login y token, y además actúa
  como **proxy** de la PokeAPI (la consume él, no el navegador), con caché y
  reescritura de URLs.
- **El ciclo completo de una app real** (lo que dice la Clase 6):

  `Frontend → fetch() → TU API → JSON → renderizar`

  (y tu API es a su vez cliente de la PokeAPI: `Backend → fetch() → PokeAPI → JSON`)

---

## 2. Backend FastAPI (Clase 4 aplicada)

Estructura:

```
backend/
├── main.py                  # app + CORS + routers
├── models.py                # modelos Pydantic (validación)
├── database.py              # "base de datos" en memoria
├── routers/
│   ├── auth.py              # registro / login
│   └── favoritos.py         # favoritos por usuario (Bearer token)
└── requirements.txt
```

### 2.1 `main.py` — el punto de entrada

```python
app = FastAPI(title="API Pokédex UJAP", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router, prefix="/api/v1")
app.include_router(favoritos.router, prefix="/api/v1")
```

- `FastAPI(...)` crea la aplicación. Por eso, sin escribir nada más, ya existe
  **Swagger interactivo en `/docs`** (documentación automática de la API).
- **CORS** (`CORSMiddleware`): el navegador bloquea las peticiones que van de un
  origen a otro (Clase 6: CORS y API keys). Como el frontend corre en
  `localhost:3000` y el backend en `8000`, sin este middleware el navegador
  rechazaría las llamadas. Aquí permitimos solo nuestro frontend.
- `include_router(..., prefix="/api/v1")`: agrupa los routers bajo una ruta
  común. El router de favoritos declara `GET/POST` en `/favoritos`, y con el
  prefijo queda `GET/POST /api/v1/favoritos`.

### 2.2 `models.py` — Pydantic (validación automática)

```python
class UsuarioIn(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=1, max_length=64)

class FavoritoIn(BaseModel):
    pokemon_id: int = Field(..., ge=1)
    nombre: str = Field(..., min_length=1)
```

- Pydantic define el **contrato** de la API (Clase 4): qué campos entran y salen.
- Si el cliente manda un JSON inválido (falta un campo, tipo incorrecto,
  `pokemon_id` menor a 1…), FastAPI responde `422` automáticamente, sin escribir
  ni una validación manual.
- `Favorito` hereda de `FavoritoIn` y agrega `id` y `created_at`: lo que la API
  devuelve al guardar.

### 2.3 `database.py` — base de datos en memoria

```python
usuarios: dict[str, dict] = {}
tokens: dict[str, str] = {}
favoritos_por_usuario: dict[str, list[dict]] = {}
```

- Como es un proyecto de clase, la "base de datos" son **diccionarios en
  memoria** (se reinicia al apagar el servidor). Simple y suficiente para el
  bonus.
- **Contraseñas**: nunca se guardan en texto plano. Se guarda el **hash PBKDF2
  con salt**:

  ```python
  def hash_password(password: str, salt: bytes) -> str:
      return hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERACIONES_PBKDF2).hex()
  ```

  El `salt` es aleatorio por usuario (`secrets.token_bytes(16)`), así dos
  usuarios con la misma contraseña tienen hashes distintos. Al hacer login se
  vuelve a calcular y se compara (`verificar_password`).
- **Tokens de sesión**: `secrets.token_hex(16)` genera un token aleatorio que se
  guarda en `tokens[token] = username`. Es lo que el frontend manda en cada
  petición de favoritos.

### 2.4 `routers/auth.py` — registro y login

```python
@router.post("/registro", response_model=UsuarioRespuesta, status_code=status.HTTP_201_CREATED)
def registrar(usuario: UsuarioIn) -> UsuarioRespuesta:
    username = usuario.username.strip().lower()
    if username in database.usuarios:
        raise HTTPException(status.HTTP_409_CONFLICT, "El usuario ya existe")
    error = _validar_password(usuario.password)
    if error:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, error)
    database.crear_usuario(username, usuario.password)
    token = database.crear_token(username)
    return UsuarioRespuesta(username=username, token=token)
```

- `POST /api/v1/auth/registro` → **201** `{username, token}`.
- **409** si el usuario ya existe (conflicto), **422** si la contraseña no
  cumple las reglas.
- `_validar_password` devuelve un mensaje en español por cada regla (largo ≥ 6,
  letra, número, carácter especial). Es una validación de negocio, distinta de
  la de tipos que hace Pydantic.
- `POST /api/v1/auth/login` → verifica con `verificar_password` y responde
  **401** si las credenciales son incorrectas; si es correcto, crea y devuelve
  un token nuevo.

### 2.5 `routers/favoritos.py` — CRUD protegido

```python
def obtener_usuario(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sesión inválida")
    username = database.usuario_por_token(authorization.split(" ", 1)[1])
    if not username:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sesión inválida")
    return username
```

- **Dependencia `Depends(obtener_usuario)`**: se ejecuta automáticamente en cada
  endpoint y "inyecta" el nombre de usuario. Si el header
  `Authorization: Bearer <token>` no existe o el token no es válido → **401**.
  Es una forma muy limpia de proteger rutas en FastAPI.
- `GET /api/v1/favoritos` → lista los favoritos de esa cuenta.
- `POST /api/v1/favoritos` → **201** con el favorito creado (`{id, pokemon_id, nombre, created_at}`).
- `DELETE /api/v1/favoritos/{id}` → **204** si se borra, **404** si no existe.

---

## 3. Frontend Next.js

### 3.1 Cómo funciona Next.js (App Router)

- **React**: los componentes renderizan lo que depende de su estado
  (`useState`) y ejecutan efectos secundarios (`useEffect`) — el requisito del
  Nivel 3.
- **App Router**: la carpeta `app/` define las rutas por el sistema de archivos.
  Este proyecto tiene una sola página:
  - `app/layout.tsx` → **layout global** (el `<html>`/`<body>`, fuentes
    Fredoka/Geist, importa los estilos). Envuelve a todas las páginas.
  - `app/page.tsx` → la página `/` (toda la app).
- **Servidor vs cliente**: los componentes por defecto se renderizan en el
  servidor (RSC). Cuando un componente usa hooks/estado o eventos, necesita
  `"use client"` al inicio del archivo. Casi todos los archivos de este proyecto
  son componentes de cliente porque la Pokédex es interactiva.

### 3.2 `app/page.tsx` — el "director" de la app

Es la pieza central. Decide **qué vista mostrar** según el estado:

| Estado | Vista |
|---|---|
| Sin sesión | `Login` |
| Buscando (`busquedaLimpia`) | resultados de búsqueda / "No se encontró" |
| 2 seleccionados para comparar | `Comparador` |
| `verFavoritos` | grid de favoritos |
| Carga/error | estados loading / error |
| Por defecto | grid paginado (con o sin filtro de tipo) |

- Usa hooks para cada responsabilidad:
  `useSesion`, `useFavorites`, `useShiny`, `useFetch` (lista paginada),
  `useDebounce` (búsqueda), `useDetallesPokemon` (detalles del grid).
- **Paginación** (Nivel 3): se hace con `offset` y `limit`. Cambiar `offset`
  cambia la URL y `useFetch` vuelve a pedir (a nuestro backend):
  `http://127.0.0.1:8001/api/v1/pokeapi/pokemon?limit=20&offset=40`.
- **Búsqueda con debounce**: el input escribe en `consulta`, pero se usa
  `useDebounce(consulta, 400)`; la petición real se hace 400ms después de dejar
  de escribir (evita llamar a la API por cada tecla).
- **Modal de detalle**: al tocar una tarjeta se abre `PokeModal`, que navega
  entre evoluciones recargando el detalle.

### 3.3 Hooks propios (requisito Nivel 3)

**`useFetch` — el hook genérico reutilizable** (`hooks/useFetch.ts`):

```typescript
export function useFetch<T>(url: string | null): ResultadoFetch<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);   // Clase 6
      setData((await res.json()) as T);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");  // try/catch
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { cargar(); }, [cargar]);

  return { data, loading, error, reload: cargar };
}
```

Aplica las buenas prácticas de la **Clase 6**:
- verifica **siempre** `response.ok` antes de leer el JSON,
- **try/catch** en la petición,
- devuelve los tres estados que la UI necesita: **loading / error / data**
  (nunca pantalla en blanco).

Se usa con cualquier tipo (`useFetch<Pokemon>`, `useFetch<PokemonLista>`…).

**`useFavorites`** (`hooks/useFavorites.ts`): sincroniza favoritos entre
`localStorage["favoritos:{usuario}"]` (Nivel 3) y el backend (bonus). Si el
backend no responde, usa lo guardado localmente y marca `errorSync`.

**`useDebounce`** (`hooks/useDebounce.ts`): retrasa un valor (búsqueda).

**`useEvolutions`** (`hooks/useEvolutions.ts`): carga la **cadena evolutiva**
(Nivel 3) encadenando tres peticiones:
1. `pokemon-species/{id}` → da la URL de la cadena,
2. la cadena → `aplanarCadena` la convierte en lista de especies,
3. `Promise.all(...)` pide los detalles de todas las evoluciones **en paralelo**
   (Clase 6: requests paralelas).

**`useShiny`** y **`useSesion`**: toggles de estado (shiny) y la sesión
(username + token) que vive en `sessionStorage`.

### 3.4 `lib/pokeapi.ts` — consumir TU API (proxy de la PokeAPI, Clase 6)

> El frontend **no** llama a `pokeapi.co`: `BASE_URL` apunta a nuestro backend
> (`http://127.0.0.1:8001/api/v1/pokeapi`), que hace de **proxy**: pide a la
> PokeAPI, cachea la respuesta 60 s y reescribe las URLs internas para que
> apunten a nuestro servidor. Así el navegador nunca habla con la API externa.

- `pedirJson<T>` centraliza el patrón **fetch → response.ok → json**.
- `obtenerLista(offset, limite)` → `/pokemon?limit=&offset=` (paginación).
- `obtenerDetalles(urls)` → `Promise.all(urls.map(pedirJson))`: pide los
  detalles de los 20 de la página **en paralelo**, no uno por uno.
- `obtenerTodosLosNombres()` → cachea la lista completa de nombres (una sola
  petición de 10000) para el buscador.
- `filtrarPorPrefijo` / `especiesDeTipo` / `aplanarCadena` → transforman los
  datos de la API en lo que necesita la UI.

### 3.5 `lib/apiBackend.ts` — el cliente de TU API (favoritos)

- Función `pedirBackend` que agrega el header `Content-Type` y los headers
  extra (el token), verifica `res.ok` y extrae `detail` del error (los mensajes
  en español del backend).
- Exporta `registrar`, `iniciarSesion`, `getFavoritos`, `guardarFavorito`,
  `eliminarFavorito` → exactamente los endpoints de FastAPI.

### 3.6 Tipos y configuración

- `lib/types.ts`: interfaces TypeScript de la PokeAPI (`Pokemon`, `PokemonLista`,
  `PokemonEspecie`, `RespuestaTipo`…). TypeScript da seguridad: si la API cambia
  de forma, el compilador lo avisa.
- `lib/constants.ts`:
  `BACKEND_URL = "http://127.0.0.1:8001"`,
  `BASE_URL = BACKEND_URL + "/api/v1/pokeapi"`,
  `LIMITE_POR_PAGINA = 20`, `MAX_COINCIDENCIAS = 12`.

### 3.7 Diseño

- **Tokens CSS** en `app/globals.css` (`--bg`, `--surface`, `--texto`,
  `--acento`, `--rojo`, `--azul`, `--tinta`, `--pantalla`).
- Estilo **retro píxel 8-bit**: clases `.borde-pixel`, `.tecla-pixel`,
  `.recorte-pixel-peq`, `.scanline`, `.imagen-pixel`, pokebola SVG pixelada.
- Accesibilidad: `aria-label`, `aria-pressed`, focus visible ámbar y
  `prefers-reduced-motion` que apaga las animaciones.

---

## 4. Mapa Clase ↔ Código

| Aprendizaje | Dónde está aplicado |
|---|---|
| **Clase 4 — Construir API**: FastAPI, Pydantic, CRUD, CORS | `backend/` completo: `main.py` (CORS, routers), `models.py` (Pydantic), `routers/auth.py` y `routers/favoritos.py` (CRUD) |
| **Clase 4 — Swagger** | `/docs` en `http://localhost:8001/docs` (generado por FastAPI) |
| **Clase 6 — fetch + async/await** | `lib/pokeapi.ts`, `lib/apiBackend.ts`, `backend/routers/pokeapi.py`, `hooks/useFetch.ts` |
| **Clase 6 — verificar `response.ok`** | `pedirJson` y `pedirBackend`, `useFetch` |
| **Clase 6 — try/catch** | `useFetch`, `useEvolutions`, `useFavorites`, `Login` |
| **Clase 6 — Promise.all (paralelo)** | `obtenerDetalles` y `useEvolutions` |
| **Clase 6 — CORS y seguridad** | `allow_origins` del backend; tokens Bearer en favoritos |
| **Nivel 2** | Grid 20, filtro por tipo, comparar 2, shiny toggle, responsive |
| **Nivel 3** | `useState`/`useEffect`, hook `useFetch`, paginación, favoritos `localStorage`, evoluciones, búsqueda con debounce |
| **Bonus** | FastAPI de favoritos + frontend conectado (`useFavorites` + `apiBackend`) + **proxy de la PokeAPI** |

---

## 5. Flujo de datos (ejemplo: abrir la app y marcar un favorito)

```
1. El usuario hace login → POST /api/v1/auth/login → {username, token}
2. La app guarda la sesión en sessionStorage.
3. El grid carga: GET /api/v1/pokeapi/pokemon?limit=20&offset=0
   (el backend pide a la PokeAPI, cachea y reescribe las URLs)
   → luego Promise.all de 20 URLs de detalle → sprites y datos.
4. El usuario toca la ★ → useFavorites:
   a) guarda el id en localStorage["favoritos:ash"]
   b) POST /api/v1/favoritos  (header Authorization: Bearer <token>)
      → el backend lo guarda en memoria y devuelve {id, pokemon_id, ...}.
5. Abrir "★ Favoritos" → GET /api/v1/favoritos → el backend devuelve la lista.
```

---

## 6. Cómo correr el proyecto

Frontend (puerto 3000):

```bash
npm run dev
```

Backend (puerto 8001) desde `backend/`:

```bash
venv/Scripts/python -m uvicorn main:app --reload --port 8001
```

Documentación Swagger del backend: `http://localhost:8001/docs`
