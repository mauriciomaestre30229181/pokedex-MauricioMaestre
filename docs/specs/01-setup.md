# Fase 1 — Setup del proyecto Next.js

> Basado en `00-overview.md` y `AGENTS.md`. Sin UI aún — solo esqueleto y tema.

## Objetivo

Crear el proyecto **Next.js (App Router) + TypeScript + Tailwind CSS** y preparar la
estructura base con tokens de tema y limpieza del boilerplate.

## Pasos

### 1. Crear el proyecto

Desde la raíz `pokemonProyecto/` (la carpeta ya tiene `.md` de teoría; create-next-app
no los borra si no chocan — confirmar al prompt):

```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*"
```

Opciones elegidas: TypeScript, Tailwind, App Router, ESLint, sin carpeta `src/`,
alias de imports `@/*`.

### 2. Estructura base a tener

```
app/
├── layout.tsx        # metadatos + fuentes + <html lang="es">
├── page.tsx          # página base (se reemplaza en Fase 2)
├── globals.css       # tokens CSS + resets
└── favicon.ico
```

### 3. Tokens de tema (globals.css + tailwind)

Definir tokens con `@theme` (Tailwind v4) o variables CSS con la dirección que la
skill de diseño defina. Mínimo inicial:

```css
:root {
  --bg: #0f172a;          /* fondo oscuro base */
  --surface: #1e293b;     /* tarjetas */
  --texto: #f8fafc;       /* texto principal */
  --acento: #fbbf24;      /* acento dorado */
}
```

Los colores por tipo (fire, water, grass...) se agregan en la Fase 2 con la skill
de diseño. No fijar la paleta completa aquí si la skill la va a definir.

### 4. Limpiar boilerplate

- `app/page.tsx`: reemplazar el contenido de ejemplo por un encabezado simple "Pokédex UJAP".
- `app/layout.tsx`: `lang="es"`, título "Pokédex UJAP", metadatos.
- Borrar SVGs de ejemplo en `public/` que no se usen.

### 5. .gitignore

Verificar que `.gitignore` incluya `node_modules/`, `.next/`, `.env*` (nunca subir
claves). Git es local, pero el hábito se mantiene.

## Archivos afectados

- `package.json` (scripts: `dev`, `build`, `lint`)
- `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- `.gitignore`

## Criterios de verificación

- [ ] `npm run dev` levanta en http://localhost:3000 sin errores.
- [ ] Página muestra "Pokédex UJAP" y `lang="es"`.
- [ ] `npm run build` termina sin errores.
- [ ] No hay archivos de ejemplo sin usar.
