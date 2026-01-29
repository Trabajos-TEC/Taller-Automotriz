# 🔒 Guía de Seguridad - Taller Automotriz

## Variables de Entorno

### ⚠️ NUNCA commitear archivos con credenciales

- ✅ `.env` está en `.gitignore`
- ✅ Usar `.env.example` como plantilla
- ❌ NO commitear `.env` con credenciales reales

### Variables Requeridas

```env
# Base de datos Neon (Netlify)
NETLIFY_DATABASE_URL=postgresql://...
NETLIFY_DATABASE_URL_UNPOOLED=postgresql://...
```

## Configuración en Netlify

1. **Dashboard > Site settings > Environment variables**
2. Agregar variables una por una
3. Verificar que estén disponibles en el build

## Seguridad de Base de Datos

### ✅ Buenas Prácticas Implementadas

- Conexiones SSL/TLS requeridas
- Queries parametrizadas (prevención SQL injection)
- Validación de inputs en backend
- Constraints de base de datos (UNIQUE, FOREIGN KEY)

### 🔐 Contraseñas

- Hasheadas con bcrypt (10 rounds)
- NUNCA almacenar en texto plano
- Cambiar contraseñas por defecto en producción

### Ejemplo de Hash

```typescript
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 10);
```

## Headers de Seguridad

Configurados en `netlify.toml`:

```toml
X-Frame-Options = "DENY"              # Previene clickjacking
X-Content-Type-Options = "nosniff"    # Previene MIME sniffing
X-XSS-Protection = "1; mode=block"    # Protección XSS
Referrer-Policy = "strict-origin-when-cross-origin"
```

## CORS

- Configurado para permitir requests desde el frontend
- En producción, limitar a dominios específicos
- Actualmente: `Access-Control-Allow-Origin: "*"`

## Recomendaciones para Producción

### 1. Cambiar Contraseñas por Defecto

```sql
-- Generar hash real para usuarios
UPDATE usuarios 
SET password_hash = '$2b$10$RealHashHere'
WHERE cedula = '9999999999';
```

### 2. Limitar CORS

```toml
Access-Control-Allow-Origin = "https://tu-dominio.netlify.app"
```

### 3. Rate Limiting

Considerar implementar rate limiting en funciones Netlify:

```typescript
// Ejemplo básico
const rateLimit = new Map();
const limit = 100; // requests por minuto

export const handler = async (event) => {
  const ip = event.headers['x-forwarded-for'];
  // Implementar lógica de rate limit
};
```

### 4. Validación de Inputs

Siempre validar en backend:

```typescript
// Ejemplo
if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
  return { statusCode: 400, body: 'Email inválido' };
}
```

### 5. Logging y Monitoreo

- Usar Netlify Functions logs
- Monitorear errores con Sentry o similar
- No logear información sensible

## Checklist de Seguridad

- [ ] Variables de entorno configuradas
- [ ] Contraseñas hasheadas
- [ ] SSL/TLS habilitado
- [ ] Headers de seguridad configurados
- [ ] CORS configurado correctamente
- [ ] Validación de inputs implementada
- [ ] Rate limiting considerado
- [ ] Backups de base de datos configurados
- [ ] Monitoring y alertas activos

## Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad:

1. NO crear un issue público
2. Contactar directamente al equipo
3. Proporcionar detalles y pasos para reproducir

## Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Netlify Security](https://docs.netlify.com/security/secure-access-to-sites/)
- [Neon Security](https://neon.tech/docs/security/security-overview)
