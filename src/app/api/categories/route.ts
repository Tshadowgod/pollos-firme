import { NextResponse } from "next/server";

import { getCategories } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/categories → categorías del menú ordenadas */
export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return NextResponse.json(
      { error: "No pudimos cargar las categorías." },
      { status: 500 }
    );
  }
}
