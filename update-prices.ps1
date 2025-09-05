# PowerShell script to update lab test prices
Write-Host "🔧 Updating all lab test prices to 200..." -ForegroundColor Yellow

# Check if sqlite3 is available
try {
    $dbPath = ".\backend\opd-emr.db"
    
    if (-not (Test-Path $dbPath)) {
        Write-Host "❌ Database file not found at: $dbPath" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "📁 Database path: $dbPath" -ForegroundColor Green
    
    # Use sqlite3 command line tool
    $updateQuery = "UPDATE lab_tests SET price = 200, updatedAt = CURRENT_TIMESTAMP;"
    $verifyQuery = "SELECT COUNT(*) as total, COUNT(CASE WHEN price = 200 THEN 1 END) as updated_count FROM lab_tests;"
    
    Write-Host "🔄 Updating prices..." -ForegroundColor Yellow
    
    # Execute update
    $updateResult = sqlite3 $dbPath $updateQuery 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Price update completed successfully!" -ForegroundColor Green
        
        # Verify update
        Write-Host "🔍 Verifying update..." -ForegroundColor Yellow
        $verifyResult = sqlite3 $dbPath $verifyQuery 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $lines = $verifyResult -split "`n"
            if ($lines.Count -ge 1) {
                $parts = $lines[0] -split "\|"
                if ($parts.Count -ge 2) {
                    $total = $parts[0].Trim()
                    $updated = $parts[1].Trim()
                    $successRate = [math]::Round(([int]$updated / [int]$total) * 100, 1)
                    
                    Write-Host "📊 Verification Results:" -ForegroundColor Cyan
                    Write-Host "   Total lab tests: $total" -ForegroundColor White
                    Write-Host "   Tests with price 200: $updated" -ForegroundColor White
                    Write-Host "   Success rate: $successRate%" -ForegroundColor White
                }
            }
        }
        
        Write-Host "🎉 All lab test prices have been successfully updated to 200!" -ForegroundColor Green
    } else {
        Write-Host "❌ Error updating prices: $updateResult" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure sqlite3 command line tool is installed and in PATH" -ForegroundColor Yellow
}
