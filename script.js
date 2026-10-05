const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const languageToggle = document.querySelector("#language-toggle");
const languageCurrent = document.querySelector("#language-current");
const languageMenu = document.querySelector("#language-menu");
const searchForm = document.querySelector("#tool-search-form");
const searchInput = document.querySelector("#tool-search");
const searchResults = document.querySelector("#search-results");
const searchStatus = document.querySelector("#search-status");

const tools = [
  { name: "Time zone converter", category: "Productivity", description: "Never miss a beat, wherever you are.", icon: "◷", className: "card-lilac", path: "../tools/Time-zone-converter/" },
  { name: "Color palette", category: "Creative", description: "Find colors that play well together.", icon: "◉", className: "card-cream", path: "../tools/Color-palette/" },
  { name: "Text formatter", category: "Everyday", description: "Make every word count beautifully.", icon: "Aa", className: "card-sage", path: "../tools/Text-formatter/" },
  { name: "JSON formatter", category: "Developer", description: "Turn messy data into something clear.", icon: "{ }", className: "card-peach", path: "../tools/JSON-formatter/" },
  { name: "UUID generator", category: "Developer", description: "Create secure, unique IDs in seconds.", icon: "⌗", className: "card-lilac", path: "../tools/UUID-generator/" },
  { name: "URL encoder", category: "Developer", description: "Encode or decode URL components.", icon: "↗", className: "card-cream", path: "../tools/URL-encoder/" },
  { name: "Base64 converter", category: "Developer", description: "Convert text to and from Base64.", icon: "64", className: "card-sage", path: "../tools/Base64-converter/" },
  { name: "Timestamp converter", category: "Everyday", description: "Translate Unix time into a date.", icon: "◷", className: "card-peach", path: "../tools/Timestamp-converter/" },
  { name: "Unit converter", category: "Everyday", description: "Convert everyday measurements with ease.", icon: "↔", className: "card-lilac", path: "../tools/Unit-converter/" },
  { name: "Word counter", category: "Everyday", description: "Count words, characters, and reading time.", icon: "¶", className: "card-cream", path: "../tools/Word-counter/" }
];

const themeLabels = {
  en: { dark: "Switch to dark theme", light: "Switch to light theme" },
  zh: { dark: "切换到深色主题", light: "切换到浅色主题" },
  es: { dark: "Cambiar al tema oscuro", light: "Cambiar al tema claro" },
  fr: { dark: "Activer le thème sombre", light: "Activer le thème clair" },
  de: { dark: "Dunkles Design aktivieren", light: "Helles Design aktivieren" },
  ja: { dark: "ダークテーマに切り替え", light: "ライトテーマに切り替え" }
};
const themeToggleButton = document.createElement("button");
themeToggleButton.className = "theme-toggle";
themeToggleButton.type = "button";
themeToggleButton.innerHTML = '<span class="theme-toggle-icon" aria-hidden="true"></span><span class="sr-only"></span>';
document.querySelector(".navbar")?.append(themeToggleButton);

function setTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  localStorage.setItem("tools-box-theme", isDark ? "dark" : "light");
  themeToggleButton.setAttribute("aria-pressed", String(isDark));
  themeToggleButton.querySelector(".theme-toggle-icon").textContent = isDark ? "☀" : "☾";
  updateThemeToggleLabel(localStorage.getItem("tools-box-language") || "en");
}

function updateThemeToggleLabel(language) {
  if (!themeToggleButton.isConnected) return;
  const isDark = document.documentElement.dataset.theme === "dark";
  const label = themeLabels[language] || themeLabels.en;
  const action = isDark ? label.light : label.dark;
  themeToggleButton.setAttribute("aria-label", action);
  themeToggleButton.title = action;
  themeToggleButton.querySelector(".sr-only").textContent = action;
}

themeToggleButton.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});
setTheme(localStorage.getItem("tools-box-theme") === "dark" ? "dark" : "light");

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
const ageRequirementCopy = {
  en: "You must be 18 or older to create an account.",
  zh: "必须年满 18 岁才能创建账户。",
  es: "Debes tener 18 años o más para crear una cuenta."
};
const supabaseUrl = "https://svjbtfhbwpavpvrjfbbe.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2amJ0Zmhid3BhdnB2cmpmYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzODcwMDMsImV4cCI6MjEwNDk2MzAwM30.a7Iwkxj5sjVE_3YC1og-4_OAXi8Yhx5nkW6TVkIduNY";
const supabaseClient = window.supabase?.createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (input, init = {}) => {
      const requestUrl = input instanceof Request ? input.url : String(input);
      const isPublisherFunction = requestUrl.startsWith(`${supabaseUrl}/functions/v1/github-publish`);
      return fetch(input, { ...init, credentials: isPublisherFunction ? "include" : "omit" });
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
window.supabaseClient = supabaseClient;
const siteHomeUrl = new URL("/", window.location.origin).href;
const loginUrl = new URL("login/", siteHomeUrl).href;
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
    heroTitle: "Useful <span class=\"title-highlight\">tools</span>,<br />made simple.", toolsTitle: "Tools that do<br /><em>the little things.</em>", aboutTitle: "Keep the useful.<br /><em>Lose the noise.</em>", allToolsLabel: "All tools", productivity: "Productivity", creative: "Creative", developer: "Developer", everyday: "Everyday", timeZoneTitle: "Time zone<br />converter", timeZoneText: "Never miss a beat, wherever you are.", colorTitle: "Color<br />palette", colorText: "Find colors that play well together.", textTitle: "Text<br />formatter", textText: "Make every word count beautifully.", jsonTitle: "JSON<br />formatter", jsonText: "Turn messy data into something clear.", explore: "Explore tools", why: "Why tools.box", people: "people", monthly: "use tools.box every month", findFlow: "Find your flow", curated: "Curated for you", viewAll: "View all tools", noClutter: "Good tools, no clutter", browse: "Browse the box", backHome: "Back to home", login: "Log in", signup: "Sign up", welcomeBack: "Welcome back", getStarted: "Get started", loginTitle: "Log in to<br /><em>your toolbox.</em>", signupTitle: "Make room for<br /><em>useful things.</em>", loginIntro: "Pick up where you left off and get back to the tools that help you do your best work.", signupIntro: "Create your free account and keep your favorite tools close at hand.", emailLabel: "Email address", passwordLabel: "Password", nameLabel: "Your name", remember: "Remember me", forgot: "Forgot password?", loginButton: "Log in", signupButton: "Create account", noAccount: "Don't have an account?", haveAccount: "Already have an account?", terms: "I agree to the terms and privacy policy.", privateNote: "Simple tools, made with care.", whyEyebrow: "A better way to get things done", whyTitle: "Why choose<br /><em>tools.box?</em>", whyIntro: "Because useful things should be easy to find. tools.box brings simple, focused tools together so you can spend less time searching and more time creating.", valuesEyebrow: "What we believe", valuesTitle: "Small tools can make<br /><em>a big difference.</em>", valueOneTitle: "Useful by default", valueOneText: "Every tool has a clear purpose and helps with a task you actually do.", valueTwoTitle: "Simple to use", valueTwoText: "No long tutorials or complicated setup. Open a tool and get moving.", valueThreeTitle: "Made for everyone", valueThreeText: "Whether you write, plan, design, or code, there is something here for you.", howEyebrow: "How it works", howTitle: "Find it.<br /><em>Use it.</em><br />Keep going.", stepOne: "Search the box for the kind of help you need.", stepTwo: "Choose a focused tool without distractions.", stepThree: "Get back to the work that matters to you.", ctaTitle: "Ready to find<br /><em>your next useful tool?</em>", searchEyebrow: "Search the box", searchTitle: "What can we help<br /><em>you find?</em>", searchDescription: "Search by tool name, category, or what you need to get done.", searchPlaceholder: "Try “color”, “JSON”, or “time zone”", searchButton: "Search", results: "tools found", noResults: "No tools found. Try another search."
  },
  zh: {
    home: "首页", allTools: "搜索", categories: "分类", about: "关于我们", login: "登录", signup: "注册",
    eyebrow: "你的数字工具箱", heroDescription: "一系列实用的日常工具，让工作更轻松，让想法更清晰。",
    heroTitle: "实用的<span class=\"title-highlight\">工具</span>，<br />让事情更简单。", toolsTitle: "做好<br /><em>小事情的工具。</em>", aboutTitle: "保留实用。<br /><em>告别杂乱。</em>", allToolsLabel: "全部工具", productivity: "效率", creative: "创意", developer: "开发者", everyday: "日常", timeZoneTitle: "时区<br />转换器", timeZoneText: "无论你在哪里，都不会错过重要时刻。", colorTitle: "配色<br />方案", colorText: "找到彼此协调的颜色。", textTitle: "文本<br />格式化", textText: "让每个字都发挥作用。", jsonTitle: "JSON<br />格式化", jsonText: "把杂乱的数据变得清晰。", explore: "探索工具", why: "为什么选择 tools.box", people: "位用户", monthly: "每月使用 tools.box", findFlow: "找到你的节奏", curated: "为你精选", viewAll: "查看全部工具", noClutter: "实用工具，没有杂乱", browse: "浏览工具箱", backHome: "返回首页", login: "登录", signup: "注册", welcomeBack: "欢迎回来", getStarted: "开始使用", loginTitle: "登录你的<br /><em>工具箱。</em>", signupTitle: "为实用的工具<br /><em>留点空间。</em>", loginIntro: "继续使用那些帮助你高效工作的工具。", signupIntro: "创建免费账户，把常用工具放在手边。", emailLabel: "邮箱地址", passwordLabel: "密码", nameLabel: "你的名字", remember: "记住我", forgot: "忘记密码？", loginButton: "登录", signupButton: "创建账户", noAccount: "还没有账户？", haveAccount: "已经有账户？", terms: "我同意服务条款和隐私政策。", privateNote: "用心打造的简单工具。", whyEyebrow: "更轻松地完成事情", whyTitle: "为什么选择<br /><em>tools.box？</em>", whyIntro: "因为实用的东西应该容易找到。tools.box 把简单、专注的工具放在一起，让你少花时间寻找，多花时间创造。", valuesEyebrow: "我们的理念", valuesTitle: "小工具也能带来<br /><em>大改变。</em>", valueOneTitle: "实用为先", valueOneText: "每个工具都有清晰的用途，帮助你完成真正会做的事情。", valueTwoTitle: "简单易用", valueTwoText: "不需要长篇教程或复杂设置，打开工具就可以开始。", valueThreeTitle: "人人都能用", valueThreeText: "无论写作、计划、设计还是编程，这里都有适合你的工具。", howEyebrow: "使用方式", howTitle: "找到它。<br /><em>使用它。</em><br />继续前进。", stepOne: "搜索你需要的帮助。", stepTwo: "选择一个专注、不打扰你的工具。", stepThree: "回到真正重要的工作中。", ctaTitle: "准备好找到<br /><em>下一个实用工具了吗？</em>", searchEyebrow: "搜索工具箱", searchTitle: "你想要<br /><em>找什么？</em>", searchDescription: "按工具名称、分类或任务搜索。", searchPlaceholder: "试试“颜色”、“JSON”或“时区”", searchButton: "搜索", results: "个工具", noResults: "没有找到工具，请换个关键词。"
  },
  es: {
    home: "Inicio", allTools: "Buscar", categories: "Categorías", about: "Sobre nosotros", login: "Entrar", signup: "Crear cuenta",
    eyebrow: "Tu caja de herramientas digital", heroDescription: "Una colección de herramientas cotidianas para aligerar tu trabajo y aclarar tus ideas.",
    heroTitle: "Herramientas <span class=\"title-highlight\">útiles</span>,<br />hechas simples.", toolsTitle: "Herramientas para<br /><em>las pequeñas cosas.</em>", aboutTitle: "Quédate con lo útil.<br /><em>Deja el ruido.</em>", allToolsLabel: "Todas", productivity: "Productividad", creative: "Creativo", developer: "Desarrollador", everyday: "Cotidiano", timeZoneTitle: "Conversor<br />horario", timeZoneText: "No pierdas el ritmo, estés donde estés.", colorTitle: "Paleta<br />de color", colorText: "Encuentra colores que combinan bien.", textTitle: "Formateador<br />de texto", textText: "Haz que cada palabra cuente.", jsonTitle: "Formateador<br />JSON", jsonText: "Convierte datos desordenados en algo claro.", explore: "Explorar herramientas", why: "Por qué tools.box", people: "personas", monthly: "usan tools.box cada mes", findFlow: "Encuentra tu ritmo", curated: "Elegidas para ti", viewAll: "Ver todas", noClutter: "Buenas herramientas, sin ruido", browse: "Abrir la caja", backHome: "Volver al inicio", whyEyebrow: "Una forma mejor de hacer las cosas", whyTitle: "¿Por qué elegir<br /><em>tools.box?</em>", whyIntro: "Porque las cosas útiles deberían ser fáciles de encontrar. tools.box reúne herramientas sencillas y enfocadas para que busques menos y crees más.", valuesEyebrow: "Lo que creemos", valuesTitle: "Las herramientas pequeñas<br /><em>marcan la diferencia.</em>", valueOneTitle: "Útiles desde el inicio", valueOneText: "Cada herramienta tiene un propósito claro y resuelve una tarea real.", valueTwoTitle: "Fáciles de usar", valueTwoText: "Sin tutoriales largos ni configuraciones complicadas. Abre y empieza.", valueThreeTitle: "Para todos", valueThreeText: "Escribe, planifica, diseña o programa: aquí hay algo para ti.", howEyebrow: "Cómo funciona", howTitle: "Encuéntralo.<br /><em>Úsalo.</em><br />Sigue adelante.", stepOne: "Busca la ayuda que necesitas.", stepTwo: "Elige una herramienta enfocada y sin distracciones.", stepThree: "Vuelve al trabajo que importa.", ctaTitle: "¿Listo para encontrar<br /><em>tu próxima herramienta útil?</em>", searchEyebrow: "Buscar en la caja", searchTitle: "¿Qué podemos<br /><em>ayudarte a encontrar?</em>", searchDescription: "Busca por nombre, categoría o tarea.", searchPlaceholder: "Prueba “color”, “JSON” o “zona horaria”", searchButton: "Buscar", results: "herramientas encontradas", noResults: "No encontramos herramientas. Prueba otra búsqueda."
  }
};

Object.assign(translations.en, {
  birthDateLabel: "Date of birth",
  adultOnlyNotice: "You must be 18 or older to create an account. Your birth date is stored privately and visible only to authorized admins."
});
Object.assign(translations.zh, {
  birthDateLabel: "出生日期",
  adultOnlyNotice: "必须年满 18 岁才能注册。生日会保存在私有记录中，仅授权管理员可见。"
});
Object.assign(translations.es, {
  birthDateLabel: "Fecha de nacimiento",
  adultOnlyNotice: "Debes tener 18 años o más para registrarte. La fecha se guarda de forma privada y solo la ven administradores autorizados."
});
Object.assign(translations.en, {
  aboutEyebrow: "A little more room for what matters",
  aboutHeroTitle: "Less busywork.<br /><em>More good work.</em>",
  aboutHeroText: "Useful Tools Box brings small, focused tools together to make everyday tasks feel a little easier. Find what you need, get it done, and get back to your day.",
  aboutExplore: "Explore the tools",
  aboutStoryKicker: "WHY WE'RE HERE",
  aboutStoryTitle: "Good tools shouldn't get in your way.",
  aboutStoryText: "Sometimes you just need to check a time zone, tidy up a block of text, or make sense of a file. Instead of wading through clutter, ads, and complicated setup, you should be able to open one clear tool and carry on.",
  aboutStoryTextTwo: "That's the idea behind tools.box: bring handy things into one welcoming place, keep each experience focused, and make useful feel effortless.",
  aboutPrinciplesKicker: "Our little-big principles",
  aboutPrinciplesTitle: "Thoughtful by design.<br /><em>Useful in real life.</em>",
  aboutPurpose: "PURPOSE",
  aboutSimplicity: "SIMPLICITY",
  aboutPeople: "PEOPLE",
  aboutPrincipleOneTitle: "Start with useful",
  aboutPrincipleOneText: "Every tool should solve a real, everyday problem — clearly and without extra fuss.",
  aboutPrincipleTwoTitle: "Keep it simple",
  aboutPrincipleTwoText: "Straightforward interfaces help you spend less time figuring things out and more time doing.",
  aboutPrincipleThreeTitle: "Make room for everyone",
  aboutPrincipleThreeText: "Whether you're planning, writing, creating, or coding, the box is here to help you get going.",
  aboutHowKicker: "A simple way forward",
  aboutHowTitle: "Find your tool.<br /><em>Find your flow.</em>",
  aboutStepOne: "Look around or search for the task on your mind.",
  aboutStepTwo: "Open a focused tool and use it at your own pace.",
  aboutStepThree: "Get back to whatever you wanted to do next.",
  aboutCtaKicker: "Ready when you are",
  aboutCtaTitle: "Let's make the little things<br /><em>a little easier.</em>",
  aboutArtOne: "make it simple", aboutArtTwo: "keep moving", aboutFooterLine: "Small tools. Big help."
});
Object.assign(translations.zh, {
  aboutEyebrow: "为重要的事情腾出更多空间",
  aboutHeroTitle: "少些琐事。<br /><em>多做重要的事。</em>",
  aboutHeroText: "Useful Tools Box 汇集简单、专注的小工具，让日常任务更轻松。找到所需工具，完成手头的事，然后继续自己的生活。",
  aboutExplore: "探索工具",
  aboutStoryKicker: "我们为何而来",
  aboutStoryTitle: "好工具，不该挡你的路。",
  aboutStoryText: "有时你只想查一下时区、整理一段文字，或弄清一个文件。你不必在杂乱广告和复杂设置中费力寻找，只需打开一个清晰的工具，继续手头的事。",
  aboutStoryTextTwo: "这就是 tools.box 的想法：把实用的小工具放在一个友好的地方，让每个体验专注而简单，让实用触手可及。",
  aboutPrinciplesKicker: "小而重要的原则",
  aboutPrinciplesTitle: "用心设计。<br /><em>贴近日常。</em>",
  aboutPurpose: "实用",
  aboutSimplicity: "简单",
  aboutPeople: "人人可用",
  aboutPrincipleOneTitle: "从实用出发",
  aboutPrincipleOneText: "每个工具都应清晰、直接地解决一个真实的日常问题。",
  aboutPrincipleTwoTitle: "保持简单",
  aboutPrincipleTwoText: "直观的界面让你少花时间琢磨，多花时间行动。",
  aboutPrincipleThreeTitle: "为每个人留一席之地",
  aboutPrincipleThreeText: "无论你在计划、写作、创作还是编程，这里都有工具帮你开始。",
  aboutHowKicker: "简单向前",
  aboutHowTitle: "找到工具。<br /><em>找回节奏。</em>",
  aboutStepOne: "浏览或搜索你正在处理的事情。",
  aboutStepTwo: "打开专注的工具，按自己的节奏使用。",
  aboutStepThree: "回到接下来真正想做的事情。",
  aboutCtaKicker: "随时等你来",
  aboutCtaTitle: "让日常的小事<br /><em>再简单一点。</em>",
  aboutArtOne: "简单一点", aboutArtTwo: "继续前进", aboutFooterLine: "小工具，大帮助。"
});
Object.assign(translations.es, {
  aboutEyebrow: "Un poco más de espacio para lo importante",
  aboutHeroTitle: "Menos tareas rutinarias.<br /><em>Más trabajo valioso.</em>",
  aboutHeroText: "Useful Tools Box reúne herramientas pequeñas y enfocadas para hacer más sencillas las tareas cotidianas. Encuentra lo que necesitas, resuélvelo y sigue con tu día.",
  aboutExplore: "Explorar herramientas",
  aboutStoryKicker: "POR QUÉ ESTAMOS AQUÍ",
  aboutStoryTitle: "Las buenas herramientas no deberían estorbar.",
  aboutStoryText: "A veces solo necesitas consultar una zona horaria, ordenar un texto o entender un archivo. En lugar de buscar entre ruido, anuncios y configuraciones complicadas, deberías poder abrir una herramienta clara y continuar.",
  aboutStoryTextTwo: "Esa es la idea de tools.box: reunir cosas útiles en un lugar acogedor, mantener cada experiencia enfocada y hacer que lo práctico sea sencillo.",
  aboutPrinciplesKicker: "Principios pequeños pero importantes",
  aboutPrinciplesTitle: "Diseñado con intención.<br /><em>Útil en la vida real.</em>",
  aboutPurpose: "PROPÓSITO",
  aboutSimplicity: "SIMPLICIDAD",
  aboutPeople: "PERSONAS",
  aboutPrincipleOneTitle: "Empezar por lo útil",
  aboutPrincipleOneText: "Cada herramienta debe resolver un problema cotidiano real, de forma clara y sencilla.",
  aboutPrincipleTwoTitle: "Mantenerlo simple",
  aboutPrincipleTwoText: "Las interfaces claras te ayudan a dedicar menos tiempo a entender y más a hacer.",
  aboutPrincipleThreeTitle: "Un espacio para todos",
  aboutPrincipleThreeText: "Ya sea que planifiques, escribas, crees o programes, aquí puedes empezar.",
  aboutHowKicker: "Un camino sencillo",
  aboutHowTitle: "Encuentra tu herramienta.<br /><em>Encuentra tu ritmo.</em>",
  aboutStepOne: "Explora o busca la tarea que tienes en mente.",
  aboutStepTwo: "Abre una herramienta enfocada y úsala a tu ritmo.",
  aboutStepThree: "Vuelve a lo que querías hacer después.",
  aboutCtaKicker: "Cuando quieras",
  aboutCtaTitle: "Hagamos que las pequeñas cosas<br /><em>sean más fáciles.</em>",
  aboutArtOne: "hazlo sencillo", aboutArtTwo: "sigue adelante", aboutFooterLine: "Pequeñas herramientas. Gran ayuda."
});
translations.fr = { ...translations.en };
translations.de = { ...translations.en };
translations.ja = { ...translations.en };
Object.assign(translations.fr, {
  home: "Accueil", allTools: "Recherche", categories: "Catégories", about: "À propos", login: "Connexion", signup: "S'inscrire",
  eyebrow: "Votre boîte à outils numérique", heroDescription: "Des outils pratiques du quotidien pour alléger votre travail et clarifier vos idées.",
  heroTitle: "Des outils <span class=\"title-highlight\">utiles</span>,<br />tout simplement.", toolsTitle: "Des outils pour<br /><em>les petites choses.</em>",
  allToolsLabel: "Tous les outils", productivity: "Productivité", creative: "Créativité", developer: "Développement", everyday: "Quotidien",
  timeZoneTitle: "Convertisseur<br />de fuseaux horaires", timeZoneText: "Gardez le rythme, où que vous soyez.",
  colorTitle: "Palette<br />de couleurs", colorText: "Trouvez des couleurs qui s'accordent.", textTitle: "Mise en forme<br />du texte",
  textText: "Faites compter chaque mot.", jsonTitle: "Formateur<br />JSON", jsonText: "Rendez les données désordonnées plus claires.",
  explore: "Découvrir les outils", why: "Pourquoi tools.box", people: "personnes", monthly: "utilisent tools.box chaque mois",
  findFlow: "Trouvez votre rythme", curated: "Choisis pour vous", viewAll: "Voir tous les outils", noClutter: "De bons outils, sans superflu",
  browse: "Parcourir la boîte", backHome: "Retour à l'accueil", welcomeBack: "Bon retour", getStarted: "Commencer",
  loginTitle: "Connectez-vous à<br /><em>votre boîte à outils.</em>", signupTitle: "Faites de la place<br /><em>aux idées utiles.</em>",
  loginIntro: "Reprenez là où vous en étiez avec les outils qui vous aident à avancer.", signupIntro: "Créez un compte gratuit et gardez vos outils préférés à portée de main.",
  emailLabel: "Adresse e-mail", passwordLabel: "Mot de passe", nameLabel: "Votre nom", remember: "Se souvenir de moi",
  forgot: "Mot de passe oublié ?", loginButton: "Connexion", signupButton: "Créer un compte",
  noAccount: "Vous n'avez pas de compte ?", haveAccount: "Vous avez déjà un compte ?", terms: "J'accepte les conditions et la politique de confidentialité.",
  privateNote: "Des outils simples, conçus avec soin.", whyEyebrow: "Une meilleure façon d'avancer", whyTitle: "Pourquoi choisir<br /><em>tools.box ?</em>",
  whyIntro: "Les choses utiles devraient être faciles à trouver. tools.box réunit des outils simples et ciblés pour chercher moins et créer davantage.",
  valuesEyebrow: "Nos convictions", valuesTitle: "Les petits outils peuvent<br /><em>faire une grande différence.</em>",
  valueOneTitle: "Utiles par nature", valueOneText: "Chaque outil répond à un besoin clair et à une tâche du quotidien.",
  valueTwoTitle: "Simples à utiliser", valueTwoText: "Pas de longs tutoriels ni de configuration compliquée. Ouvrez et commencez.",
  valueThreeTitle: "Pensés pour tous", valueThreeText: "Écrivez, planifiez, créez ou codez : vous trouverez ici un outil pour vous.",
  howEyebrow: "Comment ça marche", howTitle: "Trouvez.<br /><em>Utilisez.</em><br />Continuez.",
  stepOne: "Cherchez l'aide qu'il vous faut dans la boîte.", stepTwo: "Choisissez un outil ciblé, sans distraction.",
  stepThree: "Reprenez le travail qui compte.", ctaTitle: "Prêt à trouver<br /><em>votre prochain outil utile ?</em>",
  searchEyebrow: "Chercher dans la boîte", searchTitle: "Que pouvons-nous<br /><em>vous aider à trouver ?</em>",
  searchDescription: "Recherchez par nom, catégorie ou tâche.", searchPlaceholder: "Essayez « couleur », « JSON » ou « fuseau horaire »",
  searchButton: "Rechercher", results: "outils trouvés", noResults: "Aucun outil trouvé. Essayez une autre recherche.",
  birthDateLabel: "Date de naissance", adultOnlyNotice: "Vous devez avoir au moins 18 ans pour créer un compte.",
  aboutEyebrow: "Un peu plus de place pour l'essentiel", aboutHeroTitle: "Moins de petites tâches.<br /><em>Plus de projets qui comptent.</em>",
  aboutHeroText: "Useful Tools Box réunit des outils simples et ciblés pour faciliter le quotidien. Trouvez ce qu'il vous faut, faites-le, puis reprenez votre journée.",
  aboutExplore: "Découvrir les outils", aboutStoryKicker: "POURQUOI NOUS EXISTONS",
  aboutStoryTitle: "Les bons outils ne devraient pas vous ralentir.",
  aboutStoryText: "Parfois, il suffit de vérifier un fuseau horaire, de mettre un texte en forme ou de comprendre un fichier. Vous devriez pouvoir ouvrir un outil clair et continuer, sans bruit ni configuration compliquée.",
  aboutStoryTextTwo: "Voilà l'idée de tools.box : réunir des outils pratiques dans un espace accueillant, garder chaque expérience simple et rendre l'utilité naturelle.",
  aboutPrinciplesKicker: "Nos principes essentiels", aboutPrinciplesTitle: "Pensé avec soin.<br /><em>Utile au quotidien.</em>",
  aboutPurpose: "UTILITÉ", aboutSimplicity: "SIMPLICITÉ", aboutPeople: "TOUT LE MONDE",
  aboutPrincipleOneTitle: "Commencer par l'utile", aboutPrincipleOneText: "Chaque outil doit résoudre clairement un vrai problème du quotidien.",
  aboutPrincipleTwoTitle: "Faire simple", aboutPrincipleTwoText: "Des interfaces claires : moins de temps à comprendre, plus de temps à agir.",
  aboutPrincipleThreeTitle: "Une place pour chacun", aboutPrincipleThreeText: "Pour planifier, écrire, créer ou coder, trouvez ici de quoi vous lancer.",
  aboutHowKicker: "Un chemin simple", aboutHowTitle: "Trouvez votre outil.<br /><em>Trouvez votre rythme.</em>",
  aboutStepOne: "Parcourez les outils ou cherchez la tâche qui vous occupe.", aboutStepTwo: "Ouvrez un outil ciblé et utilisez-le à votre rythme.",
  aboutStepThree: "Reprenez ce que vous aviez envie de faire.", aboutCtaKicker: "Quand vous voulez",
  aboutCtaTitle: "Simplifions les petites choses<br /><em>du quotidien.</em>",
  aboutArtOne: "faire simple", aboutArtTwo: "continuer", aboutFooterLine: "Petits outils. Grande aide."
});
Object.assign(translations.de, {
  home: "Startseite", allTools: "Suche", categories: "Kategorien", about: "Über uns", login: "Anmelden", signup: "Registrieren",
  eyebrow: "Dein digitaler Werkzeugkasten", heroDescription: "Praktische Alltagswerkzeuge, die deine Arbeit erleichtern und Ideen klarer machen.",
  heroTitle: "Nützliche <span class=\"title-highlight\">Tools</span>,<br />ganz einfach.", toolsTitle: "Tools für<br /><em>die kleinen Dinge.</em>",
  allToolsLabel: "Alle Tools", productivity: "Produktivität", creative: "Kreatives", developer: "Entwicklung", everyday: "Alltag",
  timeZoneTitle: "Zeitzonen-<br />umrechner", timeZoneText: "Bleib im Takt, wo immer du bist.",
  colorTitle: "Farb-<br />palette", colorText: "Finde Farben, die gut zusammenpassen.", textTitle: "Text<br />formatieren",
  textText: "Mach jedes Wort wertvoll.", jsonTitle: "JSON<br />formatieren", jsonText: "Bring Ordnung in unübersichtliche Daten.",
  explore: "Tools entdecken", why: "Warum tools.box", people: "Menschen", monthly: "nutzen tools.box jeden Monat",
  findFlow: "Finde deinen Flow", curated: "Für dich ausgewählt", viewAll: "Alle Tools ansehen", noClutter: "Gute Tools, kein Ballast",
  browse: "Werkzeugkasten öffnen", backHome: "Zur Startseite", welcomeBack: "Willkommen zurück", getStarted: "Los geht's",
  loginTitle: "Melde dich bei<br /><em>deinem Werkzeugkasten an.</em>", signupTitle: "Schaffe Platz für<br /><em>nützliche Dinge.</em>",
  loginIntro: "Mach dort weiter, wo du aufgehört hast – mit Tools, die dich unterstützen.", signupIntro: "Erstelle ein kostenloses Konto und halte deine Lieblingstools griffbereit.",
  emailLabel: "E-Mail-Adresse", passwordLabel: "Passwort", nameLabel: "Dein Name", remember: "Angemeldet bleiben",
  forgot: "Passwort vergessen?", loginButton: "Anmelden", signupButton: "Konto erstellen",
  noAccount: "Noch kein Konto?", haveAccount: "Du hast bereits ein Konto?", terms: "Ich stimme den Nutzungsbedingungen und der Datenschutzerklärung zu.",
  privateNote: "Einfache Tools, mit Sorgfalt gemacht.", whyEyebrow: "Ein besserer Weg, Dinge zu erledigen",
  whyTitle: "Warum<br /><em>tools.box?</em>", whyIntro: "Nützliche Dinge sollten leicht zu finden sein. tools.box bündelt einfache, fokussierte Tools – damit du weniger suchst und mehr schaffst.",
  valuesEyebrow: "Woran wir glauben", valuesTitle: "Kleine Tools können<br /><em>viel bewirken.</em>",
  valueOneTitle: "Von Anfang an nützlich", valueOneText: "Jedes Tool hat einen klaren Zweck und hilft bei einer echten Aufgabe.",
  valueTwoTitle: "Einfach zu nutzen", valueTwoText: "Keine langen Anleitungen oder komplizierte Einrichtung. Öffnen und loslegen.",
  valueThreeTitle: "Für alle gemacht", valueThreeText: "Ob Schreiben, Planen, Gestalten oder Programmieren – hier ist etwas für dich.",
  howEyebrow: "So funktioniert es", howTitle: "Finden.<br /><em>Nutzen.</em><br />Weitermachen.",
  stepOne: "Suche nach der Hilfe, die du gerade brauchst.", stepTwo: "Wähle ein fokussiertes Tool ohne Ablenkung.",
  stepThree: "Mach weiter mit dem, was dir wichtig ist.", ctaTitle: "Bereit für<br /><em>dein nächstes nützliches Tool?</em>",
  searchEyebrow: "Werkzeugkasten durchsuchen", searchTitle: "Wonach suchst<br /><em>du?</em>",
  searchDescription: "Suche nach Namen, Kategorie oder Aufgabe.", searchPlaceholder: "Zum Beispiel „Farbe“, „JSON“ oder „Zeitzone“",
  searchButton: "Suchen", results: "Tools gefunden", noResults: "Keine Tools gefunden. Versuch es mit einer anderen Suche.",
  birthDateLabel: "Geburtsdatum", adultOnlyNotice: "Du musst mindestens 18 Jahre alt sein, um ein Konto zu erstellen.",
  aboutEyebrow: "Mehr Platz für das, was zählt", aboutHeroTitle: "Weniger Kleinkram.<br /><em>Mehr gute Arbeit.</em>",
  aboutHeroText: "Useful Tools Box vereint kleine, fokussierte Tools, die den Alltag erleichtern. Finde, was du brauchst, erledige es und mach mit deinem Tag weiter.",
  aboutExplore: "Tools entdecken", aboutStoryKicker: "WARUM ES UNS GIBT",
  aboutStoryTitle: "Gute Tools sollten dich nicht aufhalten.",
  aboutStoryText: "Manchmal möchtest du nur eine Zeitzone prüfen, einen Text ordnen oder eine Datei verstehen. Statt dich durch Ablenkungen und komplizierte Einstellungen zu kämpfen, solltest du einfach ein klares Tool öffnen und weitermachen können.",
  aboutStoryTextTwo: "Das ist die Idee hinter tools.box: Praktisches an einem freundlichen Ort sammeln, jede Nutzung fokussiert halten und Nützliches mühelos machen.",
  aboutPrinciplesKicker: "Unsere wichtigen Grundsätze", aboutPrinciplesTitle: "Mit Bedacht gestaltet.<br /><em>Im Alltag nützlich.</em>",
  aboutPurpose: "ZWECK", aboutSimplicity: "EINFACHHEIT", aboutPeople: "MENSCHEN",
  aboutPrincipleOneTitle: "Nützlich anfangen", aboutPrincipleOneText: "Jedes Tool soll ein echtes Alltagsproblem klar und unkompliziert lösen.",
  aboutPrincipleTwoTitle: "Einfach halten", aboutPrincipleTwoText: "Klare Oberflächen bedeuten weniger Grübeln und mehr Erledigen.",
  aboutPrincipleThreeTitle: "Für alle da", aboutPrincipleThreeText: "Ob Planen, Schreiben, Gestalten oder Programmieren – hier kannst du loslegen.",
  aboutHowKicker: "Ein einfacher Weg", aboutHowTitle: "Finde dein Tool.<br /><em>Finde deinen Flow.</em>",
  aboutStepOne: "Stöbere oder suche nach deiner aktuellen Aufgabe.", aboutStepTwo: "Öffne ein fokussiertes Tool und nutze es in deinem Tempo.",
  aboutStepThree: "Mach weiter mit dem, was du als Nächstes tun wolltest.", aboutCtaKicker: "Wann immer du bereit bist",
  aboutCtaTitle: "Machen wir die kleinen Dinge<br /><em>einfacher.</em>",
  aboutArtOne: "einfach machen", aboutArtTwo: "weitermachen", aboutFooterLine: "Kleine Tools. Große Hilfe."
});
Object.assign(translations.ja, {
  home: "ホーム", allTools: "検索", categories: "カテゴリー", about: "私たちについて", login: "ログイン", signup: "新規登録",
  eyebrow: "あなたのデジタルツールボックス", heroDescription: "日々の作業を少し楽にし、アイデアをもっと明確にする便利なツールを集めました。",
  heroTitle: "便利な<span class=\"title-highlight\">ツール</span>を、<br />シンプルに。", toolsTitle: "ちょっとしたことに<br /><em>役立つツール。</em>",
  allToolsLabel: "すべてのツール", productivity: "効率化", creative: "クリエイティブ", developer: "開発", everyday: "日常",
  timeZoneTitle: "タイムゾーン<br />変換", timeZoneText: "どこにいても時間を逃しません。",
  colorTitle: "カラーパレット", colorText: "相性のよい色を見つけましょう。", textTitle: "テキスト<br />整形",
  textText: "言葉をもっと読みやすく。", jsonTitle: "JSON<br />整形", jsonText: "複雑なデータをわかりやすく。",
  explore: "ツールを見る", why: "tools.box について", people: "人", monthly: "人が毎月 tools.box を利用",
  findFlow: "自分のペースで", curated: "おすすめ", viewAll: "すべて見る", noClutter: "便利なツールを、すっきりと",
  browse: "ツールを探す", backHome: "ホームに戻る", welcomeBack: "おかえりなさい", getStarted: "はじめましょう",
  loginTitle: "<em>ツールボックス</em>に<br />ログイン", signupTitle: "便利なツールを<br /><em>いつでも手元に。</em>",
  loginIntro: "前回の続きから、作業に役立つツールを使いましょう。", signupIntro: "無料アカウントを作成して、お気に入りのツールをすぐ使えるようにしましょう。",
  emailLabel: "メールアドレス", passwordLabel: "パスワード", nameLabel: "お名前", remember: "ログイン状態を保持",
  forgot: "パスワードをお忘れですか？", loginButton: "ログイン", signupButton: "アカウントを作成",
  noAccount: "アカウントをお持ちでない方", haveAccount: "すでにアカウントをお持ちですか？", terms: "利用規約とプライバシーポリシーに同意します。",
  privateNote: "心を込めたシンプルなツール。", whyEyebrow: "もっとスムーズに作業するために",
  whyTitle: "tools.boxを<br /><em>選ぶ理由</em>", whyIntro: "便利なものは、すぐ見つかるべきです。tools.boxはシンプルで目的に集中できるツールをまとめ、探す時間を減らして創作の時間を増やします。",
  valuesEyebrow: "大切にしていること", valuesTitle: "小さなツールが<br /><em>大きな違いを生む。</em>",
  valueOneTitle: "使いやすさを第一に", valueOneText: "一つひとつのツールが、日常の具体的な作業を助けます。",
  valueTwoTitle: "シンプルに", valueTwoText: "長い説明や複雑な設定は不要。開いてすぐ使えます。",
  valueThreeTitle: "誰にとっても使いやすく", valueThreeText: "文章、計画、デザイン、開発。あなたに合うツールが見つかります。",
  howEyebrow: "使い方", howTitle: "見つける。<br /><em>使う。</em><br />次へ進む。",
  stepOne: "必要なツールを検索します。", stepTwo: "集中できるツールを選んで使います。",
  stepThree: "大切な作業に戻りましょう。", ctaTitle: "次のお気に入りツールを<br /><em>見つけませんか？</em>",
  searchEyebrow: "ツールを検索", searchTitle: "何を<br /><em>お探しですか？</em>",
  searchDescription: "名前、カテゴリー、やりたいことから検索できます。", searchPlaceholder: "「色」「JSON」「タイムゾーン」など",
  searchButton: "検索", results: "件のツール", noResults: "ツールが見つかりません。別の言葉で検索してください。",
  birthDateLabel: "生年月日", adultOnlyNotice: "アカウント作成には18歳以上である必要があります。",
  aboutEyebrow: "大切なことに、もう少し時間を", aboutHeroTitle: "雑務を減らして。<br /><em>やりたいことを。</em>",
  aboutHeroText: "Useful Tools Boxは、毎日の作業を少し楽にするシンプルなツールを集めた場所です。必要なものを見つけて使ったら、また自分の時間へ。",
  aboutExplore: "ツールを見る", aboutStoryKicker: "私たちの想い",
  aboutStoryTitle: "よいツールは、作業の邪魔をしません。",
  aboutStoryText: "タイムゾーンを確認したい、文章を整えたい、ファイルの内容を知りたい。広告や複雑な設定に悩まず、わかりやすいツールを開いてすぐに作業を続けられるべきです。",
  aboutStoryTextTwo: "それがtools.boxの考え方です。便利なものをひとつの場所に集め、使う人が迷わず、自然に役立つ体験を目指します。",
  aboutPrinciplesKicker: "大切にする3つのこと", aboutPrinciplesTitle: "丁寧に設計。<br /><em>日々の暮らしに役立つ。</em>",
  aboutPurpose: "目的", aboutSimplicity: "シンプル", aboutPeople: "みんな",
  aboutPrincipleOneTitle: "役立つことから", aboutPrincipleOneText: "日常の本当の困りごとを、わかりやすく解決するツールを作ります。",
  aboutPrincipleTwoTitle: "シンプルに保つ", aboutPrincipleTwoText: "迷う時間を減らし、すぐに使えるわかりやすい画面を大切にします。",
  aboutPrincipleThreeTitle: "誰もが使えるように", aboutPrincipleThreeText: "計画、文章、創作、プログラミング。ここから始められます。",
  aboutHowKicker: "シンプルな使い方", aboutHowTitle: "ツールを見つけて。<br /><em>自分のペースで。</em>",
  aboutStepOne: "必要な作業を検索、または一覧から探します。", aboutStepTwo: "目的に合ったツールを自分のペースで使います。",
  aboutStepThree: "次にやりたいことへ戻りましょう。", aboutCtaKicker: "いつでもどうぞ",
  aboutCtaTitle: "日々の小さな作業を<br /><em>もっと簡単に。</em>",
  aboutArtOne: "シンプルに", aboutArtTwo: "前に進もう", aboutFooterLine: "小さなツール、大きな助け。"
});
const languageLabels = { en: "EN", zh: "中文", es: "ES", fr: "FR", de: "DE", ja: "日本語" };
const newToolTranslations = {
  en: { uuidTitle: "UUID<br />generator", uuidText: "Create secure, unique IDs in seconds.", urlTitle: "URL<br />encoder", urlText: "Encode or decode URL components.", base64Title: "Base64<br />converter", base64Text: "Convert text to and from Base64.", timestampTitle: "Timestamp<br />converter", timestampText: "Translate Unix time into a date.", unitTitle: "Unit<br />converter", unitText: "Convert everyday measurements with ease.", wordCountTitle: "Word<br />counter", wordCountText: "Count words, characters, and reading time." },
  zh: { uuidTitle: "UUID<br />生成器", uuidText: "快速生成安全且唯一的 ID。", urlTitle: "URL<br />编码器", urlText: "编码或解码 URL 组件。", base64Title: "Base64<br />转换器", base64Text: "在文本与 Base64 之间转换。", timestampTitle: "时间戳<br />转换器", timestampText: "将 Unix 时间转换为日期。", unitTitle: "单位<br />转换器", unitText: "轻松转换常见计量单位。", wordCountTitle: "字数<br />统计", wordCountText: "统计字词、字符和阅读时间。" },
  es: { uuidTitle: "Generador<br />UUID", uuidText: "Crea identificadores únicos y seguros.", urlTitle: "Codificador<br />URL", urlText: "Codifica o decodifica componentes URL.", base64Title: "Conversor<br />Base64", base64Text: "Convierte texto y Base64.", timestampTitle: "Conversor de<br />tiempo Unix", timestampText: "Transforma una marca de tiempo en fecha.", unitTitle: "Conversor de<br />unidades", unitText: "Convierte medidas cotidianas fácilmente.", wordCountTitle: "Contador<br />de palabras", wordCountText: "Cuenta palabras, caracteres y tiempo de lectura." },
  fr: { uuidTitle: "Générateur<br />UUID", uuidText: "Créez des identifiants uniques et sûrs.", urlTitle: "Encodeur<br />URL", urlText: "Encodez ou décodez des composants URL.", base64Title: "Convertisseur<br />Base64", base64Text: "Convertissez du texte et du Base64.", timestampTitle: "Convertisseur<br />Unix", timestampText: "Transformez un horodatage en date.", unitTitle: "Convertisseur<br />d’unités", unitText: "Convertissez facilement les mesures courantes.", wordCountTitle: "Compteur<br />de mots", wordCountText: "Comptez les mots, caractères et temps de lecture." },
  de: { uuidTitle: "UUID-<br />Generator", uuidText: "Erzeuge sichere, eindeutige IDs.", urlTitle: "URL-<br />Encoder", urlText: "Kodiere oder dekodiere URL-Bestandteile.", base64Title: "Base64-<br />Konverter", base64Text: "Wandle Text in Base64 um und zurück.", timestampTitle: "Zeitstempel-<br />Konverter", timestampText: "Wandle Unix-Zeit in ein Datum um.", unitTitle: "Einheiten-<br />umrechner", unitText: "Rechne gängige Maße ganz einfach um.", wordCountTitle: "Wörter<br />zählen", wordCountText: "Zähle Wörter, Zeichen und Lesezeit." },
  ja: { uuidTitle: "UUID<br />生成", uuidText: "安全で一意なIDをすぐに作成。", urlTitle: "URL<br />エンコード", urlText: "URLの各要素をエンコード・デコード。", base64Title: "Base64<br />変換", base64Text: "テキストとBase64を相互変換。", timestampTitle: "タイムスタンプ<br />変換", timestampText: "Unix時刻を日付に変換。", unitTitle: "単位<br />変換", unitText: "よく使う単位を簡単に変換。", wordCountTitle: "文字数<br />カウント", wordCountText: "単語、文字数、読了時間を表示。" }
};
Object.entries(newToolTranslations).forEach(([language, copy]) => Object.assign(translations[language], copy));
Object.assign(switchAccountLabels, { fr: "Changer de compte", de: "Konto wechseln", ja: "アカウントを切り替える" });
Object.assign(welcomeLabels, { fr: "Bienvenue", de: "Willkommen", ja: "ようこそ" });
Object.assign(authFeedback, {
  fr: { login: "Connexion impossible. Vérifiez votre adresse e-mail et votre mot de passe.", signup: "Création du compte impossible. Réessayez." },
  de: { login: "Anmeldung nicht möglich. Prüfe E-Mail-Adresse und Passwort.", signup: "Konto konnte nicht erstellt werden. Bitte versuche es erneut." },
  ja: { login: "ログインできません。メールアドレスとパスワードを確認してください。", signup: "アカウントを作成できませんでした。もう一度お試しください。" }
});
Object.assign(authSuccess, {
  fr: { login: "Connexion réussie. Redirection…", signup: "Compte créé. Vérifiez votre e-mail pour confirmer votre adresse." },
  de: { login: "Erfolgreich angemeldet. Weiterleitung…", signup: "Konto erstellt. Bestätige deine E-Mail-Adresse." },
  ja: { login: "ログインしました。移動しています…", signup: "アカウントを作成しました。メールを確認してください。" }
});
Object.assign(ageRequirementCopy, {
  fr: "Vous devez avoir au moins 18 ans pour créer un compte.",
  de: "Du musst mindestens 18 Jahre alt sein, um ein Konto zu erstellen.",
  ja: "アカウントを作成するには18歳以上である必要があります。"
});
Object.assign(resetMessages, {
  fr: { email: "Saisissez l'adresse e-mail utilisée pour l'inscription :", sent: "E-mail de réinitialisation envoyé. Vérifiez votre boîte de réception.", missing: "Saisissez une adresse e-mail." },
  de: { email: "Gib die E-Mail-Adresse ein, mit der du dich registriert hast:", sent: "E-Mail zum Zurücksetzen gesendet. Prüfe deinen Posteingang.", missing: "Bitte gib eine E-Mail-Adresse ein." },
  ja: { email: "登録に使用したメールアドレスを入力してください：", sent: "パスワード再設定メールを送信しました。受信箱をご確認ください。", missing: "メールアドレスを入力してください。" }
});
Object.assign(switchPageCopy, {
  fr: { switchAccount: "Changer de compte", accountSettings: "Paramètres du compte", switchTitle: "Changer<br /><em>de compte.</em>", switchIntro: "Vous êtes connecté en tant que :", switchButton: "Continuer avec un autre compte", signOutButton: "Annuler la connexion", staySignedIn: "Rester connecté" },
  de: { switchAccount: "Konto wechseln", accountSettings: "Kontoeinstellungen", switchTitle: "Wechsle<br /><em>dein Konto.</em>", switchIntro: "Du bist derzeit angemeldet als:", switchButton: "Mit einem anderen Konto fortfahren", signOutButton: "Abmelden abbrechen", staySignedIn: "Angemeldet bleiben" },
  ja: { switchAccount: "アカウントを切り替える", accountSettings: "アカウント設定", switchTitle: "<em>アカウント</em>を<br />切り替える", switchIntro: "現在ログイン中のアカウント：", switchButton: "別のアカウントで続行", signOutButton: "ログインをキャンセル", staySignedIn: "ログインしたままにする" }
});

function setLanguage(language) {
  const copy = translations[language] || translations.en;
  const navCopy = { ".nav-link:nth-child(1)": copy.home, ".nav-link:nth-child(2)": copy.allTools, ".nav-link:nth-child(3)": copy.categories, ".nav-link:nth-child(4)": copy.about, ".login-link": copy.login };
  Object.entries(navCopy).forEach(([selector, value]) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  });
  const birthDateHint = document.querySelector(".form-hint[data-i18n='adultOnlyNotice']");
  if (birthDateHint) birthDateHint.textContent = copy.adultOnlyNotice;
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
  if (languageCurrent) languageCurrent.textContent = languageLabels[language] || languageLabels.en;
  updateThemeToggleLabel(language);
  document.querySelectorAll("[data-language]").forEach((option) => {
    option.setAttribute("aria-selected", String(option.dataset.language === language));
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
  const copy = translations[localStorage.getItem("tools-box-language") || "en"] || translations.en;
  searchResults.innerHTML = matches.map((tool) => `<a class="search-result ${tool.className}" href="${tool.path || `${siteHomeUrl}#tool-${tool.name.toLowerCase().split(" ")[0]}`}"><span class="tool-icon">${tool.icon}</span><span><h3>${tool.name}</h3><p>${tool.category} · ${tool.description}</p></span></a>`).join("");
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
  window.location.href = loginUrl;
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
  const language = localStorage.getItem("tools-box-language") || "en";
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

function closeLanguageMenu() {
  if (!languageMenu || !languageToggle) return;
  languageMenu.hidden = true;
  languageToggle.setAttribute("aria-expanded", "false");
}

languageToggle?.addEventListener("click", () => {
  const isOpen = !languageMenu.hidden;
  languageMenu.hidden = isOpen;
  languageToggle.setAttribute("aria-expanded", String(!isOpen));
});
document.querySelectorAll("[data-language]").forEach((option) => {
  option.addEventListener("click", () => {
    setLanguage(option.dataset.language);
    closeLanguageMenu();
  });
});
document.addEventListener("click", (event) => {
  if (languageMenu && languageToggle && !languageMenu.contains(event.target) && !languageToggle.contains(event.target)) closeLanguageMenu();
});
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
    const language = localStorage.getItem("tools-box-language") || "en";
    const email = form.querySelector('input[type="email"]')?.value.trim();
    const password = form.querySelector('input[type="password"]')?.value;
    const name = form.querySelector('input[name="name"]')?.value.trim();
    const birthDate = form.querySelector('input[name="date_of_birth"]')?.value;
    const submitButton = form.querySelector(".auth-submit");
    const setFeedback = (message) => {
      if (feedback) feedback.textContent = message;
    };
    if (!supabaseClient) {
      setFeedback(authFeedback[language][type]);
      return;
    }
    if (type === "signup" && !isAtLeastEighteen(birthDate)) {
      setFeedback(ageRequirementCopy[language] || ageRequirementCopy.en);
      return;
    }
    if (submitButton) submitButton.disabled = true;
    setFeedback("");
    const request = type === "login"
      ? supabaseClient.auth.signInWithPassword({ email, password })
      : supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { name, date_of_birth: birthDate },
          emailRedirectTo: siteHomeUrl
        }
      });
    request.then(({ data, error }) => {
      if (error) {
        setFeedback(friendlyAuthError(error, language, type));
        return;
      }
      if (type === "login" && data.session?.user) updateAccountUi(data.session.user);
      if (type === "signup" && data.user && !data.session) {
        beginSignupVerification(email);
        return;
      }
      setFeedback(authSuccess[language][type]);
      if (type === "login" && data.session?.user) window.setTimeout(() => { window.location.href = siteHomeUrl; }, 700);
    }).catch(() => {
      setFeedback(authFeedback[language][type]);
    }).finally(() => {
      if (submitButton) submitButton.disabled = false;
    });
  });
});

const signupForm = document.querySelector("[data-auth-form='signup']");
const signupVerifyForm = document.querySelector("#signup-verify-form");
const signupEmailInput = signupForm?.querySelector('input[name="email"]');
const signupCodeInput = document.querySelector("#signup-code");
const signupVerifyFeedback = document.querySelector("#signup-verify-feedback");
const verifySignupButton = document.querySelector("#verify-signup-button");
const resendSignupButton = document.querySelector("#resend-signup-code");
let signupVerificationEmail = "";
let signupResendAvailableAt = 0;

function friendlyAuthError(error, language, type = "signup") {
  const detail = String(error?.message || "");
  if (/email address not authorized/i.test(detail)) {
    return {
      en: "Supabase's default email service only sends to authorized team addresses. Configure custom SMTP to send verification emails to other users.",
      zh: "Supabase 默认邮件服务只向项目团队授权邮箱发送。要给其他用户发送验证码，请先配置自定义 SMTP。",
      es: "El correo predeterminado de Supabase solo envía a direcciones autorizadas del equipo. Configura SMTP propio para enviar códigos a otros usuarios."
    }[language] || "Supabase's default email service only sends to authorized team addresses. Configure custom SMTP.";
  }
  return detail || authFeedback[language]?.[type] || authFeedback.en[type];
}

function beginSignupVerification(email) {
  signupVerificationEmail = email;
  signupResendAvailableAt = Date.now() + 60_000;
  sessionStorage.setItem("tools-box-pending-signup-email", email);
  signupForm?.classList.add("auth-hidden");
  signupVerifyForm?.classList.remove("auth-hidden");
  const copy = document.querySelector("#signup-verify-copy");
  if (copy) copy.textContent = `验证码已发送至 ${email}。请输入邮件中的 6 位数字验证码。\nA verification code was sent to ${email}. Enter the 6-digit code from the email.`;
  if (signupVerifyFeedback) signupVerifyFeedback.textContent = "请检查收件箱和垃圾邮件文件夹。 / Check your inbox and spam folder.";
  signupCodeInput?.focus();
  updateSignupResendButton();
}

function updateSignupResendButton() {
  if (!resendSignupButton) return;
  const remaining = Math.ceil((signupResendAvailableAt - Date.now()) / 1000);
  resendSignupButton.disabled = remaining > 0;
  if (remaining > 0) {
    resendSignupButton.textContent = `重新发送 / Resend (${remaining}s)`;
    window.setTimeout(updateSignupResendButton, 1000);
  } else {
    resendSignupButton.textContent = "重新发送验证码 / Resend code";
  }
}

if (signupForm && signupVerifyForm) {
  const pendingEmail = sessionStorage.getItem("tools-box-pending-signup-email");
  if (pendingEmail) {
    signupVerificationEmail = pendingEmail;
    signupForm.querySelectorAll("input").forEach((input) => { input.disabled = true; });
    signupForm.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    signupEmailInput.value = pendingEmail;
    signupForm.classList.add("auth-hidden");
    signupVerifyForm.classList.remove("auth-hidden");
    const copy = document.querySelector("#signup-verify-copy");
    if (copy) copy.textContent = `验证码已发送至 ${pendingEmail}。请输入邮件中的 6 位数字验证码。\nA verification code was sent to ${pendingEmail}. Enter the 6-digit code from the email.`;
    signupResendAvailableAt = 0;
    updateSignupResendButton();
  }

  signupVerifyForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const code = signupCodeInput.value.trim();
    if (!signupVerificationEmail || !/^\d{6}$/.test(code)) {
      signupVerifyFeedback.textContent = "请输入邮件中的 6 位数字验证码。 / Enter the 6-digit code from your email.";
      return;
    }
    verifySignupButton.disabled = true;
    signupVerifyFeedback.textContent = "正在验证…… / Verifying…";
    try {
      const { data, error } = await supabaseClient.auth.verifyOtp({
        email: signupVerificationEmail,
        token: code,
        type: "signup"
      });
      if (error) throw error;
      if (data.session?.user) updateAccountUi(data.session.user);
      sessionStorage.removeItem("tools-box-pending-signup-email");
      signupVerifyFeedback.textContent = "邮箱已验证，正在进入网站。 / Email verified. Opening the site…";
      window.setTimeout(() => { window.location.href = siteHomeUrl; }, 700);
    } catch (error) {
      console.error("Signup email verification failed", error);
      signupVerifyFeedback.textContent = error.message || "验证码无效或已过期，请重试。 / The code is invalid or expired. Try again.";
    } finally {
      verifySignupButton.disabled = false;
    }
  });

  resendSignupButton.addEventListener("click", async () => {
    if (!signupVerificationEmail || resendSignupButton.disabled) return;
    resendSignupButton.disabled = true;
    signupVerifyFeedback.textContent = "正在重新发送…… / Sending another code…";
    try {
      const { error } = await supabaseClient.auth.resend({
        type: "signup",
        email: signupVerificationEmail,
        options: { emailRedirectTo: siteHomeUrl }
      });
      if (error) throw error;
      signupResendAvailableAt = Date.now() + 60_000;
      signupVerifyFeedback.textContent = "验证码已重新发送。 / A new code has been sent.";
      updateSignupResendButton();
    } catch (error) {
      console.error("Signup verification resend failed", error);
      signupVerifyFeedback.textContent = friendlyAuthError(error, localStorage.getItem("tools-box-language") || "en");
      signupResendAvailableAt = Date.now() + 60_000;
      updateSignupResendButton();
    }
  });

  document.querySelector("#back-to-signup")?.addEventListener("click", () => {
    sessionStorage.removeItem("tools-box-pending-signup-email");
    signupVerificationEmail = "";
    signupVerifyForm.classList.add("auth-hidden");
    signupForm.classList.remove("auth-hidden");
    signupForm.querySelectorAll("input,button").forEach((input) => { input.disabled = false; });
    signupVerifyFeedback.textContent = "";
  });
}

function isAtLeastEighteen(value) {
  if (!value) return false;
  const [year, month, day] = value.split("-").map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day || birthDate > today) return false;
  let age = today.getFullYear() - year;
  if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) age -= 1;
  return age >= 18;
}

const birthDateInput = document.querySelector('input[name="date_of_birth"]');
if (birthDateInput) {
  const today = new Date();
  birthDateInput.max = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

setLanguage(localStorage.getItem("tools-box-language") || "en");
renderResults();
