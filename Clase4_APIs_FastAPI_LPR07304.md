**LPR07304 · Clase 4 · Laboratorio**

**APIs &**

**FastAPI**

De HTTP a tu primera API REST en Python

**¿Qué es una API?**

**HTTP y REST**

**FastAPI setup**

**CRUD completo**

python -m pip install fastapi uvicorn  ·  Prof. María García  ·  UJAP 2026-2CR

> PORTADA. Pregunta de arranque: '¿Alguien ha consumido una API alguna vez? ¿Cuándo usaron fetch() en JS o requests en Python?' Deja que respondan. Explica que hoy van a construir su propia API — no solo consumirla. Pide que instalen FastAPI ahora: pip install fastapi uvicorn

**¿Qué es una API y por qué importa?**

**API** (Application Programming Interface) = **contrato entre dos programas** que define cómo se comunican sin conocer los detalles internos del otro.

👤

**Cliente**

**(tu app)**

→

🧾

**Menú / API**

**(contrato)**

→

👨‍🍳

**Cocina**

**(servidor)**

→

🍽️

**Respuesta**

**(JSON/datos)**

**APIs que ya conocen (o usan sin saberlo):**

**⚡ Google Maps API**

→ app de taxi calcula ruta

**⚡ WhatsApp API**

→ empresas envían mensajes automáticos

**⚡ Stripe API**

→ procesar pagos en cualquier app

**⚡ OpenAI API**

→ agregar IA a tu propia aplicación

**🚀  tu API 🚀 — lo que van a construir hoy**

> APIs. La analogía del restaurante es la más efectiva. El cliente (frontend/app) no sabe cómo funciona la cocina (backend/DB) — solo conoce el menú (API). Pregunta: '¿Cuándo usaron fetch() o axios en JS para traer datos?' — eso era consumir una API. Hoy construyen la cocina.

**HTTP y REST — El idioma de las APIs**

**0–15 min**

**Verbos HTTP → operaciones CRUD**

**GET**

**READ**

Obtener datos

/estudiantes

**POST**

**CREATE**

Crear nuevo registro

/estudiantes

**PUT**

**UPDATE**

Actualizar completo

/estudiantes/1

**PATCH**

**UPDATE**

Actualizar parcial

/estudiantes/1

**DELETE**

**DELETE**

Eliminar registro

/estudiantes/1

**Códigos de respuesta más comunes**

200 OK

→ éxito

201 Created

→ creado

400 Bad Request

→ error cliente

404 Not Found

→ no existe

422 Unprocessable

→ validación

500 Server Error

→ bug tuyo

**Anatomía de una request/response HTTP**

**request·response**

\# REQUEST (el cliente envía):

GET /estudiantes/1 HTTP/1.1

Host: api.ujap.edu.ve

Authorization: Bearer eyJhbGc...

Content-Type: application/json

\# RESPONSE (el servidor responde):

HTTP/1.1 200 OK

Content-Type: application/json

{

"id": 1,

"nombre": "Ana García",

"nota": 18.5,

"letra": "A"

}

**Principios REST**

📍  URLs como recursos: /estudiantes, /cursos/3

🔄  Sin estado (stateless): cada request es independiente

📦  Respuestas en JSON (en APIs modernas)

🔑  Verbos HTTP para las operaciones

> HTTP Y REST. Dibuja en la pizarra el ciclo request-response: cliente → servidor → cliente. El concepto más importante: REST no es un protocolo, es un estilo arquitectónico. Los verbos HTTP mapean a CRUD — eso es lo que van a implementar hoy. Pregunta: '¿Por qué GET no debería modificar datos?' → Idempotencia.

**Setup de FastAPI — De cero a servidor en 5 min**

**15–25 min**

● ● ●

Terminal

\# 1. Instalar dependencias

pip install fastapi uvicorn

\# 2. Crear archivo main.py

\# (en VS Code o cualquier editor)

\# 3. Ejecutar el servidor

uvicorn main:app --reload

\# Verás algo así:

INFO:     Uvicorn running on http://127.0.0.1:8000

INFO:     Started reloader process

INFO:     Application startup complete.

\# 4. Abrir en el navegador:

http://127.0.0.1:8000          → tu API

http://127.0.0.1:8000/docs     → Swagger UI ✨

http://127.0.0.1:8000/redoc    → ReDoc

**main.py — Tu primera API FastAPI**

**primer endpoint**

from fastapi import FastAPI

\# Crear la aplicación

app = FastAPI(

title="API de Estudiantes",

description="Sistema de notas UJAP",

version="1.0.0"

)

\# Tu primer endpoint

@app.get("/")

def bienvenida():

return {

"mensaje": "¡API funcionando! 🚀",

"version": "1.0.0"

}

@app.get("/salud")

def salud():

return {"estado": "OK"}

**¿Por qué FastAPI y no Flask o Django REST?**

**⚡ Rendimiento**

Comparable a Node.js y Go — basado en Starlette y asyncio

**📝 Swagger auto**

Documentación interactiva generada automáticamente

**🔍 Validación**

Pydantic valida tipos automáticamente — sin código extra

**🐍 Type hints**

Usa las type hints de Python 3.6+ de forma nativa

**⚡ Ejercicio (8 min)**

Crea main.py, instala FastAPI y uvicorn, levanta el servidor. Abre /docs en el navegador — deberías ver Swagger UI. Agrega un endpoint GET /hola/{nombre} que retorne {'saludo': 'Hola, {nombre}!'}

> SETUP. El momento wow de esta clase es cuando abren /docs y ven el Swagger UI generado automáticamente. Eso los engancha. Caminá por el laboratorio y asegúrate de que todos tengan el servidor corriendo antes de seguir. --reload hace que el servidor se reinicie solo cuando guardas cambios — explícalo.

**Modelos con Pydantic — Validación automática**

**25–40 min**

**Modelos Pydantic en FastAPI**

**pydantic · validation**

from fastapi import FastAPI

from pydantic import BaseModel, Field, validator

from typing import Optional, List

from enum import Enum

app = FastAPI()

\# Enum para la letra

class Letra(str, Enum):

A = "A"

B = "B"

C = "C"

F = "F"

\# Modelo de entrada (lo que recibe la API)

class EstudianteIn(BaseModel):

nombre: str = Field(..., min_length=2, max_length=50)

nota: float = Field(..., ge=0, le=20)

activo: bool = True

@validator("nota")

def nota_valida(cls, v):

return round(v, 2)

\# Modelo de salida (lo que retorna la API)

class EstudianteOut(EstudianteIn):

id: int

letra: str

@property

def calcular_letra(self) -> str:

if self.nota >= 17: return "A"

if self.nota >= 14: return "B"

if self.nota >= 10: return "C"

return "F"

\# Simulación de base de datos (lista en memoria)

db: List\[dict] = \[]

contador = 0

@app.post("/estudiantes", response_model=EstudianteOut,

status_code=201)

def crear_estudiante(estudiante: EstudianteIn):

global contador

contador += 1

letra = "A" if estudiante.nota>=17 else             "B" if estudiante.nota>=14 else             "C" if estudiante.nota>=10 else "F"

nuevo = {"id": contador, \**estudiante.dict(),

"letra": letra}

db.append(nuevo)

return nuevo

**¿Qué valida Pydantic?**

Field(min_length=2)

→ longitud mínima de string

Field(ge=0, le=20)

→ rango numérico (0≤x≤20)

@validator

→ lógica personalizada

Optional\[T]

→ campo opcional

List\[T]

→ lista tipada

Enum

→ valores permitidos

💡  Si mandas nota=25 o nombre='', FastAPI retorna 422 automáticamente — sin escribir una línea de validación.

**⚡ Ejercicio (12 min)**

Agrega el modelo EstudianteIn y el endpoint POST /estudiantes. Pruébalo desde Swagger UI con nota=18.5 y luego con nota=99 — observa el error 422. Agrega un campo 'cedula' con validación de longitud 7-8 dígitos.

> PYDANTIC. Esto es lo que más les va a sorprender — validación automática sin código extra. Muestra en Swagger UI qué pasa cuando mandas datos inválidos. La diferencia clave entre EstudianteIn (lo que recibe) y EstudianteOut (lo que retorna) es el patrón más importante de FastAPI — separa lo que el usuario puede enviar de lo que la API expone.

**CRUD Completo — GET · POST · PUT · DELETE**

**40–65 min**

**CRUD de Estudiantes**

**CRUD completo**

from fastapi import FastAPI, HTTPException

from pydantic import BaseModel, Field

from typing import List, Optional

app = FastAPI()

class EstudianteIn(BaseModel):

nombre: str = Field(..., min_length=2)

nota: float = Field(..., ge=0, le=20)

class EstudianteOut(EstudianteIn):

id: int

letra: str

db: List\[dict] = \[]

counter = 0

def get_letra(nota: float) -> str:

if nota >= 17: return "A"

if nota >= 14: return "B"

if nota >= 10: return "C"

return "F"

\# GET todos

@app.get("/estudiantes", response_model=List\[EstudianteOut])

def listar():

return db

\# GET por ID

@app.get("/estudiantes/{id}", response_model=EstudianteOut)

def obtener(id: int):

e = next((x for x in db if x\["id"]==id), None)

if not e:

raise HTTPException(404, "Estudiante no encontrado")

return e

\# POST crear

@app.post("/estudiantes", response_model=EstudianteOut,

status_code=201)

def crear(estudiante: EstudianteIn):

global counter

counter += 1

nuevo = {"id":counter, \**estudiante.dict(),

"letra": get_letra(estudiante.nota)}

db.append(nuevo)

return nuevo

\# PUT actualizar

@app.put("/estudiantes/{id}", response_model=EstudianteOut)

def actualizar(id: int, datos: EstudianteIn):

for i, e in enumerate(db):

if e\["id"] == id:

db\[i] = {"id":id, \**datos.dict(),

"letra": get_letra(datos.nota)}

return db\[i]

raise HTTPException(404, "No encontrado")

\# DELETE eliminar

@app.delete("/estudiantes/{id}", status_code=204)

def eliminar(id: int):

global db

original = len(db)

db = \[e for e in db if e\["id"] != id]

if len(db) == original:

raise HTTPException(404, "No encontrado")

**Tabla de endpoints**

**GET**

/estudiantes

Lista todos

**GET**

/estudiantes/1

Uno por ID

**POST**

/estudiantes

Crea nuevo → 201

**PUT**

/estudiantes/1

Actualiza todo

**DELETE**

/estudiantes/1

Elimina → 204

💡  HTTPException(404, ...) retorna el código HTTP correcto automáticamente. Nunca retornes 200 con un mensaje de error — eso es anti-patrón.

**⚡ Ejercicio (20 min)**

Implementa el CRUD completo. Prueba desde Swagger UI: crea 3 estudiantes, lista todos, actualiza uno, elimina otro. Agrega un endpoint GET /estudiantes/promedio que retorne el promedio de todas las notas.

> CRUD. Este es el corazón de la clase. Deja que trabajen solos 20 minutos. Camina y ayuda. El ejercicio del promedio es un buen diferenciador — los más avanzados lo harán rápido y pueden ir al siguiente slide. Tip: mostrar en Swagger UI el error 404 cuando buscan un ID que no existe es muy ilustrativo.

**Path Params · Query Params · Headers**

**65–80 min**

**Parámetros en FastAPI**

**params · query**

from fastapi import FastAPI, Query, Header

from typing import Optional, List

app = FastAPI()

\# Path parameter — parte de la URL

@app.get("/estudiantes/{id}")

def obtener(id: int):  # FastAPI convierte y valida el tipo

return {"id": id}

\# Query parameters — después del ?

\# GET /estudiantes?aprobados=true&minNota=10&limite=5

@app.get("/estudiantes")

def listar(

aprobados: Optional\[bool] = None,

min_nota:  float = Query(0, ge=0, le=20),

limite:    int   = Query(10, ge=1, le=100),

pagina:    int   = Query(1, ge=1)

):

resultado = db

if aprobados is not None:

resultado = [e for e in resultado

if (e\["nota"] >= 10) == aprobados]

if min_nota > 0:

resultado = [e for e in resultado

if e\["nota"] >= min_nota]

\# Paginación simple

inicio = (pagina - 1) * limite

return resultado\[inicio:inicio+limite]

\# Headers personalizados

@app.get("/perfil")

def perfil(

x_usuario: Optional\[str] = Header(None)

):

if not x_usuario:

return {"usuario": "anónimo"}

return {"usuario": x_usuario}

**Path vs Query vs Body**

**Path**

/est/{id}

Identifica un recurso específico

**Query**

?nota=10&pag=2

Filtra, ordena o pagina

**Body**

{"nombre":"Ana"}

Datos para crear/actualizar

**Header**

Authorization: ...

Autenticación y metadata

💡  FastAPI convierte automáticamente los tipos: si defines id: int en el path y alguien manda /estudiantes/abc → 422 automático.

**⚡ Ejercicio (12 min)**

Modifica el endpoint GET /estudiantes para aceptar query params: letra (A/B/C/F), ordenar_por ('nombre' o 'nota') y orden ('asc' o 'desc'). Prueba desde Swagger con diferentes combinaciones.

> PARAMS. Este slide es muy práctico. La diferencia path vs query es fundamental: path para identificar (quién), query para filtrar (cuáles). Muestra en la barra del navegador cómo se ve la URL con query params. El ejercicio de ordenamiento es un buen reto para los más avanzados.

**Proyecto: API de Notas UJAP — Estructura profesional**

**80–90 min**

**Estructura de proyecto FastAPI profesional**

**estructura profesional**

\# Estructura de archivos recomendada:

\#

\# proyecto/

\# ├── main.py           ← punto de entrada

\# ├── models.py         ← modelos Pydantic

\# ├── database.py       ← "base de datos" (hoy en memoria)

\# ├── routers/

\# │   ├── estudiantes.py

\# │   └── cursos.py

\# └── requirements.txt

\# requirements.txt

\# fastapi==0.110.0

\# uvicorn==0.29.0

\# pydantic==2.0.0

\# main.py

from fastapi import FastAPI

from routers import estudiantes, cursos

app = FastAPI(

title="API Notas UJAP",

description="Sistema académico 2026-2CR",

version="1.0.0",

docs_url="/docs",

redoc_url="/redoc"

)

app.include_router(

estudiantes.router,

prefix="/api/v1",

tags=\["Estudiantes"]

)

app.include_router(

cursos.router,

prefix="/api/v1",

tags=\["Cursos"]

)

@app.get("/", tags=\["Root"])

def root():

return {

"api": "Notas UJAP",

"version": "1.0.0",

"docs": "/docs"

}

**Roadmap del proyecto integrador**

**Hoy**

API base con CRUD de estudiantes

**Sem 5**

OOP: clases, herencia en el dominio

**Sem 6**

Go: microservicio de reportes

**Sem 7**

Rust: microservicio de validaciones

**Sem 9**

Docker Compose: orquestar todo

**Sem 11**

RegEx + autómatas: validar inputs

**Sem 14**

PostgreSQL: reemplazar db en memoria

**Sem 15**

Next.js: frontend conectado

> PROYECTO. Este slide conecta con el semestre completo. La API que construyeron hoy es la base de todo lo que viene. Próxima clase empiezan a estructurarla mejor con OOP. Deja los últimos 10 minutos para que refactoricen su código en 2 archivos: main.py y un router de estudiantes.

**Cierre — ¿Qué construimos hoy?**

**①**

**¿Qué es una API?**

Contrato entre apps · analogía del restaurante

**②**

**HTTP y REST**

Verbos → CRUD · códigos de respuesta · JSON

**③**

**FastAPI setup**

pip install · uvicorn --reload · Swagger UI mágico

**④**

**Pydantic models**

Validación automática · Field · @validator · 422

**⑤**

**CRUD completo**

GET · POST · PUT · DELETE · HTTPException

**⑥**

**Params**

Path vs Query vs Body vs Header

**📌  Tarea**

1\. Agregar endpoint GET /estadisticas: total estudiantes, promedio general, conteo por letra (A/B/C/F).

2\. Agregar endpoint GET /estudiantes/aprobados y /reprobados.

3\. (Avanzado) Implementar búsqueda por nombre parcial con query param ?q=

**🚀  Próxima clase**

OOP en el proyecto: refactorizar la API con clases, herencia y patrones de diseño. Separar en routers. Agregar un segundo recurso (Cursos). La API empieza a parecerse a producción.

*🎯  Exit ticket: Abre /docs y muéstrame que tu API tiene al menos 5 endpoints funcionando con datos reales.*

> CIERRE. Exit ticket físico: camina por el laboratorio y cada estudiante te muestra su Swagger UI con 5 endpoints. Eso es el criterio de logro de hoy. La tarea de estadísticas es el puente hacia la próxima clase de OOP — los que la hagan bien entenderán por qué necesitan clases para organizar esa lógica.
