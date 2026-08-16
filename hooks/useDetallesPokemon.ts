"use client";

import { useEffect, useState } from "react";
import { obtenerDetalles } from "@/lib/pokeapi";
import type { Pokemon } from "@/lib/types";

export interface ResultadoDetalles {
  pokemones: Pokemon[];
  cargando: boolean;
  error: string | null;
}

export function useDetallesPokemon(urls: string[]): ResultadoDetalles {
  const [pokemones, setPokemones] = useState<Pokemon[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (urls.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPokemones([]);
      return;
    }
    let activo = true;
    setCargando(true);
    setError(null);
    obtenerDetalles(urls)
      .then((detalles) => {
        if (activo) setPokemones(detalles);
      })
      .catch(() => {
        if (activo) setError("No se pudieron cargar los detalles.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [urls]);

  return { pokemones, cargando, error };
}
