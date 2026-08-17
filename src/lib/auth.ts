import { cookies } from "next/headers";

export const ADMIN_COOKIE = "pf_admin";
/** Duración de la sesión del panel: 12 horas. */
const MAX_AGE = 60 * 60 * 12;

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error("Falta la variable AUTH_SECRET (ver .env.example).");
  }
  return value;
}

/** Firma HMAC-SHA256 en hexadecimal, usando Web Crypto (Node y Edge). */
async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Comparación en tiempo constante para no filtrar información por timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("Falta la variable ADMIN_PASSWORD (ver .env.example).");
  }
  return safeEqual(input, expected);
}

/** Crea la cookie de sesión firmada. Formato: "<expiración>.<firma>". */
export async function createSession(): Promise<void> {
  const expiresAt = Date.now() + MAX_AGE * 1000;
  const token = `${expiresAt}.${await sign(String(expiresAt))}`;

  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}

/** true si la petición trae una cookie de admin válida y no vencida. */
export async function isAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;
  if (Number(expiresAt) < Date.now()) return false;

  return safeEqual(signature, await sign(expiresAt));
}
