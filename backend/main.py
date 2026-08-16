from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, debug, favoritos, pokeapi


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await pokeapi.cerrar_cliente()


app = FastAPI(title="API Pokédex UJAP", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(debug.router, prefix="/api/v1")
app.include_router(favoritos.router, prefix="/api/v1")
app.include_router(pokeapi.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"api": "Pokédex UJAP", "docs": "/docs"}
