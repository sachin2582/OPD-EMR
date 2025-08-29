Write-Host "Starting OPD-EMR Backend Server..." -ForegroundColor Green
Write-Host ""
Write-Host "This window will stay open to keep the server running." -ForegroundColor Yellow
Write-Host "Close this window to stop the server." -ForegroundColor Yellow
Write-Host ""
Write-Host "Server will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

try {
    node working-server.js
} catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
