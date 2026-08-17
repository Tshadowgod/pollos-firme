import { NextResponse } from "next/server";

import { getProducts } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/products            → todos los platos disponibles
 * GET /api/products?featured=1 → solo los destacados
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featuredOnly = searchParams.get("featured") === "1";

  try {
    const products = await getProducts({ featuredOnly });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { error: "No pudimos cargar el menú." },
      { status: 500 }
    );
  }
}
