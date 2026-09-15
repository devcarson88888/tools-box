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

const authFeedback = {
  en: { login: "Unable to sign in. Please check your email and password.", signup: "Unable to create your account. Please try again." },
  zh: { login: "登录失败，请检查邮箱和密码。", signup: "注册失败，请稍后重试。" },
  es: { login: "No se pudo iniciar sesión. Comprueba tu correo y contraseña.", signup: "No se pudo crear la cuenta. Inténtalo de nuevo." }
};
const authSuccess = {
  en: { login: "Signed in successfully. Redirecting…", signup: "Account created. Check your email to confirm your address." },
  zh: { login: "登录成功，正在跳转……", signup: "账户已创建，请检查邮箱完成验证。" },
  es: { login: "Sesión iniciada. Redirigiendo…", signup: "Cuenta creada. Revisa tu correo para confirmar la dirección." }
};
const supabaseUrl = "https://svjbtfhbwpavpvrjfbbe.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2amJ0Zmhid3BhdnB2cmpmYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzODcwMDMsImV4cCI6MjEwNDk2MzAwM30.a7Iwkxj5sjVE_3YC1og-4_OAXi8Yhx5nkW6TVkIduNY";
const supabaseClient = window.supabase?.createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
window.supabaseClient = supabaseClient;
const siteHomeUrl = new URL("./", window.location.href).href;
const loginUrl = new URL("login.html", siteHomeUrl).href;
const accountArea = document.querySelector("#account-area");
const accountEmail = document.querySelector("#account-email");
const accountAvatar = document.querySelector("#account-avatar");
const switchAccountLink = document.querySelector("#switch-account-link");
const loginNavLink = document.querySelector("#login-nav-link");
const signupNavLink = document.querySelector("#signup-nav-link");
const forgotPasswordLink = document.querySelector("#forgot-password");
const switchAccountLabels = { en: "Switch account", zh: "切换账号", es: "Cambiar cuenta" };
const switchPageCopy = {
  en: { switchAccount: "Switch account", accountSettings: "Account settings", switchTitle: "Switch<br /><em>your account.</em>", switchIntro: "You are currently signed in as:", switchButton: "Continue with another account", signOutButton: "Cancel sign in", staySignedIn: "Stay signed in" },
  zh: { switchAccount: "切换账号", accountSettings: "账户设置", switchTitle: "切换<br /><em>你的账号。</em>", switchIntro: "你当前登录的账号是：", switchButton: "使用其他账号", signOutButton: "取消登录", staySignedIn: "保持登录" },
  es: { switchAccount: "Cambiar cuenta", accountSettings: "Ajustes de cuenta", switchTitle: "Cambia<br /><em>tu cuenta.</em>", switchIntro: "Has iniciado sesión como:", switchButton: "Continuar con otra cuenta", signOutButton: "Cancelar sesión", staySignedIn: "Mantener sesión" }
};
const welcomeLabels = { en: "Welcome", zh: "欢迎", es: "Bienvenido/a" };
const resetMessages = {
  en: { email: "Enter the email address you used to sign up:", sent: "Password reset email sent. Check your inbox.", missing: "Please enter an email address." },
  zh: { email: "请输入注册时使用的邮箱：", sent: "密码重置邮件已发送，请检查收件箱。", missing: "请输入邮箱地址。" },
  es: { email: "Introduce el correo que usaste para registrarte:", sent: "Correo de restablecimiento enviado. Revisa tu bandeja.", missing: "Introduce un correo electrónico." }
};

const translations = {
  en: {
    home: "Home", allTools: "Search", categories: "Categories", about: "About us", login: "Log in", signup: "Sign up",
    eyebrow: "Your digital toolbox", heroDescription: "A collection of handy, everyday tools designed to make your work a little lighter and your ideas a little clearer.",
    explore: "Explore tools", why: "Why tools.box", people: "people", monthly: "use tools.box every month", findFlow: "Find your flow", curated: "Curated for you", viewAll: "View all tools", noClutter: "Good tools, no clutter", browse: "Browse the box", backHome: "Back to home", login: "Log in", signup: "Sign up", welcomeBack: "Welcome back", getStarted: "Get started", loginTitle: "Log in to<br /><em>your toolbox.</em>", signupTitle: "Make room for<br /><em>useful things.</em>", loginIntro: "Pick up where you left off and get back to the tools that help you do your best work.", signupIntro: "Create your free account and keep your favorite tools close at hand.", emailLabel: "Email address", passwordLabel: "Password", nameLabel: "Your name", remember: "Remember me", forgot: "Forgot password?", loginButton: "Log in", signupButton: "Create account", noAccount: "Don't have an account?", haveAccount: "Already have an account?", terms: "I agree to the terms and privacy policy.", privateNote: "Simple tools, made with care.", whyEyebrow: "A better way to get things done", whyTitle: "Why choose<br /><em>tools.box?</em>", whyIntro: "Because useful things should be easy to find. tools.box brings simple, focused tools together so you can spend less time searching and more time creating.", valuesEyebrow: "What we believe", valuesTitle: "Small tools can make<br /><em>a big difference.</em>", valueOneTitle: "Useful by default", valueOneText: "Every tool has a clear purpose and helps with a task you actually do.", valueTwoTitle: "Simple to use", valueTwoText: "No long tutorials or complicated setup. Open a tool and get moving.", valueThreeTitle: "Made for everyone", valueThreeText: "Whether you write, plan, design, or code, there is something here for you.", howEyebrow: "How it works", howTitle: "Find it.<br /><em>Use it.</em><br />Keep going.", stepOne: "Search the box for the kind of help you need.", stepTwo: "Choose a focused tool without distractions.", stepThree: "Get back to the work that matters to you.", ctaTitle: "Ready to find<br /><em>your next useful tool?</em>", searchEyebrow: "Search the box", searchTitle: "What can we help<br /><em>you find?</em>", searchDescription: "Search by tool name, category, or what you need to get done.", searchPlaceholder: "Try “color”, “JSON”, or “time zone”", searchButton: "Search", results: "tools found", noResults: "No tools found. Try another search."
  },
  zh: {
    home: "首页", allTools: "搜索", categories: "分类", about: "关于我们", login: "登录", signup: "注册",
    eyebrow: "你的数字工具箱", heroDescription: "一系列实用的日常工具，让工作更轻松，让想法更清晰。",
    explore: "探索工具", why: "为什么选择 tools.box", people: "位用户", monthly: "每月使用 tools.box", findFlow: "找到你的节奏", curated: "为你精选", viewAll: "查看全部工具", noClutter: "实用工具，没有杂乱", browse: "浏览工具箱", backHome: "返回首页", login: "登录", signup: "注册", welcomeBack: "欢迎回来", getStarted: "开始使用", loginTitle: "登录你的<br /><em>工具箱。</em>", signupTitle: "为实用的工具<br /><em>留点空间。</em>", loginIntro: "继续使用那些帮助你高效工作的工具。", signupIntro: "创建免费账户，把常用工具放在手边。", emailLabel: "邮箱地址", passwordLabel: "密码", nameLabel: "你的名字", remember: "记住我", forgot: "忘记密码？", loginButton: "登录", signupButton: "创建账户", noAccount: "还没有账户？", haveAccount: "已经有账户？", terms: "我同意服务条款和隐私政策。", privateNote: "用心打造的简单工具。", whyEyebrow: "更轻松地完成事情", whyTitle: "为什么选择<br /><em>tools.box？</em>", whyIntro: "因为实用的东西应该容易找到。tools.box 把简单、专注的工具放在一起，让你少花时间寻找，多花时间创造。", valuesEyebrow: "我们的理念", valuesTitle: "小工具也能带来<br /><em>大改变。</em>", valueOneTitle: "实用为先", valueOneText: "每个工具都有清晰的用途，帮助你完成真正会做的事情。", valueTwoTitle: "简单易用", valueTwoText: "不需要长篇教程或复杂设置，打开工具就可以开始。", valueThreeTitle: "人人都能用", valueThreeText: "无论写作、计划、设计还是编程，这里都有适合你的工具。", howEyebrow: "使用方式", howTitle: "找到它。<br /><em>使用它。</em><br />继续前进。", stepOne: "搜索你需要的帮助。", stepTwo: "选择一个专注、不打扰你的工具。", stepThree: "回到真正重要的工作中。", ctaTitle: "准备好找到<br /><em>下一个实用工具了吗？</em>", searchEyebrow: "搜索工具箱", searchTitle: "你想要<br /><em>找什么？</em>", searchDescription: "按工具名称、分类或任务搜索。", searchPlaceholder: "试试“颜色”、“JSON”或“时区”", searchButton: "搜索", results: "个工具", noResults: "没有找到工具，请换个关键词。"
  },
  es: {
    home: "Inicio", allTools: "Buscar", categories: "Categorías", about: "Sobre nosotros", login: "Entrar", signup: "Crear cuenta",
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
  const signupButton = signupNavLink;
  if (signupButton) signupButton.firstChild.textContent = `${copy.signup} `;
  if (switchAccountLink) switchAccountLink.textContent = switchAccountLabels[language] || switchAccountLabels.en;
  document.querySelectorAll("[data-i18n='welcomeUser']").forEach((element) => {
    element.textContent = welcomeLabels[language] || welcomeLabels.en;
  });
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = copy[element.dataset.i18n] || switchPageCopy[language]?.[element.dataset.i18n];
    if (value) element.innerHTML = value;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = copy[element.dataset.i18nPlaceholder];
  });
  document.documentElement.lang = language;
  localStorage.setItem("tools-box-language", language);
  document.querySelectorAll("[data-auth-form]").forEach((form) => {
    const feedback = form.querySelector(".form-feedback");
    if (feedback) feedback.textContent = "";
  });
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

function maskEmail(email) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "Account";
  return `${name.slice(0, 1)}${"*".repeat(Math.min(Math.max(name.length - 1, 2), 4))}@${domain}`;
}

function updateAccountUi(user) {
  const signedIn = Boolean(user?.email);
  if (accountArea) accountArea.hidden = !signedIn;
  if (loginNavLink) loginNavLink.hidden = signedIn;
  if (signupNavLink) signupNavLink.hidden = signedIn;
  if (signedIn && accountEmail) accountEmail.textContent = maskEmail(user.email);
  if (signedIn && accountAvatar) {
    const displayName = user.user_metadata?.name || user.email || "User";
    accountAvatar.textContent = displayName.trim().charAt(0).toUpperCase();
  }
  if (!signedIn && accountEmail) accountEmail.textContent = "";
  if (!signedIn && accountAvatar) accountAvatar.textContent = "U";
}

updateAccountUi(null);
if (supabaseClient) {
  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) console.error("Unable to restore session", error);
    updateAccountUi(data.session?.user);
  }).catch((error) => {
    console.error("Unable to restore session", error);
    updateAccountUi(null);
  });
  supabaseClient.auth.onAuthStateChange((_event, session) => updateAccountUi(session?.user));
}

const switchConfirmButton = document.querySelector("#switch-confirm");
const cancelSignOutButton = document.querySelector("#cancel-signout");
switchConfirmButton?.addEventListener("click", async () => {
  if (!supabaseClient) return;
  switchConfirmButton.disabled = true;
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error("Unable to switch account", error);
    switchConfirmButton.disabled = false;
    return;
  }
  window.location.href = "login.html";
});

cancelSignOutButton?.addEventListener("click", async () => {
  if (!supabaseClient) return;
  cancelSignOutButton.disabled = true;
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error("Unable to cancel sign in", error);
    cancelSignOutButton.disabled = false;
    return;
  }
  window.location.href = siteHomeUrl;
});

forgotPasswordLink?.addEventListener("click", async (event) => {
  event.preventDefault();
  const language = languageSelect?.value || "en";
  const email = window.prompt(resetMessages[language].email);
  const feedback = document.querySelector("[data-auth-form='login'] .form-feedback");
  if (!email?.trim()) {
    if (feedback) feedback.textContent = resetMessages[language].missing;
    return;
  }
  if (!supabaseClient) return;
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: loginUrl
  });
  if (feedback) feedback.textContent = error ? error.message : resetMessages[language].sent;
});

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
document.querySelectorAll("[data-auth-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const type = form.dataset.authForm;
    const feedback = form.querySelector(".form-feedback");
    const language = languageSelect?.value || "en";
    const email = form.querySelector('input[type="email"]')?.value.trim();
    const password = form.querySelector('input[type="password"]')?.value;
    const name = form.querySelector('input[name="name"]')?.value.trim();
    const submitButton = form.querySelector(".auth-submit");
    if (!supabaseClient) {
      if (feedback) feedback.textContent = authFeedback[language][type];
      return;
    }
    if (submitButton) submitButton.disabled = true;
    if (feedback) feedback.textContent = "";
    const request = type === "login"
      ? supabaseClient.auth.signInWithPassword({ email, password })
      : supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: siteHomeUrl
        }
      });
    request.then(({ data, error }) => {
      if (error) {
        if (feedback) feedback.textContent = error.message;
        return;
      }
      if (type === "login" && data.session?.user) updateAccountUi(data.session.user);
      if (feedback) feedback.textContent = authSuccess[language][type];
      if (type === "login") window.setTimeout(() => { window.location.href = siteHomeUrl; }, 700);
    }).catch(() => {
      if (feedback) feedback.textContent = authFeedback[language][type];
    }).finally(() => {
      if (submitButton) submitButton.disabled = false;
    });
  });
});
setLanguage(localStorage.getItem("tools-box-language") || "en");
renderResults();
