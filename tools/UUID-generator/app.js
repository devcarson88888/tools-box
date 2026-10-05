const countInput = document.querySelector("#uuid-count");
const output = document.querySelector("#uuid-output");
const status = document.querySelector("#uuid-status");
const copyButton = document.querySelector("#copy-uuids");
const downloadButton = document.querySelector("#download-uuids");

function createUuid() {
  const secureCrypto = globalThis.crypto;
  if (typeof secureCrypto?.randomUUID === "function") return secureCrypto.randomUUID();
  if (typeof secureCrypto?.getRandomValues !== "function") throw new Error("Secure random number generation is unavailable.");
  const bytes = secureCrypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

document.querySelector("#generate-uuids").addEventListener("click", () => {
  const count = Number(countInput.value);
  if (!Number.isInteger(count) || count < 1 || count > 100) {
    status.dataset.state = "error";
    status.textContent = "Choose a whole number between 1 and 100.";
    countInput.focus();
    return;
  }
  try {
    output.value = Array.from({ length: count }, createUuid).join("\n");
    copyButton.disabled = false;
    downloadButton.disabled = false;
    status.dataset.state = "success";
    status.textContent = `${count} UUID${count === 1 ? "" : "s"} generated securely in your browser.`;
  } catch (error) {
    console.error("Unable to generate UUIDs", error);
    status.dataset.state = "error";
    status.textContent = error.message;
  }
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(output.value);
    status.dataset.state = "success";
    status.textContent = "UUIDs copied to clipboard.";
  } catch (error) {
    console.error("Unable to copy UUIDs", error);
    status.dataset.state = "error";
    status.textContent = "Clipboard access is unavailable. Select the UUIDs and copy them manually.";
  }
});

downloadButton.addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([output.value], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "uuids.txt";
  link.click();
  URL.revokeObjectURL(url);
});

document.querySelector("#clear-uuids").addEventListener("click", () => {
  output.value = "";
  copyButton.disabled = true;
  downloadButton.disabled = true;
  status.dataset.state = "";
  status.textContent = "UUIDs cleared.";
});
