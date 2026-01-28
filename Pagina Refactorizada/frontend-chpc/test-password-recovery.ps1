# Script de Prueba del Sistema de Recuperacion de Contrasenas

Write-Host "=== Prueba del Sistema de Recuperacion de Contrasenas ===" -ForegroundColor Cyan
Write-Host ""

$API_BASE = "http://localhost:5000/api"

# Verificar que el servidor este corriendo
Write-Host "1. Verificando conexion al servidor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/auth/login" -Method POST -ContentType "application/json" -Body '{"nombre_usuario":"test","contrasena":"test"}' -ErrorAction Stop
    Write-Host "   [OK] Servidor respondiendo" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   [OK] Servidor respondiendo (endpoint funcional)" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Error de conexion: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Asegurate de que el backend este corriendo en $API_BASE" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "2. Probando endpoint forgot-password..." -ForegroundColor Yellow

# Datos de prueba
$testEmail = Read-Host "Ingresa un email de prueba (debe existir en la BD)"

$body = @{
    email = $testEmail
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/auth/forgot-password" -Method POST -ContentType "application/json" -Body $body
    Write-Host "   [OK] Solicitud enviada exitosamente" -ForegroundColor Green
    Write-Host "   Mensaje: $($response.mensaje)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   IMPORTANTE: Revisa el correo de '$testEmail' para obtener el token" -ForegroundColor Yellow
} catch {
    Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 429) {
        Write-Host "   Rate limit alcanzado. Espera 15 minutos." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "3. Prueba de verificacion de token" -ForegroundColor Yellow
Write-Host "   Para probar, necesitas copiar el token del email recibido" -ForegroundColor Gray

$continuar = Read-Host "Deseas probar la verificacion de token? (s/n)"

if ($continuar -eq "s") {
    $token = Read-Host "Ingresa el token del email"
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/auth/verify-reset-token?token=$token" -Method GET
        Write-Host "   [OK] Token valido" -ForegroundColor Green
        Write-Host "   Email: $($response.email)" -ForegroundColor Cyan
        Write-Host "   Nombre: $($response.nombre)" -ForegroundColor Cyan
    } catch {
        Write-Host "   [ERROR] Token invalido o expirado" -ForegroundColor Red
    }
    
    Write-Host ""
    $probarReset = Read-Host "Deseas probar el reset de contrasena? (s/n)"
    
    if ($probarReset -eq "s") {
        $newPassword = Read-Host "Ingresa la nueva contrasena (min 6 chars, letra, numero y especial)"
        
        $resetBody = @{
            token = $token
            newPassword = $newPassword
        } | ConvertTo-Json
        
        try {
            $response = Invoke-RestMethod -Uri "$API_BASE/auth/reset-password" -Method POST -ContentType "application/json" -Body $resetBody
            Write-Host "   [OK] Contrasena actualizada exitosamente" -ForegroundColor Green
            Write-Host "   Mensaje: $($response.mensaje)" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "   IMPORTANTE: Revisa el correo de confirmacion" -ForegroundColor Yellow
        } catch {
            Write-Host "   [ERROR] Error al actualizar contrasena: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== Prueba Completada ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos pasos para testing completo:" -ForegroundColor Yellow
Write-Host "1. Verifica que ambos emails se reciban correctamente" -ForegroundColor Gray
Write-Host "2. Prueba el flujo desde el frontend:" -ForegroundColor Gray
Write-Host "   - Accede a http://localhost:8080/olvide-password" -ForegroundColor Gray
Write-Host "   - Ingresa el email y solicita el reset" -ForegroundColor Gray
Write-Host "   - Haz click en el enlace del email" -ForegroundColor Gray
Write-Host "   - Cambia la contrasena desde el formulario" -ForegroundColor Gray
Write-Host "3. Intenta hacer login con la nueva contrasena" -ForegroundColor Gray
Write-Host "4. Prueba casos de error:" -ForegroundColor Gray
Write-Host "   - Token invalido (modificar URL)" -ForegroundColor Gray
Write-Host "   - Token expirado (esperar 1 hora)" -ForegroundColor Gray
Write-Host "   - Rate limit (4+ intentos en 15 min)" -ForegroundColor Gray
Write-Host "   - Reutilizacion de token" -ForegroundColor Gray
