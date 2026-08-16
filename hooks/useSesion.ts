"use client";

import { useCallback, useEffect, useState } from "react";
import type { Sesion } from "@/lib/apiBackend";

const CLAVE = "sesion";

export function useSesion() {
  const [sesion, setSesion] = useState<Sesion | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(CLAVE);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSesion(JSON.parse(raw) as Sesion);
    } catch {
      /* sesión corrupta: se ignora */
    }
  }, []);

  const iniciar = useCallback((nueva: Sesion) => {
    setSesion(nueva);
    try {
      window.sessionStorage.setItem(CLAVE, JSON.stringify(nueva));
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  const cerrar = useCallback(() => {
    setSesion(null);
    try {
      window.sessionStorage.removeItem(CLAVE);
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  return { sesion, iniciar, cerrar };
}
