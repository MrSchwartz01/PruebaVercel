# 🚀 Guía Rápida de Instalación - Panel de Vendedores

## ✅ ¿Qué se ha creado?

### Backend (NestJS)
- ✅ Schema de Prisma actualizado con nuevos campos para gestión de vendedores
- ✅ DTOs para asignación y cambio de estado de pedidos
- ✅ Nuevos métodos en OrdersService
- ✅ Endpoints en OrdersController para vendedores y administradores
- ✅ Sistema de notificaciones integrado

### Frontend (Vue.js)
- ✅ Componente PanelVendedores.vue con interfaz completa
- ✅ Ruta configurada en el router
- ✅ Botón de acceso en el header para vendedores/admins

## 📦 Pasos de Instalación

### 1️⃣ Aplicar Migración de Base de Datos

Opción A - Usando el script automático (Recomendado):
```powershell
cd "Pagina Refactorizada\frontend-chpc\backend"
.\migrate-vendedores.ps1
```

Opción B - Manualmente:
```powershell
cd "Pagina Refactorizada\frontend-chpc\backend"
npx prisma migrate dev --name add_vendedor_fields_to_orders
npx prisma generate
```

Opción C - SQL directo (solo si hay problemas con Prisma):
```powershell
# Conectarse a PostgreSQL y ejecutar:
psql -U tu_usuario -d tu_base_de_datos -f migration_vendedores.sql
```

### 2️⃣ Reiniciar el Servidor Backend

```powershell
cd "Pagina Refactorizada\frontend-chpc\backend"
npm run start:dev
```

### 3️⃣ Verificar el Frontend

No requiere reinstalación. Los cambios son automáticos.

```powershell
cd "Pagina Refactorizada\frontend-chpc"
npm run serve
```

## 🎯 Acceso al Sistema

1. **Iniciar sesión** como usuario con rol `administrador` o `vendedor`
2. **Clic en el botón "📊 Pedidos"** en el header (solo visible para vendedores/admins)
3. O navegar directamente a: `http://localhost:8080/panel-vendedores`

## 🔑 Roles y Permisos

### Administrador
- ✅ Ver todos los pedidos
- ✅ Asignar cualquier pedido a cualquier vendedor
- ✅ Desasignar cualquier pedido
- ✅ Cambiar estado de cualquier pedido

### Vendedor
- ✅ Ver todos los pedidos
- ✅ Tomar pedidos disponibles (asignárselos)
- ✅ Desasignar solo sus propios pedidos
- ✅ Cambiar estado solo de sus pedidos asignados

## 📊 Estados de Pedidos

| Estado | Descripción | Emoji |
|--------|-------------|-------|
| **PENDIENTE** | Pedido recién creado, sin atender | ⏳ |
| **EN_TRAMITE** | Vendedor trabajando en el pedido | 🔄 |
| **ATENDIDO** | Pedido completamente atendido | ✅ |
| **CANCELADO** | Pedido cancelado | ❌ |

## 🔧 API Endpoints

```
GET    /ordenes/panel/todas              - Listar todos los pedidos
POST   /ordenes/:id/asignar              - Asignar pedido a vendedor
DELETE /ordenes/:id/desasignar           - Desasignar pedido
PATCH  /ordenes/:id/estado-gestion       - Cambiar estado
GET    /ordenes/panel/mis-pedidos        - Mis pedidos asignados
```

## 🧪 Prueba Rápida

1. Crear un pedido como cliente normal
2. Login como vendedor
3. Ir a `/panel-vendedores`
4. Hacer clic en "📌 Tomar Pedido"
5. Cambiar el estado usando el selector

## 📝 Archivos Creados/Modificados

### Backend
```
✏️  backend/prisma/schema.prisma
✏️  backend/src/orders/orders.service.ts
✏️  backend/src/orders/orders.controller.ts
🆕 backend/src/orders/dto/assign-order.dto.ts
🆕 backend/src/orders/dto/update-estado-gestion.dto.ts
🆕 backend/migration_vendedores.sql
🆕 backend/migrate-vendedores.ps1
```

### Frontend
```
🆕 src/components/PanelVendedores/PanelVendedores.vue
✏️  src/router/index.js
✏️  src/components/HeaderAnth/HeaderAnth.vue
✏️  src/components/HeaderAnth/HeaderAnth.js
✏️  src/components/HeaderAnth/HeaderAnth.css
```

### Documentación
```
🆕 PANEL_VENDEDORES_README.md
🆕 INSTALACION_RAPIDA.md
```

## ❓ Solución de Problemas

### Error: "Column 'estado_gestion' does not exist"
```powershell
# Ejecutar migración nuevamente
npx prisma migrate deploy
npx prisma generate
```

### Error: "No tienes permiso"
- Verificar que el usuario tenga rol `vendedor` o `administrador`
- Verificar en la tabla `usuarios` que el campo `rol` sea correcto

### Los pedidos no se cargan
- Verificar que el backend esté corriendo en el puerto correcto
- Revisar las variables de entorno (VUE_APP_API_URL)
- Abrir la consola del navegador para ver errores

### No aparece el botón "📊 Pedidos" en el header
- Limpiar caché del navegador (Ctrl + Shift + R)
- Verificar que localStorage tenga `user_rol` = `administrador` o `vendedor`
- Cerrar sesión y volver a iniciar

## 🔄 Actualización Automática

El panel se actualiza automáticamente cada **30 segundos** para mostrar nuevos pedidos y cambios de estado en tiempo real.

## 🎨 Personalización

### Cambiar colores de estado
Editar [PanelVendedores.vue](src/components/PanelVendedores/PanelVendedores.vue) líneas ~600-620

### Cambiar intervalo de actualización
Editar [PanelVendedores.vue](src/components/PanelVendedores/PanelVendedores.vue) línea ~396

### Modificar permisos
Editar [orders.controller.ts](backend/src/orders/orders.controller.ts) decoradores `@Roles()`

## 📞 Soporte

Para más detalles, consulta:
- [PANEL_VENDEDORES_README.md](PANEL_VENDEDORES_README.md) - Documentación completa
- [Backend API](backend/src/orders/) - Código fuente del backend
- [Frontend Component](src/components/PanelVendedores/) - Código fuente del frontend

---

¡Sistema listo para usar! 🎉
