"""Rutas de desarrollo para inspeccionar el estado de la base en memoria."""

from fastapi import APIRouter

import database
from models import BaseModel

router = APIRouter(prefix="/debug", tags=["Dev"])


class UsuariosDebug(BaseModel):
    total: int
    usuarios: list[str]


@router.get("/usuarios", response_model=UsuariosDebug)
def listar_usuarios() -> UsuariosDebug:
    return UsuariosDebug(
        total=len(database.usuarios),
        usuarios=sorted(database.usuarios),
    )
