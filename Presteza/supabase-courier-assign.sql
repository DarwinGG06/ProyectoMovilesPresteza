-- Repartidor asignado por el admin (no automático).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_id text;

CREATE INDEX IF NOT EXISTS orders_courier_id_status_idx
  ON public.orders (courier_id, status)
  WHERE courier_id IS NOT NULL;
