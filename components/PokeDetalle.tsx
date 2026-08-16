"use client";

import Image from "next/image";
import BotonFavorito from "@/components/BotonFavorito";
import Evoluciones from "@/components/Evoluciones";
import Pokebola from "@/components/Pokebola";
import { useEvolutions } from "@/hooks/useEvolutions";
import { useShiny } from "@/hooks/useShiny";
import { ESTADISTICAS_ES } from "@/lib/constants";
import { COLORES_TIPOS } from "@/lib/tipos";
import type { Pokemon } from "@/lib/types";

interface PokeDetalleProps {
  pokemon: Pokemon;
  esFavorito: boolean;
  onAlternarFavorito: () => void;
  onSeleccionarEvolucion?: (id: number) => void;
}

export default function PokeDetalle({
  pokemon,
  esFavorito,
  onAlternarFavorito,
  onSeleccionarEvolucion,
}: PokeDetalleProps) {
  const { shiny, alternar } = useShiny();
  const { data: evoluciones, loading: cargandoEvoluciones, error: errorEvoluciones } =
    useEvolutions(pokemon.id);
  const tipoPrincipal = pokemon.types[0];
  const color = tipoPrincipal
    ? (COLORES_TIPOS[tipoPrincipal.type.name] ?? "#475569")
    : "#475569";

  const altura = (pokemon.height / 10).toFixed(1);
  const peso = (pokemon.weight / 10).toFixed(1);

  const sprite = shiny
    ? (pokemon.sprites.front_shiny ?? pokemon.sprites.front_default)
    : (pokemon.sprites.front_default ?? pokemon.sprites.front_shiny);

  return (
    <article className="borde-pixel anim-subir grid w-full max-w-3xl gap-6 bg-surface p-6 sm:grid-cols-[auto_1fr] sm:gap-8 sm:p-8">
      <div className="flex flex-col items-center gap-2">
        <div className="anim-flotar relative flex h-40 w-40 items-center justify-center border-2 border-tinta bg-pantalla">
          <div
            className="scanline pointer-events-none absolute inset-0"
            aria-hidden="true"
          />
          <Image
            src={sprite ?? ""}
            alt={pokemon.name}
            width={144}
            height={144}
            priority
            className="imagen-pixel relative"
          />
        </div>
        <button
          type="button"
          onClick={alternar}
          aria-pressed={shiny}
          className={`tecla-pixel min-h-11 px-4 text-xs font-semibold uppercase tracking-wide transition-all ${
            shiny
              ? "bg-acento text-black"
              : "bg-surface text-texto/60 hover:text-texto"
          }`}
        >
          {shiny ? "Normal" : "Shiny"}
        </button>
        <p className="font-mono text-sm font-medium text-texto/50">
          #{pokemon.id}
        </p>
        <div className="flex items-center gap-2">
          <h2 className="font-display text-2xl font-semibold capitalize text-texto">
            {pokemon.name}
          </h2>
          <BotonFavorito activo={esFavorito} onAlternar={onAlternarFavorito} />
        </div>
        <ul className="flex flex-wrap justify-center gap-1.5">
          {pokemon.types.map((t) => (
            <li
              key={t.slot}
              className="recorte-pixel-peq border-2 border-tinta px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
              style={{
                backgroundColor: COLORES_TIPOS[t.type.name] ?? "#475569",
              }}
            >
              {t.type.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="border-2 border-tinta bg-pantalla px-4 py-3">
            <p className="font-mono text-xs text-white/70">Altura</p>
            <p className="font-semibold text-white">{altura} m</p>
          </div>
          <div className="border-2 border-tinta bg-pantalla px-4 py-3">
            <p className="font-mono text-xs text-white/70">Peso</p>
            <p className="font-semibold text-white">{peso} kg</p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-mono text-sm font-semibold uppercase tracking-wide text-texto/50">
            Habilidades
          </h3>
          <ul className="flex flex-wrap gap-1.5">
            {pokemon.abilities.map((a) => (
              <li
                key={a.ability.name}
                className="recorte-pixel-peq border-2 border-tinta bg-pantalla px-3 py-1 text-xs capitalize text-white"
              >
                {a.ability.name.replace(/-/g, " ")}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-mono text-sm font-semibold uppercase tracking-wide text-texto/50">
            Estadísticas
          </h3>
          <ul className="flex flex-col gap-2.5">
            {pokemon.stats.map((s) => (
              <li key={s.stat.name}>
                <div className="mb-1 flex justify-between font-mono text-sm">
                  <span className="text-texto/80">
                    {ESTADISTICAS_ES[s.stat.name] ?? s.stat.name}
                  </span>
                  <span className="font-semibold text-texto">
                    {s.base_stat}
                  </span>
                </div>
                <div className="h-2.5 border-2 border-tinta bg-pantalla">
                  <div
                    className="h-full transition-[width] duration-500"
                    style={{
                      width: `${(s.base_stat / 255) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="sm:col-span-2 flex flex-col items-center gap-3">
        <h3 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-wide text-texto/50">
          <Pokebola tamano={16} pixel />
          Evoluciones
        </h3>
        {cargandoEvoluciones ? (
          <p className="animate-pulse font-mono text-sm text-acento-oscuro">
            Cargando evoluciones…
          </p>
        ) : errorEvoluciones ? (
          <p className="font-mono text-sm text-red-600">{errorEvoluciones}</p>
        ) : evoluciones && evoluciones.length > 0 ? (
          <Evoluciones evoluciones={evoluciones} onSeleccionar={onSeleccionarEvolucion} />
        ) : (
          <p className="font-mono text-sm text-texto/60">Sin evolución registrada.</p>
        )}
      </div>
    </article>
  );
}
