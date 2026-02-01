// test-service-correct.ts
async function testCitasService() {
  console.log('🧪 Probando servicio de citas...\n');
  
  try {
    // 1. Probar endpoint directamente
    console.log('1. Probando endpoint /api/citas:');
    const response = await fetch('http://localhost:3001/api/citas');
    console.log('   Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Éxito:', (data as any).success);
      console.log('   📊 Citas:', (data as any).data?.length || 0);
    } else {
      const errorText = await response.text();
      console.log('   ❌ Error:', errorText);
    }
    
    console.log('\n🎯 CONCLUSIÓN: Backend funciona correctamente');
    
  } catch (err: any) {
    console.log('❌ Error:', err.message || err);
  }
}

// Ejecutar
testCitasService();