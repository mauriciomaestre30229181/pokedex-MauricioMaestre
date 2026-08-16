"use client";

interface PaginacionProps {
  pagina: number;
  totalPaginas: number;
  onAnterior: () => void;
  onSiguiente: () => void;
}

export default function Paginacion({
  pagina,
  totalPaginas,
  onAnterior,
  onSiguiente,
}: PaginacionProps) {
  if (totalPaginas <= 1) return null;

  const claseBoton =
    "tecla-pixel min-h-11 bg-surface px-5 text-sm font-semibold text-texto transition-all hover:text-acento-oscuro disabled:cursor-not-allowed disabled:opacity-40 disabled:text-texto disabled:hover:text-texto";

  return (
    <nav
      className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2"
      aria-label="Paginación"
    >
      <button
        type="button"
        onClick={onAnterior}
        disabled={pagina <= 1}
        className={claseBoton}
      >
        ← Anterior
      </button>
      <p className="font-mono text-sm font-medium text-texto/70">
        Página {pagina} de {totalPaginas}
      </p>
      <button
        type="button"
        onClick={onSiguiente}
        disabled={pagina >= totalPaginas}
        className={claseBoton}
      >
        Siguiente →
      </button>
    </nav>
  );
}
