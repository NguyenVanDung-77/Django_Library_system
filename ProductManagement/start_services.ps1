# Library SOA Services Startup Script with Consul Integration
Write-Host "Starting Library SOA Services with Consul..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Check if Consul is running
Write-Host ""
Write-Host "[Checking] Consul availability..." -ForegroundColor Yellow
try {
    $consulResponse = Invoke-WebRequest -Uri "http://localhost:8500/v1/status/leader" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Consul is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Consul is not running!" -ForegroundColor Red
    Write-Host "Please start Consul first with: consul agent -dev" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue without Consul? (y/n)"
    if ($continue -ne "y") {
        exit
    }
}

# Function to start service in new PowerShell window
function Start-Service {
    param($ServiceName, $Port, $Path)
    
    Write-Host "[Starting] $ServiceName on port $Port..." -ForegroundColor Yellow
    
    $scriptBlock = {
        param($path, $port)
        Set-Location $path
        Write-Host "Starting service on port $port..." -ForegroundColor Cyan
        python manage.py runserver "127.0.0.1:$port"
    }
    
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "& {$($scriptBlock.ToString())} '$Path' '$Port'" -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# Get the script directory (ProductManagement folder)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start all services
Start-Service "User Service" 8001 "$scriptDir\library_soa\user_service"
Start-Service "Book Service" 8002 "$scriptDir\library_soa\book_service"  
Start-Service "Borrow Service" 8003 "$scriptDir\library_soa\borrow_service"
Start-Service "API Gateway" 8000 "$scriptDir\library_soa\api_gateway"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Services available at:" -ForegroundColor Cyan
Write-Host "- API Gateway:    http://127.0.0.1:8000" -ForegroundColor White
Write-Host "- User Service:   http://127.0.0.1:8001" -ForegroundColor White  
Write-Host "- Book Service:   http://127.0.0.1:8002" -ForegroundColor White
Write-Host "- Borrow Service: http://127.0.0.1:8003" -ForegroundColor White
Write-Host ""
Write-Host "Gateway Routes:" -ForegroundColor Cyan
Write-Host "- Users API:    http://127.0.0.1:8000/api/users/..." -ForegroundColor White
Write-Host "- Books API:    http://127.0.0.1:8000/api/books/..." -ForegroundColor White
Write-Host "- Borrows API:  http://127.0.0.1:8000/api/borrows/..." -ForegroundColor White
Write-Host ""

# Wait for services to fully start
Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Register services with Consul
Write-Host ""
Write-Host "Registering services with Consul..." -ForegroundColor Yellow
try {
    Set-Location "$scriptDir\library_soa"
    python register_services.py register
    Write-Host "✅ Services registered with Consul" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Failed to register with Consul (services will still work with static config)" -ForegroundColor Yellow
}

# Test Gateway
Write-Host ""
try {
    Write-Host "Testing API Gateway..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/gateway/info/" -Method GET -UseBasicParsing
    Write-Host "✅ API Gateway is responding!" -ForegroundColor Green
} catch {
    Write-Host "❌ API Gateway not responding yet. Please wait a moment." -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 SOA Library System is ready!" -ForegroundColor Magenta
Write-Host ""
Write-Host "Check service discovery status with:" -ForegroundColor Cyan
Write-Host "  cd library_soa; python register_services.py status" -ForegroundColor White
Write-Host ""