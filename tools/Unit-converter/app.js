const units = {
  length: [
    { id: "m", label: "Meters (m)", factor: 1 },
    { id: "km", label: "Kilometers (km)", factor: 1000 },
    { id: "cm", label: "Centimeters (cm)", factor: 0.01 },
    { id: "ft", label: "Feet (ft)", factor: 0.3048 },
    { id: "in", label: "Inches (in)", factor: 0.0254 },
    { id: "mi", label: "Miles (mi)", factor: 1609.344 }
  ],
  mass: [
    { id: "kg", label: "Kilograms (kg)", factor: 1 },
    { id: "g", label: "Grams (g)", factor: 0.001 },
    { id: "lb", label: "Pounds (lb)", factor: 0.45359237 },
    { id: "oz", label: "Ounces (oz)", factor: 0.028349523125 }
  ],
  temperature: [
    { id: "c", label: "Celsius (°C)" },
    { id: "f", label: "Fahrenheit (°F)" },
    { id: "k", label: "Kelvin (K)" }
  ],
  volume: [
    { id: "l", label: "Liters (L)", factor: 1 },
    { id: "ml", label: "Milliliters (mL)", factor: 0.001 },
    { id: "gal", label: "US gallons (gal)", factor: 3.785411784 },
    { id: "cup", label: "US cups (cup)", factor: 0.2365882365 }
  ]
};

const categoryInput = document.querySelector("#unit-category");
const fromInput = document.querySelector("#unit-from");
const toInput = document.querySelector("#unit-to");
const valueInput = document.querySelector("#unit-value");
const result = document.querySelector("#unit-result");
const status = document.querySelector("#unit-status");

function populateUnits() {
  const options = units[categoryInput.value];
  [fromInput, toInput].forEach((select) => {
    select.replaceChildren(...options.map(({ id, label }) => new Option(label, id)));
  });
  toInput.selectedIndex = Math.min(1, options.length - 1);
  convertUnits();
}

function convertTemperature(value, from, to) {
  const celsius = from === "c" ? value : from === "f" ? (value - 32) * (5 / 9) : value - 273.15;
  return to === "c" ? celsius : to === "f" ? celsius * (9 / 5) + 32 : celsius + 273.15;
}

function convertUnits() {
  const value = Number(valueInput.value);
  if (!valueInput.value.trim() || !Number.isFinite(value)) {
    result.textContent = "";
    status.dataset.state = "error";
    status.textContent = "Enter a valid number to convert.";
    return;
  }
  const options = units[categoryInput.value];
  const from = options.find((unit) => unit.id === fromInput.value);
  const to = options.find((unit) => unit.id === toInput.value);
  if (categoryInput.value === "temperature"
    && ((from.id === "c" && value < -273.15) || (from.id === "f" && value < -459.67) || (from.id === "k" && value < 0))) {
    result.textContent = "";
    status.dataset.state = "error";
    status.textContent = "Temperature cannot be below absolute zero.";
    return;
  }
  const converted = categoryInput.value === "temperature"
    ? convertTemperature(value, from.id, to.id)
    : value * from.factor / to.factor;
  if (!Number.isFinite(converted)) {
    result.textContent = "";
    status.dataset.state = "error";
    status.textContent = "The conversion is outside the supported numeric range.";
    return;
  }
  const rounded = Number(converted.toPrecision(10));
  result.textContent = `${value} ${from.id} = ${rounded} ${to.id}`;
  status.dataset.state = "success";
  status.textContent = "Conversion complete.";
}

categoryInput.addEventListener("change", populateUnits);
document.querySelector("#convert-units").addEventListener("click", convertUnits);
populateUnits();
