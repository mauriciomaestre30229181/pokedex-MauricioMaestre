"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Buscador from "@/components/Buscador";
import Comparador from "@/components/Comparador";
import FiltroTipo from "@/components/FiltroTipo";
import Login from "@/components/Login";
import Paginacion from "@/components/Paginacion";
import Pokebola from "@/components/Pokebola";
import PokeCard from "@/components/PokeCard";
import PokeModal from "@/components/PokeModal";
import { useDebounce } from "@/hooks/useDebounce";
import { useDetallesPokemon } from "@/hooks/useDetallesPokemon";
import { useFavorites } from "@/hooks/useFavorites";
import { useFetch } from "@/hooks/useFetch";
import { useSesion } from "@/hooks/useSesion";
import { useShiny } from "@/hooks/useShiny";
import {
  BASE_URL,
  LIMITE_POR_PAGINA,
  MAX_COINCIDENCIAS,
} from "@/lib/constants";
import {
  especiesDeTipo,
  filtrarPorPrefijo,
  obtenerDetalles,
  obtenerTodosLosNombres,
} from "@/lib/pokeapi";
import type { Pokemon, PokemonLista, RespuestaPokedex, RespuestaTipo } from "@/lib/types";

export default function Home() {
  const { sesion, iniciar, cerrar } = useSesion();
  const { shiny, alternar: alternarShiny } = useShiny();
  const {
    favoritos,
    alternar: alternarFavorito,
    esFavorito,
    sincronizando,
    errorSync,
  } = useFavorites(sesion);
  const [verFavoritos, setVerFavoritos] = useState(false);

  // --- Comparador (Fase 8) ---
  const [seleccion, setSeleccion] = useState<Pokemon[]>([]);

  // --- Modal de detalle (Fase 12) ---
  const [pokemonDetalle, setPokemonDetalle] = useState<Pokemon | null>(null);

  const agregarAComparacion = (p: Pokemon) => {
    setSeleccion((prev) => {
      if (prev.some((x) => x.id === p.id)) {
        return prev.filter((x) => x.id !== p.id);
      }
      if (prev.length < 2) return [...prev, p];
      return [prev[1], p];
    });
  };

  // --- Lista paginada y filtro por tipo (Fases 2, 4 y 5) ---
  const [offset, setOffset] = useState(0);
  const [offsetTipo, setOffsetTipo] = useState(0);
  const [tipo, setTipo] = useState<string | null>(null);

  const urlPokedex = `${BASE_URL}/pokedex?limit=${LIMITE_POR_PAGINA}&offset=${offset}`;

  const {
    data: lista,
    loading: cargandoLista,
    error: errorLista,
    reload,
  } = useFetch<RespuestaPokedex>(urlPokedex);

  const {
    data: datosTipo,
    loading: cargandoTipo,
    error: errorTipo,
  } = useFetch<RespuestaTipo>(tipo ? `${BASE_URL}/type/${tipo}` : null);

  const detallesLista = lista?.results ?? [];

  const urlsTipo = useMemo(
    () => especiesDeTipo(datosTipo, LIMITE_POR_PAGINA, offsetTipo).map((e) => e.url),
    [datosTipo, offsetTipo]
  );
  const urlsFavoritos = useMemo(
    () => favoritos.map((id) => `${BASE_URL}/pokemon/${id}`),
    [favoritos]
  );

  const detallesTipo = useDetallesPokemon(urlsTipo);
  const detallesFavoritos = useDetallesPokemon(urlsFavoritos);

  const detallesActivos = tipo ? detallesTipo.pokemones : detallesLista;
  const cargandoDetallesActivos = tipo ? detallesTipo.cargando : false;
  const errorDetallesActivos = tipo ? detallesTipo.error : null;
  const gridCargando = tipo
    ? cargandoTipo || cargandoDetallesActivos
    : cargandoLista;
  const gridError = tipo
    ? (errorTipo ?? errorDetallesActivos)
    : errorLista;

  const totalEspeciesTipo = useMemo(
    () =>
      datosTipo
        ? datosTipo.pokemon.filter((e) => !e.pokemon.name.includes("-")).length
        : 0,
    [datosTipo]
  );

  const pagina = Math.floor(offset / LIMITE_POR_PAGINA) + 1;
  const totalPaginas = lista
    ? Math.max(1, Math.ceil(lista.count / LIMITE_POR_PAGINA))
    : 1;
  const paginaTipo = Math.floor(offsetTipo / LIMITE_POR_PAGINA) + 1;
  const totalPaginasTipo = Math.max(
    1,
    Math.ceil(totalEspeciesTipo / LIMITE_POR_PAGINA)
  );

  const cambiarTipo = (nuevo: string | null) => {
    setTipo(nuevo);
    setOffsetTipo(0);
  };

  const primeraCarga = useRef(true);
  useEffect(() => {
    if (primeraCarga.current) {
      primeraCarga.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tipo, offset, offsetTipo]);

  // --- Búsqueda (Fase 3) ---
  const [consulta, setConsulta] = useState("");
  const busqueda = useDebounce(consulta, 400);
  const busquedaLimpia = busqueda.trim().toLowerCase();
  const esNumerica = /^\d+$/.test(busquedaLimpia);

  const [nombres, setNombres] = useState<PokemonLista | null>(null);

  useEffect(() => {
    let activo = true;
    obtenerTodosLosNombres()
      .then((data) => {
        if (activo) setNombres(data);
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  const coincidencias = useMemo(
    () => filtrarPorPrefijo(nombres, busqueda),
    [nombres, busqueda]
  );

  const urlsCoincidencias = useMemo(
    () =>
      esNumerica
        ? [`${BASE_URL}/pokemon/${busquedaLimpia}`]
        : coincidencias.slice(0, MAX_COINCIDENCIAS).map((c) => c.url),
    [esNumerica, busquedaLimpia, coincidencias]
  );

  const [coincidenciasDetalle, setCoincidenciasDetalle] = useState<Pokemon[]>(
    []
  );
  const [cargandoCoincidencias, setCargandoCoincidencias] = useState(false);

  useEffect(() => {
    if (!busquedaLimpia || urlsCoincidencias.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCoincidenciasDetalle([]);
      return;
    }
    let activo = true;
    setCargandoCoincidencias(true);
    obtenerDetalles(urlsCoincidencias)
      .then((detallesCoincidencias) => {
        if (activo) setCoincidenciasDetalle(detallesCoincidencias);
      })
      .catch(() => {
        if (activo) setCoincidenciasDetalle([]);
      })
      .finally(() => {
        if (activo) setCargandoCoincidencias(false);
      });
    return () => {
      activo = false;
    };
  }, [busquedaLimpia, urlsCoincidencias]);

  // --- Bloques de UI compartidos ---
  const cabecera = (
    <header className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full max-w-6xl items-center justify-between">
        <h1 className="titulo-pokedex flex items-center gap-3 font-display text-3xl font-semibold uppercase tracking-widest">
          <Pokebola tamano={36} pixel />
          Pokédex UJAP
        </h1>
        {sesion && (
          <div className="flex items-center gap-3 text-sm">
            <span className="font-mono text-texto/60">
              Hola,{" "}
              <strong className="capitalize text-texto">
                {sesion.username}
              </strong>
            </span>
            <button
              type="button"
              onClick={cerrar}
              className="tecla-pixel min-h-11 bg-surface px-3 py-1 text-xs font-semibold text-texto/70 hover:bg-rojo/15 hover:text-rojo"
            >
              Salir
            </button>
          </div>
        )}
      </div>
      <div className="flex w-full max-w-md items-center gap-3">
        <div className="flex-1">
          <Buscador valor={consulta} onChange={setConsulta} />
        </div>
        <button
          type="button"
          onClick={() => setVerFavoritos((v) => !v)}
          aria-pressed={verFavoritos}
          className={`tecla-pixel min-h-11 whitespace-nowrap px-4 text-sm font-semibold transition-all ${
            verFavoritos
              ? "bg-acento text-black"
              : "bg-surface text-texto/70 hover:text-texto"
          }`}
        >
          ★ Favoritos{favoritos.length > 0 ? ` (${favoritos.length})` : ""}
        </button>
      </div>
      {!busquedaLimpia && !verFavoritos && (
        <FiltroTipo tipo={tipo} onCambio={cambiarTipo} />
      )}
      <div className="h-1 w-full max-w-6xl rounded-full bg-gradient-to-r from-transparent via-rojo to-transparent" />
    </header>
  );

  const toggleShiny = (
    <button
      type="button"
      onClick={alternarShiny}
      aria-pressed={shiny}
      className={`tecla-pixel min-h-11 px-4 text-xs font-semibold uppercase tracking-wide transition-all ${
        shiny
          ? "bg-acento text-black"
          : "bg-surface text-texto/60 hover:text-texto"
      }`}
    >
      Shiny
    </button>
  );

  const barra = (contador: string) => (
    <div className="flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-mono text-sm text-texto/60">{contador}</p>
        {seleccion.length === 1 && (
          <p className="text-xs text-acento-oscuro/80">
            1 seleccionado — elige otro para comparar
          </p>
        )}
      </div>
      {toggleShiny}
    </div>
  );

  const grid = (pokemones: Pokemon[], clave: string) => (
    <ul
      key={clave}
      className="grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {pokemones.map((p, i) => (
        <li
          key={p.id}
          className="anim-subir odd:rotate-[0.4deg] even:rotate-[-0.4deg]"
          style={{ animationDelay: `${Math.min(i, 19) * 45}ms` }}
        >
          <PokeCard
            pokemon={p}
            shiny={shiny}
            esFavorito={esFavorito(p.id)}
            onAlternarFavorito={() => alternarFavorito(p.id, p.name)}
            seleccionado={seleccion.some((x) => x.id === p.id)}
            onComparar={() => agregarAComparacion(p)}
            onAbrir={() => setPokemonDetalle(p)}
          />
        </li>
      ))}
    </ul>
  );

  const coincidenciasGrid = (
    <ul
      key={`busqueda-${busquedaLimpia}`}
      className="grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {coincidenciasDetalle.map((p, i) => (
        <li
          key={p.id}
          className="anim-subir odd:rotate-[0.4deg] even:rotate-[-0.4deg]"
          style={{ animationDelay: `${Math.min(i, 19) * 45}ms` }}
        >
          <PokeCard
            pokemon={p}
            shiny={shiny}
            esFavorito={esFavorito(p.id)}
            onAlternarFavorito={() => alternarFavorito(p.id, p.name)}
            seleccionado={seleccion.some((x) => x.id === p.id)}
            onComparar={() => agregarAComparacion(p)}
            onAbrir={() => setPokemonDetalle(p)}
          />
        </li>
      ))}
    </ul>
  );

  const cargando = (mensaje: string) => (
    <main className="anim-aparecer flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      {cabecera}
      <Pokebola tamano={48} animar="girar" />
      <p className="text-xl font-semibold text-acento-oscuro">{mensaje}</p>
    </main>
  );

  if (!sesion) {
    return <Login onIngresar={iniciar} />;
  }

  // --- Estados de búsqueda ---
  if (busquedaLimpia) {
    if (cargandoCoincidencias || (!nombres && !esNumerica)) {
      return (
        <main className="anim-aparecer flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          {cabecera}
          <Pokebola tamano={40} animar="girar" />
          <p className="text-lg font-semibold text-acento-oscuro">Buscando…</p>
        </main>
      );
    }
    if (coincidenciasDetalle.length > 0) {
      return (
        <main className="anim-aparecer flex flex-1 flex-col items-center gap-6 px-4 py-8 sm:px-6">
          {cabecera}
          <p className="text-sm text-texto/60">
            {esNumerica
              ? `Pokémon n.° ${busquedaLimpia}`
              : `Coincidencias para «${busquedaLimpia}»`}
          </p>
          {coincidenciasGrid}
          {pokemonDetalle !== null && (
            <PokeModal
              id={pokemonDetalle.id}
              pokemonInicial={pokemonDetalle}
              onCerrar={() => setPokemonDetalle(null)}
              esFavorito={esFavorito}
              onAlternarFavorito={alternarFavorito}
            />
          )}
        </main>
      );
    }
    return (
      <main className="anim-aparecer flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        {cabecera}
        <p className="text-xl font-semibold text-red-600">
          No se encontró ningún Pokémon para «{busquedaLimpia}»
        </p>
        <p className="text-sm text-texto/60">
          Prueba con otro nombre o número de Pokédex.
        </p>
      </main>
    );
  }

  // --- Comparador (Fase 8) ---
  if (seleccion.length === 2) {
    return (
      <main className="anim-aparecer flex flex-1 flex-col items-center gap-6 px-4 py-8 sm:px-6">
        {cabecera}
        <Comparador
          a={seleccion[0]}
          b={seleccion[1]}
          shiny={shiny}
          onAlternarShiny={alternarShiny}
          esFavorito={esFavorito}
          onAlternarFavorito={alternarFavorito}
          onQuitarTodos={() => setSeleccion([])}
        />
      </main>
    );
  }

  // --- Vista "Mis favoritos" (Fase 7) ---
  if (verFavoritos) {
    if (sincronizando || detallesFavoritos.cargando) {
      return cargando("Cargando favoritos…");
    }
    if (detallesFavoritos.error) {
      return (
        <main className="anim-aparecer flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          {cabecera}
          <p className="text-2xl font-bold text-red-600">Hubo un error</p>
          <p className="text-texto/70">{detallesFavoritos.error}</p>
          <button
            onClick={() => setVerFavoritos(false)}
            className="rounded-full bg-acento px-6 py-2 font-semibold text-black transition-all hover:bg-acento/80 active:scale-95"
          >
            Volver a la Pokédex
          </button>
        </main>
      );
    }
    if (favoritos.length === 0) {
      return (
        <main className="anim-aparecer flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          {cabecera}
          <p className="text-xl font-semibold text-red-600">
            Aún no tienes favoritos.
          </p>
          <p className="text-sm text-texto/60">
            Toca la ★ en una tarjeta para guardarlos.
          </p>
        </main>
      );
    }
    return (
      <main className="anim-aparecer flex flex-1 flex-col items-center gap-6 px-4 py-8 sm:px-6">
        {cabecera}
        {barra(
          `${favoritos.length} favorito${favoritos.length > 1 ? "s" : ""}`
        )}
        {errorSync && (
          <p className="max-w-6xl text-xs text-acento-oscuro/80">
            Algunos cambios no se sincronizaron con el servidor; se guardaron
            localmente en este navegador.
          </p>
        )}
        {grid(detallesFavoritos.pokemones, "favoritos")}
        {pokemonDetalle !== null && (
          <PokeModal
            id={pokemonDetalle.id}
            pokemonInicial={pokemonDetalle}
            onCerrar={() => setPokemonDetalle(null)}
            esFavorito={esFavorito}
            onAlternarFavorito={alternarFavorito}
          />
        )}
      </main>
    );
  }

  // --- Grid por defecto (Fase 2), filtrado por tipo (Fase 4) o paginado (Fase 5) ---
  if (gridCargando) {
    return cargando("Cargando Pokémon…");
  }

  if (gridError) {
    return (
      <main className="anim-aparecer flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        {cabecera}
        <p className="text-2xl font-bold text-red-600">Hubo un error</p>
        <p className="text-texto/70">{gridError}</p>
        {tipo ? (
          <button
            onClick={() => cambiarTipo(null)}
            className="rounded-full bg-acento px-6 py-2 font-semibold text-black transition-all hover:bg-acento/80 active:scale-95"
          >
            Quitar filtro
          </button>
        ) : (
          <button
            onClick={reload}
            className="rounded-full bg-acento px-6 py-2 font-semibold text-black transition-all hover:bg-acento/80 active:scale-95"
          >
            Reintentar
          </button>
        )}
      </main>
    );
  }

  if (detallesActivos.length === 0) {
    return (
      <main className="anim-aparecer flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        {cabecera}
        <p className="text-xl font-semibold text-red-600">
          No se encontraron Pokémon{tipo ? ` de tipo «${tipo}»` : ""}.
        </p>
      </main>
    );
  }

  const inicio = (pagina - 1) * LIMITE_POR_PAGINA + 1;
  const fin = Math.min(pagina * LIMITE_POR_PAGINA, lista?.count ?? 0);
  const inicioTipo = (paginaTipo - 1) * LIMITE_POR_PAGINA + 1;
  const finTipo = Math.min(paginaTipo * LIMITE_POR_PAGINA, totalEspeciesTipo);

  return (
    <main className="anim-aparecer flex flex-1 flex-col items-center gap-6 px-4 py-8 sm:px-6">
      {cabecera}
      {tipo
        ? barra(
            `${totalEspeciesTipo} Pokémon de tipo «${tipo}» · mostrando ${inicioTipo}–${finTipo}`
          )
        : barra(
            `${lista?.count ?? 0} Pokémon · mostrando ${inicio}–${fin}`
          )}
      {grid(
        detallesActivos,
        tipo ? `tipo-${tipo}-${paginaTipo}` : `lista-${pagina}`
      )}
      {pokemonDetalle !== null && (
        <PokeModal
          id={pokemonDetalle.id}
          pokemonInicial={pokemonDetalle}
          onCerrar={() => setPokemonDetalle(null)}
          esFavorito={esFavorito}
          onAlternarFavorito={alternarFavorito}
        />
      )}
      {tipo ? (
        <Paginacion
          pagina={paginaTipo}
          totalPaginas={totalPaginasTipo}
          onAnterior={() =>
            setOffsetTipo((o) => Math.max(0, o - LIMITE_POR_PAGINA))
          }
          onSiguiente={() => setOffsetTipo((o) => o + LIMITE_POR_PAGINA)}
        />
      ) : (
        <Paginacion
          pagina={pagina}
          totalPaginas={totalPaginas}
          onAnterior={() =>
            setOffset((o) => Math.max(0, o - LIMITE_POR_PAGINA))
          }
          onSiguiente={() => setOffset((o) => o + LIMITE_POR_PAGINA)}
        />
      )}
    </main>
  );
}
