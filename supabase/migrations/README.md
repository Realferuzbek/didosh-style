# Supabase Migrations

Run each `.sql` file in **Supabase Dashboard → SQL Editor** (or via `supabase db push`).

## Files

| File | Purpose | When to run |
|------|---------|-------------|
| `decrement_stock.sql` | Atomic batch stock decrement RPC — replaces N+1 loop | Before first order is placed |
| `otp_cleanup.sql` | OTP table index + cleanup function | Immediately after deploy |

## pg_cron (optional)

To enable automatic OTP cleanup every 10 minutes:
1. Go to Supabase Dashboard → Database → Extensions
2. Enable `pg_cron`
3. Uncomment the `cron.schedule` line in `otp_cleanup.sql` and run it
