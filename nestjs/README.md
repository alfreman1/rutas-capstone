# LogiRoute - Backend NestJS

Este es el núcleo de orquestación backend de la plataforma de Inteligencia Artificial para la Optimización de Rutas Logísticas.

## Arquitectura

Construido siguiendo los principios de **Domain Driven Design (DDD)** y **Arquitectura Limpia**, separando en capas:
- `domain`: Reglas de negocio puras (Entities, Repository Interfaces).
- `application`: Casos de uso y DTOs (Orquestadores lógicos).
- `infrastructure`: Persistencia con **Prisma ORM** y adaptadores a APIs externas (Python).
- `presentation`: Controladores REST.

---

## 🚀 Guía Rápida para Levantar el Proyecto Localmente

Sigue estos pasos cuidadosamente para levantar el backend y la base de datos local de PostgreSQL.

### 1. Requisitos Previos
- Node.js (v18+)
- Base de datos PostgreSQL instalada localmente.

### 2. Configuración de Base de Datos
Asegúrate de que en tu motor PostgreSQL exista una base de datos llamada `db_rutas`.
El archivo `.env` en la raíz ya está configurado apuntando a tu instancia local:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/db_rutas?schema=public"
```
*(Si tu puerto o contraseña difieren, ajusta este archivo).*

### 3. Instalación de Dependencias
Abre una terminal en la carpeta `nestjs/` y ejecuta:
```bash
npm install
```

### 4. Inicializar Base de Datos (Prisma)
Para crear todas las tablas estructuradas a partir del Schema, y generar el cliente de Prisma, corre la migración inicial:
```bash
npx prisma migrate dev --name init
```
Esto creará las tablas físicamente en tu `db_rutas`.

### 5. Poblar la Base de Datos (Seeding)
Hemos preparado un *Seed* que creará los Roles del sistema y el **Usuario Administrador inicial**. Ejecuta:
```bash
npx prisma db seed
```

Las credenciales que se generarán son:
- **Email**: `admin@logistica.local`
- **Contraseña**: `admin1234`

### 6. Levantar el Servidor
Finalmente, inicia NestJS en modo desarrollo:
```bash
npm run start:dev
```
El servidor se levantará en **http://localhost:3000**.

### 7. Documentación Swagger (API REST)
Una vez levantado, puedes acceder a la documentación interactiva de los endpoints en:
👉 **http://localhost:3000/api/docs**

---

## Comandos Útiles

- `npx prisma studio`: Abre un panel gráfico en tu navegador para ver y editar los datos de las tablas directamente.
- `npx prisma format`: Formatea el archivo `schema.prisma`.
- `npm run build`: Compila el proyecto para producción.
