import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import PageHeader from "@/components/PageHeader";
import { formatDate, money } from "@/lib/format";
import { getOrderByCode } from "@/lib/queries";
import { site } from "@/lib/site";
import { STATUS_LABEL, type OrderStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Mi pedido",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/** Pasos que ve el cliente (el estado "cancelado" se muestra aparte). */
const TIMELINE: OrderStatus[] = [
  "pendiente",
  "confirmado",
  "en_preparacion",
  "en_camino",
  "entregado",
];

export default async function OrderPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const order = await getOrderByCode(decodeURIComponent(code).toUpperCase());

  if (!order) notFound();

  const cancelled = order.status === "cancelado";
  const steps = order.type === "recojo"
    ? TIMELINE.filter((s) => s !== "en_camino")
    : TIMELINE;
  const currentIndex = steps.indexOf(order.status);

  return (
    <>
      <PageHeader
        kicker="Seguimiento"
        title="¡Pedido recibido!"
        subtitle={`Tu código es ${order.code}. Guardá este link para seguir tu pedido.`}
      />

      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border-4 border-pollo-navy bg-white p-7 shadow-[var(--shadow-poster)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-pollo-navy/60">
                {formatDate(order.created_at)}
              </p>
              <h2 className="font-display text-3xl text-pollo-navy">
                {order.code}
              </h2>
            </div>
            <span
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                cancelled
                  ? "bg-red-100 text-pollo-red"
                  : order.status === "entregado"
                    ? "bg-green-100 text-green-800"
                    : "bg-pollo-yellow text-pollo-navy"
              }`}
            >
              {STATUS_LABEL[order.status]}
            </span>
          </div>

          {/* Línea de tiempo */}
          {cancelled ? (
            <p className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-pollo-red">
              Este pedido fue cancelado. Si creés que es un error, escribinos
              por WhatsApp con tu código.
            </p>
          ) : (
            <ol className="mt-8 flex items-start justify-between gap-1">
              {steps.map((step, i) => {
                const done = i <= currentIndex;
                return (
                  <li key={step} className="flex flex-1 flex-col items-center text-center">
                    <div className="flex w-full items-center">
                      <span className={`h-1 flex-1 rounded-full ${i === 0 ? "bg-transparent" : done ? "bg-pollo-red" : "bg-pollo-navy/10"}`} />
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold transition ${
                          done
                            ? "bg-pollo-red text-white"
                            : "bg-pollo-navy/10 text-pollo-navy/40"
                        }`}
                      >
                        {done ? "✓" : i + 1}
                      </span>
                      <span className={`h-1 flex-1 rounded-full ${i === steps.length - 1 ? "bg-transparent" : i < currentIndex ? "bg-pollo-red" : "bg-pollo-navy/10"}`} />
                    </div>
                    <span
                      className={`mt-2 text-xs font-semibold ${
                        done ? "text-pollo-navy" : "text-pollo-navy/40"
                      }`}
                    >
                      {STATUS_LABEL[step]}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          {/* Detalle */}
          <div className="mt-8 border-t-2 border-dashed border-pollo-navy/10 pt-6">
            <h3 className="font-display text-xl text-pollo-navy">Tu pedido</h3>
            <ul className="mt-3 space-y-2">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 text-sm">
                  <span className="text-pollo-navy/80">
                    <strong className="text-pollo-navy">{item.quantity}×</strong>{" "}
                    {item.product_name}
                  </span>
                  <span className="font-semibold text-pollo-navy">
                    {money(item.line_total)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-1.5 border-t border-pollo-navy/10 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-pollo-navy/70">Subtotal</dt>
                <dd>{money(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-pollo-navy/70">
                  {order.type === "delivery" ? "Delivery" : "Recojo en tienda"}
                </dt>
                <dd>
                  {order.delivery_fee > 0 ? money(order.delivery_fee) : "—"}
                </dd>
              </div>
              <div className="flex justify-between pt-1">
                <dt className="font-display text-lg text-pollo-navy">Total</dt>
                <dd className="font-price text-2xl text-pollo-red">
                  {money(order.total)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 grid gap-2 rounded-2xl border-3 border-pollo-navy bg-pollo-cream p-5 text-sm sm:grid-cols-2">
            <Info label="Cliente" value={order.customer_name} />
            <Info label="Teléfono" value={order.customer_phone} />
            <Info label="Pago" value={order.payment_method} />
            <Info
              label="Entrega"
              value={
                order.type === "delivery"
                  ? (order.address ?? "Ubicación enviada por WhatsApp")
                  : `${site.address}, ${site.city}`
              }
            />
            {order.notes && <Info label="Nota" value={order.notes} />}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
              `Hola, consulto por mi pedido ${order.code} 🍗`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#25D366] px-7 py-3.5 font-display text-lg text-white shadow-lg transition hover:-translate-y-0.5"
          >
            Consultar por WhatsApp
          </a>
          <Link
            href="/menu"
            className="rounded-full border-2 border-pollo-navy/20 px-7 py-3.5 font-display text-lg text-pollo-navy transition hover:-translate-y-0.5 hover:border-pollo-red hover:text-pollo-red"
          >
            Volver al menú
          </Link>
        </div>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-pollo-navy/55">
        {label}
      </dt>
      <dd className="font-semibold text-pollo-navy">{value}</dd>
    </div>
  );
}
