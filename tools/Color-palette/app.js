const colorInput = document.querySelector("#base-color");
const harmonyInput = document.querySelector("#harmony");
const paletteElement = document.querySelector("#palette");
const statusElement = document.querySelector("#palette-status");

function hexToHsl(hex) {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);
  const max = Math.max(...channels);
  const min = Math.min(...channels);
  const delta = max - min;
  let hue = 0;
  const lightness = (max + min) / 2;
  let saturation = 0;
  if (delta) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === channels[0]) hue = ((channels[1] - channels[2]) / delta) % 6;
    else if (max === channels[1]) hue = (channels[2] - channels[0]) / delta + 2;
    else hue = (channels[0] - channels[1]) / delta + 4;
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }
  return { hue, saturation: saturation * 100, lightness: lightness * 100 };
}

function hslToHex(hue, saturation, lightness) {
  const h = ((hue % 360) + 360) % 360 / 360;
  const s = Math.max(0, Math.min(100, saturation)) / 100;
  const l = Math.max(0, Math.min(100, lightness)) / 100;
  const channel = (n) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return `#${[channel(0), channel(8), channel(4)].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function readableText(hex) {
  const value = hex.slice(1);
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 0.42 ? "#242126" : "#ffffff";
}

function makePalette(baseHex, harmony) {
  const base = hexToHsl(baseHex);
  let hues;
  let lights = [base.lightness, base.lightness, base.lightness, base.lightness, base.lightness];
  let saturations = Array(5).fill(base.saturation);
  if (harmony === "complementary") {
    hues = [base.hue - 24, base.hue - 12, base.hue, base.hue + 180, base.hue + 192];
  } else if (harmony === "triadic") {
    hues = [base.hue - 18, base.hue, base.hue + 120, base.hue + 138, base.hue + 240];
  } else if (harmony === "monochrome") {
    hues = Array(5).fill(base.hue);
    lights = [Math.max(16, base.lightness - 30), Math.max(20, base.lightness - 14), base.lightness, Math.min(82, base.lightness + 14), Math.min(92, base.lightness + 28)];
    saturations = [base.saturation * .8, base.saturation, base.saturation, base.saturation * .9, base.saturation * .75];
  } else {
    hues = [base.hue - 36, base.hue - 18, base.hue, base.hue + 18, base.hue + 36];
  }
  return hues.map((hue, index) => hslToHex(hue, saturations[index], lights[index]));
}

function renderPalette() {
  const colors = makePalette(colorInput.value, harmonyInput.value);
  paletteElement.replaceChildren();
  colors.forEach((hex, index) => {
    const swatch = document.createElement("button");
    swatch.className = "palette-swatch";
    swatch.type = "button";
    swatch.style.setProperty("--swatch", hex);
    swatch.style.setProperty("--swatch-text", readableText(hex));
    swatch.setAttribute("aria-label", `Copy ${hex} to clipboard`);
    swatch.innerHTML = `<span class="swatch-copy">Click to copy</span><small>COLOR ${String(index + 1).padStart(2, "0")}</small><strong>${hex.toUpperCase()}</strong>`;
    swatch.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(hex.toUpperCase());
        statusElement.dataset.state = "success";
        statusElement.textContent = `${hex.toUpperCase()} copied to clipboard.`;
      } catch (error) {
        console.error("Unable to copy color value", error);
        statusElement.dataset.state = "error";
        statusElement.textContent = "Clipboard access is unavailable. Select and copy the color value.";
      }
    });
    paletteElement.append(swatch);
  });
}

document.querySelector("#generate-palette").addEventListener("click", () => {
  renderPalette();
  statusElement.dataset.state = "";
  statusElement.textContent = "Palette updated.";
});
document.querySelector("#random-color").addEventListener("click", () => {
  colorInput.value = hslToHex(Math.floor(Math.random() * 360), 60 + Math.random() * 30, 45 + Math.random() * 20);
  renderPalette();
  statusElement.dataset.state = "";
  statusElement.textContent = "A new starting color is ready.";
});
colorInput.addEventListener("input", renderPalette);
harmonyInput.addEventListener("change", renderPalette);
renderPalette();
