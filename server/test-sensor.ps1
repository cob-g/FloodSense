# PowerShell script to test sensor endpoint
# Run this after starting the server

Write-Host "`n🧪 Testing Sensor Endpoint...`n" -ForegroundColor Cyan

$serverUrl = "http://localhost:5000/api/sensor-data"

# Test 1: POST sensor data
Write-Host "Test 1: Posting sensor data..." -ForegroundColor Yellow
try {
    $body = @{
        distance = 12.34
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri $serverUrl -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "✅ POST successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ POST failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n---`n"

# Test 2: GET sensor data
Write-Host "Test 2: Getting sensor data..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $serverUrl -Method Get
    
    Write-Host "✅ GET successful!" -ForegroundColor Green
    Write-Host "Found $($response.count) readings" -ForegroundColor Gray
    if ($response.data.Count -gt 0) {
        Write-Host "Latest reading:" -ForegroundColor Gray
        $response.data[0] | ConvertTo-Json -Depth 2
    }
} catch {
    Write-Host "❌ GET failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n---`n"

# Test 3: GET latest reading
Write-Host "Test 3: Getting latest reading..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$serverUrl/latest" -Method Get
    
    Write-Host "✅ GET latest successful!" -ForegroundColor Green
    Write-Host "Latest reading:" -ForegroundColor Gray
    $response.data | ConvertTo-Json -Depth 2
} catch {
    Write-Host "❌ GET latest failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n✅ Testing complete!`n" -ForegroundColor Green
