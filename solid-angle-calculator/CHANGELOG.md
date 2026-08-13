# Changelog

All notable changes to the Solid Angle & 3D Visibility Calculator are documented here.

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
- Simple Calculator QA checklist.

## [0.1.1-dev]

### Added

- Immutable 3D vector utility module.
- Closed-form cone, circular-target, rectangle, and sphere solid-angle functions.
- Robust signed triangle solid-angle calculation using the `atan2` vector formulation.
- Triangulated-surface solid-angle accumulation with orientation preserved until final magnitude.
- Steradian, square-degree, sphere-percentage, hemisphere-percentage, and equivalent-cone conversions.
- Browser-based mathematical-core test suite.
- Translation, rotation, and uniform-scale invariance tests.

### Clarified

- Sphere boundary case (`observer distance = radius`) returns the limiting visible solid angle of `2π sr`.
- General polygon calculations will sum signed triangle contributions before converting the final result to magnitude.

## [0.1.0-dev]

### Added

- Standalone application scaffold.
- Simple Calculator and Spatial / GIS mode tabs.
- Responsive two-panel layout.
- Embed-mode detection using `?embed=1`.
- Version constant and version display.
- Modular JavaScript directory structure.
