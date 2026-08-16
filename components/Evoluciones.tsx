import Image from "next/image";
import type { Evolucion } from "@/lib/types";

function TarjetaEvolucion({
  ev,
  onSeleccionar,
}: {
  ev: Evolucion;
  onSeleccionar?: (id: number) => void;
}) {
  const contenido = (
    <>
      <div className="relative flex h-20 w-20 items-center justify-center border-2 border-tinta bg-pantalla">
        <div
          className="scanline pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        {ev.sprite && (
          <Image
            src={ev.sprite}
            alt={ev.name}
            width={72}
            height={72}
            className="imagen-pixel relative transition-transform duration-300 group-hover:scale-110"
          />
        )}
      </div>
      <p className="font-mono text-[11px] font-bold text-texto/50">#{ev.id}</p>
      <p className="font-display text-sm font-semibold uppercase tracking-wider text-texto">
        {ev.name}
      </p>
      {ev.esActual && (
        <span className="anim-latido recorte-pixel-peq border-2 border-tinta bg-acento px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black">
          Actual
        </span>
      )}
    </>
  );

  const clases =
    "group flex w-full flex-col items-center gap-1 border-2 border-tinta px-3 py-3";

  if (onSeleccionar) {
    return (
      <button
        type="button"
        onClick={() => onSeleccionar(ev.id)}
        aria-label={`Ver detalle de ${ev.name}`}
        className={`${clases} recorte-pixel-peq bg-surface transition-all duration-300 hover:-translate-y-1 active:translate-x-0.5 active:translate-y-0.5 ${
          ev.esActual
            ? "bg-acento/15"
            : "bg-surface hover:bg-tinta/5"
        }`}
        style={{ filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.45))" }}
      >
        {contenido}
      </button>
    );
  }

  return (
    <div
      className={`${clases} recorte-pixel-peq bg-surface transition-all duration-300 hover:-translate-y-0.5 ${
        ev.esActual ? "bg-acento/15" : "bg-surface"
      }`}
      style={{ filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.45))" }}
    >
      {contenido}
    </div>
  );
}

export default function Evoluciones({
  evoluciones,
  onSeleccionar,
}: {
  evoluciones: Evolucion[];
  onSeleccionar?: (id: number) => void;
}) {
  return (
    <ul className="flex w-full flex-wrap items-center justify-center gap-3">
      {evoluciones.map((ev, i) => (
        <li
          key={ev.id}
          className="anim-subir group flex items-center gap-3"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {i > 0 && (
            <span
              className="font-mono text-lg font-bold text-texto/40 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              ▶
            </span>
          )}
          <div className="w-28">
            <TarjetaEvolucion ev={ev} onSeleccionar={onSeleccionar} />
          </div>
        </li>
      ))}
    </ul>
  );
}
