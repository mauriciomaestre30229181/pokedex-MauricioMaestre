"use client";

import { NOMBRE_TIPOS, COLORES_TIPOS } from "@/lib/tipos";

interface FiltroTipoProps {
  tipo: string | null;
  onCambio: (tipo: string | null) => void;
}

export default function FiltroTipo({ tipo, onCambio }: FiltroTipoProps) {
  return (
    <div className="flex w-full max-w-3xl flex-wrap justify-center gap-2">
      <button
        type="button"
        onClick={() => onCambio(null)}
        aria-pressed={tipo === null}
        className={`tecla-pixel min-h-11 px-4 text-xs font-semibold uppercase tracking-wide transition-all ${
          tipo === null
            ? "bg-acento text-black"
            : "bg-surface text-texto/60 hover:text-texto"
        }`}
      >
        Todos
      </button>
      {NOMBRE_TIPOS.map((nombre) => {
        const color = COLORES_TIPOS[nombre];
        const activo = tipo === nombre;
        return (
          <button
            key={nombre}
            type="button"
            onClick={() => onCambio(activo ? null : nombre)}
            aria-pressed={activo}
            className={`recorte-pixel-peq min-h-11 border-2 border-tinta px-4 text-xs font-semibold uppercase tracking-wide text-white transition-all active:scale-95 ${
              activo
                ? "scale-105 ring-2 ring-acento drop-shadow-[3px_3px_0_rgba(0,0,0,0.5)]"
                : "opacity-75 hover:opacity-100"
            }`}
            style={{ backgroundColor: color }}
          >
            {nombre}
          </button>
        );
      })}
    </div>
  );
}
