"use client";

import { useCallback, useEffect, useState } from "react";
import { eliminarFavorito, getFavoritos, guardarFavorito } from "@/lib/apiBackend";
import type { Sesion } from "@/lib/apiBackend";

function claveLocal(username: string): string {
  return `favoritos:${username}`;
}

function leerLocales(username: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(claveLocal(username));
    if (!raw) return [];
    const ids = JSON.parse(raw);
    if (!Array.isArray(ids)) return [];
    return ids.map(Number).filter((n) => Number.isInteger(n) && n > 0);
  } catch {
    return [];
  }
}

function escribirLocales(username: string, ids: number[]): void {
  try {
    window.localStorage.setItem(claveLocal(username), JSON.stringify(ids));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function useFavorites(sesion: Sesion | null) {
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [idsBackend, setIdsBackend] = useState<Record<number, number>>({});
  const [sincronizando, setSincronizando] = useState(false);
  const [errorSync, setErrorSync] = useState(false);

  useEffect(() => {
    if (!sesion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFavoritos([]);
      setIdsBackend({});
      setErrorSync(false);
      return;
    }
    let activo = true;
    setSincronizando(true);
    getFavoritos(sesion.token)
      .then((lista) => {
        if (!activo) return;
        const ids = lista.map((f) => f.pokemon_id);
        setFavoritos(ids);
        setIdsBackend(
          Object.fromEntries(lista.map((f) => [f.pokemon_id, f.id]))
        );
        escribirLocales(sesion.username, ids);
        setErrorSync(false);
      })
      .catch(() => {
        if (!activo) return;
        const locales = leerLocales(sesion.username);
        setFavoritos(locales);
        setIdsBackend({});
        setErrorSync(true);
      })
      .finally(() => {
        if (activo) setSincronizando(false);
      });
    return () => {
      activo = false;
    };
  }, [sesion]);

  const alternar = useCallback(
    (id: number, nombre: string) => {
      if (!sesion) return;
      const agregando = !favoritos.includes(id);
      const nuevos = agregando
        ? [...favoritos, id]
        : favoritos.filter((f) => f !== id);
      setFavoritos(nuevos);
      escribirLocales(sesion.username, nuevos);
      if (agregando) {
        guardarFavorito(sesion.token, id, nombre)
          .then((favorito) =>
            setIdsBackend((m) => ({ ...m, [id]: favorito.id }))
          )
          .catch(() => setErrorSync(true));
      } else {
        const backendId = idsBackend[id];
        if (backendId != null) {
          eliminarFavorito(sesion.token, backendId).catch(() =>
            setErrorSync(true)
          );
        }
      }
    },
    [sesion, favoritos, idsBackend]
  );

  const esFavorito = useCallback(
    (id: number) => favoritos.includes(id),
    [favoritos]
  );

  return {
    favoritos,
    alternar,
    esFavorito,
    sincronizando,
    errorSync,
  };
}
