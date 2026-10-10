# Reglas del Proyecto LogiRoute (Backend & Frontend)

## 1. Estandarización de Respuestas API (Backend NestJS)
Todas las respuestas de la API deben pasar por el `TransformInterceptor`, el cual estandariza la salida para evitar que el frontend deba adivinar la estructura de datos.

**Para respuestas NO paginadas:**
- El controlador debe devolver directamente el Objeto, String, o Array.
- El interceptor lo transformará a:
  ```json
  {
    "success": true,
    "data": { ... } // o un arreglo [...]
  }
  ```

**Para respuestas PAGINADAS:**
- El controlador debe usar `PaginationHelper.createPaginatedResult(items, total, page, limit)`.
- El interceptor lo transformará a:
  ```json
  {
    "success": true,
    "data": [ ... ], // Los items directamente en data
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
  ```

## 2. Consumo Estándar en Frontend (Vue 3)
El `apiClient.ts` (Axios) ya desempaqueta automáticamente la capa de `axios.data`.
Por tanto, las llamadas del servicio (ej: `apiClient.get('/algo')`) retornan directamente la estructura mencionada arriba.

- **Servicios Frontend:** Deben retornar directamente la promesa de Axios sin alterar la data (no hacer `return res.data` sobre un request destrabado):
  ```typescript
  // CORRECTO:
  async listar(): Promise<PaginatedResponse<Tipo>> {
    return apiClient.get('/endpoint');
  }

  // INCORRECTO (Pierde metadatos):
  async listar() {
    const res = await apiClient.get('/endpoint');
    return res.data;
  }
  ```

- **Composables (TanStack Query):** Al leer el estado reactivo, la estructura es:
  ```typescript
  const query = useQuery(...);
  const items = computed(() => query.data.value?.data || []);
  const total = computed(() => query.data.value?.meta?.total || 0);
  ```

## 3. Seguridad y Control de Permisos
Todo nuevo endpoint creado en NestJS **DEBE** protegerse usando el decorador `@Roles()` u otro esquema de Guards definido.
```typescript
@Get()
@Roles('ADMIN', 'DISPATCHER')
async miEndpointNuevo() { ... }
```
- No se permiten endpoints expuestos globalmente a menos que sean explícitamente para autenticación o webhooks.
- Los roles y permisos deben estar sembrados en `prisma/seed.ts` para mantener coherencia en todos los entornos.
