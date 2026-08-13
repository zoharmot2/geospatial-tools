# Milestones 4–7 Integration

This development build combines:

1. **Milestone 4 — Cartesian Spatial Engine**
2. **Milestone 5 — Geographic WGS84 Engine**
3. **Milestone 6 — GeoJSON Import**
4. **Milestone 7 — Geographic Map**

## First-time map setup

Run:

`vendor/leaflet/install-leaflet.cmd`

Then restart or refresh the local web page.

## QA

1. Open `tests/` and verify the existing mathematical core remains green.
2. Open `tests/spatial.html` and verify all spatial tests pass.
3. In Spatial / GIS mode test the default Cartesian orthogonal triangle; expected solid angle is π/2 ≈ 1.570796327 sr.
4. Change to Geographic WGS84 and calculate the default triangle.
5. Import a GeoJSON Polygon.
6. Choose Draw / edit on map, place an observer, draw at least three target vertices, drag a vertex, and verify the coordinate table updates.
7. Edit a geographic vertex in the table and verify the map updates.
