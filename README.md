# 🚗 Sistema de Gestión para Taller Automotriz

Sistema integral de gestión para talleres automotrices desarrollado con React, TypeScript, y desplegado en Netlify con base de datos Neon PostgreSQL.

## ✨ Características

- 🔐 Sistema de autenticación con roles (admin, mecánico, cliente)
- 👥 Gestión de clientes y vehículos
- 📋 Gestión de órdenes de trabajo y citas
- 📦 Control de inventario de repuestos
- 📊 Reportes y estadísticas
- 🎨 Interfaz moderna y responsive

## 🛠️ Tecnologías

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Netlify Functions (Serverless)
- **Base de datos**: Neon PostgreSQL
- **Deployment**: Netlify
- **Estilos**: CSS personalizado

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 20 o superior
- npm o yarn
- Cuenta en Netlify
- Cuenta en Neon (para la base de datos)

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/Trabajos-TEC/Taller-Automotriz.git
cd Taller-Automotriz

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar en desarrollo
npm run dev
```

### Configuración de Base de Datos

Ver [database/README.md](database/README.md) para instrucciones detalladas de configuración de la base de datos.

```bash
# Opción 1: Usar el script de inicialización
chmod +x database/init-db.sh
./database/init-db.sh

# Opción 2: Usar el dashboard de Neon
# Ejecutar manualmente database/schema.sql y database/seed.sql
```

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Build
npm run build        # Compilar para producción
npm run preview      # Preview del build

# Linting
npm run lint         # Ejecutar ESLint

# Base de datos
npm run init-db      # Inicializar base de datos
```

## 🌐 Deployment en Netlify

Ver [NETLIFY_SETUP.md](NETLIFY_SETUP.md) para guía completa de deployment.

### Resumen

1. Conectar repositorio en Netlify
2. Configurar variables de entorno:
   - `NETLIFY_DATABASE_URL`
   - `NETLIFY_DATABASE_URL_UNPOOLED`
3. Deploy automático en cada push

## 📁 Estructura del Proyecto

```
Taller-Automotriz/
├── database/              # Scripts SQL y configuración DB
│   ├── schema.sql        # Estructura de tablas
│   ├── seed.sql          # Datos iniciales
│   └── README.md         # Documentación de DB
├── netlify/
│   └── functions/        # Funciones serverless
├── src/
│   ├── components/       # Componentes React
│   ├── pages/           # Páginas principales
│   ├── services/        # Servicios API
│   ├── styles/          # Estilos CSS
│   └── App.tsx          # Componente raíz
├── public/              # Assets estáticos
└── netlify.toml         # Configuración Netlify
```

## 🔐 Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```env
NETLIFY_DATABASE_URL=postgresql://...
NETLIFY_DATABASE_URL_UNPOOLED=postgresql://...
```

## 📚 Documentación Adicional

- [NETLIFY_SETUP.md](NETLIFY_SETUP.md) - Guía de deployment en Netlify
- [INTEGRACION_COMPLETADA.md](INTEGRACION_COMPLETADA.md) - Resumen de integración
- [database/README.md](database/README.md) - Documentación de base de datos

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es para uso educativo.

## 👥 Equipo

Proyecto desarrollado para el curso de Diseño de Software - TEC

---

**🔗 Links Útiles**

- [Netlify Docs](https://docs.netlify.com)
- [Neon Docs](https://neon.tech/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
