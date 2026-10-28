param(
    [ValidateSet('local', 'mysql')]
    [string]$Profile = 'local'
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$portableJavaRoot = Join-Path $projectRoot '.local/java'
$portableJdk = Get-ChildItem -LiteralPath $portableJavaRoot -Directory -ErrorAction SilentlyContinue |
    Where-Object { Test-Path (Join-Path $_.FullName 'bin/java.exe') } |
    Select-Object -First 1
if ($portableJdk) {
    $env:JAVA_HOME = $portableJdk.FullName
}
if (-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME 'bin/java.exe'))) {
    throw 'Instale um JDK 25 e configure JAVA_HOME, ou disponibilize o JDK portátil em .local/java.'
}
Push-Location $PSScriptRoot
try {
    & .\mvnw.cmd -q spring-boot:run "-Dspring-boot.run.profiles=$Profile"
    if ($LASTEXITCODE -ne 0) { throw 'O backend não conseguiu iniciar. Confira a mensagem do Maven acima.' }
} finally {
    Pop-Location
}

