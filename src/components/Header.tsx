"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "@/components/CartProvider";
import { site } from "@/lib/site";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/menu", label: "Menú" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerramos el menú móvil al navegar a otra página.
  useEffect(() => setOpen(false), [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className={`sticky top-0 z-50 border-b-6 border-pollo-navy transition-all duration-300 ${
        scrolled ? "bg-pollo-red/95 shadow-xl backdrop-blur" : "bg-pollo-red"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          {/* La mascota ya viene recortada en círculo, con su aro y su halo:
              no hace falta forzar el encuadre con escalas ni máscaras. */}
          <span className="relative block size-13 shrink-0">
            <Image
              src="/mascota.png"
              alt={site.name}
              fill
              sizes="52px"
              className="object-contain drop-shadow-md"
              priority
            />
          </span>
          <span className="font-display text-3xl leading-none text-pollo-amber drop-shadow-sm">
            Pollo <span className="text-white">Firme</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 font-display text-base transition ${
                  active
                    ? "bg-pollo-amber text-pollo-navy"
                    : "text-white/90 hover:bg-white/20 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/carrito"
            aria-label="Ver carrito"
            className="relative flex items-center gap-2 rounded-full border-3 border-pollo-navy bg-pollo-amber px-4 py-2.5 font-display text-base text-pollo-navy shadow-md transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
          >
            <CartIcon />
            <span className="hidden sm:inline">Carrito</span>
            {ready && count > 0 && (
              <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-pollo-navy text-xs font-bold text-white ring-2 ring-pollo-amber">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
            aria-expanded={open}
            className="grid size-11 place-items-center rounded-full text-white transition hover:bg-white/15 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" strokeWidth={2.5} stroke="currentColor" strokeLinecap="round">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t-4 border-pollo-navy bg-pollo-red px-4 pb-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-xl px-4 py-3 font-display text-xl text-white transition hover:bg-white/20"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
      <circle cx="10" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
