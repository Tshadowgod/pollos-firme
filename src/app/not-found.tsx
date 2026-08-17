import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 py-20 text-center">
      <div>
        <p className="text-8xl">🍗</p>
        <h1 className="mt-6 font-display text-5xl text-pollo-navy">
          404 — Se nos quemó esta página
        </h1>
        <p className="mt-3 text-pollo-charcoal/70">
          No encontramos lo que buscabas, pero el pollo sigue caliente.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-pollo-red px-8 py-3.5 font-display text-lg text-white shadow-[var(--shadow-pop)] transition hover:-translate-y-1"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
