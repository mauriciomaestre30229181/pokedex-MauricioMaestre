"use client";

interface BuscadorProps {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}

export default function Buscador({
  valor,
  onChange,
  placeholder = "pikachu, charizard, 25…",
}: BuscadorProps) {
  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar Pokémon"
        className="w-full border-2 border-tinta bg-surface px-4 py-3 pr-10 text-texto placeholder:text-texto/40 focus:border-acento focus:outline-none"
      />
      {valor !== "" && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center border-2 border-tinta text-sm text-texto/50 transition-all hover:bg-tinta hover:text-texto active:scale-90"
        >
          ✕
        </button>
      )}
    </div>
  );
}
