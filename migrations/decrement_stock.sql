-- Run this in Supabase Dashboard → SQL Editor BEFORE the first order is placed.
-- This replaces the N+1 stock decrement loop in app/api/orders/route.ts.

-- Atomically decrements stock for multiple products in a single round-trip.
-- Uses GREATEST(0, ...) so stock never goes negative.
CREATE OR REPLACE FUNCTION decrement_stock_batch(
  product_ids uuid[],
  quantities  integer[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  i integer;
BEGIN
  FOR i IN 1..array_length(product_ids, 1) LOOP
    UPDATE products
    SET stock = GREATEST(0, stock - quantities[i])
    WHERE id = product_ids[i];
  END LOOP;
END;
$$;
