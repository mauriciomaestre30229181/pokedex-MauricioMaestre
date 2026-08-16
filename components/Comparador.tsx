"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import BotonFavorito from "@/components/BotonFavorito";
import { ESTADISTICAS_ES } from "@/lib/constants";
import { COLORES_TIPOS } from "@/lib/tipos";
import type { Pokemon } from "@/lib/types";

interface ComparadorProps {
  a: Pokemon;
  b: Pokemon;
  shiny: boolean;
  onAlternarShiny: () => void;
  esFavorito: (id: number) => boolean;
  onAlternarFavorito: (id: number, nombre: string) => void;
  onQuitarTodos: () => void;
}

export default function Comparador({
  a,
  b,
  shiny,
  onAlternarShiny,
  esFavorito,
  onAlternarFavorito,
  onQuitarTodos,
}: ComparadorProps) {
  const colorA = COLORES_TIPOS[a.types[0]?.type.name] ?? "#475569";
  const colorB = COLORES_TIPOS[b.types[0]?.type.name] ?? "#475569";

  const sprite = (p: Pokemon) =>
    shiny
      ? (p.sprites.front_shiny ?? p.sprites.front_default)
      : (p.sprites.front_default ?? p.sprites.front_shiny);

  const statsA = a.stats.map((s) => s.base_stat);
  const statsB = b.stats.map((s) => s.base_stat);

  const cajaSprites = (
    p: Pokemon,
    delay: string,
    imagen: ReactNode
  ) => (
    <div
      className="anim-subir flex flex-col items-center gap-3"
      style={{ animationDelay: delay }}
    >
      <div
        className="relative flex h-36 w-36 items-center justify-center border-2 border-tinta bg-pantalla"
      >
        <div
          className="scanline pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        {imagen}
      </div>
      <p className="font-mono text-xs font-medium text-texto/50">#{p.id}</p>
      <div className="flex items-center gap-2">
        <h2 className="font-display text-xl font-semibold capitalize text-texto">{p.name}</h2>
        <BotonFavorito
          activo={esFavorito(p.id)}
          onAlternar={() => onAlternarFavorito(p.id, p.name)}
        />
      </div>
      <ul className="flex flex-wrap justify-center gap-1.5">
        {p.types.map((t) => (
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
      <div className="grid w-full grid-cols-2 gap-3 text-center">
        <div className="border-2 border-tinta bg-pantalla px-3 py-2">
          <p className="font-mono text-xs text-white/70">Altura</p>
          <p className="font-semibold text-white">
            {(p.height / 10).toFixed(1)} m
          </p>
        </div>
        <div className="border-2 border-tinta bg-pantalla px-3 py-2">
          <p className="font-mono text-xs text-white/70">Peso</p>
          <p className="font-semibold text-white">
            {(p.weight / 10).toFixed(1)} kg
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-6">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-sm text-texto/70">
          Comparando <strong className="capitalize text-texto">{a.name}</strong>{" "}
          vs <strong className="capitalize text-texto">{b.name}</strong>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAlternarShiny}
            aria-pressed={shiny}
            className={`tecla-pixel min-h-11 px-4 text-xs font-semibold uppercase tracking-wide transition-all ${
              shiny
                ? "bg-acento text-black"
                : "bg-surface text-texto/60 hover:text-texto"
            }`}
          >
            Shiny
          </button>
          <button
            type="button"
            onClick={onQuitarTodos}
            className="tecla-pixel min-h-11 bg-surface px-4 text-xs font-semibold text-texto/70 transition-all hover:text-rojo"
          >
            Quitar todos
          </button>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        {cajaSprites(
          a,
          "",
          <Image
            src={sprite(a) ?? ""}
            alt={a.name}
            width={128}
            height={128}
            className="imagen-pixel relative"
          />
        )}
        {cajaSprites(
          b,
          "80ms",
          <Image
            src={sprite(b) ?? ""}
            alt={b.name}
            width={128}
            height={128}
            className="imagen-pixel relative"
          />
        )}
      </div>

      <div
        className="borde-pixel anim-subir w-full bg-surface p-5 sm:p-6"
        style={{ animationDelay: "160ms" }}
      >
        <h3 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wide text-texto/50">
          Estadísticas
        </h3>
        <ul className="flex flex-col gap-3">
          {a.stats.map((stat, i) => {
            const nombre = ESTADISTICAS_ES[stat.stat.name] ?? stat.stat.name;
            return (
              <li
                key={stat.stat.name}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"
              >
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-sm font-semibold text-texto">
                    {statsA[i]}
                  </span>
                  <div className="h-2 w-full border-2 border-tinta bg-pantalla">
                    <div
                      className="ml-auto h-full"
                      style={{
                        width: `${(statsA[i] / 255) * 100}%`,
                        backgroundColor: colorA,
                      }}
                    />
                  </div>
                </div>
                <span className="min-w-16 text-center font-mono text-xs text-texto/50">
                  {nombre}
                </span>
                <div className="flex flex-col items-start gap-1">
                  <span className="font-mono text-sm font-semibold text-texto">
                    {statsB[i]}
                  </span>
                  <div className="h-2 w-full border-2 border-tinta bg-pantalla">
                    <div
                      className="h-full"
                      style={{
                        width: `${(statsB[i] / 255) * 100}%`,
                        backgroundColor: colorB,
                      }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
