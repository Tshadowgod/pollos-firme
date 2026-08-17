import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/queries";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH /api/admin/orders/:id → cambia el estado del pedido */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  let status: string;
  try {
    ({ status } = await request.json());
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  try {
    await updateOrderStatus(orderId, status as OrderStatus);
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    console.error("[PATCH /api/admin/orders]", error);
    return NextResponse.json(
      { error: "No pudimos actualizar el pedido." },
      { status: 500 }
    );
  }
}
