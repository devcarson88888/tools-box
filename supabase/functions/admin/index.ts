const projectUrl = Deno.env.get("SUPABASE_URL") || "https://svjbtfhbwpavpvrjfbbe.supabase.co";
const pagesOrigin = "https://tools-box-639.pages.dev";
const workersOrigin = Deno.env.get("TOOLS_BOX_APP_ORIGIN") || "https://tools-box.carson88888.workers.dev";
const allowedOrigins = new Set([pagesOrigin, workersOrigin.replace(/\/$/, "")]);
const headersFor = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
  "Content-Type": "application/json",
  "Vary": "Origin"
});

const json = (body: unknown, status: number, origin: string) =>
  new Response(JSON.stringify(body), { status, headers: headersFor(origin) });

const readDefaultKey = (name: string) => {
  const raw = Deno.env.get(name);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed.default === "string" ? parsed.default : null;
  } catch {
    return raw;
  }
};

const configuredAdmins = () => ({
  emails: (Deno.env.get("ADMIN_EMAILS") || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
  userIds: (Deno.env.get("ADMIN_USER_IDS") || "")
    .split(",")
    .map((id) => id.trim().toLowerCase())
    .filter(Boolean)
});

const supabaseAdminRequest = (path: string, init: RequestInit, secretKey: string) =>
  fetch(`${projectUrl}${path}`, {
    ...init,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });

Deno.serve(async (request) => {
  const requestOrigin = request.headers.get("origin") || "";
  const origin = allowedOrigins.has(requestOrigin) ? requestOrigin : workersOrigin.replace(/\/$/, "");
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: headersFor(origin) });
  if (request.method !== "POST") return json({ error: "Use POST." }, 405, origin);

  const authorization = request.headers.get("authorization") || "";
  const accessToken = /^Bearer\s+(.+)$/i.exec(authorization)?.[1];
  if (!accessToken) return json({ error: "Sign in with the administrator account first." }, 401, origin);

  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY") || readDefaultKey("SUPABASE_PUBLISHABLE_KEYS");
  const secretKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || readDefaultKey("SUPABASE_SECRET_KEYS");
  if (!publishableKey || !secretKey) {
    console.error("Admin function is missing Supabase API keys.");
    return json({ error: "The admin service is not configured. Ask the project owner to check Edge Function settings." }, 503, origin);
  }

  let currentUser: { id: string; email?: string };
  try {
    const userResponse = await fetch(`${projectUrl}/auth/v1/user`, {
      headers: { apikey: publishableKey, Authorization: `Bearer ${accessToken}` }
    });
    if (!userResponse.ok) return json({ error: "Your sign-in expired. Sign in again." }, 401, origin);
    currentUser = await userResponse.json();
  } catch (error) {
    console.error("Admin identity verification failed", error);
    return json({ error: "Could not verify your sign-in. Try again." }, 502, origin);
  }

  const admins = configuredAdmins();
  if (!admins.emails.length && !admins.userIds.length) {
    return json({ error: "Admin access is not enabled yet. The project owner must add an ADMIN_EMAILS or ADMIN_USER_IDS Edge Function secret." }, 503, origin);
  }
  const currentEmail = currentUser.email?.toLowerCase() || "";
  const isAdmin = admins.userIds.includes(currentUser.id.toLowerCase()) || admins.emails.includes(currentEmail);
  if (!isAdmin) return json({ error: "This signed-in account is not on the admin allowlist." }, 403, origin);

  let body: { action?: string; page?: number; userId?: string; suspend?: boolean; confirmEmail?: string } | null;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400, origin);
  }

  if (body?.action === "list-users") {
    const page = Number.isInteger(body.page) ? Math.max(1, Math.min(body.page as number, 10_000)) : 1;
    try {
      const response = await supabaseAdminRequest(`/auth/v1/admin/users?page=${page}&per_page=50`, { method: "GET" }, secretKey);
      if (!response.ok) {
        console.error("Supabase user list request failed", response.status, await response.text());
        return json({ error: "Could not load accounts from Supabase." }, 502, origin);
      }
      const result = await response.json();
      const users = Array.isArray(result.users) ? result.users : [];
      const userIds = users
        .map((user: Record<string, unknown>) => String(user.id || "").toLowerCase())
        .filter((id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id));
      let birthDatesByUser = new Map<string, string>();
      if (userIds.length) {
        const birthDateResponse = await supabaseAdminRequest(
          `/rest/v1/user_birth_dates?user_id=in.(${userIds.join(",")})&select=user_id,birth_date`,
          { method: "GET" },
          secretKey
        );
        if (!birthDateResponse.ok) {
          console.error("Supabase birth date lookup failed", birthDateResponse.status, await birthDateResponse.text());
          return json({ error: "Could not load account birth dates. Check that the birth-date migration has been applied." }, 503, origin);
        }
        const birthDateRows = await birthDateResponse.json();
        birthDatesByUser = new Map<string, string>(
          (Array.isArray(birthDateRows) ? birthDateRows : [])
            .map((row: Record<string, unknown>) => [String(row.user_id).toLowerCase(), String(row.birth_date)] as [string, string])
        );
      }
      const safeUsers = users.map((user: Record<string, unknown>) => ({
        id: user.id,
        email: user.email,
        birthDate: birthDatesByUser.get(String(user.id).toLowerCase()) || null,
        isAdmin: admins.userIds.includes(String(user.id).toLowerCase())
          || admins.emails.includes(String(user.email || "").toLowerCase()),
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        emailConfirmedAt: user.email_confirmed_at,
        bannedUntil: user.banned_until,
        name: typeof (user.user_metadata as Record<string, unknown> | undefined)?.name === "string"
          ? (user.user_metadata as Record<string, string>).name
          : ""
      }));
      return json({ users: safeUsers, page, perPage: 50 }, 200, origin);
    } catch (error) {
      console.error("Supabase user list request failed", error);
      return json({ error: "Could not connect to Supabase Auth." }, 502, origin);
    }
  }

  if (body?.action === "set-signin-suspension") {
    const targetId = typeof body.userId === "string" ? body.userId.toLowerCase() : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(targetId)) {
      return json({ error: "Select a valid account." }, 400, origin);
    }
    if (targetId === currentUser.id.toLowerCase() || admins.userIds.includes(targetId)) {
      return json({ error: "For safety, admin accounts and your own account cannot be suspended here." }, 400, origin);
    }
    if (typeof body.suspend !== "boolean") return json({ error: "Choose whether to suspend or restore sign-in." }, 400, origin);
    try {
      const targetResponse = await supabaseAdminRequest(`/auth/v1/admin/users/${targetId}`, { method: "GET" }, secretKey);
      if (!targetResponse.ok) {
        return json({ error: "Could not verify the selected account." }, 404, origin);
      }
      const targetData = await targetResponse.json();
      const targetUser = targetData.user || targetData;
      if (admins.emails.includes(String(targetUser.email || "").toLowerCase())) {
        return json({ error: "Admin accounts cannot be suspended here." }, 400, origin);
      }
      const response = await supabaseAdminRequest(`/auth/v1/admin/users/${targetId}`, {
        method: "PUT",
        body: JSON.stringify({ ban_duration: body.suspend ? "876000h" : "none" })
      }, secretKey);
      if (!response.ok) {
        console.error("Supabase account status update failed", response.status, await response.text());
        return json({ error: "Supabase could not update this account." }, 502, origin);
      }
      return json({ ok: true }, 200, origin);
    } catch (error) {
      console.error("Supabase account status update failed", error);
      return json({ error: "Could not connect to Supabase Auth." }, 502, origin);
    }
  }

  if (body?.action === "delete-user") {
    const targetId = typeof body.userId === "string" ? body.userId.toLowerCase() : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(targetId)) {
      return json({ error: "Select a valid account." }, 400, origin);
    }
    if (targetId === currentUser.id.toLowerCase() || admins.userIds.includes(targetId)) {
      return json({ error: "For safety, you cannot delete your own account or an admin account here." }, 400, origin);
    }
    if (typeof body.confirmEmail !== "string" || !body.confirmEmail.trim()) {
      return json({ error: "Type the account email to confirm deletion." }, 400, origin);
    }
    try {
      const targetResponse = await supabaseAdminRequest(`/auth/v1/admin/users/${targetId}`, { method: "GET" }, secretKey);
      if (!targetResponse.ok) return json({ error: "Could not verify the selected account." }, 404, origin);
      const targetData = await targetResponse.json();
      const targetUser = targetData.user || targetData;
      const targetEmail = String(targetUser.email || "");
      if (!targetEmail || admins.emails.includes(targetEmail.toLowerCase())) {
        return json({ error: "Admin accounts or accounts without a verified email cannot be deleted here." }, 400, origin);
      }
      if (body.confirmEmail.trim().toLowerCase() !== targetEmail.toLowerCase()) {
        return json({ error: "The email you typed does not match this account." }, 400, origin);
      }
      console.warn("Administrator permanently deleting a user account", {
        actorUserId: currentUser.id,
        targetUserId: targetId
      });
      const deleteResponse = await supabaseAdminRequest(`/auth/v1/admin/users/${targetId}`, { method: "DELETE" }, secretKey);
      if (!deleteResponse.ok) {
        console.error("Supabase account deletion failed", deleteResponse.status, await deleteResponse.text());
        return json({ error: "Supabase could not delete this account." }, 502, origin);
      }
      return json({ ok: true }, 200, origin);
    } catch (error) {
      console.error("Supabase account deletion failed", error);
      return json({ error: "Could not connect to Supabase Auth." }, 502, origin);
    }
  }

  return json({ error: "Unknown admin action." }, 400, origin);
});
