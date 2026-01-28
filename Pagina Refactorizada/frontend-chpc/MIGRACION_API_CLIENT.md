# Resumen de Migración: axios → apiClient

## ✅ Migración Completada

Se ha migrado exitosamente el proyecto para centralizar todas las peticiones HTTP usando `import apiClient from '@/services/api'`.

### 🔧 Cambios Realizados

#### 1. Configuración del apiClient
- **Archivo**: `src/services/api.js`
- **Configuración**:
  - BaseURL: Utiliza `API_BASE_URL` desde `@/config/api`
  - Timeout: 10 segundos
  - Headers por defecto: `Content-Type: application/json`
  - Interceptor automático: Añade el token de autorización (`Bearer ${access_token}`) a todas las peticiones

#### 2. Archivos Migrados (19 archivos)
Los siguientes archivos ahora utilizan `apiClient` en lugar de `axios` directamente:

**Componentes principales:**
- `TodosLosProductos.js`
- `SesionUsuario.js` 
- `RegistroUsuario.js`
- `ProductosPorMarca.js`
- `ProductosPorCategoria.js`
- `ProductoDetalle.js`
- `PerfilUsuario.js`
- `HomePage.js`
- `HeaderAnth.js`

**Componentes Vue:**
- `RestablecerPassword.vue`
- `Promociones.vue`
- `OlvidePassword.vue`

**Paneles administrativos:**
- `PanelVendedores.js`
- `PanelTecnicos.js`
- `AdminProductos.js`

**Notificaciones:**
- `NotificationsPanel.js`
- `NotificationsBell.js`

**Otros:**
- `CarritoCompras.js`
- `CarouselBanner.js`

#### 3. Beneficios de la Migración

**Centralización:**
- Todas las peticiones ahora pasan por un cliente centralizado
- Configuración unificada para headers, timeouts y base URL

**Autenticación Automática:**
- El token de acceso se añade automáticamente a todas las peticiones
- No es necesario gestionar manualmente headers de autenticación en cada componente

**Mantenibilidad:**
- Cambios en la configuración de API se realizan en un solo lugar
- Fácil implementación de interceptores globales para manejo de errores
- Configuración consistente en todo el proyecto

**Código más limpio:**
- Eliminación de imports duplicados de axios y API_BASE_URL
- Peticiones más simples: `apiClient.get('/endpoint')` vs `axios.get(\`\${API_BASE_URL}/endpoint\`)`

### 🔄 Antes y Después

**Antes:**
```javascript
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

// En cada método:
const response = await axios.get(`${API_BASE_URL}/tienda/productos`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Después:**
```javascript
import apiClient from '@/services/api';

// En cada método:
const response = await apiClient.get('/tienda/productos');
// El token se añade automáticamente
```

### 📁 Archivos que Mantienen axios Directamente

Los siguientes archivos mantienen `axios` por razones específicas:

**Configuración (correcto):**
- `src/config/axiosConfig.js` - Configuración global de interceptores
- `src/services/api.js` - Creación del apiClient

**Funcionalidades especiales (correcto):**
- Archivos del Dashboard - Usan endpoints locales específicos (`localhost:5000`)
- `CreateProduct.vue` - Posiblemente maneja uploads de archivos
- `AdminPanel.vue` - Funcionalidades administrativas específicas

### ✨ Próximos Pasos Recomendados

1. **Testing**: Verificar que todas las funcionalidades sigan funcionando correctamente
2. **Migración opcional**: Los archivos restantes pueden ser migrados si es necesario
3. **Interceptores adicionales**: Configurar manejo centralizado de errores si se desea
4. **Documentación**: Actualizar documentación del equipo sobre el uso de apiClient

### 🚀 Uso del apiClient

Para futuras implementaciones, usar:
```javascript
import apiClient from '@/services/api';

// GET
const response = await apiClient.get('/endpoint');

// POST
const response = await apiClient.post('/endpoint', data);

// PUT/PATCH/DELETE
await apiClient.put('/endpoint', data);
await apiClient.patch('/endpoint', data);
await apiClient.delete('/endpoint');
```

El token de autenticación y la baseURL se manejan automáticamente.