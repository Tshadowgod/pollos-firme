import { NextResponse } from "next/server";

import { sql } from "@/lib/db";
import { getProductsByIds } from "@/lib/queries";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingItem = { productId: unknown; quantity: unknown };

type Body = {
  customerName?: unknown;
  customerPhone?: unknown;
  type?: unknown;
  address?: unknown;
  reference?: unknown;
  notes?: unknown;
  paymentMethod?: unknown;
  items?: unknown;
};

/** Código corto y legible para que el cliente siga su pedido: PF-7K3QX2 */
function generateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `PF-${code}`;
}

function clean(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const customerName = clean(body.customerName, 120);
  const customerPhone = clean(body.customerPhone, 30);
  const type = body.type === "recojo" ? "recojo" : "delivery";
  const address = clean(body.address, 250);
  const reference = clean(body.reference, 250);
  const notes = clean(body.notes, 500);
  const paymentMethod = clean(body.paymentMethod, 50) || "Efectivo";

  if (customerName.length < 2) {
    return NextResponse.json(
      { error: "Necesitamos tu nombre para el pedido." },
      { status: 400 }
    );
  }

  // Al menos 7 dígitos: sirve para números locales y con código de país.
  if (customerPhone.replace(/\D/g, "").length < 7) {
    return NextResponse.json(
      { error: "Ingresá un número de teléfono válido." },
      { status: 400 }
    );
  }

  if (type === "delivery" && address.length < 5) {
    return NextResponse.json(
      { error: "Para delivery necesitamos la dirección de entrega." },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Tu carrito está vacío." }, { status: 400 });
  }

  // Normalizamos y unificamos cantidades repetidas del mismo producto.
  const requested = new Map<number, number>();
  for (const raw of body.items as IncomingItem[]) {
    const id = Number(raw?.productId);
    const qty = Math.floor(Number(raw?.quantity));
    if (!Number.isInteger(id) || id <= 0) continue;
    if (!Number.isInteger(qty) || qty <= 0 || qty > 99) continue;
    requested.set(id, Math.min((requested.get(id) ?? 0) + qty, 99));
  }

  if (requested.size === 0) {
    return NextResponse.json(
      { error: "Los productos del pedido no son válidos." },
      { status: 400 }
    );
  }

  try {
    // Nunca confiamos en los precios que manda el navegador: los volvemos
    // a leer de la base de datos y recalculamos el total acá.
    const catalog = await getProductsByIds([...requested.keys()]);

    const items = [...requested.entries()]
      .filter(([id]) => catalog.has(id))
      .map(([id, quantity]) => {
        const product = catalog.get(id)!;
        return {
          productId: id,
          name: product.name,
          unitPrice: product.price,
          quantity,
          lineTotal: Number((product.price * quantity).toFixed(2)),
        };
      });

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Los platos de tu carrito ya no están disponibles." },
        { status: 409 }
      );
    }

    const subtotal = Number(
      items.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2)
    );
    const deliveryFee = type === "delivery" ? site.deliveryFee : 0;
    const total = Number((subtotal + deliveryFee).toFixed(2));

    const code = generateCode();

    const [order] = await sql`
      INSERT INTO orders (
        code, customer_name, customer_phone, type, address, reference,
        notes, payment_method, subtotal, delivery_fee, total
      ) VALUES (
        ${code}, ${customerName}, ${customerPhone}, ${type}::order_type,
        ${type === "delivery" ? address : null},
        ${type === "delivery" && reference ? reference : null},
        ${notes || null}, ${paymentMethod}, ${subtotal}, ${deliveryFee}, ${total}
      )
      RETURNING id, code
    `;

    const orderId = Number(order.id);

    // Un solo INSERT con UNNEST: menos viajes de red que un insert por ítem.
    await sql`
      INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
      SELECT ${orderId}, * FROM UNNEST(
        ${items.map((i) => i.productId)}::int[],
        ${items.map((i) => i.name)}::text[],
        ${items.map((i) => i.unitPrice)}::numeric[],
        ${items.map((i) => i.quantity)}::int[],
        ${items.map((i) => i.lineTotal)}::numeric[]
      )
    `;

    return NextResponse.json(
      { ok: true, code: order.code, subtotal, deliveryFee, total },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json(
      { error: "No pudimos registrar tu pedido. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
