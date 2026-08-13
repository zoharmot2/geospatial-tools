import {
  steradiansToSquareDegrees,
  percentOfFullSphere,
  percentOfHemisphere,
  equivalentConeHalfAngle,
  radiansToDegrees,
  formatNumber,
} from "../core/units.js";
import { copyText, downloadJSON } from "../state/export.js";
import { createShareURL } from "../state/state.js";
import { createScene3D } from "../scene/scene-3d.js";

function derived(omega) {
  return {
    steradians: omega,
    squareDegrees: steradiansToSquareDegrees(omega),
    fullSpherePercent: percentOfFullSphere(omega),
    hemispherePercent: percentOfHemisphere(omega),
  };
}

export function initializeResultsUI({ appVersion }) {
  const empty = document.getElementById("result-empty");
  const content = document.getElementById("result-content");
  const precision = document.getElementById("result-precision");
  const copyButton = document.getElementById("copy-result");
  const exportButton = document.getElementById("export-result");
  const shareButton = document.getElementById("share-result");
  const actionStatus = document.getElementById("result-action-status");
  const scenePanel = document.getElementById("scene-3d-panel");
  const sceneCanvas = document.getElementById("scene-3d-canvas");
  const sceneStatus = document.getElementById("scene-3d-status");
  const scene = createScene3D({ canvas: sceneCanvas, statusElement: sceneStatus });
  let record = null;

  function decimals() {
    return Number(precision.value || 6);
  }

  function format(value, places = decimals()) {
    return formatNumber(value, places);
  }

  function setActionStatus(text) {
    actionStatus.textContent = text;
    actionStatus.hidden = !text;
    if (text) window.setTimeout(() => {
      if (actionStatus.textContent === text) actionStatus.hidden = true;
    }, 2200);
  }

  function render() {
    if (!record) {
      empty.hidden = false;
      content.hidden = true;
      scenePanel.hidden = true;
      copyButton.disabled = true;
      exportButton.disabled = true;
      shareButton.disabled = true;
      scene.setGeometry(null);
      return;
    }

    const values = derived(record.omega);
    const places = decimals();
    const srText = format(values.steradians, places);
    const degText = format(values.squareDegrees, places);
    const fullText = format(values.fullSpherePercent, places);
    const hemiText = format(values.hemispherePercent, places);

    document.getElementById("result-sr").textContent = srText;
    document.getElementById("result-deg2").textContent = degText;
    document.getElementById("result-sphere-pct").textContent = fullText;
    document.getElementById("result-hemi-pct").textContent = hemiText;

    let equivalent = "Not applicable";
    let equivalentNote = "requires Ω ≤ 2π";
    if (record.omega <= 2 * Math.PI + 1e-12) {
      const halfAngle = equivalentConeHalfAngle(Math.min(record.omega, 2 * Math.PI));
      equivalent = `${format(radiansToDegrees(halfAngle), places)}°`;
      equivalentNote = "equivalent cone half-angle";
    }
    document.getElementById("result-equivalent").textContent = equivalent;
    document.getElementById("result-equivalent-note").textContent = equivalentNote;

    const interpretation =
      `The target subtends ${srText} sr, equivalent to ${hemiText}% of a hemisphere ` +
      `and ${fullText}% of a full sphere.` +
      (equivalent !== "Not applicable"
        ? ` The same solid angle corresponds to a circular viewing cone with a half-angle of ${equivalent}.`
        : "");
    document.getElementById("result-interpretation").textContent = interpretation;

    empty.hidden = true;
    content.hidden = false;
    copyButton.disabled = false;
    exportButton.disabled = false;
    shareButton.disabled = !record.shareState;

    if (record.visualization) {
      scenePanel.hidden = false;
      scene.setGeometry(record.visualization);
    } else {
      scenePanel.hidden = true;
      scene.setGeometry(null);
    }
  }

  function displayResult(newRecord) {
    record = newRecord;
    render();
  }

  function clear() {
    record = null;
    render();
  }

  function exportPayload() {
    const values = derived(record.omega);
    return {
      tool: "Solid Angle & 3D Visibility Calculator",
      version: appVersion,
      mode: record.mode,
      calculation: record.exportData ?? {},
      result: {
        steradians: values.steradians,
        squareDegrees: values.squareDegrees,
        fullSpherePercent: values.fullSpherePercent,
        hemispherePercent: values.hemispherePercent,
      },
      warnings: record.warnings ?? [],
    };
  }

  copyButton.addEventListener("click", async () => {
    if (!record) return;
    const values = derived(record.omega);
    const p = decimals();
    const text = [
      "Solid Angle & 3D Visibility Calculator",
      `Mode: ${record.mode}`,
      record.title ? `Geometry: ${record.title}` : null,
      record.description ? `Input: ${record.description}` : null,
      `Solid angle: ${format(values.steradians, p)} sr`,
      `Square degrees: ${format(values.squareDegrees, p)} deg²`,
      `Full sphere: ${format(values.fullSpherePercent, p)}%`,
      `Hemisphere: ${format(values.hemispherePercent, p)}%`,
    ].filter(Boolean).join("\n");
    try {
      await copyText(text);
      setActionStatus("Result copied.");
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : "Copy failed.");
    }
  });

  exportButton.addEventListener("click", () => {
    if (!record) return;
    downloadJSON(exportPayload(), `solid-angle-${record.mode}-v${appVersion}.json`);
    setActionStatus("JSON exported.");
  });

  shareButton.addEventListener("click", async () => {
    if (!record?.shareState) return;
    try {
      const url = createShareURL(record.shareState);
      await copyText(url);
      setActionStatus("Share link copied.");
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : "Could not create share link.");
    }
  });

  precision.addEventListener("change", render);
  document.getElementById("scene-reset").addEventListener("click", () => scene.resetView());
  document.getElementById("scene-fit").addEventListener("click", () => scene.fitView());

  clear();
  return { displayResult, clear, getRecord: () => record, render };
}
