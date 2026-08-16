import Image from "next/image";
import Pokebola from "@/components/Pokebola";
import { COLORES_TIPOS } from "@/lib/tipos";
import type { Pokemon } from "@/lib/types";

interface PokeCardProps {
  pokemon: Pokemon;
  shiny?: boolean;
  esFavorito?: boolean;
  onAlternarFavorito?: () => void;
  seleccionado?: boolean;
  onComparar?: () => void;
  onAbrir?: () => void;
}

export default function PokeCard({
  pokemon,
  shiny = false,
  esFavorito,
  onAlternarFavorito,
  seleccionado = false,
  onComparar,
  onAbrir,
}: PokeCardProps) {
  const tipoPrincipal = pokemon.types[0];
  const color = tipoPrincipal
    ? (COLORES_TIPOS[tipoPrincipal.type.name] ?? "#475569")
    : "#475569";

  const sprite = shiny
    ? (pokemon.sprites.front_shiny ?? pokemon.sprites.front_default)
    : (pokemon.sprites.front_default ?? pokemon.sprites.front_shiny);

  return (
    <article
      className={`borde-pixel group relative flex flex-col bg-surface transition-all duration-300 hover:-translate-y-1 ${
        onAbrir ? "cursor-pointer" : ""
      }`}
      onClick={onAbrir}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ backgroundColor: color }}
      >
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-black">
          #{String(pokemon.id).padStart(4, "0")}
        </span>
        <div className="flex items-center gap-1.5">
          <Pokebola tamano={18} pixel />
          {esFavorito !== undefined && onAlternarFavorito && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAlternarFavorito();
              }}
              aria-pressed={esFavorito}
              aria-label={
                esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"
              }
              className={`flex h-7 w-7 items-center justify-center border-2 border-tinta text-base leading-none transition-all active:scale-90 ${
                esFavorito
                  ? "anim-latido bg-tinta text-acento"
                  : "bg-tinta/15 text-tinta/60 hover:text-tinta"
              }`}
            >
              {esFavorito ? "★" : "☆"}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 p-4 pt-3">
        <div className="relative flex h-28 w-28 items-center justify-center border-2 border-tinta bg-pantalla">
          <div
            className="scanline pointer-events-none absolute inset-0"
            aria-hidden="true"
          />
          <Image
            src={sprite ?? ""}
            alt={pokemon.name}
            width={96}
            height={96}
            className="imagen-pixel relative transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          />
        </div>

        {onAbrir ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAbrir();
            }}
            aria-label={`Ver detalle de ${pokemon.name}`}
            className="font-display text-lg font-semibold uppercase tracking-widest text-texto transition-colors hover:text-acento-oscuro"
          >
            {pokemon.name}
          </button>
        ) : (
          <h2 className="font-display text-lg font-semibold uppercase tracking-widest text-texto">
            {pokemon.name}
          </h2>
        )}

        <ul className="flex flex-wrap justify-center gap-1.5">
          {pokemon.types.map((t) => (
            <li
              key={t.slot}
              className="recorte-pixel-peq border-2 border-tinta px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-white transition-transform group-hover:scale-105"
              style={{
                backgroundColor: COLORES_TIPOS[t.type.name] ?? "#475569",
              }}
            >
              {t.type.name}
            </li>
          ))}
        </ul>

        {onComparar && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onComparar();
            }}
            aria-pressed={seleccionado}
            className={`recorte-pixel-peq border-2 border-tinta px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 ${
              seleccionado
                ? "bg-acento text-black"
                : "bg-transparent text-texto/70 hover:bg-acento/15 hover:text-texto"
            }`}
          >
            {seleccionado ? "✓ Seleccionado" : "Comparar"}
          </button>
        )}
      </div>
    </article>
  );
}
