const starCatalog = [
  { name: "Sirius", constellation: "Canis Major", raHours: 6.752477, decDeg: -16.7161, magnitude: -1.46, months: "Jan–Mar" },
  { name: "Canopus", constellation: "Carina", raHours: 6.399194, decDeg: -52.6957, magnitude: -0.72, months: "Feb–Apr" },
  { name: "Arcturus", constellation: "Boötes", raHours: 14.261, decDeg: 19.1825, magnitude: -0.05, months: "Apr–Jun" },
  { name: "Vega", constellation: "Lyra", raHours: 18.6156, decDeg: 38.7837, magnitude: 0.03, months: "Jun–Sep" },
  { name: "Capella", constellation: "Auriga", raHours: 5.278155, decDeg: 45.9979, magnitude: 0.08, months: "Nov–Jan" },
  { name: "Rigel", constellation: "Orion", raHours: 5.242298, decDeg: -8.20164, magnitude: 0.12, months: "Dec–Feb" },
  { name: "Procyon", constellation: "Canis Minor", raHours: 7.655033, decDeg: 5.225, magnitude: 0.38, months: "Jan–Mar" },
  { name: "Betelgeuse", constellation: "Orion", raHours: 5.919529, decDeg: 7.407064, magnitude: 0.42, months: "Dec–Mar" },
  { name: "Achernar", constellation: "Eridanus", raHours: 1.62857, decDeg: -57.23675, magnitude: 0.46, months: "Oct–Jan" },
  { name: "Hadar", constellation: "Centaurus", raHours: 14.063724, decDeg: -60.37303, magnitude: 0.61, months: "May–Jul" },
  { name: "Altair", constellation: "Aquila", raHours: 19.846389, decDeg: 8.868321, magnitude: 0.77, months: "Jul–Sep" },
  { name: "Aldebaran", constellation: "Taurus", raHours: 4.598677, decDeg: 16.5093, magnitude: 0.85, months: "Dec–Feb" },
  { name: "Antares", constellation: "Scorpius", raHours: 16.490129, decDeg: -26.432, magnitude: 0.96, months: "May–Aug" },
  { name: "Spica", constellation: "Virgo", raHours: 13.419883, decDeg: -11.161322, magnitude: 0.98, months: "Mar–Jun" },
  { name: "Pollux", constellation: "Gemini", raHours: 7.755263, decDeg: 28.026198, magnitude: 1.14, months: "Jan–Mar" },
  { name: "Fomalhaut", constellation: "Piscis Austrinus", raHours: 22.960848, decDeg: -29.622236, magnitude: 1.16, months: "Sep–Nov" },
  { name: "Deneb", constellation: "Cygnus", raHours: 20.690532, decDeg: 45.280277, magnitude: 1.25, months: "Jul–Oct" },
  { name: "Regulus", constellation: "Leo", raHours: 10.13953, decDeg: 11.967209, magnitude: 1.35, months: "Feb–Apr" },
  { name: "Shaula", constellation: "Scorpius", raHours: 17.560144, decDeg: -37.103821, magnitude: 1.62, months: "Jun–Aug" },
  { name: "Castor", constellation: "Gemini", raHours: 7.576666, decDeg: 31.888266, magnitude: 1.58, months: "Jan–Mar" },
  { name: "Bellatrix", constellation: "Orion", raHours: 5.418851, decDeg: 6.349702, magnitude: 1.64, months: "Dec–Feb" },
  { name: "Mirfak", constellation: "Perseus", raHours: 3.405381, decDeg: 49.861179, magnitude: 1.79, months: "Oct–Dec" },
  { name: "Gacrux", constellation: "Crux", raHours: 12.519427, decDeg: -57.113214, magnitude: 1.63, months: "Apr–Jun" },
  { name: "Kochab", constellation: "Ursa Minor", raHours: 14.845109, decDeg: 74.155504, magnitude: 2.07, months: "All year (N)" },
  { name: "Dubhe", constellation: "Ursa Major", raHours: 11.062128, decDeg: 61.750833, magnitude: 1.81, months: "All year (N)" }
];

const form = document.getElementById("settings-form");
const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const datetimeInput = document.getElementById("datetime");
const searchInput = document.getElementById("search");
const magnitudeInput = document.getElementById("magnitude");
const magnitudeOutput = document.getElementById("magnitude-value");
const tableBody = document.querySelector("#stars-table tbody");
const rowTemplate = document.getElementById("star-row-template");
const canvas = document.getElementById("sky-canvas");
const ctx = canvas.getContext("2d");

let selectedStarName = null;
let currentStars = [];

function formatDateTimeLocal(date) {
  const pad = (value) => value.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toJulian(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function normalizeDegrees(angle) {
  return ((angle % 360) + 360) % 360;
}

function hoursToDegrees(hours) {
  return hours * 15;
}

function calculateGMST(date) {
  const jd = toJulian(date);
  const T = (jd - 2451545.0) / 36525.0;
  let gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  return normalizeDegrees(gmst);
}

function calculateAltAz(star, observation) {
  const { latitude, longitude, datetime } = observation;
  const gmst = calculateGMST(datetime);
  const lst = normalizeDegrees(gmst + longitude);

  const ha = normalizeDegrees(lst - hoursToDegrees(star.raHours));

  const haRad = (ha * Math.PI) / 180;
  const decRad = (star.decDeg * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;

  const sinAlt =
    Math.sin(decRad) * Math.sin(latRad) +
    Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
  const altRad = Math.asin(Math.min(1, Math.max(-1, sinAlt)));
  const altitude = (altRad * 180) / Math.PI;

  const cosAlt = Math.cos(altRad);
  let azimuth = 0;
  if (Math.abs(cosAlt) < 1e-7) {
    azimuth = 0;
  } else {
    const sinAz = (-Math.sin(haRad) * Math.cos(decRad)) / cosAlt;
    const cosAz =
      (Math.sin(decRad) - Math.sin(altRad) * Math.sin(latRad)) /
      (cosAlt * Math.cos(latRad));
    azimuth = Math.atan2(sinAz, cosAz) * (180 / Math.PI);
  }

  return {
    altitude,
    azimuth: normalizeDegrees(azimuth),
    visible: altitude > 0
  };
}

function formatAltitude(value) {
  const rounded = Math.abs(value).toFixed(1);
  const sign = value < 0 ? "−" : "";
  return `${sign}${rounded}°`;
}

function cardinalDirection(azimuth) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(azimuth / 45) % directions.length;
  return directions[index];
}

function formatAzimuth(value) {
  const normalized = normalizeDegrees(value);
  const direction = cardinalDirection(normalized);
  return `${normalized.toFixed(0)}° ${direction}`;
}

function updateMagnitudeLabel() {
  magnitudeOutput.textContent = Number(magnitudeInput.value).toFixed(1);
}

function getObservationSettings() {
  const latitude = Number.parseFloat(latitudeInput.value);
  const longitude = Number.parseFloat(longitudeInput.value);
  const datetimeValue = datetimeInput.value;
  const datetime = datetimeValue ? new Date(datetimeValue) : new Date();
  const searchTerm = searchInput.value.trim().toLowerCase();
  const magnitudeLimit = Number.parseFloat(magnitudeInput.value);

  return { latitude, longitude, datetime, searchTerm, magnitudeLimit };
}

function filterStars(observation) {
  const { searchTerm, magnitudeLimit } = observation;
  return starCatalog.filter((star) => {
    const matchesTerm =
      !searchTerm ||
      star.name.toLowerCase().includes(searchTerm) ||
      star.constellation.toLowerCase().includes(searchTerm);
    const matchesMagnitude = star.magnitude <= magnitudeLimit;
    return matchesTerm && matchesMagnitude;
  });
}

function updateTable(stars) {
  tableBody.innerHTML = "";

  const fragment = document.createDocumentFragment();

  if (stars.length === 0) {
    const emptyRow = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "No stars match the current filters. Try adjusting the magnitude slider or clearing the search.";
    cell.classList.add("table-empty");
    emptyRow.appendChild(cell);
    fragment.appendChild(emptyRow);
  } else {
    stars.forEach((star) => {
      const row = rowTemplate.content.firstElementChild.cloneNode(true);
      const nameButton = row.querySelector(".star-name");
      nameButton.textContent = star.name;
      nameButton.addEventListener("click", () => {
        selectedStarName = star.name;
        highlightSelectedRow();
        drawSky(currentStars, selectedStarName);
      });

      row.dataset.starName = star.name;

      row.querySelector(".star-constellation").textContent = star.constellation;
      row.querySelector(".star-altitude").textContent = formatAltitude(star.altitude);
      row.querySelector(".star-azimuth").textContent = formatAzimuth(star.azimuth);
      row.querySelector(".star-months").textContent = star.months;

      if (!star.visible) {
        row.classList.add("star-row--below-horizon");
      }

      fragment.appendChild(row);
    });
  }

  tableBody.appendChild(fragment);
  highlightSelectedRow();
}

function highlightSelectedRow() {
  const rows = tableBody.querySelectorAll("tr");
  rows.forEach((row) => {
    if (row.dataset.starName === selectedStarName) {
      row.classList.add("star-row--highlight");
    } else {
      row.classList.remove("star-row--highlight");
    }
  });
}

function drawSky(stars, selectedName) {
  const { width, height } = canvas;
  const centerX = width / 2;
  const centerY = height / 2;
  const horizonRadius = Math.min(width, height) * 0.42;

  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, horizonRadius * 1.1);
  gradient.addColorStop(0, "rgba(16, 34, 68, 0.5)");
  gradient.addColorStop(1, "rgba(2, 6, 18, 0.9)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(centerX, centerY);

  drawHorizon(ctx, horizonRadius);

  stars.forEach((star) => {
    const altClamped = Math.max(-5, Math.min(90, star.altitude));
    const radialDistance = (horizonRadius * (90 - altClamped)) / 95;
    const azRad = (star.azimuth * Math.PI) / 180;
    const x = radialDistance * Math.sin(azRad);
    const y = -radialDistance * Math.cos(azRad);

    const color = star.magnitude <= 0.5 ? "#ffd95a" : star.magnitude <= 2.0 ? "#8be9ff" : "#7a8fa6";
    const size = Math.max(2, 6 - star.magnitude);

    ctx.globalAlpha = star.visible ? 1 : 0.35;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (star.name === selectedName) {
      ctx.strokeStyle = "#ffb86c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#ffb86c";
      ctx.font = "14px 'Source Code Pro', monospace";
      ctx.textAlign = x < 0 ? "right" : "left";
      ctx.textBaseline = y < 0 ? "bottom" : "top";
      ctx.fillText(star.name, x < 0 ? x - 10 : x + 10, y < 0 ? y - 10 : y + 10);
    }
  });

  ctx.restore();
}

function drawHorizon(context, radius) {
  context.strokeStyle = "rgba(139, 233, 255, 0.35)";
  context.lineWidth = 2;

  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.stroke();

  [60, 30].forEach((altitude) => {
    const circleRadius = (radius * (90 - altitude)) / 90;
    context.beginPath();
    context.strokeStyle = "rgba(139, 233, 255, 0.15)";
    context.arc(0, 0, circleRadius, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = "rgba(182, 194, 219, 0.6)";
    context.font = "12px 'Source Code Pro', monospace";
    context.textAlign = "center";
    context.fillText(`${altitude}°`, 0, -circleRadius + 12);
  });

  context.strokeStyle = "rgba(139, 233, 255, 0.15)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, -radius);
  context.lineTo(0, radius);
  context.moveTo(-radius, 0);
  context.lineTo(radius, 0);
  context.stroke();

  const directions = [
    { label: "N", x: 0, y: -radius - 10 },
    { label: "E", x: radius + 10, y: 0 },
    { label: "S", x: 0, y: radius + 16 },
    { label: "W", x: -radius - 10, y: 0 }
  ];

  context.fillStyle = "rgba(182, 194, 219, 0.75)";
  context.font = "14px 'Space Grotesk', sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  directions.forEach(({ label, x, y }) => {
    context.fillText(label, x, y);
  });
}

function updateSky() {
  const observation = getObservationSettings();
  if (Number.isNaN(observation.latitude) || Number.isNaN(observation.longitude)) {
    return;
  }

  const filtered = filterStars(observation);
  currentStars = filtered.map((star) => ({
    ...star,
    ...calculateAltAz(star, observation)
  })).sort((a, b) => b.altitude - a.altitude);

  if (selectedStarName && !currentStars.some((star) => star.name === selectedStarName)) {
    selectedStarName = null;
  }

  if (!selectedStarName && currentStars.length > 0) {
    const aboveHorizon = currentStars.find((star) => star.visible);
    selectedStarName = (aboveHorizon || currentStars[0]).name;
  }

  updateTable(currentStars);
  drawSky(currentStars, selectedStarName);
}

function initialiseDefaults() {
  const now = new Date();
  datetimeInput.value = formatDateTimeLocal(now);
  latitudeInput.value = "40.7";
  longitudeInput.value = "-74.0";
  magnitudeInput.value = "4.0";
  updateMagnitudeLabel();

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        latitudeInput.value = position.coords.latitude.toFixed(2);
        longitudeInput.value = position.coords.longitude.toFixed(2);
        updateSky();
      },
      () => {
        // Ignore errors and keep defaults.
      },
      { enableHighAccuracy: false, maximumAge: 3600000, timeout: 3000 }
    );
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  updateSky();
});

searchInput.addEventListener("input", () => {
  selectedStarName = null;
  updateSky();
});

magnitudeInput.addEventListener("input", () => {
  updateMagnitudeLabel();
  updateSky();
});

datetimeInput.addEventListener("change", () => {
  updateSky();
});

latitudeInput.addEventListener("change", updateSky);
longitudeInput.addEventListener("change", updateSky);

initialiseDefaults();
updateSky();
