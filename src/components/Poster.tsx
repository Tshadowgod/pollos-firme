/**
 * Piezas gráficas del estilo afiche de Pollo Firme:
 * óvalo de precio, cinta roja, lista con ✓ y flecha curva.
 * Se usan en la portada, el menú y las promociones.
 */

/** Óvalo con contorno blanco: "TODO POR: 110 Bs." */
export function PriceOval({
  amount,
  label = "Todo por:",
  size = "lg",
}: {
  amount: number | string;
  label?: string;
  size?: "sm" | "lg";
}) {
  const big = size === "lg";
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-[50%] border-4 border-white text-pollo-navy ${
        big ? "px-10 py-5" : "px-6 py-3"
      }`}
    >
      <span
        className={`font-display tracking-wide text-pollo-navy/80 ${
          big ? "text-sm" : "text-[10px]"
        }`}
      >
        {label}
      </span>
      <span className="flex items-baseline gap-1">
        <span className={`font-price ${big ? "text-6xl" : "text-3xl"}`}>
          {amount}
        </span>
        <span className={`font-price ${big ? "text-2xl" : "text-base"}`}>
          Bs.
        </span>
      </span>
    </div>
  );
}

/** Cinta roja inclinada, como el "+ COCA COLA 2 LITROS" del flyer. */
export function Ribbon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-block -rotate-2 bg-pollo-red px-4 py-2 font-display text-lg text-white shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </span>
  );
}

/** Lista de "INCLUYE:" con tildes amarillas. */
export function CheckList({
  items,
  title,
  tone = "light",
}: {
  items: string[];
  title?: string;
  tone?: "light" | "dark";
}) {
  const text = tone === "dark" ? "text-white" : "text-pollo-navy";
  return (
    <div>
      {title && (
        <p className={`font-display text-xl text-pollo-amber`}>{title}</p>
      )}
      <ul className={`mt-2 space-y-1.5 ${text}`}>
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 font-semibold">
            <span className="mt-0.5 shrink-0 font-display text-pollo-amber">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Flecha curva blanca que apunta a la promoción. */
export function CurvyArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 60"
      className={`w-24 fill-none stroke-white ${className}`}
      strokeWidth={4}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 14C34 2 78 6 104 38" strokeDasharray="0" />
      <path d="M92 40l14 2-4-15" />
    </svg>
  );
}

/** Trazo de pincel oscuro detrás de un título, como el logo del flyer. */
export function Swash({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 42"
      className={`absolute inset-x-0 -z-10 h-full w-full ${className}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M6 26C60 8 120 34 186 18c58-14 118 6 172-4-4 18-10 24-24 26-70 10-140-8-208 4C88 50 42 44 6 26Z"
        className="fill-pollo-navy"
      />
    </svg>
  );
}
