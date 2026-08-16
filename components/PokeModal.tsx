"use client";

import { useEffect, useRef, useState } from "react";
import Pokebola from "@/components/Pokebola";
import PokeDetalle from "@/components/PokeDetalle";
import { BASE_URL } from "@/lib/constants";
import { obtenerDetalles } from "@/lib/pokeapi";
import type { Pokemon } from "@/lib/types";

interface PokeModalProps {
  id: number;
  pokemonInicial?: Pokemon;
  onCerrar: () => void;
  esFavorito: (id: number) => boolean;
  onAlternarFavorito: (id: number, nombre: string) => void;
}

export default function PokeModal({
  id,
  pokemonInicial,
  onCerrar,
  esFavorito,
  onAlternarFavorito,
}: PokeModalProps) {
  const [idActual, setIdActual] = useState(id);
  const [pokemon, setPokemon] = useState<Pokemon | null>(pokemonInicial ?? null);
  const [cargando, setCargando] = useState(!pokemonInicial);
  const [error, setError] = useState<string | null>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (pokemon && pokemon.id === idActual) return;
    let activo = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargando(true);
    setError(null);
    obtenerDetalles([`${BASE_URL}/pokemon/${idActual}`])
      .then((detalles) => {
        if (activo) {
          if (detalles.length > 0) setPokemon(detalles[0]);
          else setError("No se pudo cargar este Pokémon.");
        }
      })
      .catch(() => {
        if (activo) setError("No se pudo cargar este Pokémon.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [idActual, pokemon]);

  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cerrarRef.current?.focus();
    return () => {
      document.body.style.overflow = previo;
    };
  }, []);

  useEffect(() => {
    const manejarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [onCerrar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Detalle del Pokémon"
    >
      <div
        className="anim-aparecer absolute inset-0 bg-black/60 backdrop-blur-sm"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onCerrar();
        }}
      />
      <div className="anim-subir borde-pixel relative max-h-[90vh] w-[min(92vw,48rem)] overflow-y-auto bg-surface p-6 sm:p-8">
        <button
          ref={cerrarRef}
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar detalle"
          className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center border-2 border-tinta bg-surface text-xl text-texto/70 transition-all hover:bg-rojo/15 hover:text-rojo active:scale-95"
        >
          ✕
        </button>

        {cargando && !pokemon && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <Pokebola tamano={48} animar="girar" />
            <p className="text-lg font-semibold text-acento-oscuro">Cargando…</p>
          </div>
        )}

        {!cargando && (error || !pokemon) && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-lg font-semibold text-red-600">
              No se pudo cargar este Pokémon.
            </p>
            <button
              type="button"
              onClick={onCerrar}
              className="tecla-pixel bg-acento px-6 py-2 font-semibold text-black"
            >
              Cerrar
            </button>
          </div>
        )}

        {!error && pokemon && (
          <PokeDetalle
            pokemon={pokemon}
            esFavorito={esFavorito(pokemon.id)}
            onAlternarFavorito={() =>
              onAlternarFavorito(pokemon.id, pokemon.name)
            }
            onSeleccionarEvolucion={setIdActual}
          />
        )}
      </div>
    </div>
  );
}
