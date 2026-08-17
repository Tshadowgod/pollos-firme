"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/components/CartProvider";
import { money } from "@/lib/format";
import { site } from "@/lib/site";
import type { OrderType } from "@/lib/types";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";

const PAYMENT_METHODS = ["Efectivo", "QR"] as const;

export default function CartClient() {
  const router = useRouter();
  const { lines, subtotal, count, ready, setQuantity, remove, clear } = useCart();

  const [type, setType] = useState<OrderType>("delivery");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    notes: "",
    paymentMethod: PAYMENT_METHODS[0] as string,
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryFee = type === "delivery" && lines.length > 0 ? site.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (lines.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          type,
          notes: form.notes,
          paymentMethod: form.paymentMethod,
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No pudimos registrar tu pedido.");
        return;
      }

      // El pedido ya quedó guardado en la base de datos; ahora lo mandamos
      // al WhatsApp de la pollería con los totales que calculó el servidor.
      const message = buildOrderMessage({
        code: data.code,
        name: form.name,
        phone: form.phone,
        type,
        notes: form.notes,
        paymentMethod: form.paymentMethod,
        items: lines,
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        total: data.total,
      });

      window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
      clear();
      router.push(`/pedido/${data.code}`);
    } catch {
      setError("Hubo un problema de conexión. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  }

  if (!ready) {
    return <div className="py-24 text-center text-pollo-navy/60">Cargando carrito…</div>;
  }

  if (count === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-7xl">🛒</p>
        <h2 className="mt-5 font-display text-3xl text-pollo-navy">
          Tu carrito está vacío
        </h2>
        <p className="mt-2 text-pollo-navy/70">
          Andá al menú y elegí tu pollo favorito.
        </p>
        <Link
          href="/menu"
          className="mt-7 inline-block rounded-full bg-pollo-red px-8 py-3.5 font-display text-lg text-white shadow-[var(--shadow-pop)] transition hover:-translate-y-1"
        >
          Ver el menú 🍗
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      {/* ── Lista de productos ── */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-pollo-navy">
            Tu pedido ({count} {count === 1 ? "ítem" : "ítems"})
          </h2>
          <button
            type="button"
            onClick={clear}
            className="text-sm font-semibold text-pollo-navy/60 transition hover:text-pollo-red"
          >
            Vaciar carrito
          </button>
        </div>

        <ul className="mt-5 space-y-3">
          {lines.map((line) => (
            <li
              key={line.productId}
              className="flex items-center gap-4 rounded-2xl border-3 border-pollo-navy bg-white p-4 shadow-[var(--shadow-card)]"
            >
              <span className="relative grid size-18 shrink-0 place-items-center overflow-hidden rounded-xl bg-pollo-yellow/25 text-3xl">
                {line.imageUrl ? (
                  <Image
                    src={line.imageUrl}
                    alt={line.name}
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                ) : (
                  "🍗"
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg text-pollo-navy">
                  {line.name}
                </p>
                <p className="text-sm text-pollo-navy/70">
                  {money(line.price)} c/u
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-pollo-cream p-1">
                <QtyButton
                  label="Quitar uno"
                  onClick={() => setQuantity(line.productId, line.quantity - 1)}
                >
                  −
                </QtyButton>
                <span className="w-8 text-center font-bold text-pollo-navy">
                  {line.quantity}
                </span>
                <QtyButton
                  label="Agregar uno"
                  onClick={() => setQuantity(line.productId, line.quantity + 1)}
                >
                  +
                </QtyButton>
              </div>

              <div className="w-24 text-right">
                <p className="font-price text-lg text-pollo-red">
                  {money(line.price * line.quantity)}
                </p>
                <button
                  type="button"
                  onClick={() => remove(line.productId)}
                  className="text-xs text-pollo-charcoal/40 transition hover:text-pollo-red"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href="/menu"
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-pollo-navy transition hover:gap-3 hover:text-pollo-red"
        >
          <span aria-hidden>←</span> Seguir agregando platos
        </Link>
      </div>

      {/* ── Formulario y resumen ── */}
      <form
        onSubmit={handleSubmit}
        className="h-fit rounded-3xl border-4 border-pollo-navy bg-white p-6 shadow-[var(--shadow-poster)] lg:sticky lg:top-24"
      >
        <h2 className="font-display text-2xl text-pollo-navy">Tus datos</h2>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-pollo-cream p-1">
          {(
            [
              ["delivery", "🛵 Delivery"],
              ["recojo", "🏪 Recojo"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`rounded-full py-2.5 text-sm font-bold transition ${
                type === value
                  ? "bg-pollo-red text-white shadow"
                  : "text-pollo-navy/60 hover:text-pollo-navy"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <Field
            label="Nombre completo"
            value={form.name}
            onChange={(v) => update("name", v)}
            placeholder="Juan Pérez"
            required
          />
          <Field
            label="Teléfono / WhatsApp"
            type="tel"
            value={form.phone}
            onChange={(v) => update("phone", v)}
            placeholder="70000000"
            required
          />

          <label className="block">
            <span className="text-sm font-bold text-pollo-navy">
              Forma de pago
            </span>
            <select
              value={form.paymentMethod}
              onChange={(e) => update("paymentMethod", e.target.value)}
              className="mt-1 w-full rounded-xl border-3 border-pollo-navy bg-white px-4 py-2.5 outline-none transition focus:border-pollo-red"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-pollo-navy">
              Nota para la cocina (opcional)
            </span>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
              placeholder="Sin ají, extra papas…"
              className="mt-1 w-full resize-none rounded-xl border-3 border-pollo-navy px-4 py-2.5 outline-none transition focus:border-pollo-red"
            />
          </label>
        </div>

        <dl className="mt-6 space-y-2 border-t-2 border-dashed border-pollo-navy/10 pt-4 text-sm">
          <Row label="Subtotal" value={money(subtotal)} />
          <Row
            label="Delivery"
            value={
              type === "recojo"
                ? "Recojo en tienda"
                : deliveryFee === 0
                  ? "Gratis"
                  : money(deliveryFee)
            }
          />
          <div className="flex items-center justify-between pt-2">
            <dt className="font-display text-xl text-pollo-navy">Total</dt>
            <dd className="font-price text-3xl text-pollo-red">
              {money(total)}
            </dd>
          </div>
        </dl>

        {/* La dirección no se escribe: el cliente manda su ubicación real
            por WhatsApp, que para el motorizado es mucho más preciso. */}
        {type === "delivery" && (
          <div className="mt-5 rounded-2xl border-3 border-pollo-navy bg-pollo-amber/35 px-5 py-4">
            <p className="font-display text-lg text-pollo-navy">
              📍 Enviá tu ubicación por WhatsApp
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-pollo-charcoal">
              Al confirmar se abre el chat con tu pedido escrito. Tocá el
              clip 📎 → <strong>Ubicación</strong> y mandanos dónde estás: así
              llegamos sin vueltas.
            </p>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-pollo-red">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="mt-5 w-full rounded-full bg-[#25D366] px-6 py-4 font-display text-lg text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending
            ? "Enviando pedido…"
            : type === "delivery"
              ? "Enviar pedido y ubicación"
              : "Confirmar y enviar por WhatsApp"}
        </button>

        <p className="mt-3 text-center text-xs leading-relaxed text-pollo-navy/60">
          Guardamos tu pedido y abrimos WhatsApp con el resumen listo para que
          lo envíes a {site.name}.
        </p>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-pollo-charcoal/70">{label}</dt>
      <dd className="font-semibold text-pollo-navy">{value}</dd>
    </div>
  );
}

function QtyButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-8 place-items-center rounded-full bg-white font-bold text-pollo-navy shadow-sm transition hover:bg-pollo-red hover:text-white"
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-pollo-navy">
        {label}
        {required && <span className="text-pollo-red"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border-3 border-pollo-navy px-4 py-2.5 outline-none transition focus:border-pollo-red"
      />
    </label>
  );
}
