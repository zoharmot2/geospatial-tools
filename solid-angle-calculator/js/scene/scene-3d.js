/**
 * Dependency-free interactive 3D visualization.
 * Uses an orthographic projection onto a 2D canvas after 3D rotation.
 * The visualization never changes the calculation geometry.
 */

function average(points) {
  if (!points.length) return { x: 0, y: 0, z: 0 };
  return points.reduce((acc, p) => ({
    x: acc.x + p.x / points.length,
    y: acc.y + p.y / points.length,
    z: acc.z + p.z / points.length,
  }), { x: 0, y: 0, z: 0 });
}

function bounds(points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const zs = points.map((p) => p.z);
  return {
    min: { x: Math.min(...xs), y: Math.min(...ys), z: Math.min(...zs) },
    max: { x: Math.max(...xs), y: Math.max(...ys), z: Math.max(...zs) },
  };
}

export function createScene3D({ canvas, statusElement = null }) {
  const ctx = canvas.getContext("2d");
  let geometry = null;
  let yaw = -0.75;
  let pitch = 0.55;
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let dragging = false;
  let dragMode = "rotate";
  let lastX = 0;
  let lastY = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    draw();
  }

  function resetView() {
    yaw = -0.75;
    pitch = 0.55;
    zoom = 1;
    panX = 0;
    panY = 0;
    draw();
  }

  function rotatePoint(point, center) {
    let x = point.x - center.x;
    let y = point.y - center.y;
    let z = point.z - center.z;

    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const x1 = cy * x - sy * y;
    const y1 = sy * x + cy * y;

    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const y2 = cp * y1 - sp * z;
    const z2 = sp * y1 + cp * z;

    return { x: x1, y: y2, z: z2 };
  }

  function makeProjector() {
    const points = [geometry.observer, ...geometry.vertices];
    const b = bounds(points);
    const center = {
      x: (b.min.x + b.max.x) / 2,
      y: (b.min.y + b.max.y) / 2,
      z: (b.min.z + b.max.z) / 2,
    };
    const span = Math.max(
      b.max.x - b.min.x,
      b.max.y - b.min.y,
      b.max.z - b.min.z,
      1e-12
    );
    const cssWidth = canvas.clientWidth || 1;
    const cssHeight = canvas.clientHeight || 1;
    const scale = (Math.min(cssWidth, cssHeight) * 0.34 / span) * zoom;

    return (point) => {
      const r = rotatePoint(point, center);
      return {
        x: cssWidth / 2 + panX + r.x * scale,
        y: cssHeight / 2 + panY - r.z * scale,
        depth: r.y,
      };
    };
  }

  function line(a, b, options = {}) {
    ctx.save();
    ctx.strokeStyle = options.stroke ?? "#6b7f88";
    ctx.lineWidth = options.width ?? 1.5;
    ctx.globalAlpha = options.alpha ?? 1;
    if (options.dash) ctx.setLineDash(options.dash);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
  }

  function pointMarker(p, label, observer = false) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, observer ? 7 : 6, 0, Math.PI * 2);
    ctx.fillStyle = observer ? "#172126" : "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = observer ? "#ffffff" : "#172126";
    ctx.stroke();
    ctx.fillStyle = "#172126";
    ctx.font = "600 12px system-ui, sans-serif";
    ctx.fillText(label, p.x + 9, p.y - 8);
    ctx.restore();
  }

  function drawAxes(project) {
    const origin = geometry.observer;
    const all = [origin, ...geometry.vertices];
    const b = bounds(all);
    const length = Math.max(
      b.max.x - b.min.x,
      b.max.y - b.min.y,
      b.max.z - b.min.z,
      1
    ) * 0.32;
    const o = project(origin);
    const axes = [
      [{ x: origin.x + length, y: origin.y, z: origin.z }, "X"],
      [{ x: origin.x, y: origin.y + length, z: origin.z }, "Y"],
      [{ x: origin.x, y: origin.y, z: origin.z + length }, "Z"],
    ];
    for (const [endPoint, label] of axes) {
      const end = project(endPoint);
      line(o, end, { stroke: "#98a6ad", width: 1 });
      ctx.save();
      ctx.fillStyle = "#6b7f88";
      ctx.font = "600 11px system-ui, sans-serif";
      ctx.fillText(label, end.x + 4, end.y - 4);
      ctx.restore();
    }
  }

  function draw() {
    const cssWidth = canvas.clientWidth || 1;
    const cssHeight = canvas.clientHeight || 1;
    const ratioX = canvas.width / cssWidth;
    const ratioY = canvas.height / cssHeight;
    ctx.setTransform(ratioX, 0, 0, ratioY, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.fillStyle = "#f7f9fa";
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    if (!geometry || geometry.vertices.length < 3) {
      ctx.fillStyle = "#5e6b73";
      ctx.font = "14px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Calculate a spatial target to display the 3D view.", cssWidth / 2, cssHeight / 2);
      ctx.textAlign = "start";
      return;
    }

    const project = makeProjector();
    drawAxes(project);

    const projectedVertices = geometry.vertices.map(project);
    const projectedObserver = project(geometry.observer);

    const orderedTriangles = geometry.triangleIndices
      .map((indices) => ({
        indices,
        depth: indices.reduce((sum, index) => sum + projectedVertices[index].depth, 0) / 3,
      }))
      .sort((a, b) => a.depth - b.depth);

    for (const triangle of orderedTriangles) {
      const points = triangle.indices.map((index) => projectedVertices[index]);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.lineTo(points[2].x, points[2].y);
      ctx.closePath();
      ctx.fillStyle = "rgba(32, 95, 115, 0.17)";
      ctx.fill();
      ctx.strokeStyle = "rgba(32, 95, 115, 0.65)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    for (const vertex of projectedVertices) {
      line(projectedObserver, vertex, { stroke: "#8a9aa2", dash: [5, 4], alpha: 0.75 });
    }

    for (let i = 0; i < projectedVertices.length; i += 1) {
      const a = projectedVertices[i];
      const b = projectedVertices[(i + 1) % projectedVertices.length];
      line(a, b, { stroke: "#205f73", width: 2 });
    }

    pointMarker(projectedObserver, "Observer", true);
    projectedVertices.forEach((p, index) => pointMarker(p, `P${index + 1}`));
  }

  function setGeometry(value) {
    geometry = value && Array.isArray(value.vertices) && Array.isArray(value.triangleIndices)
      ? {
          observer: { ...value.observer },
          vertices: value.vertices.map((p) => ({ ...p })),
          triangleIndices: value.triangleIndices.map((t) => [...t]),
        }
      : null;
    if (statusElement) statusElement.textContent = geometry
      ? "Drag to rotate · Shift+drag to pan · Wheel to zoom"
      : "No spatial geometry loaded.";
    resetView();
  }

  canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    dragMode = event.shiftKey ? "pan" : "rotate";
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;

    if (dragMode === "pan") {
      panX += dx;
      panY += dy;
    } else {
      yaw += dx * 0.009;
      pitch = Math.max(-1.45, Math.min(1.45, pitch + dy * 0.009));
    }
    draw();
  });

  const endDrag = () => { dragging = false; };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const factor = Math.exp(-event.deltaY * 0.001);
    zoom = Math.max(0.2, Math.min(8, zoom * factor));
    draw();
  }, { passive: false });

  canvas.addEventListener("keydown", (event) => {
    const step = 0.08;
    if (event.key === "ArrowLeft") yaw -= step;
    else if (event.key === "ArrowRight") yaw += step;
    else if (event.key === "ArrowUp") pitch = Math.max(-1.45, pitch - step);
    else if (event.key === "ArrowDown") pitch = Math.min(1.45, pitch + step);
    else return;
    event.preventDefault();
    draw();
  });

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  return { setGeometry, resetView, fitView: resetView, resize };
}
