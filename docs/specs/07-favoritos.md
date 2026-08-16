# Fase 7 — Favoritos por cuenta (login + localStorage)

> Requisito Nivel 3: "Favoritos con `localStorage`".
> Decisión del usuario: los favoritos son **por cuenta**, con **login contra el
> backend FastAPI** (adelanta parte de la Fase 10) y la **sesión es local** (se
> pierde al cerrar el navegador).
> Status: **implementado** (14-ago-2026)

## Objetivo

Permitir marcar Pokémon como **favoritos por usuario**, con una cuenta propia
(registro/login), y que persistan entre sesiones **en el navegador** por usuario.

## Diseño de datos

- **Sesión:** `sessionStorage["sesion"]` → `{ username, token }`. Se pierde al
  cerrar el navegador → al abrir se pide login otra vez.
- **Favoritos:** `localStorage["favoritos:{username}"]` → `number[]` (IDs de
  Pokémon). Sobreviven a recargas y a cerrar el navegador, por usuario.
- **Backend (fuente de verdad):** al iniciar sesión se traen los favoritos de la
  cuenta desde FastAPI y se escriben en `localStorage`; si el backend está caído,
  se leen los locales como respaldo (con aviso).

## Hook `useFavorites(sesion)` (patrón real)

```tsx
export function useFavorites(sesion: Sesion | null) {
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [idsBackend, setIdsBackend] = useState<Record<number, number>>({});
  const [sincronizando, setSincronizando] = useState(false);
  const [errorSync, setErrorSync] = useState(false);

  useEffect(() => {
    // sin sesión → se limpia; con sesión → getFavoritos(token)
    //   OK: setFavoritos + localStorage   |   fallo: leerLocales + errorSync
  }, [sesion]);

  const alternar = (id, nombre) => {
    // optimista: actualiza estado + localStorage y luego POST/DELETE al backend
  };
  const esFavorito = (id) => favoritos.includes(id);

  return { favoritos, alternar, esFavorito, sincronizando, errorSync };
}
```

`idsBackend` guarda `pokemon_id → id` del backend para poder borrar por ese ID.

## Archivos creados/modificados

| Archivo | Responsabilidad |
|---|---|
| `lib/constants.ts` | `BACKEND_URL = "http://127.0.0.1:8000"` |
| `lib/apiBackend.ts` | `registrar`, `iniciarSesion`, `getFavoritos`, `guardarFavorito`, `eliminarFavorito` (`response.ok` + `try/catch`) |
| `hooks/useSesion.ts` | Sesión en `sessionStorage` (SSR-safe), `iniciar`/`cerrar` |
| `hooks/useFavorites.ts` | Lógica por cuenta + localStorage + sync con backend |
| `components/Login.tsx` | Pantalla de acceso: usuario/contraseña, "Ingresar" / "Registrarme", estados loading/error |
| `components/BotonFavorito.tsx` | Corazón ★/☆ con `aria-pressed`, `stopPropagation()` |
| `components/PokeCard.tsx` | Corazón absoluto arriba a la derecha |
| `components/PokeDetalle.tsx` | Corazón junto al nombre |
| `app/page.tsx` | Login como puerta de entrada; botón "★ Favoritos (n)"; vista "Mis favoritos" |

## Flujo

1. Sin sesión → pantalla `Login` (registro o ingreso contra FastAPI).
2. Con sesión → Pokédex completa; header con "Hola, {usuario}" + "Salir".
3. Corazón en cada `PokeCard` y en el detalle; al pulsar, `alternar(id, nombre)`
   (optimista: local primero, backend después).
4. Botón "★ Favoritos (n)" en cabecera → vista "Mis favoritos": grid con los
   favoritos del usuario (`useDetallesPokemon`); al quitar un ★ desaparece.
5. Si el backend falla al sincronizar, los cambios quedan en `localStorage` y se
   muestra un aviso en la vista de favoritos.

## Consideraciones

- `localStorage`/`sessionStorage` se acceden **solo en el cliente** (dentro de
  `useEffect` o verificando `typeof window`) → sin errores de SSR/hidratación.
- La sesión se pierde al cerrar el navegador (por decisión del usuario); los
  favoritos quedan guardados por usuario en `localStorage` y se re-sincronizan
  desde el backend al volver a entrar.
- El login es **puerta de entrada**: sin sesión no se accede a la Pokédex.

## Criterios de verificación (estado)

- [x] Registro/login funcionan contra FastAPI (409 duplicado, 401 contraseña mala).
- [x] Favoritos por usuario: cada cuenta tiene su propia lista (backend + localStorage).
- [x] Marcar favorito persiste tras recargar la página.
- [x] Quitar favorito lo elimina también de forma persistente.
- [x] El corazón refleja el estado correcto en grid y detalle.
- [x] Sin errores de hidratación/SSR al acceder a `localStorage`/`sessionStorage`.
- [x] Al cerrar el navegador se pide login otra vez (la sesión se pierde).
- [x] La vista "Mis favoritos" muestra las cards correctas.
