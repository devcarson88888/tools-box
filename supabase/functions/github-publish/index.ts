const owner = Deno.env.get("GITHUB_REPO_OWNER") || "devcarson88888";
const repo = Deno.env.get("GITHUB_REPO_NAME") || "tools-box";
const allowedPublisher = Deno.env.get("GITHUB_ALLOWED_PUBLISHER") || owner;
const clientId = Deno.env.get("GITHUB_CLIENT_ID") || "";
const clientSecret = Deno.env.get("GITHUB_CLIENT_SECRET") || "";
const defaultOrigin = "https://tools-box-639.pages.dev";
const appOrigin = (Deno.env.get("TOOLS_BOX_APP_ORIGIN") || defaultOrigin).replace(/\/$/, "");
const isAllowedOrigin = (origin: string) =>
  origin === defaultOrigin || origin === appOrigin || /^https:\/\/[a-z0-9-]+\.tools-box-639\.pages\.dev$/.test(origin);

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Vary": "Origin",
  "Cache-Control": "no-store",
  "Content-Type": "application/json"
});

const getOrigin = (request: Request) => {
  const origin = request.headers.get("origin") || appOrigin;
  return isAllowedOrigin(origin) ? origin : appOrigin;
};

const redirectUri = (request: Request) => {
  const configuredUri = Deno.env.get("GITHUB_REDIRECT_URI");
  if (configuredUri) return configuredUri;
  const endpoint = new URL(request.url);
  endpoint.protocol = "https:";
  endpoint.search = "?action=callback";
  endpoint.hash = "";
  return endpoint.toString();
};

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

const cleanDescription = (value: unknown) => {
  if (typeof value !== "string") return null;
  const description = value.trim();
  return description.length > 0 && description.length <= 280 ? description : null;
};

const attachProjectAssets = (html: string, hasCss: boolean, hasJs: boolean) => {
  let output = html;
  if (hasCss && !/<link\b[^>]*href=["'][^"']*styles\.css(?:[?#][^"']*)?["']/i.test(output)) {
    const link = '<link rel="stylesheet" href="./styles.css">';
    output = /<\/head>/i.test(output) ? output.replace(/<\/head>/i, `${link}</head>`) : `${link}\n${output}`;
  }
  if (hasJs && !/<script\b[^>]*src=["'][^"']*script\.js(?:[?#][^"']*)?["']/i.test(output)) {
    const script = '<script src="./script.js" defer></script>';
    output = /<\/body>/i.test(output) ? output.replace(/<\/body>/i, `${script}</body>`) : `${output}\n${script}`;
  }
  return output;
};

const encodeBase64 = (value: string) =>
  (() => {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary);
  })();

const decodeBase64 = (value: string) =>
  new TextDecoder().decode(Uint8Array.from(atob(value), (character) => character.charCodeAt(0)));

type PublishedTool = { name: string; description: string; createdBy: string; url: string };

const github = async (path: string, init: RequestInit, token: string) =>
  fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {})
    }
  });

const getGithubUser = async (token: string) => {
  const response = await github("/user", { method: "GET" }, token);
  if (!response.ok) return null;
  return await response.json();
};

const readToolMetadata = async (project: string): Promise<PublishedTool | null> => {
  const response = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/create/${project}/tool.json`);
  if (!response.ok) {
    if (response.status === 404) return { name: project, description: "", createdBy: owner, url: `/create/${project}/` };
    return null;
  }
  try {
    const metadata = await response.json();
    return {
      name: project,
      description: typeof metadata.description === "string" ? metadata.description : "",
      createdBy: typeof metadata.createdBy === "string" ? metadata.createdBy : "",
      url: `/create/${project}/`
    };
  } catch {
    return null;
  }
};

const listTools = async (): Promise<PublishedTool[] | null> => {
  const response = await github(`/repos/${owner}/${repo}/git/trees/main?recursive=1`, { method: "GET" }, "");
  if (!response.ok) return null;
  const tree = await response.json();
  const projects = new Set<string>();
  for (const item of tree.tree || []) {
    const match = /^create\/([a-z0-9][a-z0-9-]{0,49})\/index\.html$/.exec(item.path);
    if (match) projects.add(match[1]);
  }
  const tools = await Promise.all([...projects].map(readToolMetadata));
  return tools.filter((tool): tool is PublishedTool => tool !== null);
};

const putFile = async (path: string, content: string, message: string, token: string) => {
  const existing = await github(path, { method: "GET" }, token);
  const existingData = existing.ok ? await existing.json() : null;
  return await github(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: encodeBase64(content),
      ...(existingData?.sha ? { sha: existingData.sha } : {})
    })
  }, token);
};

const moderationUrl = Deno.env.get("SUPABASE_URL") || "https://svjbtfhbwpavpvrjfbbe.supabase.co";

const moderationRequest = async (path: string, init: RequestInit = {}) => {
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) throw new Error("Publisher moderation storage is not configured.");
  return await fetch(`${moderationUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });
};

const getPublisherBan = async (githubUserId: number) => {
  const response = await moderationRequest(
    `github_publisher_bans?github_user_id=eq.${githubUserId}&select=banned_at&limit=1`
  );
  if (!response.ok) throw new Error("Could not check publisher moderation status.");
  const rows = await response.json();
  return Array.isArray(rows) && rows.length ? rows[0].banned_at as string : null;
};

const banPublisher = async (user: { id: number; login: string }) => {
  const response = await moderationRequest("github_publisher_bans?on_conflict=github_user_id", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
    body: JSON.stringify({
      github_user_id: user.id,
      github_login: user.login,
      reason_code: "explicit_adult_content"
    })
  });
  if (!response.ok) throw new Error("Could not persist publisher moderation status.");
  const inserted = await response.json();
  if (Array.isArray(inserted) && inserted[0]?.banned_at) return inserted[0].banned_at as string;
  const existingBan = await getPublisherBan(user.id);
  if (!existingBan) throw new Error("Publisher moderation status was not recorded.");
  return existingBan;
};

const containsExplicitAdultContent = (files: Record<string, string>) => {
  const patterns = [
    /\b(?:porn(?:ography)?|hentai|xxx|sex\s*(?:tape|video|cam)|nudes?|naked\s*(?:girl|woman|man)|explicit\s+sex|blowjob|handjob|onlyfans)\b/i,
    /色情|成人影片|成人内容|黄色网站|黄网|裸聊|裸照|裸体|淫秽|性交|手淫|口交/,
    /ポルノ|アダルト動画|エロ動画|性行為/
  ];
  return Object.values(files).some((content) => patterns.some((pattern) => pattern.test(content)));
};

Deno.serve(async (request) => {
  const origin = getOrigin(request);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });

  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "publish";

  if (action === "login") {
    if (!clientId || !clientSecret) return json({ error: "GitHub OAuth is not configured." }, 500, origin);
    const requestedReturnTo = url.searchParams.get("return_to") || `${appOrigin}/create/`;
    let returnTo: string;
    try {
      const target = new URL(requestedReturnTo);
      returnTo = target.origin === defaultOrigin || target.origin === appOrigin
        ? target.toString()
        : `${appOrigin}/create/`;
    } catch {
      returnTo = `${appOrigin}/create/`;
    }
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
    const headers = new Headers({ Location: returnTo });
    headers.append("Set-Cookie", `github_access_token=${encodeURIComponent(tokenData.access_token)}; HttpOnly; Secure; SameSite=None; Max-Age=3600; Path=/`);
    headers.append("Set-Cookie", `github_oauth_state=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/`);
    return new Response(null, { status: 302, headers });
  }

  if (request.method !== "POST") return json({ error: "Use POST to publish." }, 405, origin);
  const body = await request.json().catch(() => null);
  const requestedAction = body?.action || "publish";

  if (requestedAction === "tools") {
    const tools = await listTools();
    return tools ? json({ tools }, 200, origin) : json({ error: "Unable to load published tools." }, 502, origin);
  }

  const token = parseCookies(request).github_access_token;
  if (!token) return json({ error: "Authorize GitHub before publishing." }, 401, origin);
  const user = await getGithubUser(token);
  if (!user?.login) return json({ error: "GitHub authorization expired. Please authorize again." }, 401, origin);

  if (requestedAction === "ban-status") {
    try {
      const bannedAt = await getPublisherBan(user.id);
      return bannedAt
        ? json({ banned: true, bannedAt, githubLogin: user.login }, 200, origin)
        : json({ banned: false }, 200, origin);
    } catch (error) {
      console.error("Publisher moderation lookup failed", error);
      return json({ error: "Could not check publisher moderation status." }, 503, origin);
    }
  }

  let bannedAt: string | null;
  try {
    bannedAt = await getPublisherBan(user.id);
  } catch (error) {
    console.error("Publisher moderation lookup failed", error);
    return json({ error: "Publishing is unavailable because moderation status could not be checked." }, 503, origin);
  }
  if (bannedAt) {
    return json({ error: "Publisher access is permanently suspended for an adult-content policy violation.", banned: true, bannedAt }, 403, origin);
  }

  if (requestedAction === "my-tools") {
    if (user.login.toLowerCase() !== allowedPublisher.toLowerCase()) {
      return json({ error: "Only the repository owner can manage published tools." }, 403, origin);
    }
    const tools = await listTools();
    return tools
      ? json({ tools: tools.filter((tool) => tool.createdBy.toLowerCase() === user.login.toLowerCase()) }, 200, origin)
      : json({ error: "Unable to load your tools." }, 502, origin);
  }

  if (requestedAction === "update-description") {
    if (user.login.toLowerCase() !== allowedPublisher.toLowerCase()) {
      return json({ error: "Only the repository owner can manage published tools." }, 403, origin);
    }
    const project = safeProjectName(body?.projectName);
    const description = cleanDescription(body?.description);
    if (!project || !description) return json({ error: "Use a valid project name and a description up to 280 characters." }, 400, origin);
    if (containsExplicitAdultContent({ description })) {
      try {
        const timestamp = await banPublisher(user);
        return json({
          error: "Publisher access is permanently suspended for an adult-content policy violation.",
          banned: true,
          bannedAt: timestamp
        }, 403, origin);
      } catch (error) {
        console.error("Publisher ban could not be persisted", error);
        return json({ error: "The description was blocked, but the permanent moderation record could not be saved. Contact the site administrator." }, 503, origin);
      }
    }
    const metadataPath = `/repos/${owner}/${repo}/contents/create/${project}/tool.json`;
    const existing = await github(metadataPath, { method: "GET" }, token);
    let metadata: Record<string, string>;
    let existingSha: string | undefined;
    if (existing.ok) {
      const current = await existing.json();
      existingSha = current.sha;
      try {
        metadata = JSON.parse(decodeBase64(current.content));
      } catch {
        return json({ error: "This tool's metadata is invalid." }, 500, origin);
      }
    } else if (existing.status === 404) {
      const indexResponse = await github(`/repos/${owner}/${repo}/contents/create/${project}/index.html`, { method: "GET" }, token);
      if (!indexResponse.ok) return json({ error: "Could not find this published tool." }, indexResponse.status, origin);
      metadata = { name: project, createdBy: user.login };
    } else {
      return json({ error: "Could not read this tool's metadata." }, existing.status, origin);
    }
    const updated = await github(metadataPath, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Update ${project} description`,
        content: encodeBase64(JSON.stringify({ ...metadata, description }, null, 2)),
        ...(existingSha ? { sha: existingSha } : {})
      })
    }, token);
    if (!updated.ok) {
      const githubError = await updated.json().catch(() => null);
      return json({ error: githubError?.message || "Unable to save the description." }, updated.status, origin);
    }
    return json({ ok: true }, 200, origin);
  }

  const project = safeProjectName(body?.projectName);
  if (!project) return json({ error: "Project name must use lowercase letters, numbers, and hyphens." }, 400, origin);
  if (user.login.toLowerCase() !== allowedPublisher.toLowerCase()) {
    return json({ error: "Only the repository owner can publish tools to this website." }, 403, origin);
  }
  const files = body?.files;
  if (!files || typeof files !== "object") return json({ error: "No staged files were provided." }, 400, origin);
  if (typeof files["index.html"] !== "string") return json({ error: "index.html is required before publishing." }, 400, origin);
  const description = cleanDescription(body.description);
  if (!description) return json({ error: "Add a description of up to 280 characters." }, 400, origin);

  const publishableFiles: Record<string, string> = {};
  for (const fileName of ["index.html", "styles.css", "script.js"]) {
    if (typeof files[fileName] === "string") publishableFiles[fileName] = files[fileName];
  }
  if (containsExplicitAdultContent({ ...publishableFiles, description })) {
    try {
      const timestamp = await banPublisher(user);
      return json({
        error: "Publisher access is permanently suspended for an adult-content policy violation.",
        banned: true,
        bannedAt: timestamp
      }, 403, origin);
    } catch (error) {
      console.error("Publisher ban could not be persisted", error);
      return json({ error: "Publishing was blocked, but the permanent moderation record could not be saved. Contact the site administrator." }, 503, origin);
    }
  }
  publishableFiles["index.html"] = attachProjectAssets(
    publishableFiles["index.html"],
    typeof files["styles.css"] === "string",
    typeof files["script.js"] === "string"
  );
  const totalBytes = Object.values(publishableFiles).reduce((sum, content) => sum + new TextEncoder().encode(content).byteLength, 0);
  if (totalBytes > 1_000_000) return json({ error: "The combined project files must be smaller than 1 MB." }, 413, origin);
  for (const [fileName, content] of Object.entries(publishableFiles)) {
    const path = `/repos/${owner}/${repo}/contents/create/${project}/${fileName}`;
    const response = await putFile(path, content, `Publish ${project}/${fileName}`, token);
    if (!response.ok) {
      const githubError = await response.json().catch(() => null);
      return json({ error: githubError?.message || `GitHub rejected ${fileName}.` }, response.status, origin);
    }
  }

  const metadataPath = `/repos/${owner}/${repo}/contents/create/${project}/tool.json`;
  const metadataResponse = await putFile(
    metadataPath,
    JSON.stringify({ name: project, description, createdBy: user.login }, null, 2),
    `Update ${project} description`,
    token
  );
  if (!metadataResponse.ok) {
    const githubError = await metadataResponse.json().catch(() => null);
    return json({ error: githubError?.message || "GitHub rejected tool metadata." }, metadataResponse.status, origin);
  }
  return json({ ok: true, path: `create/${project}/` }, 200, origin);
});
