const input = document.querySelector("#url-input");
const output = document.querySelector("#url-output");
const status = document.querySelector("#url-status");
const copyButton = document.querySelector("#copy-url");

function transformUrl(transform) {
  if (!input.value) {
    output.value = "";
    copyButton.disabled = true;
    status.dataset.state = "error";
    status.textContent = "Enter text to encode or decode.";
    input.focus();
    return;
  }
  try {
    output.value = transform(input.value);
    copyButton.disabled = false;
    status.dataset.state = "success";
    status.textContent = "URL component converted successfully.";
  } catch (error) {
    output.value = "";
    copyButton.disabled = true;
    status.dataset.state = "error";
    status.textContent = `Conversion failed: ${error.message}`;
  }
}

document.querySelector("#encode-url").addEventListener("click", () => transformUrl(encodeURIComponent));
document.querySelector("#decode-url").addEventListener("click", () => transformUrl(decodeURIComponent));
copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(output.value);
    status.dataset.state = "success";
    status.textContent = "Result copied to clipboard.";
  } catch (error) {
    console.error("Unable to copy URL component", error);
    status.dataset.state = "error";
    status.textContent = "Clipboard access is unavailable. Select the result and copy it manually.";
  }
});
document.querySelector("#clear-url").addEventListener("click", () => {
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
