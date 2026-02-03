# Scripts de Seed por Tabla

## Orden de Ejecución

Para poblar la base de datos con datos de prueba, ejecuta los scripts en este orden:

### 1. Limpiar datos existentes (OPCIONAL)
```bash
psql "postgresql://USERNAME:PASSWORD@HOST/DATABASE?sslmode=require" -f database/cleanup.sql
```

### 2. Ejecutar scripts en orden
```bash
# 1. Clientes (150 registros)
psql "..." -f database/seeds/01_clientes.sql

# 2. Vehículos Base (100 registros)
psql "..." -f database/seeds/02_vehiculos_base.sql

# 3. Inventario (120 registros)
psql "..." -f database/seeds/03_inventario.sql

# 4. Vincular Clientes con Taller
psql "..." -f database/seeds/04_clientes_talleres.sql

# 5. Vehículos de Clientes (150 registros)
psql "..." -f database/seeds/05_vehiculos_clientes.sql

# 6. Servicios (10 registros)
psql "..." -f database/seeds/06_servicios.sql

# 7. Citas (120 registros)
psql "..." -f database/seeds/07_citas.sql

# 8. Órdenes de Trabajo (100 registros)
psql "..." -f database/seeds/08_ordenes_trabajo.sql

# 9. Repuestos y Servicios de Órdenes (200+ registros)
psql "..." -f database/seeds/09_orden_repuestos_servicios.sql
```

### 3. O ejecutar todos de una vez
```bash
# En el directorio del proyecto
cd database/seeds
for file in *.sql; do
  echo "Ejecutando $file..."
  psql "postgresql://USERNAME:PASSWORD@HOST/DATABASE?sslmode=require" -f "$file"
done
```

## Desde Neon Dashboard

1. Ir a **SQL Editor**
2. Copiar y pegar el contenido de cada archivo en orden
3. Ejecutar cada script
4. Verificar el resultado mostrado al final de cada ejecución

## Verificar Datos

Después de ejecutar todos los scripts, verifica los conteos:

```sql
SELECT 
    'Clientes' as tabla, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'Vehículos Base', COUNT(*) FROM vehiculos_base
UNION ALL
SELECT 'Inventario', COUNT(*) FROM inventario
UNION ALL
SELECT 'Vehículos de Clientes', COUNT(*) FROM vehiculos_clientes
UNION ALL
SELECT 'Citas', COUNT(*) FROM citas
UNION ALL
SELECT 'Servicios', COUNT(*) FROM servicios
UNION ALL
SELECT 'Órdenes de Trabajo', COUNT(*) FROM ordenes_trabajo
UNION ALL
SELECT 'Repuestos de Órdenes', COUNT(*) FROM orden_repuestos
UNION ALL
SELECT 'Servicios de Órdenes', COUNT(*) FROM orden_servicios;
```

## Notas

- Cada script muestra un mensaje de confirmación al final
- Los scripts usan `ON CONFLICT DO NOTHING` para evitar duplicados
- Si un script falla, puedes volver a ejecutarlo sin problemas
- El orden es importante debido a las dependencias entre tablas
