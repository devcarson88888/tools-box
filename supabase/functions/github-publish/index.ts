const owner = Deno.env.get("GITHUB_REPO_OWNER") || "devcarson88888";
const repo = Deno.env.get("GITHUB_REPO_NAME") || "tools-box";
const clientId = Deno.env.get("GITHUB_CLIENT_ID") || "";
const clientSecret = Deno.env.get("GITHUB_CLIENT_SECRET") || "";
const defaultOrigin = "https://tools-box-639.pages.dev";
const isAllowedOrigin = (origin: string) =>
  origin === defaultOrigin || /^https:\/\/[a-z0-9-]+\.tools-box-639\.pages\.dev$/.test(origin);

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
});

const getOrigin = (request: Request) => {
  const origin = request.headers.get("origin") || defaultOrigin;
  return isAllowedOrigin(origin) ? origin : defaultOrigin;
};

const redirectUri = (request: Request) =>
  Deno.env.get("GITHUB_REDIRECT_URI") ||
  `${new URL(request.url).origin}/functions/v1/github-publish?action=callback`;

const parseCookies = (request: Request) =>
  Object.fromEntries((request.headers.get("cookie") || "").split(";").filter(Boolean).map((item) => {
    const separator = item.indexOf("=");
    return [item.slice(0, separator).trim(), decodeURIComponent(item.slice(separator + 1).trim())];
  }));

const json = (body: unknown, status: number, origin: string) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });

const safeProjectName = (value: unknown) => {
  const name = String(value || "").trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,49}$/.test(name) ? name : null;
};

const encodeBase64 = (value: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(value)));

const github = async (path: string, init: RequestInit, token: string) =>
  fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers || {})
    }
  });

Deno.serve(async (request) => {
  const origin = getOrigin(request);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });

  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "publish";

  if (action === "login") {
    if (!clientId || !clientSecret) return json({ error: "GitHub OAuth is not configured." }, 500, origin);
    const requestedReturnTo = url.searchParams.get("return_to") || `${defaultOrigin}/create/`;
    const returnTo = requestedReturnTo.startsWith(`${defaultOrigin}/`) ? requestedReturnTo : `${defaultOrigin}/create/`;
    const state = crypto.randomUUID();
    const authUrl = new URL("https://github.com/login/oauth/authorize");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri(request));
    authUrl.searchParams.set("scope", "repo");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("allow_signup", "true");
    const headers = new Headers({ Location: authUrl.toString() });
    headers.append("Set-Cookie", `github_oauth_state=${encodeURIComponent(`${state}|${returnTo}`)}; HttpOnly; Secure; SameSite=None; Max-Age=600; Path=/`);
    return new Response(null, { status: 302, headers });
  }

  if (action === "callback") {
    const stored = parseCookies(request).github_oauth_state;
    const state = url.searchParams.get("state");
    const code = url.searchParams.get("code");
    if (!stored || !state || !code || stored.split("|")[0] !== state) return new Response("Invalid OAuth state.", { status: 400 });
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri(request) })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) return new Response("GitHub authorization failed.", { status: 502 });
    const returnTo = stored.split("|").slice(1).join("|");
    const headers = new Headers({ "Content-Type": "text/html; charset=utf-8" });
    headers.append("Set-Cookie", `github_access_token=${encodeURIComponent(tokenData.access_token)}; HttpOnly; Secure; SameSite=None; Max-Age=3600; Path=/`);
    headers.append("Set-Cookie", `github_oauth_state=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/`);
    headers.append("Content-Security-Policy", "default-src 'none'; script-src 'unsafe-inline'");
    return new Response(`<!doctype html><meta charset="utf-8"><script>location.replace(${JSON.stringify(returnTo)})</script>`, { status: 200, headers });
  }

  if (request.method !== "POST") return json({ error: "Use POST to publish." }, 405, origin);
  const token = parseCookies(request).github_access_token;
  if (!token) return json({ error: "Authorize GitHub before publishing." }, 401, origin);
  const body = await request.json().catch(() => null);
  const project = safeProjectName(body?.projectName);
  if (!project) return json({ error: "Project name must use lowercase letters, numbers, and hyphens." }, 400, origin);
  const files = body?.files;
  if (!files || typeof files !== "object") return json({ error: "No staged files were provided." }, 400, origin);
  if (typeof files["index.html"] !== "string") return json({ error: "index.html is required before publishing." }, 400, origin);

  for (const fileName of ["index.html", "styles.css", "script.js"]) {
    if (typeof files[fileName] !== "string") continue;
    const path = `/repos/${owner}/${repo}/contents/create/${project}/${fileName}`;
    const existing = await github(path, { method: "GET" }, token);
    const existingData = existing.ok ? await existing.json() : null;
    const response = await github(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Publish ${project}/${fileName}`,
        content: encodeBase64(files[fileName]),
        ...(existingData?.sha ? { sha: existingData.sha } : {})
      })
    }, token);
    if (!response.ok) return json({ error: `GitHub rejected ${fileName}.` }, response.status, origin);
  }
  return json({ ok: true, path: `create/${project}/` }, 200, origin);
});
