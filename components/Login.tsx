"use client";

import { useState } from "react";
import Pokebola from "@/components/Pokebola";
import { iniciarSesion, registrar } from "@/lib/apiBackend";
import type { Sesion } from "@/lib/apiBackend";

interface LoginProps {
  onIngresar: (sesion: Sesion) => void;
}

function OjoIcono({ visible }: { visible: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {!visible && <line x1="4" y1="4" x2="20" y2="20" />}
    </svg>
  );
}

export default function Login({ onIngresar }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reglas = [
    {
      id: "largo",
      texto: "Mínimo 6 caracteres",
      cumple: password.length >= 6,
    },
    {
      id: "letra",
      texto: "Al menos una letra",
      cumple: /[A-Za-z]/.test(password),
    },
    {
      id: "numero",
      texto: "Al menos un número",
      cumple: /[0-9]/.test(password),
    },
    {
      id: "especial",
      texto: "Al menos un carácter especial",
      cumple: /[^A-Za-z0-9]/.test(password),
    },
    {
      id: "coincide",
      texto: "Las contraseñas coinciden",
      cumple: confirmacion.length > 0 && confirmacion === password,
    },
  ];
  const passwordValida = reglas.every((r) => r.cumple);
  const formularioValido =
    username.trim().length > 0 &&
    (modo === "login" ||
      (passwordValida && confirmacion.length > 0 && confirmacion === password));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    if (modo === "registro" && password !== confirmacion) return;
    setCargando(true);
    setError(null);
    try {
      const sesion =
        modo === "login"
          ? await iniciarSesion(username.trim(), password)
          : await registrar(username.trim(), password);
      onIngresar(sesion);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo conectar con el servidor"
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="anim-aparecer flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <Pokebola tamano={64} animar="flotar" pixel />
        <h1 className="titulo-pokedex font-display text-4xl font-semibold uppercase tracking-widest">
          Pokédex UJAP
        </h1>
      </div>
      <form
        onSubmit={enviar}
        className={`borde-pixel flex w-full max-w-sm flex-col gap-4 bg-surface p-8 text-left ${
          error ? "anim-sacudida" : ""
        }`}
      >
        <label className="flex flex-col gap-1.5 text-sm text-texto/80">
          Usuario
          <input
            suppressHydrationWarning
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="ash"
            className="border-2 border-tinta bg-bg px-4 py-3 text-texto placeholder:text-texto/40 focus:border-acento focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-texto/80">
          Contraseña
          <span className="relative block">
            <input
              suppressHydrationWarning
              type={verPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={modo === "login" ? "current-password" : "new-password"}
              placeholder="••••••"
              className="w-full border-2 border-tinta bg-bg py-3 pl-4 pr-11 text-texto placeholder:text-texto/40 focus:border-acento focus:outline-none"
            />
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setVerPassword((v) => !v)}
              aria-label={
                verPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              aria-pressed={verPassword}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-texto/50 hover:text-texto focus:outline-none"
            >
              <OjoIcono visible={verPassword} />
            </button>
          </span>
        </label>
        {modo === "registro" && (
          <label className="flex flex-col gap-1.5 text-sm text-texto/80">
            Confirmar contraseña
            <span className="relative block">
              <input
                suppressHydrationWarning
                type={verPassword ? "text" : "password"}
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••"
                className="w-full border-2 border-tinta bg-bg py-3 pl-4 pr-11 text-texto placeholder:text-texto/40 focus:border-acento focus:outline-none"
              />
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                aria-label={
                  verPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                aria-pressed={verPassword}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-texto/50 hover:text-texto focus:outline-none"
              >
                <OjoIcono visible={verPassword} />
              </button>
            </span>
          </label>
        )}
        {modo === "registro" && (
          <ul className="flex flex-col gap-1.5 text-xs">
            {reglas.map((regla) => (
              <li
                key={regla.id}
                className={`flex items-center gap-2 font-medium transition-colors ${
                  regla.cumple ? "text-acento-oscuro" : "text-texto/50"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={regla.cumple ? "text-acento-oscuro" : "text-texto/30"}
                >
                  {regla.cumple ? "✓" : "•"}
                </span>
                {regla.texto}
              </li>
            ))}
          </ul>
        )}
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <button
          suppressHydrationWarning
          type="submit"
          disabled={cargando || !formularioValido}
          className="tecla-pixel bg-acento px-6 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cargando ? "Cargando…" : modo === "login" ? "Ingresar" : "Registrarme"}
        </button>
        <button
          suppressHydrationWarning
          type="button"
          onClick={() => {
            setModo((m) => (m === "login" ? "registro" : "login"));
            setConfirmacion("");
            setError(null);
          }}
          className="text-sm text-texto/60 underline-offset-4 hover:text-texto hover:underline"
        >
          {modo === "login"
            ? "¿No tienes cuenta? Regístrate"
            : "Ya tengo cuenta, ingresar"}
        </button>
      </form>
      <p className="text-xs text-texto/50">
        Necesitas una cuenta para guardar tus favoritos por usuario.
      </p>
    </main>
  );
}
