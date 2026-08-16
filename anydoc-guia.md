# Guía de anydoc

Todo lo que necesitas saber sobre **anydoc** y cómo usarlo por CLI y en código.

---

## 1. ¿Qué es anydoc?

**anydoc** es una librería de código abierto (MIT) hecha en **Rust** por [Firecrawl](https://firecrawl.dev).
Convierte documentos de oficina en **Markdown tipo GitHub (GFM)**:

| Formato | Extensiones |
|---|---|
| Word | `.doc`, `.docx`, `.docm` |
| PowerPoint | `.ppt`, `.pps`, `.pot`, `.pptx`, `.pptm`, `.ppsx`, `.ppsm` |
| Excel | `.xls`, `.xlsx`, `.xlsm`, `.xlsb` |
| OpenDocument | `.odt`, `.ods`, `.odp` |
| Rich Text Format | `.rtf` |
| EPUB | `.epub` |
| CSV | `.csv` |
| PDF | `.pdf` (texto puro, sin OCR) |

- **Gratis**, sin registro, sin API key, sin servicios externos.
- Tiene versiones para **Node.js, Python, browser (WebAssembly) y CLI**.

---

## 2. ¿Cómo funciona?

1. **Detección por contenido, no por extensión**: lee las "firmas" internas del archivo
   (header de PDF, open group de RTF, stream names de OLE, mimetype de ZIP).
   Así un archivo mal nombrado igual se convierte bien. El **CSV no tiene firma**,
   por eso necesita que se lo digas explícitamente.
2. **Modelo de documento único**: cada formato se parsea a un modelo compartido
   (bloques, tablas, notas, assets) y un **mismo serializador GFM** genera el Markdown.
   Por eso el resultado es consistente entre formatos.
3. **PDF**: los PDF de texto se convierten localmente con `pdf-inspector` (sin OCR).
   Los escaneados necesitan OCR, que es lo que agrega [Firecrawl Parse](https://firecrawl.dev/parse).
4. **Rápido**: Rust puro, sin modelos de ML. Mediana de conversión < 5 ms por documento.
5. **Errores tipados**: `Unsupported`, `Malformed`, `Encrypted`, `ResourceLimit`,
   `MissingPart`, `Io`. En JS salen en `error.code`; en Python son subclases de `ConvertError`.
6. **Extras**: imágenes y objetos embebidos (quedan como alt text + bytes en el modelo),
   notas de hablante, tablas con celdas fusionadas, listas anidadas, notas al pie.

---

## 3. Guía de CLI desde cero

> Si nunca has usado una terminal, empieza aquí.

### 3.1 ¿Qué es la terminal?

La terminal (en Windows: **PowerShell** o **CMD**) es una ventana donde escribes
**comandos de texto** en lugar de hacer clic.

**Cómo abrirla**: pulsa la tecla `Windows`, escribe `PowerShell` y pulsa `Enter`.

### 3.2 ¿Qué son Node.js y npm/npx?

- **Node.js** es un programa que ejecuta herramientas de JavaScript en tu computadora.
- **npm** viene con Node.js y es la "tienda" de herramientas.
- **npx** permite usar una herramienta de esa tienda **sin instalarla**.

**Comprobar si lo tienes** (en PowerShell):
```
node -v
```
- Si muestra algo como `v20.10.0` → ya lo tienes.
- Si dice "no se reconoce" → instálalo desde https://nodejs.org (versión LTS).

### 3.3 El comando básico

```
npx @firecrawl/anydoc TU_ARCHIVO.docx
```

| Parte | Qué significa |
|---|---|
| `npx` | descarga y ejecuta una herramienta |
| `@firecrawl/anydoc` | el nombre de la herramienta |
| `TU_ARCHIVO.docx` | la ruta del archivo a convertir |

La primera vez se descarga la herramienta (unos segundos) y luego muestra el **Markdown en pantalla**.

### 3.4 Guardar el resultado en un archivo

```
npx @firecrawl/anydoc informe.docx -o informe.md
```

Crea el archivo `informe.md` con el contenido convertido.

### 3.5 Navegar a la carpeta de tu archivo

Por defecto la terminal empieza en tu carpeta de usuario. Para ir a tu proyecto:

```
cd "OneDrive\Escritorio\pokemonProyecto"
```

(`cd` = "change directory" = cambiar de carpeta)

### 3.6 Ejemplos útiles

```
# Convertir un PDF
npx @firecrawl/anydoc documento.pdf -o documento.md

# Convertir una presentación
npx @firecrawl/anydoc presentacion.pptx -o presentacion.md

# Convertir un Excel
npx @firecrawl/anydoc datos.xlsx -o datos.md

# Leer desde entrada estándar (stdin), indicando el formato
npx @firecrawl/anydoc - --format csv < data.csv

# Ver todas las opciones
npx @firecrawl/anydoc --help
```

### 3.7 Instalar el comando permanentemente

```
npm install -g @firecrawl/anydoc
```

Después puedes usar `anydoc` directamente (sin `npx`).

---

## 4. Implementación en código

### CLI (un solo archivo)

```bash
npx @firecrawl/anydoc report.docx -o report.md
npx @firecrawl/anydoc - --format csv < data.csv
```

### Node.js

```bash
npm install @firecrawl/anydoc
```

```js
import { toMarkdown, toMarkdownBytes, toDocument } from '@firecrawl/anydoc';

// Desde una ruta de archivo:
const markdown = await toMarkdown('report.docx');

// Desde bytes, con el formato detectado por contenido:
const fromBytes = await toMarkdownBytes(bytes);

// O indicándolo (los formatos sin firma, como CSV, lo necesitan):
const fromCsv = await toMarkdownBytes(bytes, 'csv');

// O quedarte con el modelo de documento (trae los assets embebidos):
const document = await toDocument(bytes);
```

### Python

```bash
pip install firecrawl-anydoc
```

```python
import anydoc

markdown = anydoc.to_markdown("report.docx")
markdown = anydoc.to_markdown_bytes(data, "csv")
document = anydoc.to_document(data)
```

### Browser / WebAssembly (todo local, los archivos no salen de tu máquina)

```bash
npm install @firecrawl/anydoc-wasm
```

```js
import init, { toMarkdownBytes } from '@firecrawl/anydoc-wasm';

await init();

const markdown = toMarkdownBytes(bytes);
const fromCsv = toMarkdownBytes(bytes, 'csv');
const document = toDocument(bytes);
```

### Rust

```bash
cargo add anydoc
```

```rust
let markdown = anydoc::to_markdown("report.docx")?;
let markdown = anydoc::to_markdown_bytes(&bytes, None)?;
let markdown = anydoc::to_markdown_bytes(&bytes, anydoc::Format::Csv)?;
let document = anydoc::to_document(&bytes, None)?;
```

### Detección de formato (las tres funciones en Node / Python)

```rust
anydoc::Format::from_bytes(&bytes);              // Some(Format::Docx)
anydoc::Format::from_extension("pptm");          // Some(Format::Pptx)
anydoc::Format::from_path(Path::new("report.odt"));
```

---

## 5. Errores

Una conversión devuelve `Err` solo cuando no puede salir nada útil del archivo:

| Variante | Significado |
|---|---|
| `Unsupported` | Formato desconocido, o uno que no se puede convertir (un PDF solo de imágenes) |
| `Malformed` | Estructuralmente inservible |
| `Encrypted` | Encriptado o protegido con contraseña |
| `ResourceLimit` | Cruzó un límite de seguridad (descompresión, anidación, nodos) |
| `MissingPart` | Falta una parte necesaria para el contenido |
| `Io` | El archivo no se pudo leer (solo `to_markdown`) |

En Node/WASM el nombre sale en `error.code`; en Python se lanza una subclase de `ConvertError` por variante (u `OSError` si no se puede leer).

---

## 6. Casos de uso y notas

- **Pipelines RAG/LLM**: recibes documentos mixtos (Word, PPT, Excel, PDF) y necesitas un Markdown limpio y consistente.
- **Pre-procesado**: pasar documentos a un LLM en un formato legible.
- **Adjuntos**: extraer contenido de archivos subidos por usuarios.

**Notas importantes**:
- Los PDF **escaneados** (imágenes) necesitan OCR → para eso existe Firecrawl Parse (de pago).
- El **CSV** no tiene firma interna → siempre indícale el formato.
- En el benchmark público, anydoc fue el único que cubrió los 14 formatos y el más rápido.

---

## Recursos

- Demo en browser (convierte local, los archivos nunca salen de tu máquina): https://firecrawl.github.io/anydoc/
- Repositorio: https://github.com/firecrawl/anydoc
- npm: https://www.npmjs.com/package/@firecrawl/anydoc
- PyPI: https://pypi.org/project/firecrawl-anydoc/
- crates.io: https://crates.io/crates/anydoc
