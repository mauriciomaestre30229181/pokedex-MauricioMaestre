"use client";

import { useEffect, useState } from "react";

export function useDebounce<T>(valor: T, demora = 400): T {
  const [valorFinal, setValorFinal] = useState(valor);

  useEffect(() => {
    const t = setTimeout(() => setValorFinal(valor), demora);
    return () => clearTimeout(t);
  }, [valor, demora]);

  return valorFinal;
}
