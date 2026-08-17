"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { formatDate, money } from "@/lib/format";
import {
  ORDER_STATUSES,
  STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/lib/types";

const STATUS_STYLE: Record<OrderStatus, string> = {
  pendiente: "bg-amber-100 text-amber-900 ring-amber-300",
  confirmado: "bg-blue-100 text-blue-900 ring-blue-300",
  en_preparacion: "bg-orange-100 text-orange-900 ring-orange-300",
  en_camino: "bg-violet-100 text-violet-900 ring-violet-300",
  entregado: "bg-green-100 text-green-900 ring-green-300",
  cancelado: "bg-red-100 text-red-900 ring-red-300",
};

type Stats = {
  today: number;
  todayRevenue: number;
  pending: number;
  total: number;
};

export default function AdminDashboard({
  orders,
  stats,
}: {
  orders: Order[];
  stats: Stats;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<OrderStatus | "todos">("todos");
  const [updating, setUpdating] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const visible = useMemo(
    () => (filter === "todos" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );

  async function changeStatus(orderId: number, status: OrderStatus) {
    setUpdating(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) startTransition(() => router.refresh());
    } finally {
      setUpdating(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-pollo-cream">
      <header className="bg-pollo-navy">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <h1 className="font-display text-2xl text-white">
              Pollo <span className="text-pollo-yellow">Firme</span> · Pedidos
            </h1>
            <p className="text-sm text-white/60">
              Panel de administración
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => startTransition(() => router.refresh())}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              {pending ? "Actualizando…" : "↻ Actualizar"}
            </button>
            <Link
              href="/admin/promociones"
              className="rounded-full bg-pollo-amber px-4 py-2 text-sm font-bold text-pollo-navy transition hover:bg-white"
            >
              🖼️ Promociones
            </Link>
            <Link
              href="/"
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Ver sitio
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-pollo-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-pollo-red-dark"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Resumen */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pedidos de hoy" value={String(stats.today)} emoji="📦" />
          <StatCard
            label="Ventas de hoy"
            value={money(stats.todayRevenue)}
            emoji="💰"
            highlight
          />
          <StatCard label="Pendientes" value={String(stats.pending)} emoji="⏳" />
          <StatCard label="Pedidos totales" value={String(stats.total)} emoji="📊" />
        </div>

        {/* Filtros */}
        <div className="scrollbar-none mt-8 flex gap-2 overflow-x-auto pb-1">
          <Chip
            label={`Todos (${orders.length})`}
            active={filter === "todos"}
            onClick={() => setFilter("todos")}
          />
          {ORDER_STATUSES.map((status) => {
            const n = orders.filter((o) => o.status === status).length;
            return (
              <Chip
                key={status}
                label={`${STATUS_LABEL[status]} (${n})`}
                active={filter === status}
                onClick={() => setFilter(status)}
              />
            );
          })}
        </div>

        {/* Lista de pedidos */}
        {visible.length === 0 ? (
          <p className="mt-16 text-center text-pollo-charcoal/50">
            No hay pedidos en esta vista.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {visible.map((order) => (
              <li
                key={order.id}
                className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-xl text-pollo-navy">
                        {order.code}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${STATUS_STYLE[order.status]}`}
                      >
                        {STATUS_LABEL[order.status]}
                      </span>
                      <span className="rounded-full bg-pollo-cream px-2.5 py-1 text-xs font-bold text-pollo-navy">
                        {order.type === "delivery" ? "🛵 Delivery" : "🏪 Recojo"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-pollo-charcoal/60">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span className="font-price text-2xl text-pollo-red">
                    {money(order.total)}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-pollo-charcoal/40">
                      Cliente
                    </p>
                    <p className="font-semibold text-pollo-navy">
                      {order.customer_name}
                    </p>
                    <a
                      href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-pollo-charcoal/70 underline-offset-2 hover:text-pollo-red hover:underline"
                    >
                      {order.customer_phone}
                    </a>
                    {order.type === "delivery" && (
                      <p className="mt-1 text-sm text-pollo-charcoal/70">
                        📍{" "}
                        {order.address ?? "Ubicación enviada por WhatsApp"}
                        {order.reference && ` · ${order.reference}`}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-pollo-charcoal/70">
                      💵 {order.payment_method}
                    </p>
                    {order.notes && (
                      <p className="mt-1 rounded-lg bg-pollo-yellow/25 px-2.5 py-1.5 text-sm text-pollo-navy">
                        📝 {order.notes}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-pollo-charcoal/40">
                      Detalle
                    </p>
                    <ul className="mt-1 space-y-0.5 text-sm">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between gap-3">
                          <span className="text-pollo-charcoal/80">
                            {item.quantity}× {item.product_name}
                          </span>
                          <span className="shrink-0 font-semibold text-pollo-navy">
                            {money(item.line_total)}
                          </span>
                        </li>
                      ))}
                      {order.delivery_fee > 0 && (
                        <li className="flex justify-between gap-3 text-pollo-charcoal/60">
                          <span>Delivery</span>
                          <span>{money(order.delivery_fee)}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-pollo-navy/10 pt-4">
                  <span className="text-xs font-bold uppercase tracking-wide text-pollo-charcoal/40">
                    Cambiar estado:
                  </span>
                  {ORDER_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={updating === order.id || status === order.status}
                      onClick={() => changeStatus(order.id, status)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed ${
                        status === order.status
                          ? "bg-pollo-navy text-white"
                          : "bg-pollo-cream text-pollo-navy hover:bg-pollo-yellow disabled:opacity-40"
                      }`}
                    >
                      {STATUS_LABEL[status]}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  emoji,
  highlight,
}: {
  label: string;
  value: string;
  emoji: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-[var(--shadow-card)] ${
        highlight ? "bg-pollo-red text-white" : "bg-white"
      }`}
    >
      <p
        className={`text-sm ${highlight ? "text-white/80" : "text-pollo-charcoal/55"}`}
      >
        {emoji} {label}
      </p>
      <p
        className={`mt-1 font-display text-3xl ${
          highlight ? "text-white" : "text-pollo-navy"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
        active
          ? "bg-pollo-navy text-white"
          : "bg-white text-pollo-navy hover:bg-pollo-yellow"
      }`}
    >
      {label}
    </button>
  );
}
