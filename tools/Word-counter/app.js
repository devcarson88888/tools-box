const textInput = document.querySelector("#counter-input");
const wordCount = document.querySelector("#word-count");
const characterCount = document.querySelector("#character-count");
const characterNoSpaces = document.querySelector("#character-no-spaces");
const sentenceCount = document.querySelector("#sentence-count");
const paragraphCount = document.querySelector("#paragraph-count");
const readingTime = document.querySelector("#reading-time");
const status = document.querySelector("#counter-status");

const wordSegmenter = typeof Intl.Segmenter === "function"
  ? new Intl.Segmenter(undefined, { granularity: "word" })
  : null;

function countWords(text) {
  if (!text.trim()) return 0;
  if (wordSegmenter) return [...wordSegmenter.segment(text)].filter((part) => part.isWordLike).length;
  return text.trim().match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length || 0;
}

function updateCounts() {
  const text = textInput.value;
  const words = countWords(text);
  wordCount.textContent = String(words);
  characterCount.textContent = String([...text].length);
  characterNoSpaces.textContent = String([...text.replace(/\s/gu, "")].length);
  sentenceCount.textContent = String((text.match(/[.!?。！？]+(?=\s|$)/gu) || []).length);
  paragraphCount.textContent = String(text.trim() ? text.trim().split(/\n\s*\n/gu).length : 0);
  readingTime.textContent = words ? `${Math.max(1, Math.ceil(words / 200))} min` : "0 min";
}

textInput.addEventListener("input", updateCounts);

document.querySelector("#copy-counted-text").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(textInput.value);
    status.dataset.state = "success";
    status.textContent = "Text copied to clipboard.";
  } catch (error) {
    console.error("Unable to copy counted text", error);
    status.dataset.state = "error";
    status.textContent = "Clipboard access is unavailable. Select the text and copy it manually.";
  }
});

document.querySelector("#clear-counted-text").addEventListener("click", () => {
  textInput.value = "";
  updateCounts();
  status.dataset.state = "";
  status.textContent = "Text cleared.";
  textInput.focus();
});

updateCounts();
