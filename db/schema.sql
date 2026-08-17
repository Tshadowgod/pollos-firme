-- ═══════════════════════════════════════════════════════════════════
--  POLLO FIRME · Esquema de base de datos (Neon / PostgreSQL)
-- ═══════════════════════════════════════════════════════════════════

-- ── Categorías del menú ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  emoji       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ── Platos / productos ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url    TEXT,
  badge        TEXT,                       -- "Más vendido", "Nuevo", etc.
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_category_idx  ON products (category_id);
CREATE INDEX IF NOT EXISTS products_featured_idx  ON products (is_featured) WHERE is_featured;

-- ── Promociones / banners ──────────────────────────────────────────
-- La imagen se guarda en la misma base (base64) para que subir fotos
-- funcione igual en local y en Vercel, sin contratar un servicio aparte.
CREATE TABLE IF NOT EXISTS promotions (
  id           SERIAL PRIMARY KEY,
  kicker       TEXT,
  title        TEXT NOT NULL,
  subtitle     TEXT,
  price        NUMERIC(10, 2),
  ribbon       TEXT,
  includes     TEXT[] NOT NULL DEFAULT '{}',
  image_base64 TEXT,
  image_type   TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS promotions_active_idx ON promotions (is_active, sort_order);

-- ── Pedidos ────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pendiente', 'confirmado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_type AS ENUM ('delivery', 'recojo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,          -- código corto visible: PF-A1B2C3
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  type            order_type NOT NULL DEFAULT 'delivery',
  address         TEXT,                          -- obligatorio solo si type = 'delivery'
  reference       TEXT,                          -- referencia de la dirección
  notes           TEXT,
  payment_method  TEXT NOT NULL DEFAULT 'efectivo',
  subtotal        NUMERIC(10, 2) NOT NULL,
  delivery_fee    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total           NUMERIC(10, 2) NOT NULL,
  status          order_status NOT NULL DEFAULT 'pendiente',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx  ON orders (status);

-- ── Detalle de cada pedido ─────────────────────────────────────────
-- Guardamos nombre y precio "congelados" para que el historial no cambie
-- si mañana suben los precios del menú.
CREATE TABLE IF NOT EXISTS order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  unit_price   NUMERIC(10, 2) NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  line_total   NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);
