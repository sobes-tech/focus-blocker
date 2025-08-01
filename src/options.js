const DEFAULT_BLOCKED_EVENTS = [
  "visibilitychange",
  "webkitvisibilitychange",
  "mozvisibilitychange",
  "msvisibilitychange",
  "blur",
  "focus",
  "focusin",
  "focusout",
];

const DEFAULT_HIGHLIGHT_ENABLED = true;
const DEFAULT_BORDER_COLOR = "#4169E1";
const DEFAULT_BORDER_OPACITY = 100;
const DEFAULT_WHITELIST_DOMAINS = ["code.yandex-team.ru", "*.meet2code.com", "*.cups.online"];

// Load saved settings
chrome.storage.sync.get(
  ["blockedEvents", "highlightEnabled", "borderColor", "borderOpacity", "whitelistDomains"],
  (result) => {
    const blockedEvents = result.blockedEvents || DEFAULT_BLOCKED_EVENTS;
    const highlightEnabled =
      result.highlightEnabled !== undefined ? result.highlightEnabled : DEFAULT_HIGHLIGHT_ENABLED;
    const borderColor = result.borderColor || DEFAULT_BORDER_COLOR;
    const borderOpacity = result.borderOpacity !== undefined ? result.borderOpacity : DEFAULT_BORDER_OPACITY;
    const whitelistDomains = result.whitelistDomains || DEFAULT_WHITELIST_DOMAINS;

    // Update toggles based on saved settings
    document.querySelectorAll(".toggle[data-event]").forEach((toggle) => {
      const event = toggle.dataset.event;
      if (!blockedEvents.includes(event)) {
        toggle.classList.remove("active");
      }
    });

    // Update border color picker
    document.getElementById("borderColor").value = borderColor;
    document.getElementById("borderColorValue").textContent = borderColor;

    // Update border opacity slider
    document.getElementById("borderOpacity").value = borderOpacity;
    document.getElementById("borderOpacityValue").textContent = borderOpacity + "%";

    // Update highlight enabled toggle
    const highlightToggle = document.getElementById("highlightEnabled");
    if (!highlightEnabled) {
      highlightToggle.classList.remove("active");
    }

    // Show/hide color and opacity settings based on enabled state
    updateHighlightSettingsVisibility(highlightEnabled);

    // Update whitelist domains
    document.getElementById("whitelistDomains").value = whitelistDomains.join("\n");
  }
);

// Handle toggle clicks for blocked events only
document.querySelectorAll(".toggle[data-event]").forEach((toggle) => {
  toggle.addEventListener("click", function () {
    this.classList.toggle("active");
    saveSettings();
  });
});

// Handle highlight enabled toggle separately
const highlightToggle = document.getElementById("highlightEnabled");
highlightToggle.addEventListener("click", function () {
  this.classList.toggle("active");
  const isEnabled = this.classList.contains("active");
  updateHighlightSettingsVisibility(isEnabled);
  saveSettings();
});

// Handle border color picker change
const borderColorPicker = document.getElementById("borderColor");
const borderColorValue = document.getElementById("borderColorValue");

borderColorPicker.addEventListener("input", function () {
  borderColorValue.textContent = this.value;
  saveSettings();
});

// Handle border opacity slider change
const borderOpacitySlider = document.getElementById("borderOpacity");
const borderOpacityValue = document.getElementById("borderOpacityValue");

borderOpacitySlider.addEventListener("input", function () {
  borderOpacityValue.textContent = this.value + "%";
  saveSettings();
});

// Handle whitelist domains change
const whitelistDomainsTextarea = document.getElementById("whitelistDomains");
whitelistDomainsTextarea.addEventListener("input", function () {
  saveSettings();
});

function updateHighlightSettingsVisibility(enabled) {
  const borderColorSettings = document.getElementById("borderColorSettings");
  const borderOpacitySettings = document.getElementById("borderOpacitySettings");

  if (enabled) {
    borderColorSettings.style.display = "flex";
    borderOpacitySettings.style.display = "flex";
  } else {
    borderColorSettings.style.display = "none";
    borderOpacitySettings.style.display = "none";
  }
}

function saveSettings() {
  const blockedEvents = [];

  // Collect all active toggles (only those with data-event attribute)
  document.querySelectorAll(".toggle[data-event].active").forEach((toggle) => {
    blockedEvents.push(toggle.dataset.event);
  });

  // Get highlight settings
  const highlightEnabled = highlightToggle.classList.contains("active");
  const borderColor = borderColorPicker.value;
  const borderOpacity = parseInt(borderOpacitySlider.value);

  // Get whitelist domains
  const whitelistDomains = whitelistDomainsTextarea.value
    .split("\n")
    .map((domain) => domain.trim())
    .filter((domain) => domain.length > 0);

  // Save to chrome storage
  chrome.storage.sync.set(
    {
      blockedEvents,
      highlightEnabled,
      borderColor,
      borderOpacity,
      whitelistDomains,
    },
    () => {
      // Show save confirmation
      const saveStatus = document.getElementById("saveStatus");
      saveStatus.classList.add("show");

      setTimeout(() => {
        saveStatus.classList.remove("show");
      }, 2000);
    }
  );
}
