# Alberta Trails – Trailhead Map & Live Weather

A small SODV1401 Part 4 competency project using HTML, CSS and vanilla JavaScript.

## Features
- Responsive OpenStreetMap iframe with lazy loading and a fallback link.
- Current Banff weather from the Open-Meteo API.
- Fetch timeout, HTTP/data validation, friendly error fallback and a 10-minute session cache.
- Safe DOM rendering with `textContent` and DOM element creation.
- SEO metadata, canonical placeholder, Open Graph/Twitter metadata and JSON-LD.
- No API key, framework, external font, image asset or icon package is required.

## Run locally
Use VS Code Live Server, or run a local server from this folder:

```bash
python3 -m http.server 5500
```

Open `http://localhost:5500`.


## Third-party services
- Open-Meteo: weather API. No API key is used or exposed.
- OpenStreetMap: map iframe and map tiles. The map is lazy-loaded, sandboxed and uses `no-referrer`; third-party requests may still disclose IP address and browser/network metadata to the provider when loaded.
