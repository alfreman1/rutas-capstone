# Guía de Ejecución del Proyecto LogiRoute

Este repositorio contiene tres componentes principales:
1. **Python (`/python`):** Microservicio de Inteligencia Artificial y Optimización (FastAPI + OR-Tools + Scikit-Learn).
2. **NestJS (`/nestjs`):** API Principal del Backend con Arquitectura Limpia/DDD (NestJS + Prisma + PostgreSQL).
3. **Vue (`/vue`):** Aplicación Frontend (Vue 3 + Vite + TailwindCSS + PrimeVue + Leaflet).

---

## 1. Microservicio de Inteligencia Artificial (`/python`)

El servicio de optimización matemática y clustering corre sobre **FastAPI** en el puerto `8000`.

### Requisitos previos:
- Python 3.10 o superior instalado.

### Pasos para levantar:
```powershell
# 1. Entrar al directorio
cd d:\proyectos\inteligencia\python

# 2. Activar el entorno virtual existente (.venv)
.\.venv\Scripts\Activate.ps1
# (O alternativamente en cmd: .\.venv\Scripts\activate.bat)

# 3. (Opcional) Instalar o actualizar dependencias
pip install -r requirements.txt

# 4. Levantar el servidor en modo desarrollo
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```

> **Ejecución directa en Windows sin activar entorno en terminal:**
> ```powershell
> .\.venv\Scripts\python.exe -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
> ```

- **Documentación Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Endpoint Demo Optimización:** `POST http://localhost:8000/api/v1/optimize/demo`

---

## 2. API Backend Principal (`/nestjs`)

El backend de gestión y autenticación corre sobre **NestJS** en el puerto `3000`.

### Requisitos previos:
- Node.js v18 o superior y npm.
- Base de datos PostgreSQL activa.

### Pasos para levantar:
```powershell
# 1. Entrar al directorio
cd d:\proyectos\inteligencia\nestjs

# 2. Configurar variables de entorno (si es la primera vez)
cp .env.example .env
# Configura DATABASE_URL con tus credenciales de PostgreSQL en el archivo .env

# 3. Instalar dependencias
npm install

# 4. Generar cliente Prisma y ejecutar migraciones / semillas
npx prisma generate
npx prisma migrate dev
npm run prisma:seed

# 5. Iniciar el servidor en modo desarrollo
npm run start:dev
```

- **Documentación Swagger NestJS:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 3. Frontend Web (`/vue`)

La interfaz de usuario interactiva y el panel de visualización de rutas corren sobre **Vite** en el puerto `5173`.

### Requisitos previos:
- Node.js v18 o superior y npm.

### Pasos para levantar:
```powershell
# 1. Entrar al directorio
cd d:\proyectos\inteligencia\vue

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo Vite
npm run dev
```

- **Acceso Web:** [http://localhost:5173](http://localhost:5173)
- **Módulo Demo de Evaluación de Modelos:** [http://localhost:5173/dashboard/optimizacion-demo](http://localhost:5173/dashboard/optimizacion-demo)
