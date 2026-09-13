const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const languageSelect = document.querySelector("#language-select");
const searchForm = document.querySelector("#tool-search-form");
const searchInput = document.querySelector("#tool-search");
const searchResults = document.querySelector("#search-results");
const searchStatus = document.querySelector("#search-status");

const tools = [
  { name: "Time zone converter", category: "Productivity", description: "Never miss a beat, wherever you are.", icon: "◷", className: "card-lilac" },
  { name: "Color palette", category: "Creative", description: "Find colors that play well together.", icon: "◉", className: "card-cream" },
  { name: "Text formatter", category: "Everyday", description: "Make every word count beautifully.", icon: "Aa", className: "card-sage" },
  { name: "JSON formatter", category: "Developer", description: "Turn messy data into something clear.", icon: "{ }", className: "card-peach" }
];

const translations = {
  en: {
    home: "Home", allTools: "All tools", categories: "Categories", about: "About us", login: "Log in", signup: "Sign up",
    eyebrow: "Your digital toolbox", heroDescription: "A collection of handy, everyday tools designed to make your work a little lighter and your ideas a little clearer.",
    explore: "Explore tools", why: "Why tools.box", people: "people", monthly: "use tools.box every month", findFlow: "Find your flow", curated: "Curated for you", viewAll: "View all tools", noClutter: "Good tools, no clutter", browse: "Browse the box", backHome: "Back to home", searchEyebrow: "Search the box", searchTitle: "What can we help<br /><em>you find?</em>", searchDescription: "Search by tool name, category, or what you need to get done.", searchPlaceholder: "Try “color”, “JSON”, or “time zone”", searchButton: "Search", results: "tools found", noResults: "No tools found. Try another search."
  },
  zh: {
    home: "首页", allTools: "全部工具", categories: "分类", about: "关于我们", login: "登录", signup: "注册",
    eyebrow: "你的数字工具箱", heroDescription: "一系列实用的日常工具，让工作更轻松，让想法更清晰。",
    explore: "探索工具", why: "为什么选择 tools.box", people: "位用户", monthly: "每月使用 tools.box", findFlow: "找到你的节奏", curated: "为你精选", viewAll: "查看全部工具", noClutter: "实用工具，没有杂乱", browse: "浏览工具箱", backHome: "返回首页", searchEyebrow: "搜索工具箱", searchTitle: "你想要<br /><em>找什么？</em>", searchDescription: "按工具名称、分类或任务搜索。", searchPlaceholder: "试试“颜色”、“JSON”或“时区”", searchButton: "搜索", results: "个工具", noResults: "没有找到工具，请换个关键词。"
  },
  es: {
    home: "Inicio", allTools: "Todas las herramientas", categories: "Categorías", about: "Sobre nosotros", login: "Entrar", signup: "Crear cuenta",
    eyebrow: "Tu caja de herramientas digital", heroDescription: "Una colección de herramientas cotidianas para aligerar tu trabajo y aclarar tus ideas.",
    explore: "Explorar herramientas", why: "Por qué tools.box", people: "personas", monthly: "usan tools.box cada mes", findFlow: "Encuentra tu ritmo", curated: "Elegidas para ti", viewAll: "Ver todas", noClutter: "Buenas herramientas, sin ruido", browse: "Abrir la caja", backHome: "Volver al inicio", searchEyebrow: "Buscar en la caja", searchTitle: "¿Qué podemos<br /><em>ayudarte a encontrar?</em>", searchDescription: "Busca por nombre, categoría o tarea.", searchPlaceholder: "Prueba “color”, “JSON” o “zona horaria”", searchButton: "Buscar", results: "herramientas encontradas", noResults: "No encontramos herramientas. Prueba otra búsqueda."
  }
};

function setLanguage(language) {
  const copy = translations[language] || translations.en;
  const navCopy = { ".nav-link:nth-child(1)": copy.home, ".nav-link:nth-child(2)": copy.allTools, ".nav-link:nth-child(3)": copy.categories, ".nav-link:nth-child(4)": copy.about, ".login-link": copy.login };
  Object.entries(navCopy).forEach(([selector, value]) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  });
  document.querySelector(".button-small").firstChild.textContent = `${copy.signup} `;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    if (copy[element.dataset.i18n]) element.innerHTML = copy[element.dataset.i18n];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = copy[element.dataset.i18nPlaceholder];
  });
  document.documentElement.lang = language;
  localStorage.setItem("tools-box-language", language);
  if (searchResults) renderResults(searchInput?.value || "");
}

function renderResults(query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const matches = tools.filter((tool) => `${tool.name} ${tool.category} ${tool.description}`.toLowerCase().includes(normalizedQuery));
  const copy = translations[languageSelect?.value || "en"] || translations.en;
  searchResults.innerHTML = matches.map((tool) => `<a class="search-result ${tool.className}" href="#tool-${tool.name.toLowerCase().split(" ")[0]}"><span class="tool-icon">${tool.icon}</span><span><h3>${tool.name}</h3><p>${tool.category} · ${tool.description}</p></span></a>`).join("");
  searchStatus.textContent = `${matches.length} ${copy.results}`;
  if (!matches.length) searchResults.innerHTML = `<p class="search-empty">${copy.noResults}</p>`;
}

menuToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-link, .nav-actions a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

languageSelect?.addEventListener("change", (event) => setLanguage(event.target.value));
searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  renderResults(searchInput.value);
});
searchInput?.addEventListener("input", () => renderResults(searchInput.value));
setLanguage(localStorage.getItem("tools-box-language") || "en");
renderResults();
