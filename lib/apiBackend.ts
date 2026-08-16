import { BACKEND_URL } from "./constants";

export interface Sesion {
  username: string;
  token: string;
}

export interface FavoritoBackend {
  id: number;
  pokemon_id: number;
  nombre: string;
  created_at: string;
}

async function pedirBackend<T>(
  url: string,
  opciones: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${url}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...opciones.headers,
    },
  });
  if (!res.ok) {
    let detalle = `HTTP ${res.status}`;
    try {
      const cuerpo = await res.json();
      if (typeof cuerpo.detail === "string") detalle = cuerpo.detail;
    } catch {
      /* sin detalle del servidor */
    }
    throw new Error(detalle);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function registrar(
  username: string,
  password: string
): Promise<Sesion> {
  return pedirBackend<Sesion>("/api/v1/auth/registro", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function iniciarSesion(
  username: string,
  password: string
): Promise<Sesion> {
  return pedirBackend<Sesion>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function getFavoritos(token: string): Promise<FavoritoBackend[]> {
  return pedirBackend<FavoritoBackend[]>("/api/v1/favoritos", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function guardarFavorito(
  token: string,
  pokemonId: number,
  nombre: string
): Promise<FavoritoBackend> {
  return pedirBackend<FavoritoBackend>("/api/v1/favoritos", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ pokemon_id: pokemonId, nombre }),
  });
}

export function eliminarFavorito(token: string, id: number): Promise<void> {
  return pedirBackend<void>(`/api/v1/favoritos/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
