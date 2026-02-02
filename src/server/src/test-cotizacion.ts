// src/tests/test-cotizacion.ts
import { CotizacionModel } from './models/cotizacion.model';

async function test() {
  console.log('=== TEST COTIZACIONES ===');

  const nueva = await CotizacionModel.create({
    codigo: 'COT-TEST-001',
    clienteNombre: 'Juan Test',
    clienteCedula: '111111111',
    vehiculoPlaca: 'AAA-111',
    descuentoManoObra: 0,
    subtotalRepuestos: 10000,
    subtotalManoObra: 20000,
    iva: 3900,
    total: 33900,
    estado: 'borrador',
    esProforma: false,
    codigoOrdenTrabajo: null,
    mecanicoOrdenTrabajo: 'Mecánico Test',
  });

  console.log('✅ Creada:', nueva.codigo);

  const todas = await CotizacionModel.getAll();
  console.log('📄 Total:', todas.length);

  const una = await CotizacionModel.getByCodigo('COT-TEST-001');
  console.log('🔍 Encontrada:', una?.cliente_nombre);
}

test()
  .then(() => process.exit())
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
