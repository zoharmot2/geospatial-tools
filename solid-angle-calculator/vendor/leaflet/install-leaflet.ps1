$ErrorActionPreference = "Stop"

$Version = "1.9.4"
$Url = "https://github.com/Leaflet/Leaflet/releases/download/v$Version/leaflet.zip"
$Destination = $PSScriptRoot
$TempZip = Join-Path $env:TEMP "leaflet-$Version.zip"
$TempDir = Join-Path $env:TEMP "leaflet-$Version-extract"

Write-Host "Downloading Leaflet $Version from the official GitHub release..."
Invoke-WebRequest -Uri $Url -OutFile $TempZip

if (Test-Path $TempDir) {
    Remove-Item $TempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $TempDir | Out-Null

Expand-Archive -Path $TempZip -DestinationPath $TempDir -Force

$LeafletJs = Get-ChildItem $TempDir -Recurse -Filter "leaflet.js" | Select-Object -First 1
$LeafletCss = Get-ChildItem $TempDir -Recurse -Filter "leaflet.css" | Select-Object -First 1
$Images = Get-ChildItem $TempDir -Recurse -Directory -Filter "images" | Select-Object -First 1

if (-not $LeafletJs -or -not $LeafletCss -or -not $Images) {
    throw "Leaflet distribution files were not found in the downloaded archive."
}

Copy-Item $LeafletJs.FullName (Join-Path $Destination "leaflet.js") -Force
Copy-Item $LeafletCss.FullName (Join-Path $Destination "leaflet.css") -Force

$ImagesDestination = Join-Path $Destination "images"
if (Test-Path $ImagesDestination) {
    Remove-Item $ImagesDestination -Recurse -Force
}
Copy-Item $Images.FullName $ImagesDestination -Recurse -Force

Remove-Item $TempZip -Force
Remove-Item $TempDir -Recurse -Force

Write-Host ""
Write-Host "Leaflet $Version has been vendored successfully."
Write-Host "Files are now stored inside:"
Write-Host "  $Destination"
