from fastapi import APIRouter, Depends, Header, HTTPException, status

import database
from models import Favorito, FavoritoIn

router = APIRouter(prefix="/favoritos", tags=["Favoritos"])


def obtener_usuario(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sesión inválida")
    username = database.usuario_por_token(authorization.split(" ", 1)[1])
    if not username:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sesión inválida")
    return username


@router.get("", response_model=list[Favorito])
def listar_favoritos(username: str = Depends(obtener_usuario)) -> list[dict]:
    return database.listar_favoritos(username)


@router.post(
    "", response_model=Favorito, status_code=status.HTTP_201_CREATED
)
def crear_favorito(
    favorito: FavoritoIn, username: str = Depends(obtener_usuario)
) -> dict:
    return database.agregar_favorito(
        username, favorito.pokemon_id, favorito.nombre.strip()
    )


@router.delete("/{favorito_id}", status_code=status.HTTP_204_NO_CONTENT)
def borrar_favorito(
    favorito_id: int, username: str = Depends(obtener_usuario)
) -> None:
    if not database.eliminar_favorito(username, favorito_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Favorito no encontrado")
