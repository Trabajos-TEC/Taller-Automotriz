# Poblar Base de Datos con Datos de Prueba

Este script genera más de 100 registros para las entidades principales de la base de datos.

## Resumen de Datos Generados

- **150 Clientes** con información completa (nombre, cédula, correo, teléfono)
- **100 Vehículos Base** (diferentes marcas, modelos y años)
- **120 Productos** en inventario (repuestos y accesorios)
- **150 Vehículos de Clientes** (vinculados a clientes y vehículos base)
- **120 Citas** (con diferentes estados y fechas)
- **10 Servicios** (tipos de trabajos del taller)
- **100 Órdenes de Trabajo** (vinculadas a vehículos, servicios y citas)
- **200+ Repuestos de Órdenes** (1-3 repuestos por orden)
- **100+ Servicios de Órdenes** (0-2 servicios adicionales por orden)

**Total: Más de 900 registros en la base de datos**

## Requisitos Previos

1. Tener acceso a la base de datos Neon PostgreSQL
2. Tener instalado `psql` (cliente de PostgreSQL)
3. Tener las credenciales de conexión

## Método 1: Usando psql (Recomendado)

### Opción A: Conexión directa
```bash
psql "postgresql://USERNAME:PASSWORD@HOST/DATABASE?sslmode=require" -f database/seed_large_data.sql
```

### Opción B: Variables de entorno
```bash
export PGHOST=your-host.neon.tech
export PGDATABASE=your-database
export PGUSER=your-username
export PGPASSWORD=your-password
export PGSSLMODE=require

psql -f database/seed_large_data.sql
```

### Desde Neon Dashboard

1. Ir a tu proyecto en Neon
2. Click en "SQL Editor"
3. Copiar y pegar el contenido de `seed_large_data.sql`
4. Click en "Run"

## Método 2: Desde la aplicación web

También puedes usar la interfaz web de Neon:

1. Inicia sesión en https://console.neon.tech
2. Selecciona tu proyecto
3. Ve a la pestaña "SQL Editor"
4. Abre el archivo `seed_large_data.sql`
5. Copia todo el contenido
6. Pégalo en el editor SQL
7. Click en "Run" (puede tomar 30-60 segundos)

## Verificar la Inserción

Después de ejecutar el script, verás un resumen al final:

```
tabla                      | total
---------------------------+-------
Clientes                   | 150
Vehículos Base             | 100
Inventario                 | 120
Vehículos de Clientes      | 150
Citas                      | 120
Servicios                  | 10
Órdenes de Trabajo         | 100
Repuestos de Órdenes       | 200+
Servicios de Órdenes       | 100+
```

## Consideraciones

- El script usa `ON CONFLICT DO NOTHING` para evitar duplicados
- Las fechas se generan de forma dinámica (últimos 60 días y próximos 30)
- Los datos están relacionados correctamente entre tablas
- Se asigna automáticamente todo al taller con ID 1

## Limpiar Datos de Prueba (Opcional)

Si necesitas empezar de nuevo:

```sql
TRUNCATE TABLE 
    orden_servicios,
    orden_repuestos,
    ordenes_trabajo,
    citas,
    vehiculos_clientes,
    clientes_talleres,
    clientes,
    inventario,
    vehiculos_base
CASCADE;
```

⚠️ **CUIDADO**: Esto eliminará TODOS los datos de estas tablas.

## Solución de Problemas

### Error: "relation does not exist"
- Asegúrate de haber ejecutado primero el schema.sql

### Error: "permission denied"
- Verifica que tu usuario tenga permisos de INSERT

### Error: "could not connect"
- Verifica tus credenciales de conexión
- Asegúrate que tu IP esté permitida en Neon

### El script tarda mucho
- Es normal, está insertando 900+ registros
- Puede tomar 1-2 minutos dependiendo de la conexión

## Datos de Prueba Interesantes

Los datos generados incluyen:

- **Clientes** con nombres realistas en español
- **Placas** en formato CR: ABC-123
- **Fechas** distribuidas en el tiempo (pasado y futuro)
- **Estados** variados (pendiente, aceptada, finalizada, etc.)
- **Precios** realistas en colones (₡)
- **Relaciones** coherentes entre entidades

## Para Presentación

Este volumen de datos te permite demostrar:

- ✅ Paginación y búsqueda
- ✅ Filtros y ordenamiento
- ✅ Reportes con datos significativos
- ✅ Gráficos con información real
- ✅ Rendimiento con volumen de datos
- ✅ Casos de uso realistas

## Mantenimiento

Si necesitas más datos:

- Modifica los límites en los loops (ej: `FOR i IN 1..150` → `FOR i IN 1..300`)
- Ejecuta el script nuevamente (no duplicará por `ON CONFLICT`)
- O ejecuta solo las secciones específicas que necesites
