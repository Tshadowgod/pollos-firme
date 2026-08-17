import { NextResponse } from "next/server";

import { checkPassword, createSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = await request.json();
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  try {
    if (!checkPassword(password)) {
      // Pequeña espera para desalentar intentos por fuerza bruta.
      await new Promise((resolve) => setTimeout(resolve, 600));
      return NextResponse.json(
        { error: "Contraseña incorrecta." },
        { status: 401 }
      );
    }

    await createSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/admin/login]", error);
    return NextResponse.json(
      { error: "Error de configuración del servidor." },
      { status: 500 }
    );
  }
}
