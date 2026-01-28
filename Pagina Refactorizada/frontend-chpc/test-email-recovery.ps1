# Script para probar el envio de email de recuperacion

Write-Host "`n=== Test de Email de Recuperacion ===" -ForegroundColor Cyan
Write-Host ""

# Detectar puerto del backend
$API_BASE = $null
$ports = @(5000, 3000)

foreach ($port in $ports) {
    try {
        $testResponse = Invoke-WebRequest -Uri "http://localhost:$port/api" -Method GET -TimeoutSec 2 -ErrorAction Stop
        $API_BASE = "http://localhost:$port/api"
        Write-Host "[OK] Backend encontrado en puerto $port" -ForegroundColor Green
        break
    } catch {
        if ($_.Exception.Response.StatusCode) {
            $API_BASE = "http://localhost:$port/api"
            Write-Host "[OK] Backend encontrado en puerto $port" -ForegroundColor Green
            break
        }
    }
}

if (-not $API_BASE) {
    Write-Host "[ERROR] No se pudo conectar al backend" -ForegroundColor Red
    Write-Host "Asegurate de ejecutar: npm run start:dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
$email = Read-Host "Ingresa el email para probar (debe existir en la BD)"

Write-Host ""
Write-Host "Enviando solicitud de recuperacion..." -ForegroundColor Yellow

$body = @{ email = $email } | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/auth/forgot-password" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
    
    Write-Host ""
    Write-Host "[OK] Respuesta del servidor recibida" -ForegroundColor Green
    Write-Host "Mensaje: $($response.mensaje)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "IMPORTANTE:" -ForegroundColor Yellow
    Write-Host "1. Revisa los logs del backend para ver detalles del envio" -ForegroundColor Gray
    Write-Host "2. Busca mensajes que digan:" -ForegroundColor Gray
    Write-Host "   - 'Intentando enviar email de recuperacion a:'" -ForegroundColor Gray
    Write-Host "   - 'Email de recuperacion enviado exitosamente'" -ForegroundColor Gray
    Write-Host "   - 'El servicio de email retorno false'" -ForegroundColor Gray
    Write-Host "   - 'Error al enviar email de recuperacion'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Si no ves errores, revisa tu bandeja de entrada: $email" -ForegroundColor Gray
    Write-Host "4. Tambien revisa la carpeta de spam" -ForegroundColor Gray
    
} catch {
    Write-Host ""
    Write-Host "[ERROR] Error en la solicitud" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Codigo de estado: $statusCode" -ForegroundColor Yellow
        
        if ($statusCode -eq 429) {
            Write-Host "Rate limit alcanzado. Espera 15 minutos." -ForegroundColor Yellow
        }
    }
    
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Fin de la prueba ===" -ForegroundColor Cyan
Write-Host ""
