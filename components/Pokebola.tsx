interface PokebolaProps {
  tamano?: number;
  animar?: "girar" | "flotar" | null;
  className?: string;
  pixel?: boolean;
}

export default function Pokebola({
  tamano = 40,
  animar = null,
  className = "",
  pixel = false,
}: PokebolaProps) {
  const animacion =
    animar === "girar"
      ? "anim-girar"
      : animar === "flotar"
        ? "anim-flotar"
        : "";

  if (pixel) {
    return (
      <svg
        width={tamano}
        height={tamano}
        viewBox="0 0 16 16"
        role="img"
        aria-label="Pokebola"
        className={`${animacion} ${className}`}
        shapeRendering="crispEdges"
      >
        <rect x="1" y="1" width="14" height="14" fill="none" stroke="#05060a" strokeWidth="2" />
        <rect x="3" y="3" width="10" height="5" fill="#dc0a2d" />
        <rect x="3" y="8" width="10" height="5" fill="white" />
        <rect x="3" y="7" width="10" height="2" fill="#05060a" />
        <rect x="6" y="6" width="4" height="4" fill="#05060a" />
        <rect x="7" y="7" width="2" height="2" fill="white" />
      </svg>
    );
  }

  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Pokebola"
      className={`${animacion} ${className}`}
    >
      <circle cx="24" cy="24" r="23" fill="#111827" />
      <circle cx="24" cy="24" r="21" fill="white" />
      <path d="M24 3 A21 21 0 0 0 3 24 H21 Z" fill="#dc0a2d" />
      <rect x="3" y="22.5" width="42" height="3" rx="1.5" fill="#111827" />
      <circle cx="24" cy="24" r="6.5" fill="white" stroke="#111827" strokeWidth="3" />
    </svg>
  );
}
