from datetime import datetime, timezone

from pydantic import BaseModel, Field


class UsuarioIn(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=1, max_length=64)


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


def ahora() -> str:
    return datetime.now(timezone.utc).isoformat()
