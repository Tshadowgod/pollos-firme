/**
 * Carga el menú de Pollo Firme.
 *
 *   npm run db:seed
 *
 * ⚠️ Borra el menú existente y lo vuelve a cargar (no toca los pedidos).
 *
 * 💰 LOS PRECIOS SON PROVISIONALES: están puestos para poder probar el
 *    sitio. Cambiá los números de abajo por los reales y volvé a correr
 *    este script, o editalos desde el SQL Editor de Neon.
 */
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("\n❌ Falta DATABASE_URL (ver .env.example).\n");
  process.exit(1);
}

const sql = neon(connectionString);

/* ── Categorías ──────────────────────────────────────────────────── */

const categories = [
  { slug: "broaster", name: "Pollo Broaster", emoji: "🍗", description: "Crocante, jugoso y recién frito", sort_order: 1 },
  { slug: "brasa", name: "Pollo a la Brasa", emoji: "🔥", description: "Dorado al carbón, a la leña de siempre", sort_order: 2 },
  { slug: "platos", name: "Platos", emoji: "🍽️", description: "Para variar del pollo", sort_order: 3 },
  { slug: "combos", name: "Combos", emoji: "🍱", description: "Para compartir en familia", sort_order: 4 },
  { slug: "bebidas", name: "Bebidas", emoji: "🥤", description: "Bien frías", sort_order: 5 },
];

/* ── Platos ──────────────────────────────────────────────────────── */

const products = [
  // ── Combo del afiche ──
  {
    category: "combos",
    slug: "combo-firme",
    name: "Combo Firme",
    description:
      "Pollo entero + 2 porciones de arroz + 2 porciones de fideo + 1 porción de papas fritas + Coca Cola de 2 litros.",
    price: 110,
    badge: "Combo del día",
    featured: true,
    order: 1,
  },

  // ── Pollo broaster: económico, cuarto y medio ──
  {
    category: "broaster",
    slug: "broaster-economico",
    name: "Broaster Económico",
    description: "Presa de pollo broaster con papas fritas.",
    price: 18,
    featured: false,
    order: 10,
  },
  {
    category: "broaster",
    slug: "broaster-cuarto",
    name: "1/4 de Pollo Broaster",
    description: "Cuarto de pollo broaster con papas fritas y ensalada.",
    price: 28,
    badge: "Más vendido",
    featured: true,
    order: 11,
  },
  {
    category: "broaster",
    slug: "broaster-medio",
    name: "1/2 Pollo Broaster",
    description:
      "Medio pollo broaster con papas fritas, ensalada y las salsas de la casa.",
    price: 52,
    featured: true,
    order: 12,
  },

  // ── Pollo a la brasa: económico, cuarto y medio ──
  {
    category: "brasa",
    slug: "brasa-economico",
    name: "Brasa Económico",
    description: "Presa de pollo a la brasa con papas fritas.",
    price: 20,
    featured: false,
    order: 20,
  },
  {
    category: "brasa",
    slug: "brasa-cuarto",
    name: "1/4 de Pollo a la Brasa",
    description:
      "Cuarto de pollo al carbón con papas doradas, ensalada y ají de la casa.",
    price: 30,
    badge: "Favorito",
    featured: true,
    order: 21,
  },
  {
    category: "brasa",
    slug: "brasa-medio",
    name: "1/2 Pollo a la Brasa",
    description: "Medio pollo marinado y cocinado lento sobre la brasa.",
    price: 56,
    featured: false,
    order: 22,
  },

  // ── Otros platos ──
  {
    category: "platos",
    slug: "hamburguesa",
    name: "Hamburguesa",
    description: "Hamburguesa de la casa con papas fritas.",
    price: 22,
    featured: false,
    order: 30,
  },
  {
    category: "platos",
    slug: "milanesa-napolitana",
    name: "Milanesa Napolitana",
    description:
      "Milanesa con salsa, jamón y queso gratinado, con su guarnición.",
    price: 40,
    featured: true,
    order: 31,
  },
  {
    category: "platos",
    slug: "salchipapas",
    name: "Salchipapas",
    description: "Papas fritas con salchicha y salsas.",
    price: 20,
    featured: true,
    order: 32,
  },

  // ── Bebidas ──
  // (Agregadas para poder completar un pedido; borralas si no vendés.)
  {
    category: "bebidas",
    slug: "gaseosa-personal",
    name: "Gaseosa Personal",
    description: "500 ml bien fría. Consultá sabores disponibles.",
    price: 10,
    featured: false,
    order: 40,
  },
  {
    category: "bebidas",
    slug: "gaseosa-2l",
    name: "Gaseosa 2 Litros",
    description: "Ideal para acompañar el combo familiar.",
    price: 22,
    featured: false,
    order: 41,
  },
];

/* ── Carga ───────────────────────────────────────────────────────── */

console.log("🌱 Cargando el menú…");

// order_items guarda nombre y precio propios, así que borrar el menú
// no rompe el historial de pedidos.
await sql`DELETE FROM products`;
await sql`DELETE FROM categories`;
await sql`ALTER SEQUENCE categories_id_seq RESTART WITH 1`;
await sql`ALTER SEQUENCE products_id_seq RESTART WITH 1`;

const categoryIds = new Map<string, number>();

for (const c of categories) {
  const [row] = await sql`
    INSERT INTO categories (slug, name, description, emoji, sort_order)
    VALUES (${c.slug}, ${c.name}, ${c.description}, ${c.emoji}, ${c.sort_order})
    RETURNING id
  `;
  categoryIds.set(c.slug, Number(row.id));
}

console.log(`   ✓ ${categories.length} categorías`);

for (const p of products) {
  const categoryId = categoryIds.get(p.category);
  if (!categoryId) throw new Error(`Categoría desconocida: ${p.category}`);

  await sql`
    INSERT INTO products (
      category_id, slug, name, description, price, badge, is_featured, sort_order
    ) VALUES (
      ${categoryId}, ${p.slug}, ${p.name}, ${p.description}, ${p.price},
      ${"badge" in p ? p.badge : null}, ${p.featured}, ${p.order}
    )
  `;
}

console.log(`   ✓ ${products.length} platos`);
console.log("\n⚠️  Recordá: los precios son provisionales.");
console.log("✅ Menú cargado. Levantá el sitio con: npm run dev\n");
