/**
 * Geographic map controller.
 *
 * Leaflet must be vendored locally under vendor/leaflet/.
 * No Leaflet Draw plugin is required: observer/target editing uses core Leaflet
 * markers and map click events.
 */

export function createGeographicMapController({
  containerId,
  statusElement,
  onObserverChange = () => {},
  onVerticesChange = () => {},
}) {
  let map = null;
  let observerMarker = null;
  let vertexMarkers = [];
  let polygon = null;
  let observer = null;
  let vertices = [];
  let mode = "idle"; // idle | observer | target
  let targetDefaultHeight = 0;

  const L = window.L;

  if (!L) {
    if (statusElement) {
      statusElement.hidden = false;
      statusElement.innerHTML =
        "<strong>Map library not installed.</strong> Run the included Leaflet installer in <code>vendor/leaflet/</code>, then reload the page.";
    }
    return {
      available: false,
      setObserver() {},
      setVertices() {},
      setTargetDefaultHeight() {},
      beginObserverPlacement() {},
      beginTargetDrawing() {},
      stopDrawing() {},
      clearGeometry() {},
      fitToData() {},
      invalidateSize() {},
    };
  }

  if (statusElement) statusElement.hidden = true;

  map = L.map(containerId, {
    zoomControl: true,
  }).setView([31.78, 35.22], 8);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const observerIcon = L.divIcon({
    className: "observer-div-icon",
    html: '<span class="map-symbol map-symbol-observer">O</span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const vertexIcon = (index) =>
    L.divIcon({
      className: "target-div-icon",
      html: `<span class="map-symbol map-symbol-target">${index + 1}</span>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

  function updatePolygon() {
    if (polygon) {
      map.removeLayer(polygon);
      polygon = null;
    }

    if (vertices.length >= 2) {
      const latlngs = vertices.map((v) => [v.latitude, v.longitude]);
      polygon =
        vertices.length >= 3
          ? L.polygon(latlngs, { weight: 2, fillOpacity: 0.12 }).addTo(map)
          : L.polyline(latlngs, { weight: 2 }).addTo(map);
    }
  }

  function rebuildVertexMarkers() {
    vertexMarkers.forEach((marker) => map.removeLayer(marker));
    vertexMarkers = [];

    vertices.forEach((vertex, index) => {
      const marker = L.marker(
        [vertex.latitude, vertex.longitude],
        { draggable: true, icon: vertexIcon(index) }
      ).addTo(map);

      marker.bindTooltip(`Target vertex P${index + 1}`);

      marker.on("dragend", () => {
        const latlng = marker.getLatLng();
        vertices[index] = {
          ...vertices[index],
          longitude: latlng.lng,
          latitude: latlng.lat,
        };
        updatePolygon();
        onVerticesChange(vertices.map((v) => ({ ...v })));
      });

      vertexMarkers.push(marker);
    });

    updatePolygon();
  }

  function rebuildObserverMarker() {
    if (observerMarker) {
      map.removeLayer(observerMarker);
      observerMarker = null;
    }

    if (!observer) return;

    observerMarker = L.marker(
      [observer.latitude, observer.longitude],
      { draggable: true, icon: observerIcon }
    ).addTo(map);

    observerMarker.bindTooltip("Observer");

    observerMarker.on("dragend", () => {
      const latlng = observerMarker.getLatLng();
      observer = {
        ...observer,
        longitude: latlng.lng,
        latitude: latlng.lat,
      };
      onObserverChange({ ...observer });
    });
  }

  map.on("click", (event) => {
    if (mode === "observer") {
      observer = {
        longitude: event.latlng.lng,
        latitude: event.latlng.lat,
        height: observer?.height ?? 0,
      };
      rebuildObserverMarker();
      onObserverChange({ ...observer });
      mode = "idle";
      return;
    }

    if (mode === "target") {
      vertices.push({
        longitude: event.latlng.lng,
        latitude: event.latlng.lat,
        height: targetDefaultHeight,
      });
      rebuildVertexMarkers();
      onVerticesChange(vertices.map((v) => ({ ...v })));
    }
  });

  function setObserver(value) {
    observer = value ? { ...value } : null;
    rebuildObserverMarker();
  }

  function setVertices(value) {
    vertices = (value ?? []).map((v) => ({ ...v }));
    rebuildVertexMarkers();
  }

  function setTargetDefaultHeight(value) {
    if (Number.isFinite(Number(value))) targetDefaultHeight = Number(value);
  }

  function beginObserverPlacement() {
    mode = "observer";
  }

  function beginTargetDrawing() {
    mode = "target";
  }

  function stopDrawing() {
    mode = "idle";
  }

  function clearGeometry() {
    observer = null;
    vertices = [];
    rebuildObserverMarker();
    rebuildVertexMarkers();
    onObserverChange(null);
    onVerticesChange([]);
  }

  function fitToData() {
    const latlngs = [];
    if (observer) latlngs.push([observer.latitude, observer.longitude]);
    vertices.forEach((v) => latlngs.push([v.latitude, v.longitude]));

    if (latlngs.length === 1) {
      map.setView(latlngs[0], 15);
    } else if (latlngs.length > 1) {
      map.fitBounds(latlngs, { padding: [30, 30] });
    }
  }

  return {
    available: true,
    setObserver,
    setVertices,
    setTargetDefaultHeight,
    beginObserverPlacement,
    beginTargetDrawing,
    stopDrawing,
    clearGeometry,
    fitToData,
    invalidateSize: () => map.invalidateSize(),
  };
}
