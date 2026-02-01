# Netlify Database Integration - Taller Automotriz

Este directorio contiene los scripts SQL para configurar la base de datos Neon integrada con Netlify.

## Archivos

- **schema.sql**: Define la estructura completa de la base de datos (tablas, índices, triggers)
- **seed.sql**: Datos iniciales para poblar la base de datos
- **init-db.sh**: Script bash para ejecutar ambos archivos en orden

## Estructura de la Base de Datos

### Tablas Principales

1. **clientes**: Información de clientes del taller
2. **usuarios**: Usuarios del sistema con autenticación
3. **vehiculos_base**: Catálogo de modelos de vehículos
4. **vehiculos_clientes**: Vehículos específicos de cada cliente
5. **inventario**: Productos y repuestos
6. **inventario_vehiculos**: Compatibilidad entre productos y vehículos

### Tablas Adicionales (Opcionales)

7. **talleres**: Información de talleres
8. **trabajadores**: Empleados de los talleres
9. **clientes_talleres**: Relación muchos a muchos entre clientes y talleres

## Cómo usar

### Opción 1: Usando el Script (Recomendado)

```bash
# 1. Hacer el script ejecutable
chmod +x database/init-db.sh

# 2. Configurar variables de entorno
export NETLIFY_DATABASE_URL="tu_url_de_neon"

# 3. Ejecutar el script
./database/init-db.sh
```

### Opción 2: Manualmente con psql

```bash
# Crear tablas
psql "$NETLIFY_DATABASE_URL" -f database/schema.sql

# Insertar datos
psql "$NETLIFY_DATABASE_URL" -f database/seed.sql
```

### Opción 3: Usando el Dashboard de Neon

1. Abre el dashboard de Neon en https://console.neon.tech
2. Selecciona tu proyecto: jolly-dream-52819550
3. Ve a la sección "SQL Editor"
4. Copia y pega el contenido de `schema.sql`
5. Ejecuta el script
6. Repite con `seed.sql`

### Opción 4: Usando código TypeScript con @neondatabase/serverless

```typescript
import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const sql = neon(process.env.NETLIFY_DATABASE_URL!);

// Leer y ejecutar schema
const schema = fs.readFileSync('./database/schema.sql', 'utf8');
await sql(schema);

// Leer y ejecutar seed
const seed = fs.readFileSync('./database/seed.sql', 'utf8');
await sql(seed);
```

## Variables de Entorno

Asegúrate de tener configuradas estas variables:

```env
NETLIFY_DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
NETLIFY_DATABASE_URL_UNPOOLED=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

## Notas Importantes

- Las contraseñas por defecto en los datos de ejemplo son las cédulas hasheadas
- Ajusta los datos de ejemplo según tus necesidades
- Los índices están optimizados para búsquedas frecuentes
- Las claves foráneas tienen políticas CASCADE/RESTRICT según la lógica del negocio

## Integración con Netlify

Para usar la base de datos en tus funciones de Netlify:

```typescript
import { neon } from '@neondatabase/serverless';

export default async (req: Request) => {
  const sql = neon(process.env.NETLIFY_DATABASE_URL!);
  
  const clientes = await sql`SELECT * FROM clientes LIMIT 10`;
  
  return new Response(JSON.stringify(clientes), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

## Verificación

Después de ejecutar los scripts, verifica que todo esté correcto:

```sql
-- Ver todas las tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Contar registros
SELECT 'clientes' as tabla, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'vehiculos_base', COUNT(*) FROM vehiculos_base
UNION ALL
SELECT 'inventario', COUNT(*) FROM inventario;
```
