-- Coordenadas del cliente al pedir domicilio (casita exacta en el mapa).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lat double precision;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lng double precision;
