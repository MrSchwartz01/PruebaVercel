# Panel de Gestión de Pedidos para Vendedores

## 📋 Descripción

Sistema completo de gestión de pedidos que permite a administradores y vendedores:
- Visualizar todos los pedidos en tiempo real
- Asignar pedidos a vendedores específicos
- Gestionar 4 estados: Pendiente, En Trámite, Atendido y Cancelado
- Filtrar y buscar pedidos
- Recibir notificaciones automáticas

## 🚀 Instalación

### 1. Ejecutar migración de base de datos

```bash
cd "Pagina Refactorizada/frontend-chpc/backend"
npx prisma migrate dev --name add_vendedor_fields_to_orders
```

### 2. Generar cliente de Prisma

```bash
npx prisma generate
```

### 3. Reiniciar el servidor backend

```bash
npm run start:dev
```

## 📊 Cambios en la Base de Datos

Se agregaron los siguientes campos a la tabla `ordenes`:

- `estado_gestion` (enum): Estado de gestión del pedido
  - PENDIENTE
  - EN_TRAMITE
  - ATENDIDO
  - CANCELADO
- `vendedor_id` (int, opcional): ID del vendedor asignado
- `vendedor_nombre` (string, opcional): Nombre del vendedor asignado

## 🎯 Endpoints de la API

### Para Administradores y Vendedores

#### 1. Obtener todos los pedidos
```
GET /ordenes/panel/todas
Headers: Authorization: Bearer {token}
```

#### 2. Asignar un pedido
```
POST /ordenes/{id}/asignar
Headers: Authorization: Bearer {token}
Body: {
  "vendedor_nombre": "Juan Pérez"
}
```

#### 3. Desasignar un pedido
```
DELETE /ordenes/{id}/desasignar
Headers: Authorization: Bearer {token}
```

#### 4. Cambiar estado de gestión
```
PATCH /ordenes/{id}/estado-gestion
Headers: Authorization: Bearer {token}
Body: {
  "estado_gestion": "EN_TRAMITE" // PENDIENTE | EN_TRAMITE | ATENDIDO | CANCELADO
}
```

#### 5. Obtener mis pedidos asignados
```
GET /ordenes/panel/mis-pedidos
Headers: Authorization: Bearer {token}
```

## 🖥️ Uso del Frontend

### Acceder al Panel

1. Iniciar sesión como administrador o vendedor
2. Navegar a `/panel-vendedores`

### Funcionalidades

#### Filtros
- **Por estado**: Pendiente, En Trámite, Atendido, Cancelado
- **Por vista**: 
  - Todos los pedidos
  - Mis pedidos asignados
  - Pedidos disponibles (sin asignar)

#### Acciones sobre pedidos

**Para pedidos sin asignar:**
- Botón "📌 Tomar Pedido" - Asigna el pedido al vendedor actual

**Para pedidos asignados:**
- Botón "🔓 Liberar Pedido" - Solo el vendedor asignado o admin
- Selector de estado - Cambiar entre los 4 estados disponibles

#### Estadísticas en tiempo real
- Total de pedidos pendientes
- Total en trámite
- Total atendidos
- Mis pedidos asignados

### Actualización automática
El panel se actualiza automáticamente cada 30 segundos para mostrar los cambios más recientes.

## 🔔 Sistema de Notificaciones

El sistema genera notificaciones automáticas para:
- Nuevos pedidos creados
- Pedidos asignados a vendedores
- Pedidos liberados
- Cambios de estado

Las notificaciones se envían a todos los administradores y vendedores.

## 🔒 Permisos

### Administrador
- Ver todos los pedidos
- Asignar cualquier pedido
- Desasignar cualquier pedido
- Cambiar estado de cualquier pedido

### Vendedor
- Ver todos los pedidos
- Tomar pedidos disponibles (asignárselos)
- Desasignar solo sus propios pedidos
- Cambiar estado solo de sus pedidos asignados

## 🎨 Características del UI

- **Código de colores por estado**:
  - 🟠 Naranja: Pendiente
  - 🔵 Azul: En Trámite
  - 🟢 Verde: Atendido
  - 🔴 Rojo: Cancelado

- **Tarjetas de pedido** con información completa:
  - Código de pedido
  - Fecha y hora
  - Cliente y datos de contacto
  - Lista de productos
  - Totales y descuentos
  - Observaciones
  - Vendedor asignado

- **Diseño responsive** adaptado a móviles y tablets

## 🔧 Personalización

### Cambiar intervalo de actualización automática

Edita el archivo `PanelVendedores.vue`:

```javascript
// En el mounted(), cambiar 30000 (30 segundos) por el valor deseado en ms
this.intervalo = setInterval(() => {
  this.cargarPedidos();
}, 30000); // Cambiar este valor
```

### Modificar colores del estado

Edita las clases CSS en `PanelVendedores.vue`:

```css
.pedido-card.estado-pendiente {
  border-left-color: #ffa726; /* Cambiar color */
}
```

## 📱 Agregar acceso rápido en el menú

Para agregar un enlace en tu header/navbar:

```vue
<router-link to="/panel-vendedores" v-if="esVendedorOAdmin">
  📊 Panel de Pedidos
</router-link>
```

## ⚠️ Notas Importantes

1. **Roles requeridos**: Solo usuarios con rol `administrador` o `vendedor` pueden acceder
2. **Token de autenticación**: Necesario en todas las peticiones
3. **Migración de base de datos**: Debe ejecutarse antes de usar el sistema
4. **Estado dual**: Los pedidos tienen dos estados independientes:
   - `status`: Estado de pago/envío (PENDING, PAID, etc.)
   - `estado_gestion`: Estado de atención por vendedor (PENDIENTE, EN_TRAMITE, etc.)

## 🐛 Solución de Problemas

### Error: "No tienes permiso"
- Verificar que el usuario tenga rol de `administrador` o `vendedor`
- Verificar que el token JWT sea válido

### Los pedidos no se cargan
- Verificar que el backend esté ejecutándose
- Verificar la URL del API en las variables de entorno
- Revisar la consola del navegador para errores

### No puedo cambiar el estado
- Solo puedes cambiar el estado de pedidos asignados a ti (o todos si eres admin)
- Verificar que el pedido tenga un vendedor asignado

## 📞 Soporte

Para más información o problemas, contactar al equipo de desarrollo.
