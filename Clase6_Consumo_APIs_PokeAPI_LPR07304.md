**LPR07304 · Clase 6 · Consumo de APIs**

**Consumiendo**

**la PokeAPI**

fetch · async/await · manejo de errores · frontend propio

pokeapi.co  — 100% gratuita, sin API key, sin registro

**¿Qué es consumir?**

**HTTP + fetch**

**async / await**

**Manejo de errores**

**Tu frontend**

Prof. María García · UJAP 2026-2CR

> PORTADA. Arranca con la pregunta: '¿Alguno ha jugado Pokémon GO o conoce los Pokémon?' — casi todos. Explica que hoy van a consumir la PokeAPI oficial, la misma que usan apps reales. Al final de la clase tienen su propia Pokédex funcionando. Abre pokeapi.co en el navegador y muéstrala brevemente.

**Clase 4 vs Clase 6 — Construir vs Consumir**

**Clase 4 — Construiste una API**

**Tú eras el servidor** • Definiste los endpoints (/estudiantes) • Escribiste la lógica del backend • Respondiste con JSON • FastAPI generó el Swagger  Rol: **PROVEEDOR de datos**

**Clase 6 — Consumes una API ajena**

**Tú eres el cliente** • Llamas endpoints de otro servidor • Recibes JSON y lo procesas • Muestras los datos en tu frontend • Manejas errores de red y datos  Rol: **CONSUMIDOR de datos**

→

**El ciclo completo de una app real:**

**Tu Frontend (HTML/React/Next)  →  fetch()  →  PokeAPI  →  JSON  →  renderizar en pantalla**

> CONSTRUIR VS CONSUMIR. Este slide conecta con la clase 4. Pregunta: '¿Recuerdan el endpoint GET /estudiantes que hicieron? Hoy van a hacer lo mismo pero del lado del cliente — van a llamar a un GET de otra API.' El ciclo del final es lo más importante — dibújalo en la pizarra también.

**La PokeAPI — Explorando los endpoints**

**0–10 min**

**Endpoints que vamos a usar hoy**

.../pokemon/pikachu

→ Pokémon por nombre

.../pokemon/25

→ Pokémon por ID

.../pokemon?limit=20

→ Lista de 20 pokémon

.../type/fire

→ Pokémon de tipo fuego

.../pokemon/ditto

→ Datos de Ditto

La PokeAPI no requiere API key ni registro. Es pública, gratuita y tiene más de 800 Pokémon. Límite: 100 requests/IP/minuto — más que suficiente.

**Respuesta JSON de /pokemon/pikachu (simplificada)**

**JSON real**

{

"id": 25,

"name": "pikachu",

"height": 4,

"weight": 60,

"base_experience": 112,

"sprites": {

"front_default": "https://raw.githubusercontent.com/

PokeAPI/sprites/master/sprites/

pokemon/25.png",

"front_shiny": "https://..."

},

"types": [

{

"slot": 1,

"type": { "name": "electric", "url": "..." }

}

],

"stats": [

{ "base_stat": 35, "stat": { "name": "hp" } },

{ "base_stat": 55, "stat": { "name": "attack" } },

{ "base_stat": 40, "stat": { "name": "defense" } },

{ "base_stat": 90, "stat": { "name": "speed" } }

],

"abilities": [

{ "ability": { "name": "static" }, "is_hidden": false },

{ "ability": { "name": "lightning-rod"}, "is_hidden": true }

]

}

**🖥️  DEMO EN VIVO — Abrir pokeapi.co/api/v2/pokemon/pikachu en el navegador — leer el JSON juntos**

> POKEAPI. Abre el navegador y ve a pokeapi.co/api/v2/pokemon/pikachu. Muéstrales el JSON crudo. Instala la extensión 'JSON Formatter' en Chrome si no la tienes — hace el JSON legible. Pregunta: '¿Cómo obtenemos la imagen? ¿Cómo obtenemos solo el tipo?' — que busquen en el JSON. Eso entrena a leer documentación de APIs reales.

**fetch() y async/await — La forma correcta de consumir**

**10–25 min**

**Evolución: callback → Promise → async/await**

**async · await · try/catch**

// Forma antigua — callback hell

fetch('https://pokeapi.co/api/v2/pokemon/pikachu')

.then(function(response) {

return response.json();

})

.then(function(data) {

console.log(data.name);

})

.catch(function(error) {

console.error(error);

});

// Forma moderna — async/await (más legible)

async function getPokemon(nombre) {

try {

const url = \`https://pokeapi.co/api/v2/pokemon/${nombre}`;

const response = await fetch(url);

// Verificar que la respuesta fue exitosa

if (!response.ok) {

throw new Error(\`HTTP ${response.status}: ${nombre} no encontrado`);

}

const data = await response.json();

return data;

} catch (error) {

console.error('Error al obtener Pokémon:', error.message);

throw error;  // re-lanzar para que el llamador lo maneje

}

}

// Llamar la función

async function main() {

const pika = await getPokemon('pikachu');

console.log(pika.name);       // pikachu

console.log(pika.sprites.front_default); // URL imagen

console.log(pika.types\[0].type.name);    // electric

}

main();

**Lo que SIEMPRE debes hacer**

**✅ Verificar response.ok**

La request puede llegar pero con 404 o 500 — eso no es un error de red pero tampoco es éxito

**✅ try/catch siempre**

Las requests pueden fallar por red, por CORS, por servidor caído. Nunca asumas que funciona

**✅ await response.json()**

fetch() retorna una Promise de Response, no los datos directamente. Necesitas .json() para parsear

**✅ Mostrar estado al usuario**

Loading... Error... No results — el usuario debe saber qué está pasando, nunca pantalla en blanco

**Errores comunes al consumir APIs**

• No manejar el error de red → app se cuelga sin mensaje

• No verificar response.ok → leer JSON de un 404

• Olvidar await → usar la Promise como si fuera el dato

• No manejar CORS en desarrollo → error silencioso

**DEMO EN VIVO — Abrir VS Code — escribir getPokemon() en vivo en la consola del navegador**

> FETCH Y ASYNC/AWAIT. Abre el DevTools del navegador (F12 → Console) y escribe la función async/await en vivo. Ejecuta getPokemon('pikachu') y muestra el JSON. Luego prueba con un nombre que no existe: getPokemon('pokemoninventado') — muestra el error. Esto es más impactante que slides. Luego haz que ellos lo repliquen en su consola.

**CORS · Headers · API Keys — Lo que nadie te explica**

**25–35 min**

**Headers y fetch() con opciones**

**headers · POST · auth**

// Fetch con headers (para APIs que requieren autenticación)

async function fetchConAuth(url) {

const response = await fetch(url, {

method: 'GET',          // GET por defecto

headers: {

'Content-Type': 'application/json',

'Authorization': \`Bearer ${API_KEY}`,

'Accept': 'application/json',

},

});

return response.json();

}

// POST con body (para enviar datos)

async function crearEstudiante(datos) {

const response = await fetch('/api/estudiantes', {

method: 'POST',

headers: { 'Content-Type': 'application/json' },

body: JSON.stringify(datos),

});

if (!response.ok) {

const error = await response.json();

throw new Error(error.detail);

}

return response.json();

}

**CORS — Cross Origin Resource Sharing**

El navegador bloquea requests a otro dominio por seguridad.

La PokeAPI permite CORS → funciona sin problemas.

Tu FastAPI: agrega CORSMiddleware en main.py.

Si hay error CORS en dev: usa un proxy o extensión.

**API Keys — cómo manejarlas BIEN**

**Variables de entorno — NUNCA hardcodear keys**

**variables de entorno**

\# NUNCA hagas esto (visible en GitHub)

API_KEY = "sk-1234abcd..."

\# Usa variables de entorno

\# archivo .env (agrégalo a .gitignore)

POKEAPI_URL=https://pokeapi.co/api/v2

MI_API_KEY=sk-1234abcd...

\# En JS (Vite/Next.js):

const key = import.meta.env.VITE_API_KEY

// En Node.js:

const key = process.env.API_KEY

**Checklist de seguridad al consumir APIs**

❌ Nunca pongas API keys en el código fuente

❌ Nunca subas .env a Git (agrégalo a .gitignore)

✅ Usa variables de entorno siempre

✅ Para APIs públicas, documenta el rate limit

✅ Maneja los errores 401, 403, 429 explícitamente

La PokeAPI es pública y no necesita key. Perfecta para aprender. Pero en APIs reales (OpenAI, Stripe, Google Maps) SIEMPRE van variables de entorno.

> CORS Y HEADERS. El error de CORS es el más confuso para estudiantes nuevos — aclárate bien antes de explicarlo. La clave: CORS lo controla el SERVIDOR, no el cliente. La PokeAPI lo permite. Tu FastAPI de la clase 4 necesita CORSMiddleware (muéstralo rápido). Las API keys en .gitignore es un hábito profesional que deben internalizar desde hoy.

**Demo en vivo — Pokédex paso a paso**

**35–60 min**

*Construimos esto juntos en VS Code — HTML + CSS + JS vanilla*

**index.html — Pokédex completa**

**HTML + CSS + JS**

\<!DOCTYPE html>

\<html lang="es">

\<head>

\<meta charset="UTF-8">

\<title>Pokédex UJAP\</title>

\<style>

\* { box-sizing: border-box; margin: 0; padding: 0; }

body { background: #1a1a2e; color: white; font-family: Arial; padding: 20px; }

h1 { color: #FFD700; text-align: center; margin-bottom: 20px; }

.busqueda { display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; }

input { padding: 10px; border-radius: 8px; border: none; font-size: 16px; width: 250px; }

button { padding: 10px 20px; background: #CC0000; color: white;

border: none; border-radius: 8px; cursor: pointer; font-size: 16px; }

button:hover { background: #FF0000; }

#resultado { text-align: center; }

.card { background: #16213e; border-radius: 16px; padding: 20px;

display: inline-block; min-width: 250px; margin-top: 10px; }

.card img { width: 150px; height: 150px; }

.nombre { font-size: 28px; font-weight: bold; text-transform: capitalize;

color: #FFD700; }

.tipos span { background: #CC0000; padding: 4px 12px; border-radius: 20px;

margin: 4px; display: inline-block; font-size: 14px; }

.stats { text-align: left; margin-top: 12px; }

.stat-bar { background: #333; border-radius: 4px; height: 8px; margin: 4px 0; }

.stat-fill { background: #FFD700; height: 8px; border-radius: 4px; }

#error { color: #FF6B6B; font-size: 18px; }

#loading { color: #06B6D4; font-size: 18px; }

\</style>

\</head>

\<body>

\<h1>🎮 Pokédex UJAP\</h1>

\<div class="busqueda">

\<input id="inputPoke" type="text" placeholder="pikachu, charizard, 25..." />

\<button onclick="buscar()">Buscar\</button>

\</div>

\<div id="resultado">\</div>

\<script>

const BASE = 'https://pokeapi.co/api/v2';

async function getPokemon(query) {

const url = \`${BASE}/pokemon/${query.toLowerCase().trim()}`;

const res = await fetch(url);

if (!res.ok) throw new Error(\`${query} no encontrado (HTTP ${res.status})`);

return res.json();

}

function renderPokemon(p) {

const tipos = p.types.map(t =>

\`\<span>${t.type.name}\</span>`).join('');

const stats = p.stats.map(s =>

`\<div>${s.stat.name}: ${s.base_stat}

\<div class="stat-bar">

\<div class="stat-fill" style="width:${s.base_stat/255*100}%">\</div>

\</div>

\</div>`).join('');

return `

\<div class="card">

\<img src="${p.sprites.front_default}" alt="${p.name}">

\<div class="nombre">#${p.id} ${p.name}\</div>

\<div class="tipos">${tipos}\</div>

\<div class="stats">${stats}\</div>

\</div>`;

}

async function buscar() {

const query = document.getElementById('inputPoke').value;

const div = document.getElementById('resultado');

if (!query) return;

div.innerHTML = '\<p id="loading">⏳ Buscando...\</p>';

try {

const pokemon = await getPokemon(query);

div.innerHTML = renderPokemon(pokemon);

} catch (err) {

div.innerHTML = \`\<p id="error">❌ ${err.message}\</p>`;

}

}

// Buscar con Enter

document.getElementById('inputPoke')

.addEventListener('keypress', e => {

if (e.key === 'Enter') buscar();

});

\</script>

\</body>

\</html>

**Pasos de la demo**

**1**

**HTML base**

Crear index.html con input y botón

**2**

**fetch básico**

getPokemon() en consola, ver JSON

**3**

**Mostrar imagen**

sprites.front_default en un \<img>

**4**

**Tipos**

p.types.map() → badges de colores

**5**

**Stats**

p.stats.map() → barras de progreso

**6**

**Error handling**

try/catch + mensaje de error visible

**7**

**Enter key**

keypress listener para UX mejor

> DEMO EN VIVO. Este es el corazón de la clase. Hay que construir el archivo index.html desde cero en VS Code — no lo pegues todo de golpe. Ve paso a paso: primero el HTML vacío, luego la función fetch, luego mostrar solo el nombre, luego la imagen, luego los tipos, luego los stats. Cada paso que añades, refresca el navegador y muéstralo. Los estudiantes van replicando en sus laptops al mismo tiempo. Si alguien usa React o Next.js, la lógica de getPokemon() es idéntica — solo cambia cómo renderizan.

**Más allá de uno — Listar, paginar y filtrar**

**60–75 min**

**Listar Pokémon con paginación**

**Promise.all · paginación**

// Obtener lista de pokémon

async function getListaPokemon(limite=20, offset=0) {

const url = \`https://pokeapi.co/api/v2/pokemon` +

\`?limit=${limite}&offset=${offset}`;

const res = await fetch(url);

if (!res.ok) throw new Error('Error al cargar lista');

const data = await res.json();

// data.results = \[{name: "bulbasaur", url: "..."}, ...]

// data.count = total de pokémon (más de 1000)

return data;

}

// Cargar detalles de cada uno (con Promise.all para hacerlo en paralelo)

async function getDetallesLista(limite=20) {

const lista = await getListaPokemon(limite);

// Promise.all: lanza todas las requests AL MISMO TIEMPO

// En lugar de esperar una por una (seria muy lento)

const detalles = await Promise.all(

lista.results.map(p => fetch(p.url).then(r => r.json()))

);

return detalles;

}

// Mostrar grid de pokémon

async function cargarGrid() {

const div = document.getElementById('grid');

div.innerHTML = '\<p>⏳ Cargando primera generación...\</p>';

try {

const pokemones = await getDetallesLista(151); // Gen 1

div.innerHTML = pokemones.map(p => `

\<div class="mini-card" onclick="verDetalle('${p.name}')">

\<img src="${p.sprites.front_default}" alt="${p.name}">

\<p>#${p.id} ${p.name}\</p>

\</div>

`).join('');

} catch(err) {

div.innerHTML = \`\<p>❌ ${err.message}\</p>`;

}

}

**Promise.all vs requests secuenciales**

**Secuencial vs Paralelo**

**paralelo vs serie**

// ❌ LENTO — espera uno por uno

for (const poke of lista) {

const detalle = await fetch(poke.url); // 151 requests

}                                         // en serie = ~15 seg

// ✅ RÁPIDO — todos al mismo tiempo

const detalles = await Promise.all(

lista.map(p => fetch(p.url).then(r => r.json()))

);                        // 151 requests en paralelo = ~1 seg

💡  Promise.all falla si UNA sola falla. Para tolerancia a fallos usa Promise.allSettled() — retorna tanto los éxitos como los errores.

**⚡ Tu Pokédex con lista (10 min)**

1\. Agrega un botón 'Cargar Gen 1' que muestre los 151 pokémon originales en un grid

2\. Cada tarjeta muestra imagen, nombre e ID

3\. Al hacer clic en una tarjeta, muestra el detalle completo del pokémon elegido

> LISTA Y PROMISE.ALL. La diferencia secuencial vs paralelo es visual — cronometra en vivo cuánto tarda cargar 20 pokémon uno por uno vs con Promise.all. El impacto es inmediato. Esto conecta con las goroutines de Go que vieron — mismo concepto, diferente sintaxis: en Go usas goroutines + WaitGroup, en JS usas Promise.all.