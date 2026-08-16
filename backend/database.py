"""Base de datos en memoria (Clase 4): usuarios, tokens y favoritos por cuenta."""

import hashlib
import secrets

from models import ahora

usuarios: dict[str, dict] = {}
tokens: dict[str, str] = {}
favoritos_por_usuario: dict[str, list[dict]] = {}
contador_id: dict[str, int] = {}

ITERACIONES_PBKDF2 = 100_000


def hash_password(password: str, salt: bytes) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt, ITERACIONES_PBKDF2
    ).hex()


def crear_usuario(username: str, password: str) -> dict:
    salt = secrets.token_bytes(16)
    usuarios[username] = {
        "username": username,
        "salt": salt,
        "password_hash": hash_password(password, salt),
    }
    favoritos_por_usuario[username] = []
    contador_id[username] = 0
    return usuarios[username]


def verificar_password(username: str, password: str) -> bool:
    usuario = usuarios.get(username)
    if not usuario:
        return False
    return hash_password(password, usuario["salt"]) == usuario["password_hash"]


def crear_token(username: str) -> str:
    token = secrets.token_hex(16)
    tokens[token] = username
    return token


def usuario_por_token(token: str) -> str | None:
    return tokens.get(token)


def listar_favoritos(username: str) -> list[dict]:
    return list(favoritos_por_usuario.get(username, []))


def agregar_favorito(username: str, pokemon_id: int, nombre: str) -> dict:
    favoritos = favoritos_por_usuario.setdefault(username, [])
    contador_id[username] = contador_id.get(username, 0) + 1
    favorito = {
        "id": contador_id[username],
        "pokemon_id": pokemon_id,
        "nombre": nombre,
        "created_at": ahora(),
    }
    favoritos.append(favorito)
    return favorito


def eliminar_favorito(username: str, favorito_id: int) -> bool:
    favoritos = favoritos_por_usuario.get(username, [])
    for i, favorito in enumerate(favoritos):
        if favorito["id"] == favorito_id:
            favoritos.pop(i)
            return True
    return False
