# Sistema de Recuperación de Contraseñas

## 📋 Descripción General

Sistema completo de recuperación de contraseñas mediante tokens enviados por correo electrónico. Implementa las mejores prácticas de seguridad incluyendo tokens de un solo uso, expiración temporal, rate limiting y hash criptográfico.

## 🏗️ Arquitectura

### Backend (NestJS)

#### Base de Datos
**Modelo:** `PasswordResetToken`
- `id`: Identificador único (autoincremental)
- `token`: Token hasheado con bcrypt (único)
- `usuario_id`: Relación con el usuario (FK)
- `usado`: Bandera para tokens de un solo uso
- `fecha_creacion`: Timestamp de creación
- `fecha_expiracion`: Timestamp de expiración (1 hora)
- `ip_address`: IP del solicitante (opcional, para auditoría)
- `user_agent`: User agent del navegador (opcional)

**Índices:**
- `token` (único)
- `usuario_id`
- `usado`
- `fecha_expiracion`

#### DTOs

**ForgotPasswordDto** (`backend/src/auth/forgot-password.dto.ts`)
```typescript
{
  email: string // Validado con @IsEmail()
}
```

**ResetPasswordDto** (`backend/src/auth/reset-password.dto.ts`)
```typescript
{
  token: string,
  newPassword: string // Con validación completa de requisitos
}
```

#### Servicios

**AuthService** (`backend/src/auth/auth.service.ts`)

Métodos agregados:

1. **`requestPasswordReset(forgotPasswordDto, ipAddress, userAgent)`**
   - ✅ Verifica rate limiting (3 intentos por 15 minutos)
   - ✅ Invalida tokens anteriores del usuario
   - ✅ Genera token criptográfico seguro (32 bytes)
   - ✅ Hashea el token con bcrypt antes de guardarlo
   - ✅ Configura expiración de 1 hora
   - ✅ Envía email con enlace de recuperación
   - ✅ No revela si el email existe (seguridad)

2. **`verifyResetToken(token)`**
   - ✅ Valida token contra hashes en BD
   - ✅ Verifica que no esté usado
   - ✅ Verifica que no haya expirado
   - ✅ Retorna información básica del usuario

3. **`resetPassword(resetPasswordDto)`**
   - ✅ Valida token (igual que verifyResetToken)
   - ✅ Actualiza contraseña con bcrypt
   - ✅ Marca token como usado
   - ✅ Invalida todos los refresh tokens del usuario
   - ✅ Envía email de confirmación

**MailService** (`backend/src/mail/mail.service.ts`)

Métodos agregados:

1. **`sendPasswordResetEmail(email, resetData)`**
   - Template: `password-reset.hbs`
   - Asunto: "🔐 Recuperación de Contraseña - CHPC"
   - Variables: nombre, resetUrl, expiracion

2. **`sendPasswordChangedEmail(email, userData)`**
   - Template: `password-changed.hbs`
   - Asunto: "✅ Contraseña Actualizada - CHPC"
   - Variables: nombre, fecha

#### Controlador

**AuthController** (`backend/src/auth/auth.controller.ts`)

Endpoints agregados:

1. **POST** `/auth/forgot-password`
   - Body: `{ email: string }`
   - Headers: IP y User-Agent capturados automáticamente
   - Response: Mensaje genérico (no revela si email existe)

2. **GET** `/auth/verify-reset-token`
   - Query: `?token=xxx`
   - Response: `{ valido: boolean, email?: string, nombre?: string }`
   - Uso: Validar token antes de mostrar formulario

3. **POST** `/auth/reset-password`
   - Body: `{ token: string, newPassword: string }`
   - Response: Mensaje de éxito
   - Side effects: Invalida refresh tokens, envía email

### Frontend (Vue.js)

#### Componentes

**OlvidePassword.vue** (`src/components/OlvidePassword.vue`)

**Funcionalidad:**
- Formulario simple con input de email
- Validación de formato de email
- Muestra mensaje de éxito sin revelar si email existe
- Manejo de rate limiting (429)
- Permite reenviar correo

**Flujo:**
1. Usuario ingresa email
2. Click en "Enviar Enlace de Recuperación"
3. POST a `/auth/forgot-password`
4. Muestra mensaje de éxito con instrucciones
5. Opción de "Enviar otro correo" o "Volver al login"

**RestablecerPassword.vue** (`src/components/RestablecerPassword.vue`)

**Funcionalidad:**
- Lee token desde query param `?token=xxx`
- Verifica validez del token al montar componente
- Formulario con dos inputs de password
- Toggle para mostrar/ocultar contraseñas
- Validación en tiempo real de requisitos de contraseña
- Muestra indicadores visuales (✓/○) para cada requisito
- Manejo de errores (token inválido/expirado)

**Estados:**
1. **Verificando**: Spinner mientras valida token
2. **Token Inválido**: Mensaje de error con enlace para solicitar nuevo
3. **Formulario**: Inputs de password con validación en vivo
4. **Éxito**: Confirmación con botón para ir a login

**Requisitos de Contraseña:**
- ✓ Mínimo 6 caracteres
- ✓ Al menos una letra
- ✓ Al menos un número
- ✓ Al menos un carácter especial (@$!%*?&.,-_:)

#### Router

**Rutas agregadas** (`src/router/index.js`)

```javascript
{ 
  path: '/olvide-password', 
  component: OlvidePassword,
  name: 'OlvidePassword',
  beforeEnter: redirectIfAuthenticated
},
{ 
  path: '/restablecer-password', 
  component: RestablecerPassword,
  name: 'RestablecerPassword',
  beforeEnter: redirectIfAuthenticated
}
```

#### Integración con Login

**SesionUsuario.vue**
- Enlace "¿Olvidaste tu contraseña?" agregado debajo del botón de login
- Estilizado acorde al diseño existente
- Router-link a `/olvide-password`

### Templates de Email

#### password-reset.hbs
**Ubicación:** `backend/src/mail/templates/password-reset.hbs`

**Contenido:**
- Saludo personalizado con nombre del usuario
- Botón prominente "Restablecer Contraseña"
- Enlace alternativo en texto plano
- Badge de seguridad con tiempo de expiración
- Advertencia de seguridad destacada
- Footer informativo

**Variables Handlebars:**
- `{{nombre}}`: Nombre del usuario
- `{{resetUrl}}`: URL completa con token
- `{{expiracion}}`: Texto de expiración ("1 hora")

#### password-changed.hbs
**Ubicación:** `backend/src/mail/templates/password-changed.hbs`

**Contenido:**
- Confirmación visual con checkmark ✅
- Saludo personalizado
- Confirmación del cambio con fecha/hora
- Advertencia si no fue el usuario
- Tips de seguridad
- Información de soporte

**Variables Handlebars:**
- `{{nombre}}`: Nombre del usuario
- `{{fecha}}`: Fecha y hora del cambio formateada

## 🔐 Características de Seguridad

### 1. Tokens Criptográficos
- **Generación:** `crypto.randomBytes(32)` - 32 bytes de entropía
- **Codificación:** Hexadecimal (64 caracteres)
- **Hash:** bcrypt con 10 rounds antes de guardar en BD
- **Comparación:** bcrypt.compare() para verificación

### 2. Rate Limiting
- **Límite:** 3 intentos por email
- **Ventana:** 15 minutos
- **Implementación:** Cuenta tokens no usados creados en últimos 15 minutos
- **Respuesta:** HTTP 429 cuando se excede

### 3. Expiración Temporal
- **Duración:** 1 hora desde creación
- **Validación:** Verificada en cada uso del token
- **Limpieza:** Los tokens expirados permanecen en BD para auditoría

### 4. Un Solo Uso
- **Bandera:** `usado` en base de datos
- **Comportamiento:** Token se marca como usado al restablecer password
- **Previene:** Reutilización de enlaces interceptados

### 5. Invalidación de Sesiones
- **Acción:** Al cambiar password, se invalidan todos los refresh tokens
- **Efecto:** Usuario debe iniciar sesión nuevamente en todos los dispositivos
- **Seguridad:** Previene acceso no autorizado con tokens antiguos

### 6. No Revelación de Información
- **Principio:** Nunca revelar si un email existe en el sistema
- **Respuesta:** Siempre mensaje genérico de "si existe, recibirás email"
- **Previene:** Enumeración de usuarios

### 7. Auditoría
- **IP Address:** Capturada al solicitar reset
- **User Agent:** Capturado para identificar dispositivo
- **Timestamps:** fecha_creacion para tracking
- **Uso:** Permite investigación de intentos sospechosos

## 📊 Flujo Completo

```
1. Usuario olvida contraseña
   ↓
2. Accede a /olvide-password
   ↓
3. Ingresa email y envía
   ↓
4. Backend verifica rate limit
   ↓
5. Backend invalida tokens anteriores
   ↓
6. Backend genera y hashea token
   ↓
7. Backend guarda token en BD
   ↓
8. Backend envía email con enlace
   ↓
9. Usuario recibe email
   ↓
10. Usuario hace click en enlace
   ↓
11. Redirección a /restablecer-password?token=xxx
   ↓
12. Frontend verifica validez del token (GET)
   ↓
13. Si válido, muestra formulario de nueva contraseña
   ↓
14. Usuario ingresa nueva contraseña (con validación)
   ↓
15. Usuario envía formulario (POST)
   ↓
16. Backend verifica token nuevamente
   ↓
17. Backend actualiza contraseña (hasheada)
   ↓
18. Backend marca token como usado
   ↓
19. Backend invalida refresh tokens
   ↓
20. Backend envía email de confirmación
   ↓
21. Frontend muestra éxito
   ↓
22. Usuario va a login con nueva contraseña
```

## 🗃️ Migración de Base de Datos

**Comando ejecutado:**
```bash
npx prisma migrate dev --name add_password_reset_tokens
```

**Archivo generado:**
```
migrations/
  └─ 20260106163904_add_password_reset_tokens/
    └─ migration.sql
```

**Tablas creadas:**
- `password_reset_tokens`

**Relaciones:**
- FK a `users.id` con ON DELETE CASCADE

## 🧪 Testing

### Pruebas Manuales Recomendadas

1. **Solicitud exitosa:**
   - Ingresar email válido
   - Verificar recepción de email
   - Verificar formato del enlace

2. **Rate limiting:**
   - Intentar 4+ solicitudes en 15 minutos
   - Verificar error 429

3. **Token válido:**
   - Hacer click en enlace del email
   - Verificar que muestra formulario

4. **Token inválido:**
   - Modificar token en URL
   - Verificar mensaje de error

5. **Token expirado:**
   - Cambiar manualmente fecha_expiracion en BD
   - Intentar usar token
   - Verificar error de expiración

6. **Token usado:**
   - Usar token para cambiar password
   - Intentar reutilizar mismo token
   - Verificar error de "ya usado"

7. **Validación de contraseña:**
   - Probar contraseñas débiles
   - Verificar indicadores visuales
   - Probar contraseña fuerte válida

8. **Cambio exitoso:**
   - Completar flujo completo
   - Verificar email de confirmación
   - Login con nueva contraseña

### Endpoints para Testing

```bash
# 1. Solicitar reset
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@ejemplo.com"}'

# 2. Verificar token
curl -X GET "http://localhost:3000/api/auth/verify-reset-token?token=TOKEN_AQUI"

# 3. Restablecer password
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_AQUI",
    "newPassword": "NuevaPass123!"
  }'
```

## 🔧 Variables de Entorno Necesarias

**Backend** (`.env`)
```env
# URL del frontend para construir enlaces
FRONTEND_URL=http://localhost:8080

# Configuración de email (debe estar previamente configurada)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-email@gmail.com
MAIL_PASS=tu-app-password
MAIL_FROM=noreply@chpc.com
```

**Frontend** (`.env`)
```env
# URL de la API
VUE_APP_API_BASE_URL=http://localhost:3000/api
```

## 📝 Archivos Modificados

### Backend
- ✅ `prisma/schema.prisma` - Modelo PasswordResetToken
- ✅ `src/auth/forgot-password.dto.ts` - DTO creado
- ✅ `src/auth/reset-password.dto.ts` - DTO creado
- ✅ `src/auth/auth.service.ts` - 3 métodos agregados
- ✅ `src/auth/auth.controller.ts` - 3 endpoints agregados
- ✅ `src/mail/mail.service.ts` - 1 método agregado
- ✅ `src/mail/templates/password-reset.hbs` - Template existente (sin cambios)
- ✅ `src/mail/templates/password-changed.hbs` - Template creado

### Frontend
- ✅ `src/components/OlvidePassword.vue` - Componente creado
- ✅ `src/components/RestablecerPassword.vue` - Componente creado
- ✅ `src/router/index.js` - 2 rutas agregadas
- ✅ `src/components/SesionUsuario/SesionUsuario.vue` - Enlace agregado
- ✅ `src/components/SesionUsuario/SesionUsuario.css` - Estilos agregados

### Migraciones
- ✅ `prisma/migrations/20260106163904_add_password_reset_tokens/migration.sql`

## 🚀 Próximos Pasos

Para poner en producción:

1. **Testing exhaustivo** de todos los flujos
2. **Configurar email** con credenciales reales
3. **Ajustar FRONTEND_URL** en .env de producción
4. **Monitorear rate limiting** para ajustar límites si es necesario
5. **Implementar limpieza** de tokens antiguos (job periódico)
6. **Configurar alertas** para intentos sospechosos
7. **Revisar logs** de auditoría (ip_address, user_agent)

## 📞 Soporte

Para cualquier duda sobre el sistema de recuperación de contraseñas, referirse a:
- Esta documentación
- Código fuente con comentarios inline
- Logs del servidor para debugging

---

**Última actualización:** 6 de enero de 2026
**Versión:** 1.0
**Autor:** Sistema de IA - GitHub Copilot
