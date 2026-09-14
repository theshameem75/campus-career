$ErrorActionPreference = "Stop"

$isAdministrator = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)

if (-not $isAdministrator) {
  $process = Start-Process powershell.exe -Verb RunAs -Wait -PassThru -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    ('"{0}"' -f $PSCommandPath)
  )
  if ($process.ExitCode -ne 0) {
    throw "Local HTTPS setup was cancelled or failed."
  }
  exit 0
}

$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root ".env"
$devHostLine = Get-Content -LiteralPath $envPath | Where-Object {
  $_ -match "^VITE_BLOCKS_DEV_HOST="
} | Select-Object -First 1

if (-not $devHostLine) {
  throw "VITE_BLOCKS_DEV_HOST is missing from .env."
}

$devHost = ($devHostLine -split "=", 2)[1].Trim().Trim('"').Trim("'")
$hostsPath = Join-Path $env:WINDIR "System32\drivers\etc\hosts"
$hostPattern = "(^|\s)$([regex]::Escape($devHost))(\s|$)"
$activeEntries = @(Get-Content -LiteralPath $hostsPath | Where-Object {
  $_ -notmatch "^\s*#" -and $_ -match $hostPattern
})

if ($activeEntries.Count -gt 0 -and $activeEntries -notmatch "^\s*127\.0\.0\.1\s+") {
  throw "$devHost is already mapped to another address in the hosts file."
}

if ($activeEntries.Count -eq 0) {
  Add-Content -LiteralPath $hostsPath -Value "127.0.0.1 $devHost"
}

$certPath = Join-Path $root ".cert\dev-cert.pem"
if (-not (Test-Path -LiteralPath $certPath)) {
  throw "Development certificate is missing. Run npm run cert first."
}

$certificate = [Security.Cryptography.X509Certificates.X509Certificate2]::new($certPath)
$trustedCertificate = Get-ChildItem Cert:\LocalMachine\Root | Where-Object {
  $_.Thumbprint -eq $certificate.Thumbprint
}
if (-not $trustedCertificate) {
  & certutil.exe -addstore -f Root $certPath | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Windows could not trust the development certificate."
  }
}

Write-Output "Local HTTPS is configured for https://${devHost}:5173"
