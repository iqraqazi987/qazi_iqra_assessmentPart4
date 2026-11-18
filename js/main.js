const form = document.querySelector("#enquiry-form");
const weatherResult = document.querySelector("#weather-result");
const loadMapButton = document.querySelector("#load-map");
const mapFrame = document.querySelector("#map-frame");

const weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=51.089&longitude=-115.359&current=temperature_2m,weather_code,wind_speed_10m&timezone=America%2FEdmonton";
const mapUrl = "https://www.openstreetmap.org/export/embed.html?bbox=-115.45%2C50.98%2C-115.25%2C51.12&layer=mapnik&marker=51.089%2C-115.359";
const COOKIE_NAME = "trailEnquiry";
const weatherDescriptions = new Map([
  [0, "Clear sky"],
  [1, "Mainly clear"],
  [2, "Partly cloudy"],
  [3, "Overcast"],
  [45, "Fog"],
  [48, "Depositing rime fog"],
  [51, "Light drizzle"],
  [53, "Moderate drizzle"],
  [55, "Dense drizzle"],
  [56, "Light freezing drizzle"],
  [57, "Dense freezing drizzle"],
  [61, "Slight rain"],
  [63, "Moderate rain"],
  [65, "Heavy rain"],
  [66, "Light freezing rain"],
  [67, "Heavy freezing rain"],
  [71, "Slight snow"],
  [73, "Moderate snow"],
  [75, "Heavy snow"],
  [77, "Snow grains"],
  [80, "Slight rain showers"],
  [81, "Moderate rain showers"],
  [82, "Violent rain showers"],
  [85, "Slight snow showers"],
  [86, "Heavy snow showers"],
  [95, "Thunderstorm"],
  [96, "Thunderstorm with slight hail"],
  [99, "Thunderstorm with heavy hail"],
]);

async function loadWeather() {
  if (!(weatherResult instanceof HTMLElement)) {
    throw new Error("The weather result region could not be found.");
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(weatherUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Weather service returned HTTP ${response.status}.`);
    }

    const payload = await response.json();
    const current = payload?.current;
    const temperature = current?.temperature_2m;
    const windSpeed = current?.wind_speed_10m;
    const weatherCode = current?.weather_code;

    if (
      typeof temperature !== "number" ||
      !Number.isFinite(temperature) ||
      typeof windSpeed !== "number" ||
      !Number.isFinite(windSpeed) ||
      typeof weatherCode !== "number" ||
      !Number.isInteger(weatherCode)
    ) {
      throw new Error("Weather service returned an unexpected response.");
    }

    const description = weatherDescriptions.get(weatherCode) ?? "Conditions unavailable";
    const temperatureText = new Intl.NumberFormat("en-CA", {
      maximumFractionDigits: 1,
      style: "unit",
      unit: "celsius",
      unitDisplay: "short",
    }).format(temperature);
    const windText = new Intl.NumberFormat("en-CA", {
      maximumFractionDigits: 0,
    }).format(windSpeed);

    weatherResult.textContent = `${description} · ${temperatureText} · Wind ${windText} km/h`;
  } catch (error) {
    weatherResult.textContent = error instanceof Error && error.name === "AbortError"
      ? "Weather is taking too long to load. Please try again later."
      : "Current weather is unavailable. Please check your connection and try again later.";
  } finally {
    window.clearTimeout(timeoutId);
  }
}

if (loadMapButton instanceof HTMLButtonElement && mapFrame instanceof HTMLElement) {
  loadMapButton.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.title = "OpenStreetMap showing Canmore trailheads in Alberta";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer";
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    iframe.src = mapUrl;

    const fallback = document.createElement("p");
    fallback.className = "map-card__fallback";
    fallback.textContent = "If the map does not appear, use the OpenStreetMap link below.";
    mapFrame.replaceChildren(iframe, fallback);
  });
}

void loadWeather();

if (!(form instanceof HTMLFormElement)) {
  throw new Error("The trail enquiry form could not be found.");
}

const fields = [...form.querySelectorAll("input, textarea")];
const status = form.querySelector("#form-status");
const validationTimers = new WeakMap();
const touchedFields = new WeakSet();
let hasSubmitted = false;

window.addEventListener("error", (event) => {
  console.error("[monitor] Unhandled page error:", event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("[monitor] Unhandled promise rejection:", event.reason);
});

if (!(status instanceof HTMLElement)) {
  throw new Error("The form status region could not be found.");
}

function getError(field) {
  const value = field.value.trim();

  if (field.name === "name" && value === "") {
    return "Enter your name.";
  }

  if (field.name === "email") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value === "") {
      return "Enter your email address.";
    }
    if (!emailPattern.test(value)) {
      return "Enter an email address in the format name@example.com.";
    }
  }

  if (field.name === "message") {
    if (value === "") {
      return "Enter a message.";
    }
    if (field.value.length > 500) {
      return "Keep your message to 500 characters or fewer.";
    }
  }

  return "";
}

function validateField(field) {
  const error = getError(field);
  const errorElement = form.querySelector(`#${field.id}-error`);

  field.setAttribute("aria-invalid", String(Boolean(error)));
  if (errorElement) {
    errorElement.textContent = error;
  }
  return error;
}

function setSecurePreferenceCookie() {
  if (!window.isSecureContext) {
    console.info("[privacy] SecureContext is unavailable; no preference cookie was stored.");
    return;
  }

  document.cookie = `${COOKIE_NAME}=submitted; Path=/; Max-Age=86400; Secure; SameSite=Lax`;
}

function validateTouchedFields() {
  const errors = [];
  for (const field of fields) {
    if (touchedFields.has(field) || hasSubmitted) {
      const error = validateField(field);
      if (error) {
        errors.push(error);
      }
    }
  }

  status.textContent = errors.length
    ? "Please correct the highlighted fields."
    : "";
}

form.addEventListener("input", (event) => {
  const field = event.target;
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
    return;
  }

  touchedFields.add(field);
  window.clearTimeout(validationTimers.get(field));
  validationTimers.set(field, window.setTimeout(() => {
    validateField(field);
    validateTouchedFields();
  }, 300));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  hasSubmitted = true;

  for (const field of fields) {
    window.clearTimeout(validationTimers.get(field));
    validateField(field);
  }
  const firstInvalidField = fields.find((field) => field.getAttribute("aria-invalid") === "true");

  if (firstInvalidField) {
    status.textContent = "Please correct the highlighted fields before sending your enquiry.";
    firstInvalidField.focus();
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      data[key] = value.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]);
    }
  }

  setSecurePreferenceCookie();
  console.log(JSON.stringify(data, null, 2));
  status.textContent = "Thanks! Your enquiry is valid and ready to send.";
});
