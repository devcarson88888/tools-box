const input = document.querySelector("#base64-input");
const output = document.querySelector("#base64-output");
const status = document.querySelector("#base64-status");
const copyButton = document.querySelector("#copy-base64");

function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function decodeBase64(value) {
  const compact = value.replace(/\s/gu, "").replace(/-/gu, "+").replace(/_/gu, "/");
  if (!compact || !/^[A-Za-z0-9+/]*={0,2}$/u.test(compact) || compact.length % 4 === 1) {
    throw new Error("Enter a valid Base64 value.");
  }
  const padded = compact + "=".repeat((4 - (compact.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function convert(converter, successMessage) {
  if (input.value === "") {
    output.value = "";
    copyButton.disabled = true;
    status.dataset.state = "error";
    status.textContent = "Enter text to convert.";
    input.focus();
    return;
  }
  try {
    output.value = converter(input.value);
    copyButton.disabled = false;
    status.dataset.state = "success";
    status.textContent = successMessage;
  } catch (error) {
    output.value = "";
    copyButton.disabled = true;
    status.dataset.state = "error";
    status.textContent = `Conversion failed: ${error.message}`;
  }
}

document.querySelector("#encode-base64").addEventListener("click", () => convert(encodeBase64, "Text encoded as UTF-8 Base64."));
document.querySelector("#decode-base64").addEventListener("click", () => convert(decodeBase64, "Base64 decoded as UTF-8 text."));
copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(output.value);
    status.dataset.state = "success";
    status.textContent = "Result copied to clipboard.";
  } catch (error) {
    console.error("Unable to copy Base64 result", error);
    status.dataset.state = "error";
    status.textContent = "Clipboard access is unavailable. Select the result and copy it manually.";
  }
});
document.querySelector("#clear-base64").addEventListener("click", () => {
  input.value = "";
  output.value = "";
  copyButton.disabled = true;
  status.dataset.state = "";
  status.textContent = "Fields cleared.";
  input.focus();
});
input.addEventListener("input", () => {
  output.value = "";
  copyButton.disabled = true;
  status.dataset.state = "";
  status.textContent = "";
});
