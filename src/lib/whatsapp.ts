import { money } from "@/lib/format";
import { site } from "@/lib/site";
import type { CartLine, OrderType } from "@/lib/types";

export type WhatsAppOrder = {
  code: string;
  name: string;
  phone: string;
  type: OrderType;
  notes?: string;
  paymentMethod: string;
  items: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

/**
 * Arma el mensaje que se le envía al WhatsApp de la pollería
 * cuando un cliente confirma su pedido.
 */
export function buildOrderMessage(order: WhatsAppOrder): string {
  const lines: string[] = [
    `🍗 *NUEVO PEDIDO — ${site.name}*`,
    `Código: *${order.code}*`,
    "",
    `👤 *Cliente:* ${order.name}`,
    `📱 *Teléfono:* ${order.phone}`,
    `🛵 *Entrega:* ${order.type === "delivery" ? "Delivery" : "Recojo en tienda"}`,
  ];

  lines.push(`💵 *Pago:* ${order.paymentMethod}`, "", "*── PEDIDO ──*");

  for (const item of order.items) {
    lines.push(
      `• ${item.quantity} × ${item.name} — ${money(item.price * item.quantity)}`
    );
  }

  lines.push(
    "",
    `Subtotal: ${money(order.subtotal)}`,
    `Delivery: ${order.deliveryFee > 0 ? money(order.deliveryFee) : "Gratis"}`,
    `*TOTAL: ${money(order.total)}*`
  );

  if (order.notes) lines.push("", `📝 *Nota:* ${order.notes}`);

  // El cliente adjunta su ubicación en el mismo chat, así el motorizado
  // recibe el punto exacto en vez de una dirección escrita a mano.
  if (order.type === "delivery") {
    lines.push("", "📍 *Les envío mi ubicación acá abajo* 👇");
  }

  return lines.join("\n");
}

/** Link wa.me listo para abrir con el mensaje precargado. */
export function whatsappLink(message: string, phone = site.whatsapp): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
