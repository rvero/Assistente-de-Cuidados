$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8081/api'
$accounts = @(
    @{ nome = 'Carlos Silva'; email = 'testecuidador@exemplo.com'; password = '123456'; tipo = 'CUIDADOR' },
    @{ nome = 'Maria Santos'; email = 'testefamilia@exemplo.com'; password = '123456'; tipo = 'CLIENTE' }
)
foreach ($account in $accounts) {
    try {
        $null = Invoke-RestMethod "$base/auth/register" -Method Post -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes(($account | ConvertTo-Json)))
    } catch {
        if ([int]$_.Exception.Response.StatusCode -ne 409) { throw }
    }
    $body = @{ email = $account.email; password = $account.password } | ConvertTo-Json
    $session = Invoke-RestMethod "$base/auth/login" -Method Post -ContentType 'application/json' -Body $body
    if ($session.role -ne $account.tipo) { throw ('A conta ' + $account.email + ' possui outro tipo de perfil.') }
    Write-Host ($account.email + ' — conta disponível e login verificado.')
}

