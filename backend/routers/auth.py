import re

from fastapi import APIRouter, HTTPException, status

import database
from models import LoginIn, UsuarioIn, UsuarioRespuesta

router = APIRouter(prefix="/auth", tags=["Auth"])


def _validar_password(password: str) -> str | None:
    if len(password) < 6:
        return "La contraseña debe tener al menos 6 caracteres."
    if not re.search(r"[A-Za-z]", password):
        return "La contraseña debe contener al menos una letra."
    if not re.search(r"[0-9]", password):
        return "La contraseña debe contener al menos un número."
    if not re.search(r"[^A-Za-z0-9]", password):
        return "La contraseña debe contener al menos un carácter especial."
    return None


@router.post(
    "/registro",
    response_model=UsuarioRespuesta,
    status_code=status.HTTP_201_CREATED,
)
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


@router.post("/login", response_model=UsuarioRespuesta)
def iniciar_sesion(credenciales: LoginIn) -> UsuarioRespuesta:
    username = credenciales.username.strip().lower()
    if not database.verificar_password(username, credenciales.password):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "Usuario o contraseña incorrectos"
        )
    token = database.crear_token(username)
    return UsuarioRespuesta(username=username, token=token)
