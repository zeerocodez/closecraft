# Security Rotation Checklist — do this when Phase 1 is deployed

Phase 1 removed hardcoded secrets from the code at HEAD, but **the old values
remain in this repository's public git history forever** (the repo has been
public and cloned). Anything that was ever committed must be treated as
compromised and **rotated**, not just re-set to the same value.

## Before deploying the Phase 1 commit (Vercel → Settings → Environment Variables)
- [ ] `AUTH_SECRET` or `NEXTAUTH_SECRET` is set to a NEW random value
      (rotating it logs out all existing sessions — expected).
- [ ] `ENCRYPTION_KEY` is set to a NEW random value. Note: Meta tokens
      encrypted with the old fallback key will need the Meta integration
      reconnected per workspace after rotation.
- [ ] `FACEBOOK_VERIFY_TOKEN` / `META_VERIFY_TOKEN` is set to a NEW value,
      and the same value is updated in the Meta App Dashboard webhook config.
- [ ] `FACEBOOK_APP_SECRET` / `META_APP_SECRET` reviewed; rotate in the Meta
      dashboard if it was ever shared outside Vercel.

## Accounts
- [ ] If `create_admin.js` was ever run against production, change the
      `admin@zeerocodes.com` password immediately (the script's password was
      public). Use `scripts/create_admin.js` with a strong env-supplied
      password instead.
- [ ] Rotate the Apex demo workspace password after any public evaluation
      window, or disable the demo workspace (`scripts/purge-demo-data.js`).
- [ ] Check production users for any account created with `password123`
      (the old Prisma seed) and force a reset.

## Repository visibility
- [ ] After the AI Startup Challenge evaluation ends, switch the repo to
      Private: GitHub → Settings → General → Danger Zone → Change
      visibility. Making it private does not undo history exposure — the
      rotations above are still required.
- [ ] Confirm no forks or mirrors retain the pre-fix history with live
      credentials (secrets were fallbacks, not production keys — rotation
      closes the risk regardless).
