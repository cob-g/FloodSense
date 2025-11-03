# FloodSense Connection Test Script
# Tests if backend and frontend are properly connected

Write-Host "╔═══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   FloodSense Connection Test          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Test 1: MongoDB
Write-Host "Test 1: MongoDB Connection" -ForegroundColor Cyan
try {
    $mongoVersion = mongosh --eval "db.version()" --quiet 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ PASS - MongoDB is running (v$mongoVersion)" -ForegroundColor Green
    } else {
        throw "MongoDB not accessible"
    }
} catch {
    Write-Host "  ✗ FAIL - MongoDB is not running" -ForegroundColor Red
    $allPassed = $false
}
Write-Host ""

# Test 2: Backend API
Write-Host "Test 2: Backend API (http://localhost:5000)" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/ping" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        Write-Host "  ✓ PASS - Backend is running" -ForegroundColor Green
        Write-Host "    Status: $($data.status)" -ForegroundColor Gray
        Write-Host "    Version: $($data.version)" -ForegroundColor Gray
    } else {
        throw "Unexpected status code"
    }
} catch {
    Write-Host "  ✗ FAIL - Backend is not responding" -ForegroundColor Red
    Write-Host "    Make sure to run: cd server && npm start" -ForegroundColor Yellow
    $allPassed = $false
}
Write-Host ""

# Test 3: Frontend
Write-Host "Test 3: Frontend (http://localhost:5173)" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ PASS - Frontend is running" -ForegroundColor Green
    } else {
        throw "Unexpected status code"
    }
} catch {
    Write-Host "  ✗ FAIL - Frontend is not responding" -ForegroundColor Red
    Write-Host "    Make sure to run: cd client && npm run dev" -ForegroundColor Yellow
    $allPassed = $false
}
Write-Host ""

# Test 4: CORS Configuration
Write-Host "Test 4: CORS Configuration" -ForegroundColor Cyan
$serverEnv = Get-Content "server\.env" -Raw -ErrorAction SilentlyContinue
if ($serverEnv -match "CLIENT_URL=http://localhost:5173") {
    Write-Host "  ✓ PASS - CLIENT_URL correctly set" -ForegroundColor Green
} else {
    Write-Host "  ✗ FAIL - CLIENT_URL not set to http://localhost:5173" -ForegroundColor Red
    Write-Host "    Edit server\.env and set: CLIENT_URL=http://localhost:5173" -ForegroundColor Yellow
    $allPassed = $false
}
Write-Host ""

# Test 5: Environment Files
Write-Host "Test 5: Environment Files" -ForegroundColor Cyan
$serverEnvExists = Test-Path "server\.env"
$clientEnvExists = Test-Path "client\.env"

if ($serverEnvExists -and $clientEnvExists) {
    Write-Host "  ✓ PASS - Both .env files exist" -ForegroundColor Green
} else {
    if (-not $serverEnvExists) {
        Write-Host "  ✗ FAIL - server\.env not found" -ForegroundColor Red
    }
    if (-not $clientEnvExists) {
        Write-Host "  ✗ FAIL - client\.env not found" -ForegroundColor Red
    }
    $allPassed = $false
}
Write-Host ""

# Summary
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "✓ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your FloodSense setup is ready!" -ForegroundColor Green
    Write-Host "Open http://localhost:5173 in your browser" -ForegroundColor Cyan
} else {
    Write-Host "✗ SOME TESTS FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues above and run this script again" -ForegroundColor Yellow
}
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
