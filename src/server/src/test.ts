// test-router-real.ts
import express from 'express';
import ordenesRouter from './routes/ordenes_trabajo.routes';

async function runTest() {
  console.log('🧪 Probando router REAL...\n');

  const app = express();
  const PORT = 4000;

  app.use(express.json());

  // 👉 montar tu router real
  app.use('/api/ordenes-trabajo', ordenesRouter);

  const server = app.listen(PORT, async () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);

    try {
      const response = await fetch(`http://localhost:${PORT}/api/ordenes-trabajo`);
      console.log('Status:', response.status);

      const text = await response.text();
      console.log('Respuesta:', text);

    } catch (err: any) {
      console.log('❌ Error:', err.message);
    }

    server.close();
  });
}

runTest();
