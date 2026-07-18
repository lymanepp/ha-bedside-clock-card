console.info("[bedside-clock-card] loading v1.0.0");

class BedsideClockCard extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._timer = null;
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    this._config = Object.assign({
      default_device: null,
      time_format: "12",
      show_seconds: false,
      show_date: true,
      show_weather_text: true,
      theme: "warm",
      burn_in_shift: true,
      devices: {}
    }, config || {});

    this._render();
    this._startTimer();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  getCardSize() {
    return 12;
  }

  connectedCallback() {
    this._startTimer();
  }

  disconnectedCallback() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _startTimer() {
    if (this._timer) clearInterval(this._timer);
    this._update();
    this._timer = setInterval(() => this._update(), 1000);
  }

  _deviceKey() {
    var devices = this._config.devices || {};
    var keys = Object.keys(devices);
    var query = new URLSearchParams(window.location.search);
    var requested = query.get("device");

    if (requested && Object.prototype.hasOwnProperty.call(devices, requested)) {
      return requested;
    }

    if (
      this._config.default_device &&
      Object.prototype.hasOwnProperty.call(devices, this._config.default_device)
    ) {
      return this._config.default_device;
    }

    return keys[0] || null;
  }

  _deviceConfig() {
    var devices = this._config.devices || {};
    var key = this._deviceKey();
    return key ? (devices[key] || {}) : {};
  }

  _entity(entityId) {
    if (!entityId || !this._hass || !this._hass.states) return null;
    return this._hass.states[entityId] || null;
  }

  _number(entityId) {
    var entity = this._entity(entityId);
    if (!entity) return null;
    var value = parseFloat(entity.state);
    return Number.isFinite(value) ? value : null;
  }

  _weatherLabel(condition) {
    var labels = {
      "clear-night": "Clear",
      "cloudy": "Cloudy",
      "fog": "Fog",
      "hail": "Hail",
      "lightning": "Lightning",
      "lightning-rainy": "Storms",
      "partlycloudy": "Partly cloudy",
      "pouring": "Heavy rain",
      "rainy": "Rain",
      "snowy": "Snow",
      "snowy-rainy": "Wintry mix",
      "sunny": "Sunny",
      "windy": "Windy",
      "windy-variant": "Windy",
      "exceptional": "Weather alert"
    };
    return labels[condition] || condition || "";
  }

  _weatherIcon(condition) {
    var icons = {
      "clear-night": "☾",
      "cloudy": "☁",
      "fog": "≋",
      "hail": "◆",
      "lightning": "ϟ",
      "lightning-rainy": "ϟ",
      "partlycloudy": "◒",
      "pouring": "☂",
      "rainy": "☂",
      "snowy": "❄",
      "snowy-rainy": "❄",
      "sunny": "☀",
      "windy": "≈",
      "windy-variant": "≈",
      "exceptional": "!"
    };
    return icons[condition] || "•";
  }

  _render() {
    var themes = {
      warm:   { fg: "#f2eadf", dim: "#a99d90", accent: "#d8a763" },
      neutral:{ fg: "#f1f3f4", dim: "#9aa0a6", accent: "#c9d4e2" },
      amber:  { fg: "#ffbf69", dim: "#8a6237", accent: "#ffd6a0" },
      red:    { fg: "#d95c5c", dim: "#743434", accent: "#ed8a8a" }
    };
    var theme = themes[this._config.theme] || themes.warm;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100%;
          min-height: calc(100vh - var(--header-height, 0px));
          background: #000;
        }

        ha-card {
          box-sizing: border-box;
          height: 100%;
          min-height: calc(100vh - var(--header-height, 0px));
          margin: 0;
          border: 0;
          border-radius: 0;
          box-shadow: none;
          overflow: hidden;
          background: #000;
          color: ${theme.fg};
          font-family: Roboto, system-ui, sans-serif;
          font-variant-numeric: tabular-nums lining-nums;
        }

        .clock {
          box-sizing: border-box;
          width: 100%;
          min-height: calc(100vh - var(--header-height, 0px));
          display: grid;
          grid-template-rows: 0.5fr auto 1fr;
          padding: clamp(18px, 4vw, 48px);
          transform: translate(var(--shift-x, 0px), var(--shift-y, 0px));
          transition: transform 1.2s ease;
        }

        .main {
          grid-row: 2;
          align-self: center;
          text-align: center;
        }

        .time {
          font-size: clamp(7rem, 31vw, 22rem);
          font-weight: 300;
          letter-spacing: -0.065em;
          line-height: 0.82;
          white-space: nowrap;
        }

        .ampm {
          display: inline-block;
          margin-left: 0.15em;
          font-size: 0.13em;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: ${theme.dim};
          vertical-align: 0.18em;
        }

        .date {
          margin-top: clamp(22px, 4vh, 50px);
          font-size: clamp(1.1rem, 4.2vw, 2.7rem);
          color: ${theme.dim};
        }

        .footer {
          grid-row: 3;
          align-self: end;
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 24px;
          color: ${theme.dim};
          font-size: clamp(0.9rem, 3.1vw, 1.65rem);
        }

        .metric {
          display: flex;
          align-items: center;
          gap: 0.55em;
        }

        .right {
          justify-content: flex-end;
          text-align: right;
        }

        .icon { color: ${theme.accent}; font-size: 1.2em; line-height: 1; display: inline-flex; align-items: center; }
        .battery-icon { width: 1.1em; height: 0.68em; display: inline-block; }
        .battery-icon svg { width: 100%; height: 100%; display: block; }
        .primary { color: ${theme.fg}; font-weight: 500; }
        .secondary { margin-left: 0.35em; white-space: nowrap; }

        @media (orientation: portrait) {
          .time { font-size: clamp(6rem, 29vw, 13rem); }
          .footer { font-size: clamp(0.85rem, 3.7vw, 1.5rem); }
        }

        @media (max-width: 500px) {
          .weather-text { display: none; }
        }
      </style>

      <ha-card>
        <section class="clock">
          <div class="main">
            <div class="time">
              <span id="time">--:--</span><span class="ampm" id="ampm"></span>
            </div>
            <div class="date" id="date"></div>
          </div>

          <footer class="footer">
            <div class="metric">
              <span class="icon battery-icon" aria-hidden="true">
                <svg viewBox="0 0 24 14" xmlns="http://www.w3.org/2000/svg" fill="none">
                  <rect x="1" y="1" width="19" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
                  <rect x="4" y="4" width="10" height="6" rx="1" fill="currentColor"/>
                  <rect x="21" y="4" width="2" height="6" rx="1" fill="currentColor"/>
                </svg>
              </span>
              <span class="primary" id="battery">—%</span>
            </div>

            <div class="metric right">
              <span class="icon" id="weather-icon">•</span>
              <span class="primary" id="temperature">—°</span>
              <span class="secondary weather-text" id="weather-text"></span>
            </div>
          </footer>
        </section>
      </ha-card>
    `;
  }

  _update() {
    if (!this.shadowRoot || !this._config) return;

    var now = new Date();
    var is12 = String(this._config.time_format) !== "24";
    var options = {
      hour: "numeric",
      minute: "2-digit",
      hour12: is12
    };
    if (this._config.show_seconds) options.second = "2-digit";

    var parts = new Intl.DateTimeFormat(undefined, options).formatToParts(now);
    function getPart(type) {
      var found = parts.find(function (part) { return part.type === type; });
      return found ? found.value : "";
    }

    var timeText = getPart("hour") + ":" + getPart("minute");
    if (this._config.show_seconds) timeText += ":" + getPart("second");

    var timeNode = this.shadowRoot.getElementById("time");
    var ampmNode = this.shadowRoot.getElementById("ampm");
    var dateNode = this.shadowRoot.getElementById("date");
    if (!timeNode || !ampmNode || !dateNode) return;

    timeNode.textContent = timeText;
    ampmNode.textContent = is12 ? getPart("dayPeriod") : "";
    dateNode.textContent = this._config.show_date === false
      ? ""
      : new Intl.DateTimeFormat(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric"
        }).format(now);

    var device = this._deviceConfig();
    var battery = this._number(device.battery);
    this.shadowRoot.getElementById("battery").textContent =
      battery === null ? "—%" : Math.round(battery) + "%";

    var weatherEntityId = device.weather || this._config.weather_entity;
    var weather = this._entity(weatherEntityId);
    var condition = weather ? weather.state : "";

    var configuredTemp = this._number(
      device.temperature || this._config.temperature_entity
    );
    var weatherTemp = null;
    if (weather && weather.attributes) {
      var parsed = parseFloat(weather.attributes.temperature);
      if (Number.isFinite(parsed)) weatherTemp = parsed;
    }

    var temperature = configuredTemp !== null ? configuredTemp : weatherTemp;
    var unit = weather && weather.attributes && weather.attributes.temperature_unit
      ? weather.attributes.temperature_unit
      : "°";

    this.shadowRoot.getElementById("temperature").textContent =
      temperature === null ? "—°" : Math.round(temperature) + unit;
    this.shadowRoot.getElementById("weather-icon").textContent =
      this._weatherIcon(condition);
    this.shadowRoot.getElementById("weather-text").textContent =
      this._config.show_weather_text === false
        ? ""
        : this._weatherLabel(condition);

    if (this._config.burn_in_shift !== false) {
      var positions = [
        [-4, -3], [2, -4], [4, 1], [-2, 4],
        [0, 0], [3, 3], [-4, 2], [1, -2]
      ];
      var pos = positions[now.getMinutes() % positions.length];
      var clock = this.shadowRoot.querySelector(".clock");
      clock.style.setProperty("--shift-x", pos[0] + "px");
      clock.style.setProperty("--shift-y", pos[1] + "px");
    }
  }
}


window.customCards = window.customCards || [];
if (!window.customCards.some(function (card) { return card.type === "bedside-clock-card"; })) {
  window.customCards.push({
    type: "bedside-clock-card",
    name: "Bedside Clock Card",
    description: "Fullscreen bedside clock with date, weather, and per-device battery status.",
    preview: false
  });
}

if (!customElements.get("bedside-clock-card")) {
  customElements.define("bedside-clock-card", BedsideClockCard);
  console.info("[bedside-clock-card] registered v1.0.0");
}
