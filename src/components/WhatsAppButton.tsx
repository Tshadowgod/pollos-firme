"use client";

import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

/** Botón flotante para escribirle directo a la pollería. */
export default function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const message = encodeURIComponent(
    `¡Hola ${site.name}! Quisiera hacer una consulta 🍗`
  );

  return (
    <a
      href={`https://wa.me/${site.whatsapp}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-110 hover:shadow-2xl"
    >
      <svg viewBox="0 0 24 24" className="size-7" fill="currentColor">
        <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.6.1l-.9 1c-.2.2-.3.2-.6.1-1.6-.7-2.7-1.8-3.4-3.2-.2-.4 0-.5.2-.7l.5-.6c.1-.2.2-.3.3-.5v-.5c0-.2-.6-1.6-.9-2.2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.8.4-.9.9-1.2 1.9-1 3 .3 1.6 1.2 3 2.5 4.3 1.6 1.7 3.4 2.6 5.5 2.9 1.1.1 2-.2 2.7-1 .3-.4.4-.8.4-1.2.1-.3 0-.4-.3-.6zM12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3a8.2 8.2 0 1 1 7.2 3.9z" />
      </svg>
    </a>
  );
}
