import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth";
import { deletePromotion } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** DELETE /api/admin/promotions/:id → borra la promoción y su foto */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const promoId = Number(id);
  if (!Number.isInteger(promoId) || promoId <= 0) {
    return NextResponse.json({ error: "Promoción inválida." }, { status: 400 });
  }

  try {
    await deletePromotion(promoId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/promotions]", error);
    return NextResponse.json(
      { error: "No pudimos borrar la promoción." },
      { status: 500 }
    );
  }
}
