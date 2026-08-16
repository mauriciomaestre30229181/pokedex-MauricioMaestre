"use client";

interface BotonFavoritoProps {
  activo: boolean;
  onAlternar: () => void;
  className?: string;
}

export default function BotonFavorito({
  activo,
  onAlternar,
  className = "",
}: BotonFavoritoProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onAlternar();
      }}
      aria-pressed={activo}
      aria-label={activo ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`rounded-full p-1.5 text-xl leading-none transition-all active:scale-90 ${
        activo
          ? "anim-latido text-acento-oscuro hover:text-acento-oscuro/80"
          : "text-texto/40 hover:bg-tinta/10 hover:text-texto"
      } ${className}`}
    >
      {activo ? "★" : "☆"}
    </button>
  );
}
