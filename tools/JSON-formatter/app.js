const jsonInput = document.querySelector("#json-input");
const jsonOutput = document.querySelector("#json-output");
const jsonStatus = document.querySelector("#json-status");
const inputSize = document.querySelector("#input-size");
const outputSize = document.querySelector("#output-size");
const copyButton = document.querySelector("#copy-json");
const downloadButton = document.querySelector("#download-json");
let currentOutput = "";

function updateJsonMetrics() {
  inputSize.textContent = `${jsonInput.value.length} ${jsonInput.value.length === 1 ? "character" : "characters"}`;
  outputSize.textContent = `${currentOutput.length} ${currentOutput.length === 1 ? "character" : "characters"}`;
}

function setJsonStatus(message, state = "") {
  jsonStatus.textContent = message;
  jsonStatus.dataset.state = state;
}

function readJson() {
  const source = jsonInput.value.trim();
  if (!source) {
    setJsonStatus("Enter JSON first.", "error");
    jsonInput.focus();
    return null;
  }
  try {
    return JSON.parse(source);
  } catch (error) {
    currentOutput = "";
    jsonOutput.value = "";
    copyButton.disabled = true;
    downloadButton.disabled = true;
    updateJsonMetrics();
    setJsonStatus(`Invalid JSON: ${error.message}`, "error");
    return null;
  }
}

function processJson(space) {
  const value = readJson();
  if (value === null) {
    if (jsonInput.value.trim() === "null") {
      currentOutput = "null";
    } else {
      return;
    }
  } else {
    currentOutput = JSON.stringify(value, null, space);
  }
  jsonOutput.value = currentOutput;
  copyButton.disabled = false;
  downloadButton.disabled = false;
  updateJsonMetrics();
  setJsonStatus(space ? "Valid JSON formatted with 2-space indentation." : "Valid JSON minified successfully.", "success");
}

document.querySelector("#format-json").addEventListener("click", () => processJson(2));
document.querySelector("#minify-json").addEventListener("click", () => processJson(0));
document.querySelector("#validate-json").addEventListener("click", () => {
  const value = readJson();
  if (value !== null || jsonInput.value.trim() === "null") setJsonStatus("Valid JSON.", "success");
});

copyButton.addEventListener("click", async () => {
  if (!currentOutput) return;
  try {
    await navigator.clipboard.writeText(currentOutput);
    setJsonStatus("Output copied to clipboard.", "success");
  } catch (error) {
    console.error("Unable to copy JSON output", error);
    setJsonStatus("Clipboard access is unavailable. Select the output and copy it manually.", "error");
  }
});

downloadButton.addEventListener("click", () => {
  if (!currentOutput) return;
  const blob = new Blob([currentOutput], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "formatted.json";
  link.click();
  URL.revokeObjectURL(url);
  setJsonStatus("JSON file downloaded.", "success");
});

document.querySelector("#clear-json").addEventListener("click", () => {
  jsonInput.value = "";
  jsonOutput.value = "";
  currentOutput = "";
  copyButton.disabled = true;
  downloadButton.disabled = true;
  updateJsonMetrics();
  setJsonStatus("Fields cleared.");
  jsonInput.focus();
});

jsonInput.addEventListener("input", () => {
  currentOutput = "";
  jsonOutput.value = "";
  copyButton.disabled = true;
  downloadButton.disabled = true;
  updateJsonMetrics();
  setJsonStatus("");
});
updateJsonMetrics();
