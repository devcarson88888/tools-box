const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const languageSelect = document.querySelector("#language-select");

const translations = {
  en: {
    home: "Home", allTools: "All tools", categories: "Categories", about: "About us", login: "Log in", signup: "Sign up",
    eyebrow: "Your digital toolbox", heroDescription: "A collection of handy, everyday tools designed to make your work a little lighter and your ideas a little clearer.",
    explore: "Explore tools", why: "Why tools.box", people: "people", monthly: "use tools.box every month", findFlow: "Find your flow", curated: "Curated for you", viewAll: "View all tools", noClutter: "Good tools, no clutter", browse: "Browse the box"
  },
  zh: {
    home: "首页", allTools: "全部工具", categories: "分类", about: "关于我们", login: "登录", signup: "注册",
    eyebrow: "你的数字工具箱", heroDescription: "一系列实用的日常工具，让工作更轻松，让想法更清晰。",
    explore: "探索工具", why: "为什么选择 tools.box", people: "位用户", monthly: "每月使用 tools.box", findFlow: "找到你的节奏", curated: "为你精选", viewAll: "查看全部工具", noClutter: "实用工具，没有杂乱", browse: "浏览工具箱"
  },
  es: {
    home: "Inicio", allTools: "Todas las herramientas", categories: "Categorías", about: "Sobre nosotros", login: "Entrar", signup: "Crear cuenta",
    eyebrow: "Tu caja de herramientas digital", heroDescription: "Una colección de herramientas cotidianas para aligerar tu trabajo y aclarar tus ideas.",
    explore: "Explorar herramientas", why: "Por qué tools.box", people: "personas", monthly: "usan tools.box cada mes", findFlow: "Encuentra tu ritmo", curated: "Elegidas para ti", viewAll: "Ver todas", noClutter: "Buenas herramientas, sin ruido", browse: "Abrir la caja"
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
    if (copy[element.dataset.i18n]) element.textContent = copy[element.dataset.i18n];
  });
  document.documentElement.lang = language;
  localStorage.setItem("tools-box-language", language);
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

  languageSelect?.addEventListener("change", (event) => setLanguage(event.target.value));
  setLanguage(localStorage.getItem("tools-box-language") || "en");
});
