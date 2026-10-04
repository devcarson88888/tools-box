# Useful Tools Box

Useful Tools Box is a static site hosted on Cloudflare Workers Static Assets. Authentication and publisher moderation use Supabase; published tools are stored in the `create/` directory of this repository through the `github-publish` Edge Function.

## Deploy the site to Cloudflare Workers

The Worker serves this repository's static files directly; `.assetsignore` prevents project configuration and Supabase source from being published as public assets.

1. Install Node.js, then authenticate Wrangler with `npx wrangler login`.
2. From the repository root, run `npx wrangler deploy`. Wrangler prints the resulting `workers.dev` URL. Confirm the home page, `/signup/`, `/search/`, `/create/`, `/my-tools/`, `/banned/`, and `/tools/Time-zone-converter/` work before changing production settings.
3. In Supabase Edge Function secrets, set `TOOLS_BOX_APP_ORIGIN` to the exact new origin, for example `https://useful-tools-box.<your-account-subdomain>.workers.dev`. Keep the existing Pages origin available during the transition. The GitHub OAuth callback remains the Supabase Function URL; it does not move to Workers.
4. In Supabase Auth URL configuration, add the Workers origin to the allowed redirect URLs and update the Site URL when ready. Signup confirmation redirects use the site's origin.
5. Verify signup confirmation, Supabase requests, and GitHub publish/manage OAuth flows on Workers. Keep the Pages deployment available until these checks pass.

Workers deployment requires Cloudflare account access and is not performed automatically by GitHub pushes. Re-running `npx wrangler deploy` publishes the current working tree.

## Signup age check and publisher moderation

Before deploying the updated Edge Function:

1. Apply `supabase/migrations/20261004143000_age_gate_and_publisher_bans.sql` to the production Supabase project using the Supabase SQL Editor or the Supabase CLI. This adds an Auth trigger that rejects new accounts under 18, discards the submitted date of birth, and stores only an admin-managed verification timestamp. It also creates the private publisher-ban table.
2. Confirm that the Edge Function has the `SUPABASE_SERVICE_ROLE_KEY` secret. Never place this key in the static site or commit it. Supabase-hosted functions normally receive the project service-role key automatically; if it is not present, configure it in the project’s Edge Function secrets.
3. Deploy `supabase/functions/github-publish` so the function checks ban status before publisher actions and records permanent bans.

The age gate is enforced for new Auth user creation, including direct Auth API requests, not just the signup form. Existing accounts are not retroactively age-verified. Exact birth dates are not retained by the database trigger.

Adult-content moderation checks submitted HTML, CSS, JavaScript, and tool descriptions for known explicit-content terms. A match permanently blocks that GitHub publisher ID and records a timestamp. Automated text checks can misclassify content and cannot reliably detect images, encoded or obfuscated payloads, or remote content; do not treat this as complete content moderation. The ban notice page shows the recorded timestamp and links to request a review; review does not automatically restore publishing access.
