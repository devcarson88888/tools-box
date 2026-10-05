const timestampInput = document.querySelector("#timestamp-input");
const timestampUnit = document.querySelector("#timestamp-unit");
const dateInput = document.querySelector("#date-input");
const timestampResult = document.querySelector("#timestamp-result");
const dateResult = document.querySelector("#date-result");
const status = document.querySelector("#timestamp-status");

function setStatus(message, state = "") {
  status.textContent = message;
  status.dataset.state = state;
}

document.querySelector("#convert-timestamp").addEventListener("click", () => {
  const value = Number(timestampInput.value);
  if (!timestampInput.value.trim() || !Number.isFinite(value)) {
    timestampResult.textContent = "";
    setStatus("Enter a valid numeric timestamp.", "error");
    timestampInput.focus();
    return;
  }
  const milliseconds = timestampUnit.value === "seconds" ? value * 1000 : value;
  const date = new Date(milliseconds);
  if (!Number.isFinite(milliseconds) || Number.isNaN(date.getTime())) {
    timestampResult.textContent = "";
    setStatus("This timestamp is outside the supported date range.", "error");
    return;
  }
  timestampResult.textContent = `UTC: ${date.toISOString()} · Local: ${date.toLocaleString()}`;
  setStatus("Timestamp converted successfully.", "success");
});

document.querySelector("#convert-date").addEventListener("click", () => {
  const date = new Date(dateInput.value);
  if (!dateInput.value || Number.isNaN(date.getTime())) {
    dateResult.textContent = "";
    setStatus("Choose a valid local date and time.", "error");
    dateInput.focus();
    return;
  }
  dateResult.textContent = `Seconds: ${Math.floor(date.getTime() / 1000)} · Milliseconds: ${date.getTime()}`;
  setStatus("Local date converted to Unix timestamps.", "success");
});
