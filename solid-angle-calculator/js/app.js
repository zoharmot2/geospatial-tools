import { initializeSimpleCalculator } from "./ui/simple-ui.js";
import { initializeSpatialCalculator } from "./ui/spatial-ui.js";
import { initializeResultsUI } from "./ui/results-ui.js";
import { readShareStateFromURL } from "./state/state.js";

const APP_VERSION = "1.0.0";

function applyVersion() {
  document.querySelectorAll("[data-version-text]").forEach((element) => { element.textContent = APP_VERSION; });
  const versionElement = document.getElementById("app-version"); if (versionElement) versionElement.textContent = APP_VERSION;
}

function applyEmbedMode() {
  const isEmbed = new URLSearchParams(window.location.search).get("embed") === "1";
  document.body.classList.toggle("is-embed", isEmbed);
  document.querySelectorAll("[data-standalone-only]").forEach((element) => { element.hidden = isEmbed; });
}

function initializeModeTabs({ resultsUI, spatialController }) {
  const tabs = [...document.querySelectorAll("[data-mode-target]")]; const panels = [...document.querySelectorAll("[data-mode-panel]")];
  function setMode(mode, { clear = true } = {}) {
    tabs.forEach((tab) => { const active = tab.dataset.modeTarget === mode; tab.classList.toggle("is-active", active); tab.setAttribute("aria-selected", String(active)); });
    panels.forEach((panel) => { const active = panel.dataset.modePanel === mode; panel.classList.toggle("is-active", active); panel.hidden = !active; });
    if (clear) resultsUI.clear();
    if (mode === "spatial") setTimeout(() => spatialController.onModeActivated(), 0);
  }
  tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.modeTarget)));
  return { setMode };
}

function showStartupMessage(text) {
  const element = document.getElementById("startup-message"); element.textContent = text; element.hidden = false;
}

function initializeApp() {
  applyVersion(); applyEmbedMode();
  const resultsUI = initializeResultsUI({ appVersion: APP_VERSION });
  const simpleController = initializeSimpleCalculator({ resultsUI });
  const spatialController = initializeSpatialCalculator({ resultsUI });
  const tabs = initializeModeTabs({ resultsUI, spatialController });

  try {
    const state = readShareStateFromURL();
    if (state?.mode === "simple") { tabs.setMode("simple", { clear: false }); simpleController.applyState(state); }
    else if (state?.mode === "spatial") { tabs.setMode("spatial", { clear: false }); spatialController.applyState(state); }
    else if (state) throw new Error("Unsupported shared calculation mode.");
  } catch (error) {
    showStartupMessage(error instanceof Error ? `Could not load shared calculation: ${error.message}` : "Could not load shared calculation.");
  }
}

initializeApp();
export { APP_VERSION };
