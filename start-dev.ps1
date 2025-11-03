# FloodSense Development Startup Script
# This script starts both the backend and frontend servers

Write-Host "╔═══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   FloodSense Development Startup      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if .env files exist
if (-not (Test-Path "server\.env")) {
    Write-Host "⚠ Server .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item "server\.env.example" -Destination "server\.env"
    Write-Host "✓ Created server\.env" -ForegroundColor Green
    Write-Host ""
}

if (-not (Test-Path "client\.env")) {
    Write-Host "⚠ Client .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item "client\.env.example" -Destination "client\.env"
    Write-Host "✓ Created client\.env" -ForegroundColor Green
    Write-Host ""
}

# Check MongoDB
Write-Host "🔍 Checking MongoDB..." -ForegroundColor Cyan
try {
    $mongoVersion = mongosh --eval "db.version()" --quiet 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MongoDB is running (version: $mongoVersion)" -ForegroundColor Green
    } else {
        throw "MongoDB not accessible"
    }
} catch {
    Write-Host "✗ MongoDB is not running!" -ForegroundColor Red
    Write-Host "  Please start MongoDB first: mongod" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting FloodSense servers..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend will run on: http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend will run on: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; Write-Host '🔧 Starting Backend Server...' -ForegroundColor Cyan; npm start"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; Write-Host '🎨 Starting Frontend Server...' -ForegroundColor Cyan; npm run dev"

Write-Host "✓ Servers started in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Wait for both servers to fully start" -ForegroundColor White
Write-Host "  2. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "  3. Check the server windows for any errors" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Keep this window open to see startup status" -ForegroundColor Yellow
Write-Host ""
