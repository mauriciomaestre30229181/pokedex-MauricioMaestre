"""Proxy de la PokeAPI (Clase 6).

El frontend NO consume la PokeAPI directamente: todo el tráfico de datos pasa
por nuestro backend, que actúa como intermediario (BFF). Así centralizamos el
acceso a la API externa, aplicamos caché para respetar el rate limit y podemos
esconder credenciales si algún día hicieran falta.

Optimizaciones de carga:
- Cliente httpx compartido (keep-alive): el handshake TLS se reutiliza entre
  las 20 peticiones de detalle del grid en vez de abrir 20 conexiones.
- Caché de 24 h: los datos de la PokeAPI son estáticos.
- Endpoints de lote: `pokedex` (lista + detalles en UNA respuesta) y `lote`
  (detalles por ids) para que el navegador no haga 21 peticiones.

Los sprites (imágenes) se siguen cargando directo en el navegador porque son
assets estáticos, no llamadas a la API.
"""

import asyncio
import time

import httpx
from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/pokeapi", tags=["PokeAPI (proxy)"])

POKEAPI_BASE = "https://pokeapi.co/api/v2"
BACKEND_PUBLIC = "http://127.0.0.1:8001/api/v1/pokeapi"

TIMEOUT = 15
CACHE_TTL_SEGUNDOS = 60 * 60 * 24  # 24 h: los datos de la PokeAPI no cambian

_cache: dict[str, tuple[float, dict]] = {}

_cliente = httpx.AsyncClient(timeout=httpx.Timeout(TIMEOUT))


async def cerrar_cliente():
    await _cliente.aclose()


async def _proxear(ruta: str) -> dict:
    """Pide a la PokeAPI y guarda en caché durante CACHE_TTL_SEGUNDOS."""
    url = f"{POKEAPI_BASE}/{ruta}"
    ahora = time.time()
    guardado = _cache.get(url)
    if guardado and ahora - guardado[0] < CACHE_TTL_SEGUNDOS:
        return guardado[1]

    try:
        respuesta = await _cliente.get(url)
    except httpx.HTTPError as e:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            f"No se pudo contactar con la PokeAPI: {e}",
        )

    if respuesta.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No existe en la PokeAPI")
    if respuesta.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            f"La PokeAPI respondió {respuesta.status_code}",
        )

    datos = respuesta.json()
    _cache[url] = (ahora, datos)
    return datos


def _backend_url(url: str) -> str:
    """Convierte URLs de la PokeAPI en URLs de NUESTRO backend.

    Ej.: https://pokeapi.co/api/v2/evolution-chain/11
         → http://127.0.0.1:8001/api/v1/pokeapi/evolution-chain/11
    Así el frontend nunca habla con la PokeAPI.
    """
    if url.startswith(POKEAPI_BASE + "/"):
        return f"{BACKEND_PUBLIC}{url[len(POKEAPI_BASE):]}"
    return url


def _reescribir_urls(nodo):
    """Recorre el JSON y reescribe todo campo `url` que apunte a la PokeAPI."""
    if isinstance(nodo, dict):
        for clave, valor in list(nodo.items()):
            if clave == "url" and isinstance(valor, str):
                nodo[clave] = _backend_url(valor)
            else:
                _reescribir_urls(valor)
    elif isinstance(nodo, list):
        for item in nodo:
            _reescribir_urls(item)
    return nodo


async def _detalle(id_o_nombre: int | str) -> dict:
    """Detalle completo de un Pokémon (URLs reescritas)."""
    return _reescribir_urls(await _proxear(f"pokemon/{id_o_nombre}"))


CAMPOS_RESUMEN = ("id", "name", "height", "weight", "sprites", "types", "stats", "abilities")


def _resumen(pokemon: dict) -> dict:
    """Solo lo que usa la UI (tarjeta, comparador). El detalle completo de la
    PokeAPI pesa ~300 KB por Pokémon; el grid no necesita moves ni versiones
    antiguas."""
    return {campo: pokemon[campo] for campo in CAMPOS_RESUMEN}


async def _resumen_detalle(id_o_nombre: int | str) -> dict:
    return _resumen(await _detalle(id_o_nombre))


def _id_de_url(url: str) -> str:
    """Extrae el id (o nombre) del final de una URL de la PokeAPI."""
    return url.rstrip("/").split("/")[-1]


@router.get("/pokemon")
async def listar_pokemon(limit: int = 20, offset: int = 0):
    return _reescribir_urls(await _proxear(f"pokemon?limit={limit}&offset={offset}"))


@router.get("/pokedex")
async def pokedex(limit: int = 20, offset: int = 0):
    """Lista + detalles en UNA respuesta (el grid no hace 21 peticiones)."""
    lista = await _proxear(f"pokemon?limit={limit}&offset={offset}")

    tareas = [_resumen_detalle(_id_de_url(p["url"])) for p in lista["results"]]
    detalles = await asyncio.gather(*tareas, return_exceptions=True)

    results = [d for d in detalles if not isinstance(d, BaseException)]

    return _reescribir_urls(
        {
            "count": lista["count"],
            "next": lista.get("next"),
            "previous": lista.get("previous"),
            "results": results,
        }
    )


@router.get("/lote")
async def lote(ids: str):
    """Detalles resumidos de varios Pokémon en una sola respuesta."""
    ids_limpios = [i for i in ids.split(",") if i.strip()]
    tareas = [_resumen_detalle(i.strip()) for i in ids_limpios]
    detalles = await asyncio.gather(*tareas, return_exceptions=True)

    return {"results": [d for d in detalles if not isinstance(d, BaseException)]}


@router.get("/pokemon/{nombre_o_id}")
async def detalle_pokemon(nombre_o_id: str):
    return await _detalle(nombre_o_id)


@router.get("/type/{tipo}")
async def pokemon_por_tipo(tipo: str):
    return _reescribir_urls(await _proxear(f"type/{tipo}"))


@router.get("/pokemon-species/{id}")
async def especie_pokemon(id: int):
    return _reescribir_urls(await _proxear(f"pokemon-species/{id}"))


@router.get("/evolution-chain/{id}")
async def cadena_evolutiva(id: int):
    return _reescribir_urls(await _proxear(f"evolution-chain/{id}"))
