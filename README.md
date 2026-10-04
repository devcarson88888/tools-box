# Useful Tools Box

Useful Tools Box is a static site hosted on Cloudflare Pages. Authentication and publisher moderation use Supabase; published tools are stored in the `create/` directory of this repository through the `github-publish` Edge Function.

## Signup age check and publisher moderation

Before deploying the updated Edge Function:

1. Apply `supabase/migrations/20261004143000_age_gate_and_publisher_bans.sql` to the production Supabase project using the Supabase SQL Editor or the Supabase CLI. This adds an Auth trigger that rejects new accounts under 18, discards the submitted date of birth, and stores only an admin-managed verification timestamp. It also creates the private publisher-ban table.
2. Confirm that the Edge Function has the `SUPABASE_SERVICE_ROLE_KEY` secret. Never place this key in the static site or commit it. Supabase-hosted functions normally receive the project service-role key automatically; if it is not present, configure it in the project’s Edge Function secrets.
3. Deploy `supabase/functions/github-publish` so the function checks ban status before publisher actions and records permanent bans.

The age gate is enforced for new Auth user creation, including direct Auth API requests, not just the signup form. Existing accounts are not retroactively age-verified. Exact birth dates are not retained by the database trigger.

Adult-content moderation checks submitted HTML, CSS, JavaScript, and tool descriptions for known explicit-content terms. A match permanently blocks that GitHub publisher ID and records a timestamp. Automated text checks can misclassify content and cannot reliably detect images, encoded or obfuscated payloads, or remote content; do not treat this as complete content moderation. The ban notice page shows the recorded timestamp and links to request a review; review does not automatically restore publishing access.
