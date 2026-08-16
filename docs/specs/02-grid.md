# Fase 2 — Grid de 20 Pokémon + hook `useFetch`

> Requisito Nivel 2: "Grid de los primeros 20 Pokémon al cargar".
> Requisito Nivel 3: hook propio `useFetch` + `useState`/`useEffect`.

## Objetivo

Cargar los **primeros 20 Pokémon** al abrir la app y mostrarlos en un grid con
imagen, nombre e ID, con estados loading/error. Incluye el hook reutilizable `useFetch`.

> **ANTES DE CUALQUIER UI:** cargar `.opencode/skills/frontend-design-direction/SKILL.md`
> y fijar la dirección visual (paleta, tipografía, layout del grid). Esta es la fase
> donde la skill define la dirección concreta del proyecto.

## API a usar

```
GET https://pokeapi.co/api/v2/pokemon?limit=20&offset=0
→ data.results: [{ name, url }]
→ data.count: total
```

Para cada Pokémon de la lista hay que pedir el detalle (sprites, types) y cargarlos
**en paralelo** con `Promise.all` (Clase 6).

## Archivos a crear

| Archivo | Responsabilidad |
|---|---|
| `lib/types.ts` | Tipos TS: `Pokemon`, `PokemonListItem`, `PokemonList` |
| `lib/constants.ts` | `BASE_URL = "https://pokeapi.co/api/v2"` |
| `hooks/useFetch.ts` | Hook genérico `useFetch<T>(url)` → `{ data, loading, error, reload }` |
| `components/PokeCard.tsx` | Tarjeta individual (imagen, nombre, ID, tipos) |
| `app/page.tsx` | Grid: `useFetch` de la lista + `Promise.all` de detalles + grid |

## Hook `useFetch` (patrón)

```tsx
export function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { cargar(); }, [cargar]);
  return { data, loading, error, reload: cargar };
}
```

## Flujo de la página

1. `useFetch` del endpoint de lista (limit=20).
2. Con `data.results`, disparar `Promise.all` de detalles (sprites + types).
3. Renderizar:

```
loading  →  "Cargando Pokémon…"
error    →  mensaje de error + botón reintentar
ok       →  grid responsivo de <PokeCard />
```

## Criterios de verificación

- [ ] Al cargar aparecen 20 Pokémon con imagen, nombre e ID.
- [ ] Estado de carga visible durante la petición.
- [ ] Si la API falla, se muestra error y no pantalla en blanco.
- [ ] El hook `useFetch` es genérico y reutilizable (no hardcodea PokeAPI).
- [ ] El grid es responsive (1 col en móvil → 4+ en escritorio).
- [ ] Se aplicó la skill de diseño (checklist revisado).
