-- Run in Supabase Dashboard → SQL Editor BEFORE the next order attempt.
-- Generates a unique, human-readable order number: DS-YYYYMMDD-XXXXX
-- Example: DS-20260616-04821
-- Loops until the candidate is not already taken in the orders table.

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  candidate text;
  conflict  integer;
BEGIN
  LOOP
    candidate := 'DS-'
      || TO_CHAR(NOW() AT TIME ZONE 'Asia/Tashkent', 'YYYYMMDD')
      || '-'
      || LPAD(FLOOR(RANDOM() * 100000)::int::text, 5, '0');

    SELECT COUNT(*) INTO conflict
      FROM orders
     WHERE order_number = candidate;

    EXIT WHEN conflict = 0;
  END LOOP;

  RETURN candidate;
END;
$$;
