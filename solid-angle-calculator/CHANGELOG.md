# Changelog

## [1.0.0] — Stable

### Added

- Interactive 3D observer-target visualization with rotate, pan, zoom, fit, and reset controls.
- Precision selector for 3, 6, 9, or 12 decimal places.
- Unified result rendering for Simple and Spatial / GIS modes.
- JSON result export.
- Shareable URL state for supported calculation sizes.
- Shared-state restoration on page load.
- Spatial result visualization using the same observer-relative geometry and triangulation used by the calculation engine.
- Expanded About, methods, privacy, and scope documentation.
- Toolbox return link in standalone mode.
- Combined v1.0 release test suite.
- Stable version metadata and cache-busting strings.

### Changed

- The planned Three.js dependency was replaced by a dependency-free Canvas-based interactive 3D renderer. This preserves the required 3D visualization while keeping each toolbox application fully self-contained and minimizing runtime dependencies.
- Result formatting is centralized and user-selectable.
- Copy Result now supports both calculator modes.

### Stable baseline

v1.0.0 includes all functionality from development milestones 1–12: mathematical core, Simple Calculator, Cartesian spatial engine, WGS84/ECEF/ENU workflow, polygon validation and triangulation, GeoJSON import, Leaflet map, 3D visualization, export/share/embed support, and release QA.

## [0.6.0-dev]

- Cartesian XYZ workflow.
- WGS84 geographic workflow.
- GeoJSON Polygon import.
- Interactive geographic map.
- Planarity validation and internal triangulation.

## [0.2.0-dev]

- Complete Simple Calculator interface.

## [0.1.1-dev]

- Mathematical core and reference tests.

## [0.1.0-dev]

- Standalone application scaffold.
