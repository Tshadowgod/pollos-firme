import { getPromotionImage } from "@/lib/queries";

export const runtime = "nodejs";

/**
 * GET /api/promos/:id/image/:v
 *
 * Devuelve la foto de la promoción guardada en la base de datos.
 *
 * El `:v` es la fecha de última modificación y sólo sirve para romper la
 * caché: al cambiar la foto cambia la URL. Va en la ruta y no como
 * `?v=…` porque next/image rechaza las imágenes locales con query string
 * si no están declaradas en `images.localPatterns`.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; v: string }> }
) {
  const { id } = await params;
  const promoId = Number(id);

  if (!Number.isInteger(promoId) || promoId <= 0) {
    return new Response("Promoción inválida", { status: 400 });
  }

  try {
    const image = await getPromotionImage(promoId);
    if (!image) return new Response("Sin imagen", { status: 404 });

    return new Response(Uint8Array.from(Buffer.from(image.data, "base64")), {
      headers: {
        "Content-Type": image.type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[GET /api/promos/:id/image/:v]", error);
    return new Response("Error al leer la imagen", { status: 500 });
  }
}
