$ErrorActionPreference = 'Stop'
$tool = Join-Path $PSScriptRoot '.local/cloudflared.exe'
if (-not (Test-Path $tool)) { throw 'Disponibilize o cloudflared oficial em .local/cloudflared.exe.' }
try { $response = Invoke-WebRequest 'http://localhost:8081/' -UseBasicParsing }
catch { throw 'Inicie primeiro .\start-demo.ps1 e aguarde http://localhost:8081 abrir.' }
if ($response.StatusCode -ne 200) { throw 'A demonstração local ainda não está pronta.' }
Write-Host 'O link HTTPS aparecerá abaixo (trycloudflare.com).'
Write-Host 'Mantenha este computador ligado e os dois terminais abertos. Ctrl+C encerra o compartilhamento.'
& $tool tunnel --url http://127.0.0.1:8081 --no-autoupdate

