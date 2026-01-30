# frontend-chpc

Frontend de la aplicación CHPC construido con Vue.js 3.

## ⚠️ Importante: Estructura del Proyecto

Este repositorio contiene **SOLO el frontend**. El backend está en un repositorio separado:
- **Repositorio Backend**: `C:\Users\Contabilidad\Documents\GitHub\backend-chpc`
- **Backend Desplegado**: `https://backend-chpc.vercel.app`

### Carpeta `backend/` (IGNORAR)

La carpeta `backend/` en este repositorio **debe ser ignorada**. Es un remanente y no es el backend activo. 
- Está excluida en `.gitignore`
- Está excluida en `.vercelignore`

## Configuración del API

La URL del backend se configura en:
- **Archivo**: `src/config/api.js`
- **Variable de entorno**: `VUE_APP_API_URL` (archivo `.env`)

```javascript
// src/config/api.js
const backendUrl = 'https://backend-chpc.vercel.app/api';
```

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
