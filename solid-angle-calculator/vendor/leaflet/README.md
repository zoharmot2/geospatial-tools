# Leaflet 1.9.4

The Solid Angle & 3D Visibility Calculator keeps its runtime dependencies inside its own tool directory.

To vendor Leaflet locally on Windows, double-click:

`install-leaflet.cmd`

or run:

```powershell
powershell -ExecutionPolicy Bypass -File .\vendor\leaflet\install-leaflet.ps1
```

The installer downloads the official Leaflet 1.9.4 release archive from:

`https://github.com/Leaflet/Leaflet/releases/download/v1.9.4/leaflet.zip`

and copies `leaflet.js`, `leaflet.css`, and Leaflet's `images/` directory into this folder.

After installation the map code has no runtime dependency on a Leaflet CDN. Basemap image tiles are still fetched from OpenStreetMap when the map is displayed.
