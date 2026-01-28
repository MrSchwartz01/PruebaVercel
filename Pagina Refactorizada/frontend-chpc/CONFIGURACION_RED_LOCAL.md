# 🌐 Configuración de Red Local para CHPC

Este documento explica cómo configurar y solucionar problemas de acceso desde otros equipos de la red local.

## 📋 Pasos de Configuración

### 1. Configurar Firewall de Windows

Ejecuta **como Administrador**:

```powershell
.\backend\configurar-firewall.ps1
```

Esto abrirá los puertos 8080 (frontend) y 5000 (backend) para tu red local.

### 2. Verificar Configuración de Red

Ejecuta **sin privilegios de administrador**:

```powershell
.\verificar-red.ps1
```

Este script te mostrará:
- ✅ Tus IPs locales
- ✅ Estado de los puertos (si están activos)
- ✅ Reglas de firewall
- ✅ URLs de acceso

### 3. Archivos de Configuración

#### Backend: `backend\.env`

```env
PORT=5000
DATABASE_URL="postgresql://postgres:1234567@localhost:5432/WebPage"

# IMPORTANTE: Incluir ambas URLs separadas por coma
CORS_ORIGIN=http://localhost:8080,http://192.168.2.117:8080
```

#### Frontend: `.env`

```env
# URL del backend (tu IP local)
VUE_APP_API_URL=http://192.168.2.117:5000/api
VUE_APP_PORT=8080
```

### 4. Iniciar los Servicios

**Backend** (en carpeta `backend/`):
```powershell
npm run start:dev
```

**Frontend** (en carpeta raíz de frontend-chpc):
```powershell
npm run serve
```

## 🔧 Solución de Problemas

### Problema: "No puedo cargar productos/banners desde otros equipos"

**Causa**: CORS no está configurando correctamente.

**Solución**:
1. Verifica que `CORS_ORIGIN` en `backend\.env` incluya ambas URLs:
   ```
   CORS_ORIGIN=http://localhost:8080,http://192.168.2.117:8080
   ```
2. Reinicia el backend: `npm run start:dev`
3. Verifica en consola del navegador si hay errores CORS

### Problema: "No puedo acceder desde otro equipo"

**Causa**: Firewall bloqueando las conexiones.

**Solución**:
1. Ejecuta `.\backend\configurar-firewall.ps1` como Admin
2. Verifica con `.\verificar-red.ps1`
3. Asegúrate de que ambos equipos estén en la misma red

### Problema: "El backend no escucha en la red local"

**Causa**: El servidor está escuchando solo en localhost.

**Solución**: Ya está configurado en `backend\src\main.ts`:
```typescript
await app.listen(port, '0.0.0.0'); // Escuchar en todas las interfaces
```

### Problema: "La base de datos no se conecta"

**Causa**: PostgreSQL solo acepta conexiones localhost.

**Solución** (si la DB está en otro equipo):
1. Edita `pg_hba.conf` de PostgreSQL
2. Agrega: `host all all 192.168.2.0/24 md5`
3. Reinicia PostgreSQL

## 📱 URLs de Acceso

### Desde esta máquina (localhost)
- Frontend: http://localhost:8080
- Backend: http://localhost:5000/api
- Swagger: http://localhost:5000/api/docs

### Desde otros equipos en la red
- Frontend: http://192.168.2.117:8080
- Backend: http://192.168.2.117:5000/api
- Swagger: http://192.168.2.117:5000/api/docs

## ✅ Checklist de Verificación

- [ ] Firewall configurado (ejecutar `configurar-firewall.ps1`)
- [ ] Backend `.env` con CORS correcto
- [ ] Frontend `.env` con IP local correcta
- [ ] Backend corriendo en puerto 5000
- [ ] Frontend corriendo en puerto 8080
- [ ] Ambos equipos en la misma red WiFi/Ethernet
- [ ] IP local verificada con `verificar-red.ps1`

## 🔍 Comandos Útiles

```powershell
# Ver IP local
ipconfig

# Ver puertos abiertos
netstat -ano | findstr ":5000"
netstat -ano | findstr ":8080"

# Ver reglas de firewall
Get-NetFirewallRule -DisplayName "*CHPC*"

# Probar conexión desde otro equipo
# En el otro equipo, abre navegador:
# http://192.168.2.117:8080
```

## 📝 Notas Importantes

1. **Cambia tu IP**: Si tu IP local cambia, actualiza:
   - `frontend\.env` → `VUE_APP_API_URL`
   - `backend\.env` → `CORS_ORIGIN`

2. **Red privada**: Asegúrate de estar en perfil de red "Privada" en Windows

3. **Antivirus**: Algunos antivirus pueden bloquear conexiones, agrega excepciones si es necesario

4. **Reiniciar servicios**: Después de cambiar `.env`, reinicia backend y frontend

---

**¿Problemas?** Ejecuta `.\verificar-red.ps1` y revisa el estado de todos los componentes.
