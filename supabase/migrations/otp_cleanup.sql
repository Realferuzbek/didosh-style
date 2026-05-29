-- Run in Supabase Dashboard → SQL Editor.
-- Adds an index for fast OTP lookups and a cleanup function.

-- Index: fast lookup by phone + used + expiry (covers all OTP queries)
CREATE INDEX IF NOT EXISTS idx_otp_codes_lookup
  ON otp_codes (phone, used, expires_at DESC);

-- Cleanup function — deletes used or expired OTP codes older than 1 hour
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM otp_codes
  WHERE used = true
     OR expires_at < NOW() - INTERVAL '1 hour';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- OPTIONAL: Schedule auto-cleanup every 10 minutes with pg_cron.
-- To enable: Supabase Dashboard → Database → Extensions → enable pg_cron
-- Then uncomment and run:
-- SELECT cron.schedule('cleanup-otps', '*/10 * * * *', 'SELECT cleanup_expired_otps()');
