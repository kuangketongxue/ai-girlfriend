# 小暖 — 一键启动脚本（PowerShell）
# 双击运行即可

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  小暖 — AI女友 一键启动" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# 检查Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] 未安装Node.js" -ForegroundColor Red
    pause
    exit 1
}

# 启动服务器
Write-Host "[1/3] 启动服务器..." -ForegroundColor Yellow
$serverProcess = Start-Process node -ArgumentList "server.js" -WorkingDirectory $PSScriptRoot -PassThru -WindowStyle Minimized
Start-Sleep -Seconds 3

# 验证服务器
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing -TimeoutSec 5
    Write-Host "[OK] 服务器已启动" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] 服务器启动失败" -ForegroundColor Red
    pause
    exit 1
}

# 启动隧道
Write-Host "[2/3] 启动公网隧道..." -ForegroundColor Yellow
$tunnelProcess = Start-Process npx -ArgumentList "--yes localtunnel --port 3000" -WorkingDirectory $PSScriptRoot -PassThru -RedirectStandardOutput "$PSScriptRoot\tunnel-url.txt" -WindowStyle Hidden
Start-Sleep -Seconds 8

# 读取隧道URL
$tunnelUrl = ""
if (Test-Path "$PSScriptRoot\tunnel-url.txt") {
    $tunnelUrl = Get-Content "$PSScriptRoot\tunnel-url.txt" | Select-String "https://" | Select-Object -First 1
    $tunnelUrl = $tunnelUrl -replace ".*?(https://.*)", '$1'
}

if ($tunnelUrl) {
    Write-Host "[OK] 隧道已启动" -ForegroundColor Green
} else {
    Write-Host "[WARN] 隧道URL获取中，请稍候..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    $tunnelUrl = Get-Content "$PSScriptRoot\tunnel-url.txt" | Select-String "https://" | Select-Object -First 1
    $tunnelUrl = $tunnelUrl -replace ".*?(https://.*)", '$1'
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  下面是你的公网地址：" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  $tunnelUrl" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host ""
Write-Host "  复制这个地址，后面要用！" -ForegroundColor Yellow
Write-Host ""

# 打开浏览器激活隧道
Write-Host "[3/3] 打开浏览器激活隧道..." -ForegroundColor Yellow
Start-Process $tunnelUrl
Write-Host ""
Write-Host "[OK] 浏览器已打开，请点击页面上的 'Click to Continue'" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  最后一步（在手机上操作）：" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  1. 打开微信 → 设置 → 插件 → ClawBot" -ForegroundColor White
Write-Host "  2. 配置Webhook地址：" -ForegroundColor White
Write-Host "     $($tunnelUrl)/webhook" -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host "  3. 给绑定的账号发消息测试" -ForegroundColor White
Write-Host ""
Write-Host "  小暖现在在线等你聊天~" -ForegroundColor Magenta
Write-Host ""
Write-Host "  按 Ctrl+C 停止服务" -ForegroundColor Gray
Write-Host ""

# 保持运行
try {
    while ($true) { Start-Sleep -Seconds 60 }
} finally {
    Stop-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $tunnelProcess.Id -ErrorAction SilentlyContinue
}
