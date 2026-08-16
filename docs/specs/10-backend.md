# Fase 10 — Backend FastAPI (auth + favoritos por cuenta) + conexión

> Bonus: "conectar con tu API FastAPI (clase 4) para guardar favoritos".
> Basado en `Clase4_APIs_FastAPI_LPR07304.md` (estructura profesional).
> Adelantado en la Fase 7 (login + favoritos por cuenta). Status: **implementado** (14-ago-2026).

## Objetivo

Crear la API FastAPI de **auth y favoritos** en `backend/` siguiendo la estructura
de la Clase 4 (main, models, database, routers) con CORS, y conectar el frontend.
Los favoritos son **por cuenta** (cada usuario tiene su propia lista).

## Estructura de `backend/`

```
backend/
├── main.py              # app FastAPI + CORS + include_router
├── models.py            # modelos Pydantic
├── database.py          # db en memoria (usuarios, tokens, favoritos por usuario)
├── routers/
│   ├── auth.py          # POST /registro, POST /login
│   └── favoritos.py     # endpoints de favoritos (Bearer token)
└── requirements.txt     # fastapi, uvicorn
```

## Endpoints

| Método | Endpoint | Body | Respuesta |
|---|---|---|---|
| POST | `/api/v1/auth/registro` | `{ username, password }` | 201 `{ username, token }` (409 si existe) |
| POST | `/api/v1/auth/login` | `{ username, password }` | 200 `{ username, token }` (401 si falla) |
| GET | `/api/v1/favoritos` | — | 200 `[{ id, pokemon_id, nombre, created_at }]` (Bearer) |
| POST | `/api/v1/favoritos` | `{ pokemon_id, nombre }` | 201 + favorito creado (Bearer) |
| DELETE | `/api/v1/favoritos/{id}` | — | 204 (o 404 si no existe) (Bearer) |

- **Auth:** passwords con `hashlib.pbkdf2_hmac` + salt; tokens `secrets.token_hex` (sin dependencias extra).
- **Favoritos por cuenta:** la dependency `obtener_usuario` lee `Authorization: Bearer <token>`
  y devuelve el username; cada cuenta tiene su propia lista en memoria.
- **db en memoria:** `database.py` con `usuarios`, `tokens`, `favoritos_por_usuario` y contador de IDs por usuario (se pierde al reiniciar el proceso).

## Código base (patrón Clase 4)

### `main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, favoritos

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

> CORS es imprescindible (Clase 6): sin él el navegador bloquea las requests
> desde localhost:3000 al backend en localhost:8000.

### `models.py`

```python
class UsuarioIn(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=4, max_length=64)

class LoginIn(BaseModel):
    username: str
    password: str

class UsuarioRespuesta(BaseModel):
    username: str
    token: str

class FavoritoIn(BaseModel):
    pokemon_id: int = Field(..., ge=1)
    nombre: str = Field(..., min_length=1)

class Favorito(FavoritoIn):
    id: int
    created_at: str
```

### `routers/favoritos.py`

CRUD con `HTTPException(404, "Favorito no encontrado")` (patrón de la Clase 4) y la
dependency `obtener_usuario` que devuelve 401 si el token es inválido o falta.

## Frontend — conexión

- Constante `BACKEND_URL = "http://127.0.0.1:8000"` en `lib/constants.ts`.
- Funciones en `lib/apiBackend.ts`: `registrar()`, `iniciarSesion()`,
  `getFavoritos()`, `guardarFavorito()`, `eliminarFavorito()` — todas con
  `response.ok` + `try/catch`.
- `hooks/useSesion.ts` (sesión en `sessionStorage`) y `hooks/useFavorites.ts`
  (favoritos por cuenta + `localStorage` + sync con backend). Detalle en `07-favoritos.md`.

## Cómo arrancar (también en `docs/GUIA_RAPIDA.md`)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows (bash: source venv/Scripts/activate)
pip install -r requirements.txt
uvicorn main:app --reload      # http://127.0.0.1:8000/docs
```

## Criterios de verificación (estado)

- [x] `uvicorn main:app --reload` levanta sin errores.
- [x] `/docs` (Swagger UI) muestra los 5 endpoints y funcionan con datos reales.
- [x] Registro 201 / 409 duplicado; login 200 / 401 contraseña mala.
- [x] POST de favorito 201; DELETE 204; GET lista solo los de esa cuenta.
- [x] Falta/mal token → 401 "Sesión inválida".
- [x] CORS desde localhost:3000 (header `access-control-allow-origin`).
- [x] Los endpoints siguen el patrón de la Clase 4 (HTTPException, response_model).
