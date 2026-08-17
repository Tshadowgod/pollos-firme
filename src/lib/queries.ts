import { sql } from "@/lib/db";
import { toNumber } from "@/lib/format";
import type {
  Category,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  Promotion,
} from "@/lib/types";

/* ── Menú ─────────────────────────────────────────────────────────── */

export async function getCategories(): Promise<Category[]> {
  const rows = await sql`
    SELECT id, slug, name, description, emoji, sort_order
    FROM categories
    ORDER BY sort_order, name
  `;
  return rows as Category[];
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    ...(row as unknown as Product),
    price: toNumber(row.price),
  };
}

export async function getProducts(options?: {
  featuredOnly?: boolean;
}): Promise<Product[]> {
  const rows = options?.featuredOnly
    ? await sql`
        SELECT p.*, c.slug AS category_slug, c.name AS category_name
        FROM products p
        JOIN categories c ON c.id = p.category_id
        WHERE p.is_available AND p.is_featured
        ORDER BY p.sort_order, p.name
      `
    : await sql`
        SELECT p.*, c.slug AS category_slug, c.name AS category_name
        FROM products p
        JOIN categories c ON c.id = p.category_id
        WHERE p.is_available
        ORDER BY c.sort_order, p.sort_order, p.name
      `;
  return rows.map(mapProduct);
}

/** Precios de confianza para recalcular el total en el servidor. */
export async function getProductsByIds(
  ids: number[]
): Promise<Map<number, { name: string; price: number }>> {
  if (ids.length === 0) return new Map();

  const rows = await sql`
    SELECT id, name, price
    FROM products
    WHERE id = ANY(${ids}::int[]) AND is_available
  `;

  return new Map(
    rows.map((r) => [
      Number(r.id),
      { name: String(r.name), price: toNumber(r.price) },
    ])
  );
}

/* ── Promociones ──────────────────────────────────────────────────── */

function mapPromotion(row: Record<string, unknown>): Promotion {
  const id = Number(row.id);
  const hasImage = Boolean(row.has_image);
  // La versión va en la ruta (no como ?v=…) para invalidar la caché cuando
  // cambia la foto: next/image no acepta query strings en imágenes locales.
  const version = row.updated_at
    ? new Date(row.updated_at as string).getTime()
    : 0;

  return {
    id,
    kicker: (row.kicker as string | null) ?? null,
    title: String(row.title),
    subtitle: (row.subtitle as string | null) ?? null,
    price: row.price === null ? null : toNumber(row.price),
    ribbon: (row.ribbon as string | null) ?? null,
    includes: (row.includes as string[] | null) ?? [],
    image_url: hasImage ? `/api/promos/${id}/image/${version}` : null,
    is_active: Boolean(row.is_active),
    sort_order: Number(row.sort_order),
  };
}

/** Columnas de promoción sin la imagen (que puede pesar cientos de KB). */
const PROMO_FIELDS = `id, kicker, title, subtitle, price, ribbon, includes,
  is_active, sort_order, updated_at, (image_base64 IS NOT NULL) AS has_image`;

export async function getPromotions(options?: {
  activeOnly?: boolean;
}): Promise<Promotion[]> {
  const rows = options?.activeOnly
    ? await sql.query(
        `SELECT ${PROMO_FIELDS} FROM promotions
         WHERE is_active ORDER BY sort_order, id`
      )
    : await sql.query(
        `SELECT ${PROMO_FIELDS} FROM promotions ORDER BY sort_order, id`
      );

  return (rows as Record<string, unknown>[]).map(mapPromotion);
}

export async function getPromotionImage(
  id: number
): Promise<{ data: string; type: string } | null> {
  const [row] = await sql`
    SELECT image_base64, image_type FROM promotions WHERE id = ${id}
  `;
  if (!row?.image_base64) return null;
  return {
    data: String(row.image_base64),
    type: String(row.image_type ?? "image/jpeg"),
  };
}

export type PromotionInput = {
  id?: number;
  kicker: string | null;
  title: string;
  subtitle: string | null;
  price: number | null;
  ribbon: string | null;
  includes: string[];
  isActive: boolean;
  sortOrder: number;
  /** Solo viene cuando el admin sube una foto nueva. */
  image?: { data: string; type: string };
};

export async function savePromotion(input: PromotionInput): Promise<number> {
  if (input.id) {
    const [row] = input.image
      ? await sql`
          UPDATE promotions SET
            kicker = ${input.kicker}, title = ${input.title},
            subtitle = ${input.subtitle}, price = ${input.price},
            ribbon = ${input.ribbon}, includes = ${input.includes},
            is_active = ${input.isActive}, sort_order = ${input.sortOrder},
            image_base64 = ${input.image.data}, image_type = ${input.image.type},
            updated_at = NOW()
          WHERE id = ${input.id}
          RETURNING id
        `
      : await sql`
          UPDATE promotions SET
            kicker = ${input.kicker}, title = ${input.title},
            subtitle = ${input.subtitle}, price = ${input.price},
            ribbon = ${input.ribbon}, includes = ${input.includes},
            is_active = ${input.isActive}, sort_order = ${input.sortOrder},
            updated_at = NOW()
          WHERE id = ${input.id}
          RETURNING id
        `;
    if (!row) throw new Error("La promoción no existe.");
    return Number(row.id);
  }

  const [row] = await sql`
    INSERT INTO promotions (
      kicker, title, subtitle, price, ribbon, includes,
      is_active, sort_order, image_base64, image_type
    ) VALUES (
      ${input.kicker}, ${input.title}, ${input.subtitle}, ${input.price},
      ${input.ribbon}, ${input.includes}, ${input.isActive}, ${input.sortOrder},
      ${input.image?.data ?? null}, ${input.image?.type ?? null}
    )
    RETURNING id
  `;
  return Number(row.id);
}

export async function deletePromotion(id: number): Promise<void> {
  await sql`DELETE FROM promotions WHERE id = ${id}`;
}

/* ── Pedidos ──────────────────────────────────────────────────────── */

function mapOrder(row: Record<string, unknown>): Omit<Order, "items"> {
  return {
    ...(row as unknown as Order),
    subtotal: toNumber(row.subtotal),
    delivery_fee: toNumber(row.delivery_fee),
    total: toNumber(row.total),
    created_at: new Date(row.created_at as string).toISOString(),
  };
}

export async function getOrders(limit = 100): Promise<Order[]> {
  const orders = await sql`
    SELECT * FROM orders
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  if (orders.length === 0) return [];

  const ids = orders.map((o) => Number(o.id));
  const items = await sql`
    SELECT * FROM order_items
    WHERE order_id = ANY(${ids}::int[])
    ORDER BY id
  `;

  const byOrder = new Map<number, OrderItem[]>();
  for (const item of items) {
    const list = byOrder.get(Number(item.order_id)) ?? [];
    list.push({
      id: Number(item.id),
      product_id: item.product_id === null ? null : Number(item.product_id),
      product_name: String(item.product_name),
      unit_price: toNumber(item.unit_price),
      quantity: Number(item.quantity),
      line_total: toNumber(item.line_total),
    });
    byOrder.set(Number(item.order_id), list);
  }

  return orders.map((o) => ({
    ...mapOrder(o),
    items: byOrder.get(Number(o.id)) ?? [],
  }));
}

export async function getOrderByCode(code: string): Promise<Order | null> {
  const [order] = await sql`SELECT * FROM orders WHERE code = ${code}`;
  if (!order) return null;

  const items = await sql`
    SELECT * FROM order_items WHERE order_id = ${order.id} ORDER BY id
  `;

  return {
    ...mapOrder(order),
    items: items.map((item) => ({
      id: Number(item.id),
      product_id: item.product_id === null ? null : Number(item.product_id),
      product_name: String(item.product_name),
      unit_price: toNumber(item.unit_price),
      quantity: Number(item.quantity),
      line_total: toNumber(item.line_total),
    })),
  };
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus
): Promise<void> {
  await sql`
    UPDATE orders SET status = ${status}::order_status, updated_at = NOW()
    WHERE id = ${id}
  `;
}

/** Resumen para las tarjetas del panel de administración. */
export async function getOrderStats(): Promise<{
  today: number;
  todayRevenue: number;
  pending: number;
  total: number;
}> {
  const [row] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)          AS today,
      COALESCE(SUM(total) FILTER (
        WHERE created_at::date = CURRENT_DATE AND status <> 'cancelado'
      ), 0)                                                            AS today_revenue,
      COUNT(*) FILTER (WHERE status = 'pendiente')                     AS pending,
      COUNT(*)                                                         AS total
    FROM orders
  `;

  return {
    today: Number(row.today),
    todayRevenue: toNumber(row.today_revenue),
    pending: Number(row.pending),
    total: Number(row.total),
  };
}
