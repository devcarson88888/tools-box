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
    explore: "Explore tools", why: "Why tools.box", people: "people", monthly: "use tools.box every month", findFlow: "Find your flow", curated: "Curated for you", viewAll: "View all tools", noClutter: "Good tools, no clutter", browse: "Browse the box", backHome: "Back to home", whyEyebrow: "A better way to get things done", whyTitle: "Why choose<br /><em>tools.box?</em>", whyIntro: "Because useful things should be easy to find. tools.box brings simple, focused tools together so you can spend less time searching and more time creating.", valuesEyebrow: "What we believe", valuesTitle: "Small tools can make<br /><em>a big difference.</em>", valueOneTitle: "Useful by default", valueOneText: "Every tool has a clear purpose and helps with a task you actually do.", valueTwoTitle: "Simple to use", valueTwoText: "No long tutorials or complicated setup. Open a tool and get moving.", valueThreeTitle: "Made for everyone", valueThreeText: "Whether you write, plan, design, or code, there is something here for you.", howEyebrow: "How it works", howTitle: "Find it.<br /><em>Use it.</em><br />Keep going.", stepOne: "Search the box for the kind of help you need.", stepTwo: "Choose a focused tool without distractions.", stepThree: "Get back to the work that matters to you.", ctaTitle: "Ready to find<br /><em>your next useful tool?</em>", searchEyebrow: "Search the box", searchTitle: "What can we help<br /><em>you find?</em>", searchDescription: "Search by tool name, category, or what you need to get done.", searchPlaceholder: "Try “color”, “JSON”, or “time zone”", searchButton: "Search", results: "tools found", noResults: "No tools found. Try another search."
  },
  zh: {
    home: "首页", allTools: "全部工具", categories: "分类", about: "关于我们", login: "登录", signup: "注册",
    eyebrow: "你的数字工具箱", heroDescription: "一系列实用的日常工具，让工作更轻松，让想法更清晰。",
    explore: "探索工具", why: "为什么选择 tools.box", people: "位用户", monthly: "每月使用 tools.box", findFlow: "找到你的节奏", curated: "为你精选", viewAll: "查看全部工具", noClutter: "实用工具，没有杂乱", browse: "浏览工具箱", backHome: "返回首页", whyEyebrow: "更轻松地完成事情", whyTitle: "为什么选择<br /><em>tools.box？</em>", whyIntro: "因为实用的东西应该容易找到。tools.box 把简单、专注的工具放在一起，让你少花时间寻找，多花时间创造。", valuesEyebrow: "我们的理念", valuesTitle: "小工具也能带来<br /><em>大改变。</em>", valueOneTitle: "实用为先", valueOneText: "每个工具都有清晰的用途，帮助你完成真正会做的事情。", valueTwoTitle: "简单易用", valueTwoText: "不需要长篇教程或复杂设置，打开工具就可以开始。", valueThreeTitle: "人人都能用", valueThreeText: "无论写作、计划、设计还是编程，这里都有适合你的工具。", howEyebrow: "使用方式", howTitle: "找到它。<br /><em>使用它。</em><br />继续前进。", stepOne: "搜索你需要的帮助。", stepTwo: "选择一个专注、不打扰你的工具。", stepThree: "回到真正重要的工作中。", ctaTitle: "准备好找到<br /><em>下一个实用工具了吗？</em>", searchEyebrow: "搜索工具箱", searchTitle: "你想要<br /><em>找什么？</em>", searchDescription: "按工具名称、分类或任务搜索。", searchPlaceholder: "试试“颜色”、“JSON”或“时区”", searchButton: "搜索", results: "个工具", noResults: "没有找到工具，请换个关键词。"
  },
  es: {
    home: "Inicio", allTools: "Todas las herramientas", categories: "Categorías", about: "Sobre nosotros", login: "Entrar", signup: "Crear cuenta",
    eyebrow: "Tu caja de herramientas digital", heroDescription: "Una colección de herramientas cotidianas para aligerar tu trabajo y aclarar tus ideas.",
    explore: "Explorar herramientas", why: "Por qué tools.box", people: "personas", monthly: "usan tools.box cada mes", findFlow: "Encuentra tu ritmo", curated: "Elegidas para ti", viewAll: "Ver todas", noClutter: "Buenas herramientas, sin ruido", browse: "Abrir la caja", backHome: "Volver al inicio", whyEyebrow: "Una forma mejor de hacer las cosas", whyTitle: "¿Por qué elegir<br /><em>tools.box?</em>", whyIntro: "Porque las cosas útiles deberían ser fáciles de encontrar. tools.box reúne herramientas sencillas y enfocadas para que busques menos y crees más.", valuesEyebrow: "Lo que creemos", valuesTitle: "Las herramientas pequeñas<br /><em>marcan la diferencia.</em>", valueOneTitle: "Útiles desde el inicio", valueOneText: "Cada herramienta tiene un propósito claro y resuelve una tarea real.", valueTwoTitle: "Fáciles de usar", valueTwoText: "Sin tutoriales largos ni configuraciones complicadas. Abre y empieza.", valueThreeTitle: "Para todos", valueThreeText: "Escribe, planifica, diseña o programa: aquí hay algo para ti.", howEyebrow: "Cómo funciona", howTitle: "Encuéntralo.<br /><em>Úsalo.</em><br />Sigue adelante.", stepOne: "Busca la ayuda que necesitas.", stepTwo: "Elige una herramienta enfocada y sin distracciones.", stepThree: "Vuelve al trabajo que importa.", ctaTitle: "¿Listo para encontrar<br /><em>tu próxima herramienta útil?</em>", searchEyebrow: "Buscar en la caja", searchTitle: "¿Qué podemos<br /><em>ayudarte a encontrar?</em>", searchDescription: "Busca por nombre, categoría o tarea.", searchPlaceholder: "Prueba “color”, “JSON” o “zona horaria”", searchButton: "Buscar", results: "herramientas encontradas", noResults: "No encontramos herramientas. Prueba otra búsqueda."
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
  if (!searchResults || !searchStatus) return;
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
