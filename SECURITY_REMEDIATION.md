# Security remediation

Base: `dbdbe129682f43a3f2236735949bd7b3bf585904`.

## Changes

| Finding | Severity | Fix |
| --- | --- | --- |
| Signed-in users could query platform admin data | High | Both the admin page and layout require a fresh database `User.platformRole = SUPER_ADMIN` check. Tenant administrator roles and session role claims do not grant platform access. All users default to USER. |
| Paystack mock-secret fallback and email-based upgrades | High | Missing secret returns 503; every environment verifies a raw-body SHA-512 signature with constant-time comparison. Successful charges must match a stored transaction reference, minor-unit amount, currency, and server-selected plan. Atomic claiming, organization update and audit insertion share a database transaction. Retries cannot upgrade or audit twice. |
| Unsigned WhatsApp messages and default-tenant routing | High | Verify Meta's SHA-256 signature before parsing; validate payload; resolve all message phone-number IDs against the unique organization mapping before writes. Reject unknown numbers. Conversation queries also include organization scope. Verification GET fails closed without a configured token. |
| Public marketing leads assigned to customer tenants | High | Marketing submissions use the existing nullable organization field for platform-owned leads. Response exposes only success. |
| LMS authorization and prerequisite bypass | Medium | Require authenticated membership and active enrollment in a same-tenant cohort. Fetch tenant-scoped module metadata without lesson content. Direct navigation checks prerequisites before querying lessons. Completion comes from persisted ModuleProgress records, replacing demo statuses. |
| HTML email injection and unbounded public submissions | Medium | Escape all interpolated HTML fields, bound form lengths and body size, and use an atomic database-backed global 20-request/minute budget that does not trust attacker-supplied IP headers. Invalid JSON returns 400. |
| Destructive seed and predictable password | Medium | Replace reset script with an empty-database-only transactional seed. Require explicit development opt-in, local PostgreSQL database ending in _demo, operator-provided email and password of at least 16 characters. No deletes or password logging. Also guard auxiliary seeds, remove their reset logic and bind them to the demo workspace. Remove and ignore database artifacts. |
| Missing cron secret accepted Bearer undefined | Medium | Missing secret returns 503; configured token uses constant-time comparison. Remove test-query authentication bypass. Production cannot request the accelerated test threshold. |

## Deployment setup

1. Back up the database. The repository had no migration baseline. For an existing PostgreSQL database matching the original schema, apply the additive SQL in `prisma/migrations/20261007080000_security_boundaries/migration.sql` via the deployment DBA workflow and mark that migration applied using `prisma migrate resolve --applied 20261007080000_security_boundaries`. Do not run this additive migration against an empty database. Establish a proper initial schema baseline before adopting `migrate deploy` on fresh installations. Validate the SQL on staging first; it has not been executed here.
2. Generate Prisma Client and build after allowing the official Prisma engine host (`binaries.prisma.sh`) in the supported environment configuration. Do not disable TLS or checksum verification.
3. Provision `SUPER_ADMIN` only through trusted database administration; no public role-promotion endpoint was added. Existing accounts remain USER.
4. Set `PAYSTACK_SECRET_KEY`, `WHATSAPP_APP_SECRET` (Meta application secret), `WHATSAPP_VERIFY_TOKEN`, and `CRON_SECRET`. Missing values intentionally disable the corresponding privileged handlers.
5. Provision `Organization.whatsappPhoneNumberId` only after verifying ownership with Meta; never accept arbitrary client updates. The mapping is unique and currently supports one inbound number per organization.
6. Billing checkout is not implemented in this snapshot. Its trusted server code must create a `PaymentTransaction` with an unpredictable reference, authorized organization, catalog-derived positive minor-unit amount, currency and plan before initializing Paystack. There is deliberately no email-based fallback and no endpoint accepting browser-supplied payment amounts or plan claims. Until this flow is wired, unknown charge references are rejected rather than granting plans.
7. Existing students need legitimate active enrollments and membership. Only trusted assessment/review code may set `ModuleProgress.completedAt` after required criteria pass. No browser-controlled completion endpoint was added. Later modules remain locked until this record exists. Media storage itself still needs authenticated or signed delivery if real premium URLs are introduced.
8. Periodically delete expired `PublicFormRateLimit` rows using trusted maintenance code. The global budget deliberately trades availability under abuse for a shared limit that works across instances without trusting proxy headers. Tune for expected traffic and add deployment-edge abuse controls as needed.
9. Deletion of `prisma/dev.db` removes it from the current checkout only. Rotate/reset any exposed seeded accounts in deployed databases. Historical Git objects still contain the old database; rewriting shared history and coordinating retained clones/backups is a separate operational action and was not performed.

## Verification

- `npm test`: 29/29 passed (11 security regression tests plus 18 existing tenant-page tests). Fixed the existing VM harness's unresolved InboxClient import by stubbing its presentation component.
- ESLint on changed security application files, seed, helpers and tests: passed.
- `git diff --check`: passed.
- `npm run lint`: repository-wide pre-existing errors remain in marketing/LMS JSX, scripts, dashboard render logic and other unrelated code.
- `npm ci`, Prisma generation/format/diff, and `npm run build`: blocked by HTTP 403 from the environment proxy for the official Prisma engine host. Type checking cannot complete accurately without the generated client.
- `npm audit --omit=dev`: registry was reachable. Reported three High package entries (prisma, @prisma/config and deepmerge-ts) arising from GHSA-ggr8-5vv4-36mx, recursive-graph stack exhaustion in deepmerge-ts. The suggested remediation changes Prisma versions; no unverified major or backward dependency change was applied as part of these application fixes.
- Tests mock database and provider calls. Live PostgreSQL concurrency, migration execution, real provider delivery and end-to-end deployment checks remain to be performed in staging. These changes do not certify the entire application or resolve integrations outside the supplied findings.
