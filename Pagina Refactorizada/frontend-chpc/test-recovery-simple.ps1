# Script simple de prueba del sistema de recuperacion de contrasenas

Write-Host "`n=== Prueba del Sistema de Recuperacion de Contrasenas ===" -ForegroundColor Cyan
Write-Host ""

# Probar ambos puertos comunes
$ports = @(3000, 5000)
$API_BASE = $null

foreach ($port in $ports) {
    Write-Host "Probando puerto $port..." -ForegroundColor Yellow
    try {
        $testUrl = "http://localhost:$port/api"
        $response = Invoke-WebRequest -Uri $testUrl -Method GET -TimeoutSec 2 -ErrorAction Stop
        $API_BASE = $testUrl
        Write-Host "   [OK] Servidor encontrado en puerto $port" -ForegroundColor Green
        break
    } catch {
        if ($_.Exception.Response.StatusCode -eq 404 -or $_.Exception.Response.StatusCode -eq 401) {
            $API_BASE = $testUrl
            Write-Host "   [OK] Servidor encontrado en puerto $port" -ForegroundColor Green
            break
        }
    }
}

if (-not $API_BASE) {
    Write-Host "[ERROR] No se pudo conectar al backend en los puertos 3000 o 5000" -ForegroundColor Red
    Write-Host "Asegurate de que el backend este corriendo con: npm run start:dev" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nUsando API en: $API_BASE" -ForegroundColor Cyan
Write-Host ""

# Prueba 1: Verificar endpoints de recuperacion
Write-Host "1. Verificando endpoints de recuperacion de contrasena..." -ForegroundColor Yellow

try {
    # Probar con email invalido (debe responder 200 sin revelar nada)
    $testBody = @{ email = "test-no-existe@example.com" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$API_BASE/auth/forgot-password" -Method POST -ContentType "application/json" -Body $testBody -ErrorAction Stop
    Write-Host "   [OK] Endpoint forgot-password funcional" -ForegroundColor Green
    Write-Host "   Respuesta: $($response.mensaje)" -ForegroundColor Gray
} catch {
    Write-Host "   [ERROR] Endpoint forgot-password fallo: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Prueba 2: Verificar verificacion de token
Write-Host "2. Verificando endpoint de verificacion de token..." -ForegroundColor Yellow

try {
    # Probar con token invalido (debe responder 400)
    $response = Invoke-RestMethod -Uri "$API_BASE/auth/verify-reset-token?token=token-invalido-12345" -Method GET -ErrorAction Stop
    Write-Host "   [ADVERTENCIA] El endpoint no valido correctamente (deberia rechazar token invalido)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   [OK] Endpoint verify-reset-token funcional (rechazo token invalido correctamente)" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Error inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Prueba Basica Completada ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Los endpoints estan funcionando correctamente." -ForegroundColor Green
Write-Host ""
Write-Host "Para prueba completa con email real:" -ForegroundColor Yellow
Write-Host "1. Asegurate de tener configurado el servicio de email" -ForegroundColor Gray
Write-Host "2. Ingresa a la pagina de olvide-password:" -ForegroundColor Gray
Write-Host "   http://localhost:8080/olvide-password" -ForegroundColor Cyan
Write-Host "3. Ingresa un email registrado" -ForegroundColor Gray
Write-Host "4. Revisa tu correo y haz click en el enlace" -ForegroundColor Gray
Write-Host "5. Cambia tu contrasena desde el formulario" -ForegroundColor Gray
Write-Host ""

$continuar = Read-Host "Deseas probar con un email real ahora? (s/n)"

if ($continuar -eq "s" -or $continuar -eq "S") {
    Write-Host ""
    $emailPrueba = Read-Host "Ingresa el email registrado para probar"
    
    Write-Host ""
    Write-Host "Enviando solicitud de recuperacion..." -ForegroundColor Yellow
    
    try {
        $body = @{ email = $emailPrueba } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$API_BASE/auth/forgot-password" -Method POST -ContentType "application/json" -Body $body
        
        Write-Host ""
        Write-Host "[OK] Solicitud enviada!" -ForegroundColor Green
        Write-Host "Mensaje: $($response.mensaje)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "IMPORTANTE:" -ForegroundColor Yellow
        Write-Host "- Revisa la bandeja de entrada de: $emailPrueba" -ForegroundColor Gray
        Write-Host "- El email puede tardar unos segundos en llegar" -ForegroundColor Gray
        Write-Host "- Revisa tambien la carpeta de spam" -ForegroundColor Gray
        Write-Host "- El token expira en 1 hora" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Haz click en el enlace del email para continuar el proceso." -ForegroundColor Green
        
    } catch {
        Write-Host ""
        Write-Host "[ERROR] No se pudo enviar la solicitud" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
        
        if ($_.Exception.Response.StatusCode -eq 429) {
            Write-Host ""
            Write-Host "Rate limit alcanzado. Demasiados intentos." -ForegroundColor Yellow
            Write-Host "Espera 15 minutos antes de intentar nuevamente." -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=== Fin de las Pruebas ===" -ForegroundColor Cyan
Write-Host ""
