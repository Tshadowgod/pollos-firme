"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { site } from "@/lib/site";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-auto border-t-6 border-pollo-navy bg-poster-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="relative block h-16 w-14 shrink-0">
              <Image
                src="/mascota-firme.png"
                alt={site.name}
                fill
                sizes="56px"
                className="object-contain"
              />
            </span>
            <span className="font-display text-4xl text-pollo-amber">
              Pollo <span className="text-white">Firme</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-pollo-amber italic">
            {site.tagline}
          </p>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Especialistas en pollo broaster y pollo a la brasa. Crocante por
            fuera, jugoso por dentro, siempre recién hecho.
          </p>

          <div className="mt-5 flex gap-3">
            <Social href={site.social.facebook} label="Facebook">
              <path d="M14 8.5V7c0-.8.2-1.2 1.3-1.2H17V3h-2.5C11.7 3 11 4.4 11 6.6v1.9H9V11h2v10h3V11h2.2l.3-2.5H14z" />
            </Social>
            <Social href={site.social.instagram} label="Instagram">
              <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4 1 .5.4.8.8 1 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-1 1.4-.4.5-.8.8-1.4 1-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-1-.5-.4-.8-.8-1-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 1-1.4.4-.5.8-.8 1.4-1 .4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.2A6.6 6.6 0 1 0 12 18.6 6.6 6.6 0 0 0 12 5.4zm0 10.9a4.3 4.3 0 1 1 0-8.6 4.3 4.3 0 0 1 0 8.6zm6.9-11.1a1.5 1.5 0 1 1-3.1 0 1.5 1.5 0 0 1 3.1 0z" />
            </Social>
            <Social href={site.social.tiktok} label="TikTok">
              <path d="M16.5 2h-3v13.2a2.6 2.6 0 1 1-2.2-2.6v-3a5.6 5.6 0 1 0 5.2 5.6V9.4c1 .7 2.2 1.1 3.5 1.2v-3a4.1 4.1 0 0 1-3.5-3.6V2z" />
            </Social>
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl text-pollo-amber">Navegación</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {[
              { href: "/", label: "Inicio" },
              { href: "/menu", label: "Menú completo" },
              { href: "/nosotros", label: "Nosotros" },
              { href: "/contacto", label: "Contacto" },
              { href: "/carrito", label: "Mi carrito" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-pollo-amber">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xl text-pollo-amber">Visitanos</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li>
              {site.address}
              <br />
              {site.city}
            </li>
            <li>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="transition hover:text-pollo-amber">
                {site.phone}
              </a>
            </li>
            <li className="pt-2">
              {site.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-3">
                  <span>{h.days}</span>
                  <span className="text-white/60">{h.time}</span>
                </div>
              ))}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/60 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {site.name}. Todos los derechos
            reservados.
          </p>
          <Link href="/admin" className="transition hover:text-pollo-amber">
            Acceso administrador
          </Link>
        </div>
      </div>
    </footer>
  );
}

function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  // Una red sin cuenta cargada no se muestra: mejor eso que un enlace
  // que lleva a la portada genérica de la red social.
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-pollo-amber hover:text-pollo-navy"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
        {children}
      </svg>
    </a>
  );
}
