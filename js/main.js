'use strict';
(() => {
  const WEATHER_URL =
    'https://api.open-meteo.com/v1/forecast?latitude=51&longitude=-115&current_weather=true';

  /* ---- Monitoring: log every uncaught error / failed promise (see maintenance_plan.md) ---- */
  const logError = (type, detail) => console.error(`[monitor] ${type}:`, detail);
  window.addEventListener('error', e => logError('error', e.message));
  window.addEventListener('unhandledrejection', e => logError('promise', e.reason));

  /* ---- Secure cookie helper (single place = DRY) ---- */
  function setCookie(name, value, days = 7) {
    document.cookie =
      `${name}=${encodeURIComponent(value)}; Max-Age=${days * 86400}; Path=/; Secure; SameSite=Strict`;
  }

  /* ---- Weather: https, timeout, error handling, one safe DOM write ---- */
  async function loadWeather(el) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(WEATHER_URL, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      el.textContent = `Current temperature: ${data.current_weather.temperature} °C`;
    } catch (err) {
      logError('weather', err);
      el.textContent = 'Weather is unavailable right now. Please try again later.';
    } finally {
      clearTimeout(timer);
    }
  }

  /* ---- Form: real validation, no console dump ---- */
  function initForm(form) {
    const status = document.getElementById('formStatus');
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = 'Please enter your name and a valid email address.';
        return;
      }
      setCookie('contact', 'true');
      status.textContent = 'Thanks! We will send trail updates soon.';
      form.reset();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setCookie('lastSlide', '1'); // replaces old slider plugin + jQuery
    loadWeather(document.getElementById('weather'));
    initForm(document.getElementById('trailForm'));
  });
})();
