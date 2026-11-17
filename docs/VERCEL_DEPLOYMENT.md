<!-- coderabbit-ai-generated:v1 -->

# Vercel deployment

## Hobby cron schedules

The checked-in schedules run once daily: revenue engine at 00:00 UTC, follow-ups at 01:00 UTC, and revenue leakage checks at 02:00 UTC. [Vercel Hobby](https://vercel.com/docs/cron-jobs/usage-and-pricing#hobby-scheduling-limits) can invoke each job within its scheduled hour. Pending work may wait up to a day. The previous 10-minute, 15-minute and hourly schedules require a plan supporting frequent crons or a separate scheduler. All cron routes continue to require `CRON_SECRET`.

## Security release prerequisite

The security release requires the `20261117_security_rate_limits` database migration before activation. Verify the production migration baseline before applying migrations; never seed or reset production to satisfy this prerequisite.
