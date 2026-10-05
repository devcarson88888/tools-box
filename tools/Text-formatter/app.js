const textInput = document.querySelector("#text-input");
const textStatus = document.querySelector("#text-status");
const wordCount = document.querySelector("#word-count");
const characterCount = document.querySelector("#character-count");
const lineCount = document.querySelector("#line-count");

function updateTextMetrics() {
  const text = textInput.value;
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
  wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;
  characterCount.textContent = `${[...text].length} ${[...text].length === 1 ? "character" : "characters"}`;
  lineCount.textContent = `${text ? text.split(/\r\n|\r|\n/).length : 0} ${text.split(/\r\n|\r|\n/).length === 1 ? "line" : "lines"}`;
}

function titleCase(text) {
  return text.toLocaleLowerCase().replace(/(^|[\s([{'"“])(\p{L})/gu, (match, prefix, letter) => prefix + letter.toLocaleUpperCase());
}

function sentenceCase(text) {
  let firstLetter = true;
  return text.toLocaleLowerCase().replace(/[\p{L}]/gu, (letter) => {
    if (!firstLetter) return letter;
    firstLetter = false;
    return letter.toLocaleUpperCase();
  }).replace(/([.!?]\s+)(\p{L})/gu, (_match, punctuation, letter) => punctuation + letter.toLocaleUpperCase());
}

const formatters = {
  uppercase: (text) => text.toLocaleUpperCase(),
  lowercase: (text) => text.toLocaleLowerCase(),
  titlecase: titleCase,
  sentencecase: sentenceCase,
  trim: (text) => text.split(/\r\n|\r|\n/).map((line) => line.trim()).join("\n"),
  spaces: (text) => text.replace(/[^\S\r\n]+/gu, " ").replace(/\t/g, " "),
  blanklines: (text) => text.replace(/(\r?\n\s*){3,}/g, "\n\n"),
  sort: (text) => text.split(/\r\n|\r|\n/).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })).join("\n")
};

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const transform = formatters[button.dataset.action];
    if (!transform) return;
    textInput.value = transform(textInput.value);
    updateTextMetrics();
    textStatus.dataset.state = "success";
    textStatus.textContent = "Text updated.";
    textInput.focus();
  });
});

document.querySelector("#copy-text").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(textInput.value);
    textStatus.dataset.state = "success";
    textStatus.textContent = "Text copied to clipboard.";
  } catch (error) {
    console.error("Unable to copy formatted text", error);
    textStatus.dataset.state = "error";
    textStatus.textContent = "Clipboard access is unavailable. Select the text and copy it manually.";
  }
});

document.querySelector("#download-text").addEventListener("click", () => {
  const blob = new Blob([textInput.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "formatted-text.txt";
  link.click();
  URL.revokeObjectURL(url);
  textStatus.dataset.state = "success";
  textStatus.textContent = "Text file downloaded.";
});

document.querySelector("#clear-text").addEventListener("click", () => {
  textInput.value = "";
  textStatus.dataset.state = "";
  textStatus.textContent = "Text cleared.";
  updateTextMetrics();
  textInput.focus();
});

textInput.addEventListener("input", () => {
  updateTextMetrics();
  textStatus.dataset.state = "";
  textStatus.textContent = "";
});
updateTextMetrics();
