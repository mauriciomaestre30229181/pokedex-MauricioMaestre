"use client";

import { useEffect, useState } from "react";
import {
  aplanarCadena,
  obtenerCadenaEvolutiva,
  obtenerDetalles,
  obtenerEspecie,
} from "@/lib/pokeapi";
import type { Evolucion } from "@/lib/types";

export function useEvolutions(speciesId: number | null) {
  const [data, setData] = useState<Evolucion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!speciesId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null);
      setError(null);
      return;
    }
    let activo = true;
    setLoading(true);
    setError(null);
    obtenerEspecie(speciesId)
      .then((especie) => obtenerCadenaEvolutiva(especie.evolution_chain.url))
      .then((cadena) => {
        const eslabones = aplanarCadena(cadena.chain);
        return obtenerDetalles(eslabones.map((e) => e.url));
      })
      .then((detalles) => {
        if (!activo) return;
        setData(
          detalles.map((p) => ({
            id: p.id,
            name: p.name,
            sprite: p.sprites.front_default ?? "",
            esActual: p.id === speciesId,
          }))
        );
      })
      .catch(() => {
        if (activo) {
          setData(null);
          setError("No se pudo cargar la cadena evolutiva.");
        }
      })
      .finally(() => {
        if (activo) setLoading(false);
      });
    return () => {
      activo = false;
    };
  }, [speciesId]);

  return { data, loading, error };
}
