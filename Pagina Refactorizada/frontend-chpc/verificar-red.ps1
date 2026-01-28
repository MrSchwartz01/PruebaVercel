# Script para verificar configuración de red y mostrar URLs de acceso
# Ejecutar en PowerShell normal (no requiere administrador)

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACION DE RED - CHPC" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Obtener todas las IPs locales
Write-Host "[INFO] Obteniendo direcciones IP locales..." -ForegroundColor Yellow
Write-Host ""

$interfaces = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.IPAddress -ne "127.0.0.1"
}

if ($interfaces) {
    Write-Host "Interfaces de red encontradas:" -ForegroundColor Green
    Write-Host ""
    
    foreach ($interface in $interfaces) {
        $name = $interface.InterfaceAlias
        $ip = $interface.IPAddress
        
        Write-Host "  Adaptador: $name" -ForegroundColor White
        Write-Host "  IP: $ip" -ForegroundColor Cyan
        Write-Host ""
    }
} else {
    Write-Host "[ADVERTENCIA] No se encontraron interfaces de red activas" -ForegroundColor Yellow
    Write-Host ""
}

# IP configurada en el proyecto
$ipConfigurada = "192.168.2.117"
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  IP CONFIGURADA EN EL PROYECTO" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  IP: $ipConfigurada" -ForegroundColor Green
Write-Host ""

# URLs de acceso
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  URLS DE ACCESO" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "DESDE ESTA MAQUINA:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:8080" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000/api" -ForegroundColor White
Write-Host ""

Write-Host "DESDE OTROS EQUIPOS EN LA RED:" -ForegroundColor Yellow
Write-Host "  Frontend: http://$ipConfigurada:8080" -ForegroundColor White
Write-Host "  Backend:  http://$ipConfigurada:5000/api" -ForegroundColor White
Write-Host ""

# Verificar si los puertos están escuchando
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  ESTADO DE PUERTOS" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$puerto8080 = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
$puerto5000 = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue

if ($puerto8080) {
    Write-Host "  Puerto 8080 (Frontend): [ACTIVO]" -ForegroundColor Green
} else {
    Write-Host "  Puerto 8080 (Frontend): [INACTIVO]" -ForegroundColor Red
    Write-Host "    Ejecuta: npm run serve" -ForegroundColor Yellow
}

if ($puerto5000) {
    Write-Host "  Puerto 5000 (Backend):  [ACTIVO]" -ForegroundColor Green
} else {
    Write-Host "  Puerto 5000 (Backend):  [INACTIVO]" -ForegroundColor Red
    Write-Host "    Ejecuta: cd backend && npm run start:dev" -ForegroundColor Yellow
}

Write-Host ""

# Verificar firewall
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACION DE FIREWALL" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$reglaFirewall = Get-NetFirewallRule -DisplayName "*CHPC*" -ErrorAction SilentlyContinue

if ($reglaFirewall) {
    Write-Host "  Reglas de firewall: [CONFIGURADAS]" -ForegroundColor Green
    $reglaFirewall | ForEach-Object {
        Write-Host "    - $($_.DisplayName)" -ForegroundColor White
    }
} else {
    Write-Host "  Reglas de firewall: [NO CONFIGURADAS]" -ForegroundColor Red
    Write-Host "    Ejecuta como Administrador:" -ForegroundColor Yellow
    Write-Host "    .\backend\configurar-firewall.ps1" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar archivos .env
Write-Host "ARCHIVOS DE CONFIGURACION:" -ForegroundColor Yellow
Write-Host ""

$envFrontend = Test-Path ".env"
$envBackend = Test-Path "backend\.env"

if ($envFrontend) {
    Write-Host "  Frontend .env: [EXISTE]" -ForegroundColor Green
    $contenido = Get-Content ".env" | Select-String "VUE_APP_API_URL"
    if ($contenido) {
        Write-Host "    $contenido" -ForegroundColor White
    }
} else {
    Write-Host "  Frontend .env: [NO EXISTE]" -ForegroundColor Red
}

if ($envBackend) {
    Write-Host "  Backend .env:  [EXISTE]" -ForegroundColor Green
    $contenido = Get-Content "backend\.env" | Select-String "CORS_ORIGIN"
    if ($contenido) {
        Write-Host "    $contenido" -ForegroundColor White
    }
} else {
    Write-Host "  Backend .env:  [NO EXISTE]" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
