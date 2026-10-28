param(
    [switch]$SkipBuild,
    [switch]$UsePackage
)
$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    $localRoot = Join-Path $PSScriptRoot '.local'
    New-Item -ItemType Directory -Force -Path $localRoot | Out-Null
    $credentialsPath = Join-Path $localRoot 'mysql-credentials.json'
    if ($env:DB_USERNAME) {
        if (-not $env:DB_URL) { $env:DB_URL = 'jdbc:mysql://127.0.0.1:3306/banco' }
    } elseif (Test-Path $credentialsPath) {
        $credentials = Get-Content $credentialsPath -Raw | ConvertFrom-Json
        $mysqlRoot = Get-ChildItem (Join-Path $localRoot 'mysql') -Directory | Select-Object -First 1
        if (-not $mysqlRoot) { throw 'MySQL portátil não encontrado. Consulte DEMONSTRACAO.md para usar um MySQL instalado.' }
        $tcp = [Net.Sockets.TcpClient]::new()
        try { $tcp.Connect('127.0.0.1', 3306); $running = $true } catch { $running = $false } finally { $tcp.Dispose() }
        if (-not $running) {
            $dataPath = Join-Path $localRoot 'mysql-data'
            if (-not (Test-Path $dataPath)) { throw 'Banco portátil não encontrado. Importe database/banco.sql em uma instalação MySQL e configure DB_USERNAME e DB_PASSWORD.' }
            $config = Join-Path $localRoot 'mysql.ini'
            @"
[mysqld]
basedir="$($mysqlRoot.FullName.Replace('\','/'))"
datadir="$($dataPath.Replace('\','/'))"
bind-address=127.0.0.1
port=3306
mysqlx=OFF
"@ | Set-Content $config -Encoding ascii
            Start-Process -FilePath (Join-Path $mysqlRoot.FullName 'bin/mysqld.exe') -ArgumentList ('--defaults-file="' + $config + '" --console') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $localRoot 'mysql-output.log') -RedirectStandardError (Join-Path $localRoot 'mysql-error.log') | Out-Null
            $ready = $false
            for ($attempt = 0; $attempt -lt 30; $attempt++) {
                $probe = [Net.Sockets.TcpClient]::new()
                try { $probe.Connect('127.0.0.1', 3306); $ready = $true } catch { } finally { $probe.Dispose() }
                if ($ready) { break }
                Start-Sleep -Milliseconds 500
            }
            if (-not $ready) { throw 'O MySQL não iniciou. Consulte .local/mysql-error.log.' }
        }
        $env:DB_URL = 'jdbc:mysql://127.0.0.1:3306/banco'
        $env:DB_USERNAME = 'cuidados'
        $env:DB_PASSWORD = $credentials.appPassword
    } else {
        throw 'Configure DB_USERNAME, DB_PASSWORD e DB_URL para o MySQL da faculdade. Consulte DEMONSTRACAO.md.'
    }

    if (-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME 'bin/java.exe'))) {
        $jdk = Get-ChildItem (Join-Path $localRoot 'java') -Directory -ErrorAction SilentlyContinue |
            Where-Object { Test-Path (Join-Path $_.FullName 'bin/java.exe') } |
            Select-Object -First 1
        if ($jdk) { $env:JAVA_HOME = $jdk.FullName }
    }
    if (-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME 'bin/java.exe'))) {
        throw 'Configure JAVA_HOME com a pasta de um JDK 25.'
    }
    $secretPath = Join-Path $localRoot 'demo-jwt.key'
    if (-not $env:JWT_SECRET) {
        if (-not (Test-Path $secretPath)) {
            ([guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')) | Set-Content $secretPath -Encoding ascii
        }
        $env:JWT_SECRET = (Get-Content $secretPath -Raw).Trim()
    }
    if (-not $SkipBuild -and -not $UsePackage) {
        Push-Location frontend
        try {
            & npm.cmd run build
            if ($LASTEXITCODE -ne 0) { throw 'Não foi possível compilar a interface. Execute npm ci na pasta frontend e tente novamente.' }
        } finally { Pop-Location }
    }
    if (-not (Test-Path frontend/www/index.html)) { throw 'A interface compilada não foi encontrada em frontend/www. Consulte DEMONSTRACAO.md.' }
    Push-Location backend
    try {
        if (-not $UsePackage) {
            & .\mvnw.cmd -q -DskipTests package
            if ($LASTEXITCODE -ne 0) { throw 'Não foi possível compilar o backend.' }
        }
        $jar = 'target/cuidado-de-idosos-0.0.1-SNAPSHOT.jar'
        if (-not (Test-Path $jar)) { throw 'O backend compilado não foi encontrado. Compile o projeto antes de usar -UsePackage.' }
        Write-Host 'Após a inicialização, abra http://localhost:8081 no navegador.'
        Write-Host 'Mantenha este terminal aberto durante a apresentação. Ctrl+C encerra o aplicativo.'
        & (Join-Path $env:JAVA_HOME 'bin/java.exe') -jar $jar '--spring.profiles.active=mysql,demo'
        if ($LASTEXITCODE -ne 0) { throw 'Não foi possível iniciar o aplicativo. Verifique as mensagens acima.' }
    } finally { Pop-Location }
} finally { Pop-Location }

