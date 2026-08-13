# Changelog

All notable changes to the Solid Angle & 3D Visibility Calculator are documented here.

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
- Placeholder modules for mathematical, spatial, map, 3D, input, UI, and state layers.
