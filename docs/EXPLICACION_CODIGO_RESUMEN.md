# Pokédex UJAP — Resumen para presentar

Versión corta de `EXPLICACION_CODIGO.md`, pensada para presentar el proyecto en
clase. Incluye el guion minuto a minuto al final.

---

## 1. Qué es (en una frase)

Una **Pokédex web** que une las dos clases más importantes del curso: la **Clase 4**
(construir una API con FastAPI) y la **Clase 6** (consumir una API con `fetch`).

## 2. Arquitectura

```
Frontend (Next.js, puerto 3000)
   └── consume TU API (FastAPI, puerto 8001)  → login + favoritos + PROXY PokeAPI
                │
                └── consume la PokeAPI (pública) → sprites, tipos, stats, evoluciones
```

- **Frontend**: Next.js + TypeScript + Tailwind. Nivel 3 completo.
- **Backend (bonus)**: FastAPI propia con registro/login y favoritos protegidos
  por token. Además hace de **proxy de la PokeAPI**: la consume él (el navegador
  nunca habla con la API externa), con caché y reescritura de URLs. Conecta las
  dos clases.
- `El ciclo completo: Frontend → fetch() → TU API → JSON → renderizar`
  `(y tu API → fetch() → PokeAPI → JSON)`

## 3. Backend FastAPI (Clase 4) — resumen

| Archivo | Qué hace |
|---|---|
| `main.py` | Crea la app, agrega **CORS** (permite `localhost:3000`) y monta los routers bajo `/api/v1` |
| `models.py` | Modelos **Pydantic**: validación automática de lo que entra y sale |
| `database.py` | "Base de datos" en memoria; contraseñas con **hash PBKDF2 + salt**; tokens aleatorios |
| `routers/auth.py` | `POST /registro` (201/409/422) y `POST /login` (401) → `{username, token}` |
| `routers/favoritos.py` | `GET/POST /favoritos` y `DELETE /favoritos/{id}`, protegidos por `Authorization: Bearer <token>` |
| `routers/pokeapi.py` | **Proxy de la PokeAPI**: pide los datos, cachea 60 s y reescribe las URLs a nuestro servidor |

Ideas clave para explicar:
- **CORS**: sin él, el navegador bloquea al frontend porque son orígenes distintos.
- **Pydantic**: el contrato de la API; si el JSON no cumple, responde `422` solo.
- **Nunca guardamos la contraseña**: solo su hash con salt (seguridad).
- **Token**: es lo que demuestra "quién eres" en cada petición de favoritos.
- **Swagger en `/docs`**: la documentación la genera FastAPI automáticamente.
- **Proxy**: buena práctica de la Clase 6 — las APIs externas no se consumen desde
  el navegador, sino desde el backend (cachea, centraliza y evita problemas de CORS).

## 4. Frontend Next.js — resumen

- **Cómo funciona Next**: el App Router usa archivos (`app/layout.tsx` y
  `app/page.tsx`) y los componentes con `"use client"` pueden usar hooks y estado.
- **`page.tsx`** decide la vista según el estado: login → grid → búsqueda →
  comparador → favoritos.
- **Hooks propios (Nivel 3)**:
  - `useFetch` → reutilizable, devuelve `{data, loading, error, reload}`. Verifica
    `response.ok` y usa `try/catch` (prácticas de la Clase 6).
  - `useDebounce` → la búsqueda espera 400ms antes de pedir a la API.
  - `useEvolutions` → cadena evolutiva con `Promise.all` (peticiones paralelas).
  - `useFavorites` → favoritos en `localStorage` + sincronización con el backend.
- **`lib/pokeapi.ts`**: consume TU API (el proxy de la PokeAPI en
  `http://127.0.0.1:8001/api/v1/pokeapi`): paginación con `offset/limit`, filtro
  por tipo, sprites, evoluciones.
- **`lib/apiBackend.ts`**: el cliente de tu API (registro, login, favoritos).

## 5. Cobertura de los requisitos

| Nivel 2 | Nivel 3 | Bonus |
|---|---|---|
| Grid de 20 | `useState`/`useEffect` | API FastAPI de favoritos |
| Filtrar por tipo | Hook `useFetch` | Frontend conectado |
| Comparar 2 | Paginación | Login + token |
| Shiny toggle | Favoritos `localStorage` | |
| Responsive | Evoluciones | |
| | Búsqueda con debounce | |

---

## 6. Guion de presentación (~5 minutos)

> Prepara antes: frontend corriendo en `localhost:3000` y backend en
> `localhost:8001` (que se vea en una pestaña `/docs`).

### Min 0:00 — Qué hice (30s)
"Para el proyecto final elegí el Nivel 3 con bonus: una Pokédex en Next.js que
consume la PokeAPI, y además conecté mi API de FastAPI de la Clase 4 para
guardar favoritos por usuario. Básicamente uní las dos clases del curso."

### Min 0:30 — Frontend en vivo (2 min)
"Abro la app. Me pide login — los favoritos son por cuenta."
- Hago **registro** rápido (ej. `ash` / `pikachu1!`).
- Muestro el **grid**: "Al cargar trae los primeros 20. Cada tarjeta usa el hook
  `useFetch`, que verifica `response.ok` y maneja loading y error, como vimos en
  la Clase 6."
- **Búsqueda**: escribo "pika" y "noto que espera un momento antes de buscar —
  es el debounce, para no llamar a la API en cada tecla."
- **Shiny toggle** y **comparar** dos Pokémon: "Selecciono dos y los compara lado
  a lado."
- **Modal**: "Toco una tarjeta y abre el detalle con sus evoluciones; usa
  `Promise.all` para pedirlas en paralelo, como en la Clase 6."
- **Favorito**: "Marco la estrella. Se guarda local y se envía a mi backend."

### Min 2:30 — Backend en vivo (1.5 min)
"Cambio a mi API en el puerto 8001. Este Swagger lo generó FastAPI solo."
- Muestro `POST /api/v1/auth/registro`: "El modelo Pydantic valida los datos; si
  la contraseña es débil responde 422 con un mensaje en español."
- Muestro `GET /api/v1/favoritos`: "Necesita el header `Authorization: Bearer
  <token>` — si no lo mando, 401. Por eso los favoritos son por cuenta."
- Muestro el endpoint `GET /api/v1/pokeapi/pokemon/25`: "Esto es el proxy: mi
  backend pide el dato a la PokeAPI, lo cachea y se lo manda al frontend. El
  navegador nunca habla con la API externa — buena práctica de la Clase 6."
- Muestro el código de `database.py` en una línea: "Y las contraseñas no se
  guardan en texto plano, solo su hash con salt."

### Min 4:00 — Cierre (30s)
"En resumen: aprendí a construir una API (Clase 4) y a consumir otra (Clase 6), y
en este proyecto las dos conviven: Next.js consume mi FastAPI, que a su vez es
cliente de la PokeAPI y guarda los favoritos. Ese es el ciclo completo de una app
real."

### Min 4:30 — Preguntas
Deja abierta la app y el `/docs` para responder dudas.
