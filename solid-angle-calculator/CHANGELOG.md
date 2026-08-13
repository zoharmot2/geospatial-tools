# Changelog

## [0.6.0-dev]

### Added

- Cartesian XYZ observer and target workflow.
- WGS84 geographic input with direct geodetic-to-ECEF and observer-centered ENU conversion.
- Planarity classification for 3D polygons.
- 3D polygon projection to a local 2D plane.
- Simple-polygon self-intersection validation.
- Internal ear-clipping triangulation without a triangulation runtime dependency.
- Spatial solid-angle pipeline with signed triangle accumulation.
- Spatial diagnostics: vertex count, triangle count, planarity, centroid distance, nearest vertex distance, and farthest vertex distance.
- GeoJSON Polygon, Feature, and single-Polygon FeatureCollection import.
- Default height handling for 2D GeoJSON.
- Manual editable/reorderable target vertex table.
- Geographic map workflow with observer placement, target drawing, draggable geometry, fit-to-data, and table/map synchronization.
- Local Leaflet 1.9.4 vendoring installer.
- Browser and Node-compatible spatial reference tests.

### Implementation refinement

- The planned Earcut dependency was replaced by an internal ear-clipping triangulator for Version 1.0 simple polygons without holes. This reduces runtime dependencies while preserving the approved Version 1.0 geometry scope.

## [0.2.0-dev]

### Added

- Complete Simple Calculator user interface.
- Dynamic geometry selector for Cone, Circular Target, Rectangle, and Sphere.
- Angle-unit selection and cone half-angle/full-apex-angle input.
- Length-unit selector for dimensional geometries.
- Input validation with visible error messages.
- Result cards for steradians, square degrees, percentage of full sphere, and percentage of hemisphere.
- Equivalent circular-cone half-angle where applicable.
- Numerical interpretation panel.
- Geometry-specific assumptions and Show Formula panel.
- Reset and Copy Result controls.

## [0.1.1-dev]

### Added

- Immutable 3D vector utility module.
- Closed-form cone, circular-target, rectangle, and sphere solid-angle functions.
- Robust signed triangle solid-angle calculation using the atan2 vector formulation.
- Triangulated-surface solid-angle accumulation.
- Mathematical reference and invariance tests.

## [0.1.0-dev]

### Added

- Standalone application scaffold.
- Simple Calculator and Spatial / GIS mode tabs.
- Responsive two-panel layout.
- Embed-mode detection using `?embed=1`.
