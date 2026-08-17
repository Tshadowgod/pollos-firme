import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth";
import { savePromotion, type PromotionInput } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tope de la foto ya redimensionada en el navegador: ~3 MB en base64. */
const MAX_IMAGE_BASE64 = 3 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** POST /api/admin/promotions → crea o actualiza una promoción */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const title = clean(body.title, 80);
  if (title.length < 2) {
    return NextResponse.json(
      { error: "La promoción necesita un título." },
      { status: 400 }
    );
  }

  const rawPrice = Number(body.price);
  const price =
    body.price === null || body.price === "" || !Number.isFinite(rawPrice)
      ? null
      : Math.max(0, Math.round(rawPrice * 100) / 100);

  const includes = Array.isArray(body.includes)
    ? body.includes
        .map((line) => clean(line, 120))
        .filter(Boolean)
        .slice(0, 12)
    : [];

  // La imagen llega como data URL desde el navegador, ya redimensionada.
  let image: PromotionInput["image"];
  if (typeof body.imageDataUrl === "string" && body.imageDataUrl !== "") {
    const match = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(body.imageDataUrl);
    if (!match) {
      return NextResponse.json(
        { error: "El formato de la imagen no es válido." },
        { status: 400 }
      );
    }

    const [, type, data] = match;
    if (!ALLOWED_TYPES.includes(type.toLowerCase())) {
      return NextResponse.json(
        { error: "Solo aceptamos imágenes JPG, PNG o WebP." },
        { status: 400 }
      );
    }
    if (data.length > MAX_IMAGE_BASE64) {
      return NextResponse.json(
        { error: "La imagen es demasiado pesada. Probá con una más chica." },
        { status: 413 }
      );
    }

    image = { data, type: type.toLowerCase() };
  }

  const id = Number(body.id);

  try {
    const savedId = await savePromotion({
      id: Number.isInteger(id) && id > 0 ? id : undefined,
      kicker: clean(body.kicker, 60) || null,
      title,
      subtitle: clean(body.subtitle, 160) || null,
      price,
      ribbon: clean(body.ribbon, 60) || null,
      includes,
      isActive: body.isActive !== false,
      sortOrder: Number.isFinite(Number(body.sortOrder))
        ? Number(body.sortOrder)
        : 0,
      image,
    });

    return NextResponse.json({ ok: true, id: savedId });
  } catch (error) {
    console.error("[POST /api/admin/promotions]", error);
    return NextResponse.json(
      { error: "No pudimos guardar la promoción." },
      { status: 500 }
    );
  }
}
