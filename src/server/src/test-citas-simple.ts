// test-citas-api.ts
import dotenv from 'dotenv';
import path from 'path';
// Cargar variables de entorno
dotenv.config({ 
  path: path.resolve(__dirname, '../.env')
});
// Importar después de cargar .env
import { CitasModel } from './models/citas.model';
async function testModeloCitas() {
  console.log('=== TEST MODELO CITAS ===\n');
  
  try {
    // 1. Obtener todas las citas
    console.log('1. Probando CitasModel.getAll():');
    const todasCitas = await CitasModel.getAll();
    console.log(`✅ ${todasCitas.length} citas encontradas`);
    
    if (todasCitas.length > 0) {
      console.log('Primera cita:', {
        id: todasCitas[1].id,
        vehiculo_cliente_id: todasCitas[0].vehiculo_cliente_id,
        fecha: todasCitas[0].fecha,
        estado: todasCitas[0].estado
      });
    }
    console.log();
    
    // 2. Obtener cita por ID
    if (todasCitas.length > 0) {
      console.log('2. Probando CitasModel.getById():');
      const cita = await CitasModel.getById(todasCitas[0].id);
      console.log(`✅ Cita encontrada:`, {
        id: cita?.id,
        descripcion: cita?.descripcion,
        estado: cita?.estado
      });
      console.log();
    }
    
    // 3. Obtener citas por estado
    console.log('3. Probando CitasModel.getByEstado("En Espera"):');
    const citasEnEspera = await CitasModel.getByEstado('En Espera');
    console.log(`✅ ${citasEnEspera.length} citas en estado "En Espera"`);
    console.log();
    
    // 4. Obtener estadísticas
    console.log('4. Probando CitasModel.getEstadisticas():');
    const estadisticas = await CitasModel.getEstadisticas();
    console.log('✅ Estadísticas:', estadisticas);
    console.log();
    
    // 5. Probar búsqueda
    console.log('5. Probando CitasModel.getAll("aceite"):');
    const citasBusqueda = await CitasModel.getAll('aceite');
    console.log(`✅ ${citasBusqueda.length} citas encontradas con "aceite"`);
    console.log();
    
    console.log('🎉 ¡TODAS LAS PRUEBAS DEL MODELO PASARON!');
    
  } catch (error: any) {
    console.error('❌ Error en el test:', error.message);
    console.error('Stack:', error.stack);
    
    // Si hay error de conexión
    if (error.message.includes('does not support SSL')) {
      console.error('\n⚠️  Problema de SSL. Verifica la configuración en database.ts');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n⚠️  Error de DNS. Verifica tu DATABASE_URL');
    }
  }
}

testModeloCitas();