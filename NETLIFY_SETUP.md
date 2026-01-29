# Integración Netlify + Neon - Taller Automotriz

Este proyecto está configurado para deployarse en Netlify con base de datos Neon.

## 🚀 Quick Start

### 1. Configurar Variables de Entorno

En Netlify dashboard > Site settings > Environment variables, agrega:

```
NETLIFY_DATABASE_URL=tu_url_de_conexion_pooled
NETLIFY_DATABASE_URL_UNPOOLED=tu_url_de_conexion_no_pooled
```

### 2. Inicializar Base de Datos

Hay varias formas de inicializar la base de datos:

#### Opción A: Usando el Dashboard de Neon (Más fácil)

1. Ve a https://console.neon.tech
2. Selecciona tu proyecto: `jolly-dream-52819550`
3. Abre el SQL Editor
4. Copia y ejecuta `database/schema.sql`
5. Luego ejecuta `database/seed.sql`

#### Opción B: Usando psql localmente

```bash
# Configura la variable de entorno
export NETLIFY_DATABASE_URL="postgresql://..."

# Ejecuta el script de inicialización
chmod +x database/init-db.sh
./database/init-db.sh
```

#### Opción C: Usando Node.js

```bash
npm install
npm run init-db
```

### 3. Deploy en Netlify

```bash
# Conectar con Netlify
netlify login
netlify init

# Deploy
netlify deploy --prod
```

## 📦 Funciones Serverless

Las funciones de Netlify están en `netlify/functions/`:

- `get-clientes.ts` - Obtener clientes
- `get-vehiculos.ts` - Obtener vehículos
- `get-inventario.ts` - Obtener inventario

### Endpoints después del deploy

```
https://tu-sitio.netlify.app/.netlify/functions/get-clientes
https://tu-sitio.netlify.app/.netlify/functions/get-vehiculos
https://tu-sitio.netlify.app/.netlify/functions/get-inventario
```

## 🗄️ Estructura de Base de Datos

Ver `database/README.md` para detalles completos.

### Tablas principales:
- `clientes` - Información de clientes
- `usuarios` - Usuarios del sistema
- `vehiculos_base` - Catálogo de modelos
- `vehiculos_clientes` - Vehículos de clientes
- `inventario` - Productos y repuestos
- `inventario_vehiculos` - Compatibilidad productos-vehículos

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Inicializar base de datos
npm run init-db

# Preview local con Netlify
netlify dev
```

## 📝 Uso de @netlify/neon

Ejemplo de uso en tus funciones:

```typescript
import { neon } from '@netlify/neon';

export const handler = async (req: Request) => {
  const sql = neon(); // Usa automáticamente NETLIFY_DATABASE_URL
  
  const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`;
  
  return new Response(JSON.stringify(post));
};
```

## 🔐 Seguridad

- Las contraseñas están hasheadas con bcrypt
- CORS configurado en `netlify.toml`
- Headers de seguridad aplicados
- SSL/TLS requerido para conexiones DB

## 📚 Recursos

- [Netlify Docs](https://docs.netlify.com)
- [Neon Docs](https://neon.tech/docs)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [@netlify/neon Package](https://www.npmjs.com/package/@netlify/neon)

## 🐛 Troubleshooting

### Error: "NETLIFY_DATABASE_URL no está configurada"

Asegúrate de configurar las variables de entorno en Netlify dashboard.

### Error: "relation does not exist"

Ejecuta los scripts de inicialización de la base de datos.

### Funciones no responden

Verifica los logs en Netlify dashboard > Functions > Logs
