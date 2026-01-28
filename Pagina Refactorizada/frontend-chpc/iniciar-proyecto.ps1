# Script de inicio rápido para CHPC
# Inicia backend y frontend automáticamente

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INICIANDO PROYECTO CHPC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IP configurada: 192.168.2.117" -ForegroundColor Green
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "backend")) {
    Write-Host "[ERROR] No se encuentra el directorio backend" -ForegroundColor Red
    Write-Host "Ejecuta este script desde el directorio raiz del frontend" -ForegroundColor Yellow
    exit 1
}

# Función para iniciar proceso en nueva ventana
function Start-InNewWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$WorkingDirectory
    )
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkingDirectory'; Write-Host '$Title' -ForegroundColor Cyan; $Command"
}

Write-Host "[1/3] Iniciando Backend..." -ForegroundColor Yellow
Start-InNewWindow -Title "BACKEND - Puerto 5000" -Command "npm run start:dev" -WorkingDirectory "$PWD\backend"
Write-Host "[OK] Backend iniciado en nueva ventana" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Esperando 5 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host ""

Write-Host "[3/3] Iniciando Frontend..." -ForegroundColor Yellow
Start-InNewWindow -Title "FRONTEND - Puerto 8080" -Command "npm run serve" -WorkingDirectory "$PWD"
Write-Host "[OK] Frontend iniciado en nueva ventana" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PROYECTO INICIADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Acceso desde esta maquina:" -ForegroundColor Yellow
Write-Host "  http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "Acceso desde otros equipos en la red:" -ForegroundColor Yellow
Write-Host "  http://192.168.2.117:8080" -ForegroundColor White
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar esta ventana..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
