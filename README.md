# Useful Tools Box

Useful Tools Box is a static site hosted on Cloudflare Workers Static Assets. Authentication and publisher moderation use Supabase; published tools are stored in the `create/` directory of this repository through the `github-publish` Edge Function.

## Deploy the site to Cloudflare Workers

The Worker serves this repository's static files directly; `.assetsignore` prevents project configuration and Supabase source from being published as public assets.

1. Install Node.js, then authenticate Wrangler with `npx wrangler login`.
2. From the repository root, run `npx wrangler deploy`. Wrangler prints the resulting `workers.dev` URL. Confirm the home page, `/signup/`, `/search/`, `/create/`, `/my-tools/`, `/banned/`, and `/tools/Time-zone-converter/` work before changing production settings.
3. The `name` in `wrangler.json` must match the Worker name in Cloudflare. The deployed Worker is `tools-box`.
4. In Supabase Edge Function secrets, set `TOOLS_BOX_APP_ORIGIN` to `https://tools-box.carson88888.workers.dev`. Keep the existing Pages origin available during the transition. The GitHub OAuth callback remains the Supabase Function URL; it does not move to Workers.
5. In Supabase Auth URL configuration, add the Workers origin to the allowed redirect URLs and update the Site URL when ready. Signup confirmation redirects use the site's origin.
6. Verify signup confirmation, Supabase requests, and GitHub publish/manage OAuth flows on Workers. Keep the Pages deployment available until these checks pass.

Workers deployment requires Cloudflare account access and is not performed automatically by GitHub pushes. Re-running `npx wrangler deploy` publishes the current working tree.

## Admin console

The private account console is at `/admin/`. Its Edge Function verifies the signed-in Supabase user and requires an explicit `ADMIN_EMAILS` and/or `ADMIN_USER_IDS` secret; it never trusts a user-supplied name or browser-provided role. Add the exact administrator email in Supabase Edge Function secrets as `ADMIN_EMAILS` (multiple emails may be comma-separated). Do not commit or paste service keys into the static site.

Deploy `supabase/functions/admin/index.ts` as the `admin` Edge Function and apply every migration under `supabase/migrations/`, then sign in on the site with an allowlisted account and open `/admin/`. The console shows email, display name, birth date, signup time, email-confirmation state and last sign-in; it can suspend or restore sign-in and permanently delete a non-admin account after typed-email confirmation. Admin accounts cannot be suspended or deleted by this console. Passwords are never returned. Birth dates are sensitive personal information and are available only to explicitly allowlisted administrators. Dates from accounts created before `20261004174400_store_birth_dates_for_admin.sql` are not available because they were discarded and cannot be recovered. An account must be able to sign in before it can use the console.

## Signup age check and publisher moderation

Before deploying the updated Edge Function:

1. Apply `supabase/migrations/20261004143000_age_gate_and_publisher_bans.sql` to the production Supabase project using the Supabase SQL Editor or the Supabase CLI. This adds an Auth trigger that rejects new accounts under 18, discards the submitted date of birth, and stores only an admin-managed verification timestamp. It also creates the private publisher-ban table.
2. Confirm that the Edge Function has the `SUPABASE_SERVICE_ROLE_KEY` secret. Never place this key in the static site or commit it. Supabase-hosted functions normally receive the project service-role key automatically; if it is not present, configure it in the project’s Edge Function secrets.
3. Deploy `supabase/functions/github-publish` so the function checks ban status before publisher actions and records permanent bans.

The age gate is enforced for new Auth user creation, including direct Auth API requests, not just the signup form. The initial age-gate migration only retained an age-verification timestamp; the later birth-date migration retains the full date in a private table for admin display and removes it from Auth user metadata. Existing accounts are not retroactively age-verified.

Adult-content moderation checks submitted HTML, CSS, JavaScript, and tool descriptions for known explicit-content terms. A match permanently blocks that GitHub publisher ID and records a timestamp. Automated text checks can misclassify content and cannot reliably detect images, encoded or obfuscated payloads, or remote content; do not treat this as complete content moderation. The ban notice page shows the recorded timestamp and links to request a review; review does not automatically restore publishing access.

## Signup email verification codes

The signup page supports six-digit signup verification codes. Custom SMTP is not required to test this flow: Supabase's default mailer can send to authorized project team addresses, but has strict rate limits and is not intended for public delivery.

1. In the Supabase Dashboard, open **Authentication > Email Templates > Confirm signup**.
2. Set the email body to include `{{ .Token }}` (rather than relying only on `{{ .ConfirmationURL }}`). For example:

   ```html
   <h2>Verify your email</h2>
   <p>Your Useful Tools Box verification code is:</p>
   <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">{{ .Token }}</p>
   <p>Enter this code on the signup page. If you did not request it, you can ignore this email.</p>
   ```

3. Save the template, then test signup, code verification, and resend using an email address authorized by your Supabase project.

For delivery to public email addresses, configure a custom SMTP provider under **Authentication > SMTP Settings**. This requires credentials from an email service and a sender address/domain that the service allows; do not enter placeholder credentials. Changing the Supabase email template does not require redeploying the static site.
