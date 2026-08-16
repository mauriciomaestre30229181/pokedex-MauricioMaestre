"use client";

import { useCallback, useState } from "react";

export function useShiny() {
  const [shiny, setShiny] = useState(false);
  const alternar = useCallback(() => setShiny((s) => !s), []);
  return { shiny, alternar };
}
