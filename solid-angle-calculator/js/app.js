import { initializeSimpleCalculator } from "./ui/simple-ui.js";

const APP_VERSION = "0.2.0-dev";

function applyVersion() {
  const versionElement = document.getElementById("app-version");
  if (versionElement) versionElement.textContent = APP_VERSION;

  document.querySelectorAll("[data-version-text]").forEach((element) => {
    element.textContent = APP_VERSION;
  });
}

function applyEmbedMode() {
  const params = new URLSearchParams(window.location.search);
  const isEmbed = params.get("embed") === "1";

  document.body.classList.toggle("is-embed", isEmbed);

  document.querySelectorAll("[data-standalone-only]").forEach((element) => {
    element.hidden = isEmbed;
  });
}

function initializeModeTabs() {
  const tabs = [...document.querySelectorAll("[data-mode-target]")];
  const panels = [...document.querySelectorAll("[data-mode-panel]")];

  const setMode = (mode) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.modeTarget === mode;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    panels.forEach((panel) => {
      const active = panel.dataset.modePanel === mode;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.modeTarget));
  });
}

function initializeApp() {
  applyVersion();
  applyEmbedMode();
  initializeModeTabs();
  initializeSimpleCalculator();
}

initializeApp();

export { APP_VERSION };
