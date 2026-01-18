// ===============================
// Urlaub Countdown – app.js
// Ziel: 04.07.2026 08:15 (lokale Zeit)
// ===============================

console.log("✅ app.js geladen");

const TARGET = new Date(2026, 6, 4, 8, 15, 0); // Monat: 0=Jan ... 6=Juli

const daysLine = document.getElementById("daysLine");
const timeLine = document.getElementById("timeLine");

if (!daysLine || !timeLine) {
  console.error("❌ Countdown-Elemente fehlen (daysLine/timeLine). Prüfe index.html.");
}

// ---------- Countdown ----------
function pad2(n) {
  return String(n).padStart(2, "0");
}

function tick() {
  const now = new Date();
  let diffMs = TARGET - now;

  if (diffMs <= 0) {
    daysLine.textContent = "🎉 Los geht’s!";
    timeLine.textContent = "00:00:00";
    return;
  }

  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / (24 * 3600));
  const rest = totalSeconds % (24 * 3600);

  const hours = Math.floor(rest / 3600);
  const minutes = Math.floor((rest % 3600) / 60);
  const seconds = rest % 60;

  daysLine.textContent = `Noch ${days} Tage`;
  timeLine.textContent = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

tick();
setInterval(tick, 1000);

// ---------- Hintergrund wählen ----------
const pickBtn = document.getElementById("pickBg");
const resetBtn = document.getElementById("resetBg");
const fileInput = document.getElementById("bgFile");
const appEl = document.querySelector(".app");

const STORAGE_BG = "vacation-bg-dataurl";

function applyBg(dataUrl) {
  if (!appEl) return;
  appEl.style.backgroundImage = `url("${dataUrl}")`;
}

function loadBg() {
  const saved = localStorage.getItem(STORAGE_BG);
  if (saved) applyBg(saved);
}

loadBg();

// ✅ Bild komprimieren + skalieren (damit auch große Fotos gehen)
async function fileToCompressedDataURL(file, maxSize = 1600, quality = 0.75) {
  const img = new Image();
  const blobUrl = URL.createObjectURL(file);

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = blobUrl;
  });

  // proportional skalieren
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;

  const scale = Math.min(1, maxSize / Math.max(w, h));
  w = Math.round(w * scale);
  h = Math.round(h * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);

  URL.revokeObjectURL(blobUrl);

  // JPEG ist iPhone-sicher + klein
  return canvas.toDataURL("image/jpeg", quality);
}

if (pickBtn && fileInput) {
  pickBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    try {
      // ✅ egal wie groß das Foto ist: wir machen es passend
      const dataUrl = await fileToCompressedDataURL(file, 1600, 0.75);

      try {
        localStorage.setItem(STORAGE_BG, dataUrl);
      } catch (e) {
        alert("Bild ist trotz Komprimierung zu groß für den Speicher. Nimm ein etwas kleineres Foto oder reduziere Qualität/Größe.");
        fileInput.value = "";
        return;
      }

      applyBg(dataUrl);
      fileInput.value = "";
    } catch (e) {
      console.error(e);
      alert("Konnte das Bild nicht verarbeiten.");
      fileInput.value = "";
    }
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_BG);
    if (appEl) appEl.style.backgroundImage = ""; // zurück auf bg.jpg aus CSS
  });
}
