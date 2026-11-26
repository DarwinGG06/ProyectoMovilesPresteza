-- Soft-delete para la papelera (admin y cliente).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS orders_deleted_at_idx ON public.orders (deleted_at);
CREATE INDEX IF NOT EXISTS reservations_deleted_at_idx ON public.reservations (deleted_at);
CREATE INDEX IF NOT EXISTS comments_deleted_at_idx ON public.comments (deleted_at);
