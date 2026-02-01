import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script para inicializar la base de datos Neon usando @netlify/neon
 * Ejecuta los archivos SQL de schema y seed
 */

const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

async function initDatabase() {
  console.log(`${BLUE}=== Inicializando Base de Datos Neon ===${RESET}\n`);

  try {
    // Verificar que exista la variable de entorno
    if (!process.env.NETLIFY_DATABASE_URL) {
      throw new Error('NETLIFY_DATABASE_URL no está configurada');
    }

    console.log(`${GREEN}✓ Variable de entorno encontrada${RESET}\n`);

    // Inicializar conexión
    const sql = neon(process.env.NETLIFY_DATABASE_URL!);

    // Leer archivos SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');

    console.log(`${BLUE}1. Leyendo archivos SQL...${RESET}`);
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    console.log(`${GREEN}✓ Archivos leídos correctamente${RESET}\n`);

    // Ejecutar schema
    console.log(`${BLUE}2. Creando tablas...${RESET}`);
    await sql(schemaSQL);
    console.log(`${GREEN}✓ Tablas creadas exitosamente${RESET}\n`);

    // Ejecutar seed
    console.log(`${BLUE}3. Insertando datos iniciales...${RESET}`);
    await sql(seedSQL);
    console.log(`${GREEN}✓ Datos iniciales insertados${RESET}\n`);

    // Verificar datos
    console.log(`${BLUE}4. Verificando datos...${RESET}`);
    const counts = await sql`
      SELECT 'clientes' as tabla, COUNT(*) as total FROM clientes
      UNION ALL
      SELECT 'vehiculos_base', COUNT(*) FROM vehiculos_base
      UNION ALL
      SELECT 'vehiculos_clientes', COUNT(*) FROM vehiculos_clientes
      UNION ALL
      SELECT 'inventario', COUNT(*) FROM inventario
      UNION ALL
      SELECT 'usuarios', COUNT(*) FROM usuarios
    `;

    console.log('\nResumen de datos insertados:');
    counts.forEach((row: any) => {
      console.log(`  ${row.tabla}: ${row.total} registros`);
    });

    console.log(`\n${GREEN}=== Base de datos inicializada correctamente ===${RESET}`);
    console.log('\nPuedes verificar la base de datos en: https://console.neon.tech\n');

  } catch (error) {
    console.error(`${RED}✗ Error al inicializar la base de datos:${RESET}`);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initDatabase();
}

export { initDatabase };
