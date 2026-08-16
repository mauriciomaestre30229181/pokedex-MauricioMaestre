# Fase 3 — Búsqueda parcial con debounce + detalle

> Requisito Nivel 3: "Barra de búsqueda con debounce".

## Objetivo

Buscar un Pokémon **mientras se escribe** con **debounce (400 ms)**: al pausar, se
muestran las **coincidencias por prefijo** (ej. "pikac" → pikachu). Al tocar una
coincidencia (o si hay una sola, o si se busca por ID numérico) se muestra el
**detalle completo** (imagen, tipos, altura, peso, habilidades, stats) sin recargar.

> PokeAPI no ofrece búsqueda parcial: se cargan **una vez** todos los nombres
> (`/pokemon?limit=10000`, ~1351) y se filtran en el cliente (prefijo, solo
> especies base sin guiones, máx. 12 coincidencias).

## API a usar

```
GET /pokemon?limit=10000&offset=0      → lista completa de nombres (1 sola vez)
GET /pokemon/{name|id}                 → detalle de la coincidencia elegida
```

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `hooks/useDebounce.ts` | Hook genérico de debounce (400 ms) |
| `lib/pokeapi.ts` | `obtenerTodosLosNombres()` (con caché de módulo) + `filtrarPorPrefijo()` |
| `lib/constants.ts` | `MAX_COINCIDENCIAS = 12` + `ESTADISTICAS_ES` (nombres en español) |
| `components/Buscador.tsx` | Input con debounce + botón ✕ para limpiar |
| `components/PokeDetalle.tsx` | Card grande de detalle (inline, reemplaza el grid) |
| `app/page.tsx` | Estado de búsqueda + render condicional |

## Flujo

1. Input → `consulta` (sin normalizar) → `useDebounce(consulta, 400)`.
2. Al estabilizarse, `filtrarPorPrefijo(nombres, busqueda)`.
3. Render condicional:
   - Búsqueda vacía → grid normal (Fase 2).
   - **Numérica** ("25") o **una sola coincidencia** → `useFetch` del detalle:
     - loading → "Buscando…"
     - error (404) → "No se encontró «X»"
     - ok → `PokeDetalle`
   - **Varias coincidencias** → mini-grid de `PokeCard` (detalles con `Promise.all`);
     al hacer clic en una, la consulta pasa a ser su nombre exacto → detalle.
   - **Sin coincidencias** → "No se encontró ningún Pokémon para «X»".

## Detalle (PokeDetalle)

- Sprite protagonista sobre escenario del color de su tipo (coherente con el grid).
- Altura (dm→m) y peso (hg→kg).
- Habilidades como chips.
- Stats con barras `width: base_stat/255*100%` del color del tipo; nombres en
  español (`ESTADISTICAS_ES`: PS, Ataque, Defensa, At. Esp., Def. Esp., Velocidad).
- Sin tarjetas dentro de tarjetas (superficie + separadores).

## Criterios de verificación

- [ ] Escribir "pikac" y pausar → aparece pikachu (coincidencia → detalle).
- [ ] Escribir "cha" → aparecen las especies que empiezan con "cha".
- [ ] Escribir "25" → detalle de pikachu (por ID).
- [ ] "zzz" → mensaje de "no se encontró".
- [ ] Vaciar el input → vuelve el grid de los 20.
- [ ] No se dispara un fetch por cada tecla (debounce) y la lista de nombres
      se carga una sola vez (caché).
