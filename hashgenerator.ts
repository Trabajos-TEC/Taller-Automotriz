import bcrypt from 'bcrypt';

async function generarHash() {
  const cedula = '123456789';
  const passwordHash = await bcrypt.hash(cedula, 10);

  console.log('Cédula:', cedula);
  console.log('Hash:', passwordHash);
}

generarHash();
