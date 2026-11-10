# Zips every talk folder in talks/ into talks/<folder>.zip (for the [download] link).
# Run from the website folder:   powershell -ExecutionPolicy Bypass -File scripts\zip-talks.ps1
# Re-run after changing a deck; existing zips are overwritten.

$root  = Split-Path -Parent $PSScriptRoot
$talks = Join-Path $root "talks"

Get-ChildItem -Path $talks -Directory | ForEach-Object {
    $zip = Join-Path $talks ($_.Name + ".zip")
    if (Test-Path $zip) { Remove-Item $zip -Force }
    Compress-Archive -Path $_.FullName -DestinationPath $zip -CompressionLevel Optimal
    $mb = [math]::Round((Get-Item $zip).Length / 1MB, 1)
    Write-Host ("zipped  talks/{0}/  ->  talks/{0}.zip  ({1} MB)" -f $_.Name, $mb)
    if ($mb -gt 90) { Write-Warning "$($_.Name).zip is over 90 MB - GitHub rejects files over 100 MB." }
}
