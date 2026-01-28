# 📧 Servicio de Notificaciones por Email - CHPC

## 🎯 Descripción

Sistema completo de notificaciones por email utilizando **Nodemailer** y **@nestjs-modules/mailer** con plantillas HTML profesionales diseñadas con **Handlebars**.

## 🚀 Características

- ✅ Confirmación de pedidos al cliente
- ✅ Actualización de estado de pedidos
- ✅ Notificación de asignación a vendedores
- ✅ Notificaciones a administradores de nuevos pedidos
- ✅ Email de bienvenida a nuevos usuarios
- ✅ Recuperación de contraseña
- ✅ Plantillas HTML responsive y profesionales
- ✅ Integración completa con el sistema de pedidos

## 📦 Instalación

### 1. Las dependencias ya están instaladas:
```json
{
  "nodemailer": "^7.0.12",
  "@nestjs-modules/mailer": "^1.8.1",
  "handlebars": "^4.7.8"
}
```

### 2. Configurar Variables de Entorno

Edita el archivo [.env](c:\Users\Contabilidad\Documents\GitHub\CHPC-Web-Page\Pagina Refactorizada\frontend-chpc\backend\.env) y configura:

#### Para Gmail:
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=tu-contraseña-de-aplicacion
MAIL_FROM=tu-email@gmail.com
MAIL_FROM_NAME=CHPC
```

**⚠️ Importante para Gmail:**
1. Ve a https://myaccount.google.com/apppasswords
2. Genera una contraseña de aplicación
3. Usa esa contraseña en `MAIL_PASSWORD`

#### Para otros proveedores:

**Outlook/Hotmail:**
```env
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_SECURE=false
```

**Yahoo:**
```env
MAIL_HOST=smtp.mail.yahoo.com
MAIL_PORT=587
MAIL_SECURE=false
```

**SendGrid:**
```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=apikey
MAIL_PASSWORD=tu-api-key-de-sendgrid
```

### 3. Reiniciar el Servidor

```powershell
cd "Pagina Refactorizada\frontend-chpc\backend"
npm run start:dev
```

## 📋 Emails Implementados

### 1. Confirmación de Pedido
**Cuándo se envía:** Al crear un nuevo pedido
**Destinatario:** Cliente
**Plantilla:** `order-confirmation.hbs`

**Contenido:**
- Código del pedido
- Lista de productos
- Total
- Dirección de envío
- Fecha

### 2. Actualización de Estado
**Cuándo se envía:** Al cambiar el estado de gestión del pedido
**Destinatario:** Cliente
**Plantilla:** `order-status-update.hbs`

**Contenido:**
- Código del pedido
- Nuevo estado (Pendiente/En Trámite/Atendido/Cancelado)
- Nombre del vendedor (si aplica)
- Fecha de actualización

### 3. Pedido Asignado a Vendedor
**Cuándo se envía:** Al asignar un pedido a un vendedor
**Destinatario:** Vendedor asignado
**Plantilla:** `order-assigned.hbs`

**Contenido:**
- Código del pedido
- Nombre del cliente
- Total del pedido
- Enlace al panel de gestión

### 4. Nuevo Pedido (Administradores)
**Cuándo se envía:** Al crear un nuevo pedido
**Destinatarios:** Todos los administradores
**Plantilla:** `new-order-admin.hbs`

**Contenido:**
- Código del pedido
- Datos del cliente
- Cantidad de items
- Total
- Enlace al panel de gestión

### 5. Email de Bienvenida
**Cuándo se envía:** Al registrar un nuevo usuario
**Destinatario:** Nuevo usuario
**Plantilla:** `welcome.hbs`

**Contenido:**
- Nombre del usuario
- Características del servicio
- Enlace a la tienda

### 6. Recuperación de Contraseña
**Cuándo se envía:** Al solicitar recuperación de contraseña
**Destinatario:** Usuario
**Plantilla:** `password-reset.hbs`

**Contenido:**
- Enlace de recuperación
- Tiempo de expiración
- Advertencias de seguridad

## 🔧 Uso del Servicio

### Inyectar el MailService

```typescript
import { MailService } from '../mail/mail.service';

constructor(private mailService: MailService) {}
```

### Ejemplos de Uso

#### 1. Enviar confirmación de pedido
```typescript
await this.mailService.sendOrderConfirmation(
  'cliente@email.com',
  {
    codigo: 'CHPC-000001',
    nombre_cliente: 'Juan Pérez',
    total: 1500.00,
    items: [
      { nombre: 'Laptop Dell', cantidad: 1, precio: 1500.00 }
    ],
    direccion_envio: 'Calle 123, Ciudad'
  }
);
```

#### 2. Notificar cambio de estado
```typescript
await this.mailService.sendOrderStatusUpdate(
  'cliente@email.com',
  {
    codigo: 'CHPC-000001',
    nombre_cliente: 'Juan Pérez',
    estado_gestion: 'ATENDIDO',
    vendedor_nombre: 'María García'
  }
);
```

#### 3. Notificar asignación a vendedor
```typescript
await this.mailService.sendOrderAssignedToVendedor(
  'vendedor@email.com',
  {
    codigo: 'CHPC-000001',
    nombre_cliente: 'Juan Pérez',
    total: 1500.00,
    vendedor_nombre: 'María García'
  }
);
```

#### 4. Email de bienvenida
```typescript
await this.mailService.sendWelcomeEmail(
  'nuevo@email.com',
  {
    nombre: 'Pedro',
    apellido: 'González'
  }
);
```

#### 5. Recuperación de contraseña
```typescript
await this.mailService.sendPasswordResetEmail(
  'usuario@email.com',
  {
    nombre: 'Juan',
    resetToken: 'abc123xyz',
    resetUrl: 'http://localhost:8080/reset-password?token=abc123xyz'
  }
);
```

#### 6. Email personalizado
```typescript
// Con HTML
await this.mailService.sendCustomEmail(
  'destinatario@email.com',
  'Asunto del Email',
  '<h1>Contenido HTML</h1><p>Tu mensaje aquí</p>'
);

// Texto plano
await this.mailService.sendTextEmail(
  'destinatario@email.com',
  'Asunto del Email',
  'Contenido en texto plano'
);
```

## 🎨 Plantillas HTML

Las plantillas están ubicadas en: `backend/src/mail/templates/`

### Personalizar Plantillas

Puedes editar las plantillas `.hbs` para personalizar:
- Colores y estilos
- Contenido del mensaje
- Estructura del layout
- Logos e imágenes

**Ejemplo de sintaxis Handlebars:**
```handlebars
<p>Hola {{nombre}}</p>

{{#if vendedor}}
  <p>Atendido por: {{vendedor}}</p>
{{/if}}

{{#each items}}
  <tr>
    <td>{{this.nombre}}</td>
    <td>{{this.cantidad}}</td>
  </tr>
{{/each}}
```

## 🔍 Estructura de Archivos

```
backend/src/mail/
├── mail.module.ts           # Configuración del módulo
├── mail.service.ts          # Servicio con todos los métodos
└── templates/               # Plantillas HTML
    ├── order-confirmation.hbs
    ├── order-status-update.hbs
    ├── order-assigned.hbs
    ├── new-order-admin.hbs
    ├── welcome.hbs
    └── password-reset.hbs
```

## 🧪 Probar el Servicio

### 1. Crear un pedido
Haz un pedido desde el frontend y verifica que lleguen:
- Email al cliente (confirmación)
- Email a administradores (notificación)

### 2. Asignar un pedido
Toma un pedido como vendedor y verifica que lleguen:
- Email al cliente (estado actualizado)
- Email al vendedor (asignación)

### 3. Cambiar estado
Cambia el estado de un pedido y verifica que llegue:
- Email al cliente (estado actualizado)

## ⚠️ Solución de Problemas

### Error: "Invalid login"
- Verifica que el email y contraseña sean correctos
- Para Gmail, usa una contraseña de aplicación
- Verifica que la autenticación de 2 pasos esté activada (Gmail)

### Los emails no llegan
- Revisa la carpeta de spam
- Verifica las credenciales en `.env`
- Revisa los logs del servidor para errores
- Verifica que el puerto 587 no esté bloqueado

### Error de conexión
```bash
# Verificar conectividad
telnet smtp.gmail.com 587
```

### Los emails se ven mal formateados
- Verifica que las plantillas `.hbs` estén correctamente ubicadas
- Revisa la sintaxis de Handlebars
- Prueba abriendo el email en diferentes clientes

## 🔒 Seguridad

### Buenas Prácticas

1. **Nunca** guardes contraseñas en el código
2. Usa contraseñas de aplicación para Gmail
3. Mantén el archivo `.env` en `.gitignore`
4. Limita la tasa de envío de emails
5. Valida los emails antes de enviar

### Límites de Envío

**Gmail:** ~500 emails/día para cuentas gratuitas
**SendGrid:** Varía según el plan
**Outlook:** ~300 emails/día

## 📊 Integración Actual

El servicio de mail está **completamente integrado** con:

✅ **OrdersService** - Envía emails automáticamente en:
- Creación de pedidos
- Asignación a vendedores
- Cambios de estado
- Liberación de pedidos

## 🎯 Próximas Mejoras

- [ ] Cola de emails con Bull/Redis
- [ ] Reintentos automáticos en caso de error
- [ ] Tracking de emails abiertos
- [ ] Templates más avanzados con imágenes
- [ ] Envío programado de emails
- [ ] Notificaciones por WhatsApp
- [ ] Dashboard de estadísticas de emails

## 📞 Configuración por Proveedor

### Gmail (Recomendado para desarrollo)
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
```

### SendGrid (Recomendado para producción)
```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=TU_SENDGRID_API_KEY
```

### Mailgun
```env
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
```

### Amazon SES
```env
MAIL_HOST=email-smtp.us-east-1.amazonaws.com
MAIL_PORT=587
```

## 🎨 Ejemplo de Email Renderizado

Los emails incluyen:
- **Encabezados** con gradientes de color
- **Tablas** para mostrar productos
- **Botones** con enlaces a acciones
- **Footer** con información de contacto
- **Diseño responsive** para móviles
- **Colores corporativos** de CHPC

---

**¡El servicio de email está listo para usar!** 🎉

Para más información, revisa el código en:
- [mail.service.ts](backend/src/mail/mail.service.ts)
- [mail.module.ts](backend/src/mail/mail.module.ts)
- [Plantillas](backend/src/mail/templates/)
