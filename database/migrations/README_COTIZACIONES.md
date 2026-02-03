# Migración: Tabla Cotizaciones

## Descripción
Esta migración crea la tabla `cotizaciones` en la base de datos PostgreSQL de Neon.

## Ejecutar Migración

### Opción 1: Desde Neon Dashboard (Recomendado)
1. Ir a [Neon Console](https://console.neon.tech/)
2. Seleccionar el proyecto del taller
3. Click en "SQL Editor"
4. Copiar y pegar el contenido de `add_cotizaciones.sql`
5. Ejecutar con el botón "Run"

### Opción 2: Usando psql (si está instalado)
```bash
# Desde la raíz del proyecto
psql $DATABASE_URL -f database/migrations/add_cotizaciones.sql
```

### Opción 3: Usando Node.js script
```bash
# Ejecutar desde la raíz del proyecto
node -e "
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const sql = neon(process.env.DATABASE_URL);
const migration = fs.readFileSync('database/migrations/add_cotizaciones.sql', 'utf8');
sql(migration).then(() => console.log('✅ Migración completada')).catch(err => console.error('❌ Error:', err));
"
```

## Verificar que la tabla existe

### En Neon Dashboard:
```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cotizaciones'
ORDER BY ordinal_position;
```

### Verificar datos de ejemplo:
```sql
SELECT * FROM cotizaciones;
```

## Estructura de la Tabla

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | SERIAL | ID autoincremental (PK) |
| `codigo` | VARCHAR(50) | Código único (ej: COT-0001) |
| `cliente_nombre` | VARCHAR(255) | Nombre del cliente |
| `cliente_cedula` | VARCHAR(50) | Cédula del cliente |
| `vehiculo_placa` | VARCHAR(50) | Placa del vehículo |
| `descuento_mano_obra` | DECIMAL(5,2) | Porcentaje de descuento (0-100) |
| `subtotal_repuestos` | DECIMAL(10,2) | Subtotal de repuestos |
| `subtotal_mano_obra` | DECIMAL(10,2) | Subtotal de mano de obra |
| `iva` | DECIMAL(10,2) | IVA (13% en Costa Rica) |
| `total` | DECIMAL(10,2) | Total de la cotización |
| `estado` | VARCHAR(20) | borrador, pendiente, aprobada, rechazada |
| `es_proforma` | BOOLEAN | true si es proforma, false si es cotización |
| `codigo_orden_trabajo` | VARCHAR(50) | Código OT asociada (opcional) |
| `mecanico_orden_trabajo` | VARCHAR(255) | Nombre del mecánico (opcional) |
| `fecha_creacion` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Última actualización |

## Endpoints API

Una vez ejecutada la migración, los siguientes endpoints estarán disponibles:

- `GET /.netlify/functions/cotizaciones` - Listar todas las cotizaciones
- `GET /.netlify/functions/cotizaciones/:id` - Obtener una cotización
- `POST /.netlify/functions/cotizaciones` - Crear nueva cotización
- `PUT /.netlify/functions/cotizaciones/:id` - Actualizar cotización
- `DELETE /.netlify/functions/cotizaciones/:id` - Eliminar cotización

## Ejemplos de Uso

### Crear cotización (POST):
```json
{
  "codigo": "COT-0003",
  "cliente_nombre": "Carlos López",
  "cliente_cedula": "456789123",
  "vehiculo_placa": "DEF-456",
  "descuento_mano_obra": 5,
  "subtotal_repuestos": 50000,
  "subtotal_mano_obra": 30000,
  "iva": 10400,
  "total": 90400,
  "estado": "borrador",
  "es_proforma": false,
  "mecanico_orden_trabajo": "Juan Rodríguez"
}
```

### Actualizar estado (PUT):
```json
{
  "estado": "aprobada"
}
```

### Filtros disponibles (GET):
- `?estado=aprobada` - Filtrar por estado
- `?mecanico=Juan` - Filtrar por mecánico
- `?cliente=Carlos` - Filtrar por nombre o placa

## Rollback (Deshacer migración)

Si necesitas revertir la migración:

```sql
DROP TABLE IF EXISTS cotizaciones CASCADE;
```

**⚠️ Advertencia:** Esto eliminará permanentemente todas las cotizaciones.
