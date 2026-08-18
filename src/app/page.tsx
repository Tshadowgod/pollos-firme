import Image from "next/image";
import Link from "next/link";

import { Ribbon } from "@/components/Poster";
import ProductCard from "@/components/ProductCard";
import { getProducts, getPromotions } from "@/lib/queries";
import { site } from "@/lib/site";
import type { Product, Promotion } from "@/lib/types";

// El menú se lee de Neon en cada visita, así los cambios de precio
// se ven al instante sin volver a desplegar.
export const revalidate = 0;

/**
 * Promoción de respaldo: se usa cuando todavía no cargaron ninguna
 * desde el panel (o si la base no responde). Los textos salen de site.ts.
 */
function fallbackPromo(): Promotion {
  const { promo } = site;
  return {
    id: 0,
    kicker: promo.kicker,
    title: promo.title,
    subtitle: promo.subtitle,
    price: promo.price,
    ribbon: promo.ribbon,
    includes: [...promo.includes],
    image_url: promo.image,
    is_active: true,
    sort_order: 0,
  };
}

export default async function HomePage() {
  let featured: Product[] = [];
  let promotions: Promotion[] = [];
  let dbError = false;

  try {
    [featured, promotions] = await Promise.all([
      getProducts({ featuredOnly: true }),
      getPromotions({ activeOnly: true }),
    ]);
  } catch {
    dbError = true;
  }

  const [main, ...rest] = promotions.length > 0
    ? promotions
    : site.promo.active
      ? [fallbackPromo()]
      : [];

  return (
    <>
      <Hero />
      <Strip />
      {main && <Promo promo={main} />}
      {rest.length > 0 && <PromoGallery promotions={rest} />}
      <Specialties />
      <Featured products={featured.slice(0, 6)} dbError={dbError} />
      <Why />
      <Steps />
      <CtaBanner />
    </>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-halftone opacity-70" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8">
        <div className="text-center md:text-left">
          <Ribbon className="mb-5">🔥 Recién hecho, todos los días</Ribbon>

          <h1 className="font-display text-6xl text-pollo-navy drop-poster sm:text-7xl lg:text-8xl">
            El mejor
            <br />
            sabor del
            <br />
            <span className="text-white [-webkit-text-stroke:3px_var(--color-pollo-navy)]">
              pollo
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-lg font-semibold text-pollo-navy md:mx-0">
            Especialistas en <strong>pollo broaster</strong> y{" "}
            <strong>pollo a la brasa</strong>. Crocante por fuera, jugosito por
            dentro.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Link
              href="/menu"
              className="rounded-full bg-pollo-navy px-8 py-4 font-display text-xl text-pollo-amber shadow-[var(--shadow-poster)] transition hover:-translate-y-1 hover:bg-pollo-red hover:text-white"
            >
              Ver el menú 🍗
            </Link>
            <TikTokButton />
            <a
              href={`https://wa.me/${site.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-4 border-white bg-white/25 px-8 py-4 font-display text-xl text-pollo-navy backdrop-blur transition hover:-translate-y-1 hover:bg-white"
            >
              Pedir por WhatsApp
            </a>
          </div>

          <dl className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 md:justify-start">
            {[
              ["🛵", "Delivery", site.deliveryTime],
              ["🏪", "Recojo", "Listo en 20 min"],
              ["⭐", "Calidad", "Pollo fresco"],
            ].map(([icon, title, sub]) => (
              <div key={title} className="text-center md:text-left">
                <dt className="font-display text-lg text-pollo-navy">
                  {icon} {title}
                </dt>
                <dd className="text-sm font-semibold text-pollo-navy/85">
                  {sub}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-0 rounded-full bg-pollo-amber/40 blur-3xl" />
          <Image
            src="/logo.png"
            alt={`${site.name} — ${site.tagline}`}
            width={620}
            height={620}
            priority
            className="relative animate-float rounded-[2.5rem] border-8 border-white shadow-[var(--shadow-poster)]"
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Acceso directo al TikTok de la pollería, al lado del botón del menú.
 * Si todavía no hay cuenta cargada en site.ts no se muestra nada, así
 * nunca queda un botón que lleva a la nada.
 */
function TikTokButton() {
  if (!site.social.tiktok) return null;

  return (
    <a
      href={site.social.tiktok}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Seguinos en TikTok"
      title="Seguinos en TikTok"
      className="group grid size-16 shrink-0 place-items-center rounded-full border-4 border-white bg-pollo-navy text-white shadow-[var(--shadow-poster)] transition hover:-translate-y-1 hover:bg-pollo-red"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-7" aria-hidden>
        <path d="M16.5 2h-3v13.2a2.6 2.6 0 1 1-2.2-2.6v-3a5.6 5.6 0 1 0 5.2 5.6V9.4c1 .7 2.2 1.1 3.5 1.2v-3a4.1 4.1 0 0 1-3.5-3.6V2z" />
      </svg>
    </a>
  );
}

/* ── Cinta animada ────────────────────────────────────────────────── */

function Strip() {
  const items = [
    "POLLO BROASTER",
    "🍗",
    "POLLO A LA BRASA",
    "🔥",
    "DELIVERY RÁPIDO",
    "🛵",
    "SALSAS DE LA CASA",
    "⭐",
  ];

  return (
    <div className="overflow-hidden border-y-6 border-pollo-navy bg-pollo-amber py-3">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
            {items.map((item, i) => (
              <span
                key={`${copy}-${i}`}
                className="mx-6 font-display text-xl tracking-wide text-pollo-navy"
              >
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Afiche de promoción ──────────────────────────────────────────── */

/**
 * Afiche de la promoción: el nombre del combo y, debajo, la imagen que
 * se sube desde el panel ocupando todo el ancho. Los detalles (precio,
 * qué incluye, etc.) van dentro de la propia imagen del afiche.
 */
function Promo({ promo }: { promo: Promotion }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] border-6 border-pollo-navy bg-poster shadow-[var(--shadow-poster)]">
        <div className="pointer-events-none absolute inset-0 bg-halftone opacity-60" />

        <div className="relative p-6 sm:p-8 md:p-12">
          <div className="text-center">
            {promo.kicker && (
              <p className="font-display text-lg tracking-widest text-white">
                {promo.kicker}
              </p>
            )}
            <h2 className="mt-1 font-display text-6xl text-pollo-navy drop-poster sm:text-7xl">
              {promo.title}
            </h2>
          </div>

          <PromoImage promo={promo} />

          <div className="mt-8 text-center">
            <Link
              href="/menu"
              className="inline-block rounded-full bg-white px-8 py-4 font-display text-xl text-pollo-navy shadow-[var(--shadow-poster)] transition hover:-translate-y-1 hover:bg-pollo-navy hover:text-pollo-amber"
            >
              Lo quiero 🍗
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Espacio del afiche. Usa `object-contain` a propósito: un flyer vertical
 * u horizontal se ve entero, sin recortar los precios ni el texto.
 */
function PromoImage({ promo }: { promo: Promotion }) {
  return (
    <div className="mt-7 overflow-hidden rounded-[1.75rem] border-6 border-white shadow-[var(--shadow-poster)]">
      {promo.image_url ? (
        <div className="relative h-[24rem] w-full sm:h-[32rem] lg:h-[38rem]">
          <Image
            src={promo.image_url}
            alt={promo.title}
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            // El afiche tiene texto y precios chicos: subimos la calidad
            // muy por encima del 75 % que usa Next por defecto.
            quality={95}
            className="object-contain"
          />
        </div>
      ) : (
        <div className="grid h-[24rem] place-items-center p-8 text-center sm:h-[32rem]">
          <div>
            <span className="text-[7rem] leading-none drop-shadow-lg">🍗</span>
            <p className="mt-2 font-display text-4xl text-pollo-navy drop-poster">
              {promo.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/** Promociones adicionales: se muestran como una galería de banners. */
function PromoGallery({ promotions }: { promotions: Promotion[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <SectionTitle kicker="Más promos" title="Otras ofertas" />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promo) => (
          <article
            key={promo.id}
            className="overflow-hidden rounded-[1.75rem] border-4 border-pollo-navy bg-white shadow-[var(--shadow-card)] transition hover:-translate-y-1.5"
          >
            <div className="relative aspect-4/3 border-b-4 border-pollo-navy bg-poster">
              {promo.image_url ? (
                <Image
                  src={promo.image_url}
                  alt={promo.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain"
                />
              ) : (
                <span className="grid h-full place-items-center text-6xl">
                  🍗
                </span>
              )}
              {promo.price !== null && (
                <span className="absolute bottom-3 right-3 rounded-full border-3 border-pollo-navy bg-pollo-amber px-4 py-1.5 font-price text-xl text-pollo-navy">
                  Bs. {promo.price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="p-5">
              <h3 className="font-display text-2xl text-pollo-navy">
                {promo.title}
              </h3>
              {promo.subtitle && (
                <p className="mt-1 text-sm font-medium text-pollo-charcoal/75">
                  {promo.subtitle}
                </p>
              )}
              {promo.ribbon && (
                <p className="mt-3">
                  <Ribbon className="text-sm">{promo.ribbon}</Ribbon>
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ── Especialidades ───────────────────────────────────────────────── */

function Specialties() {
  const specialties = [
    {
      emoji: "🍗",
      title: "Pollo Broaster",
      text: "Marinado 12 horas en nuestra mezcla secreta de especias, empanizado a mano y frito a presión. El crocante que hace ruido.",
    },
    {
      emoji: "🔥",
      title: "Pollo a la Brasa",
      text: "Cocinado lentamente al carbón, girando sobre la brasa hasta lograr esa piel dorada y esa carne que se deshace sola.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionTitle
        kicker="Nuestra especialidad"
        title="Dos formas de hacerlo perfecto"
        subtitle="Cada pollo pasa por el mismo estándar: fresco, marinado en casa y cocinado al momento."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {specialties.map((s) => (
          <article
            key={s.title}
            className="group relative overflow-hidden rounded-[2rem] border-4 border-pollo-navy bg-pollo-cream p-8 shadow-[var(--shadow-card)] transition hover:-translate-y-1.5"
          >
            <div className="absolute -right-6 -top-6 text-9xl opacity-15 transition duration-500 group-hover:scale-125 group-hover:rotate-12">
              {s.emoji}
            </div>
            <div className="relative">
              <span className="text-5xl">{s.emoji}</span>
              <h3 className="mt-4 font-display text-4xl text-pollo-navy">
                {s.title}
              </h3>
              <p className="mt-3 max-w-sm font-medium leading-relaxed text-pollo-charcoal/80">
                {s.text}
              </p>
              <Link
                href="/menu"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-pollo-navy px-5 py-2.5 font-display text-white transition hover:gap-3 hover:bg-pollo-red"
              >
                Ver platos <span aria-hidden>→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ── Destacados ───────────────────────────────────────────────────── */

function Featured({
  products,
  dbError,
}: {
  products: Product[];
  dbError: boolean;
}) {
  return (
    <section className="border-y-6 border-pollo-navy bg-pollo-cream py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          kicker="Los favoritos"
          title="Lo más pedido de la casa"
          subtitle="Los platos que nuestros clientes repiten cada semana."
        />

        {dbError ? (
          <DbNotice />
        ) : products.length === 0 ? (
          <p className="mt-10 text-center font-semibold text-pollo-charcoal/60">
            Todavía no hay platos destacados cargados.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/menu"
            className="inline-block rounded-full bg-pollo-red px-8 py-4 font-display text-xl text-white shadow-[var(--shadow-poster)] transition hover:-translate-y-1 hover:bg-pollo-navy"
          >
            Ver el menú completo
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Por qué elegirnos ────────────────────────────────────────────── */

function Why() {
  const reasons = [
    { emoji: "🐔", title: "Pollo fresco", text: "Nunca congelado. Compramos y marinamos el mismo día." },
    { emoji: "🌶️", title: "Salsas de la casa", text: "Ají, huacatay y mayonesa preparadas en nuestra cocina." },
    { emoji: "🛵", title: "Delivery caliente", text: `Llegamos en ${site.deliveryTime} con empaque térmico.` },
    { emoji: "💛", title: "Porciones firmes", text: "Nombre que se cumple: acá nadie se queda con hambre." },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionTitle kicker="Por qué Pollo Firme" title="Lo que nos hace diferentes" />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((r) => (
          <div
            key={r.title}
            className="rounded-3xl border-4 border-pollo-navy bg-pollo-cream p-6 text-center transition hover:-translate-y-1.5 hover:bg-white hover:shadow-[var(--shadow-card)]"
          >
            <span className="text-5xl">{r.emoji}</span>
            <h3 className="mt-4 font-display text-2xl text-pollo-navy">
              {r.title}
            </h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-pollo-charcoal/75">
              {r.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Cómo pedir ───────────────────────────────────────────────────── */

function Steps() {
  const steps = [
    { n: "1", title: "Elegí tus platos", text: "Armá tu pedido desde el menú y agregalo al carrito." },
    { n: "2", title: "Confirmá tus datos", text: "Delivery o recojo, dirección y forma de pago." },
    { n: "3", title: "Te llega el pedido", text: "Nos llega por WhatsApp, lo confirmamos y sale caliente." },
  ];

  return (
    <section className="border-y-6 border-pollo-navy bg-poster-dark py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-display text-lg tracking-[0.2em] text-pollo-amber">
            Fácil y rápido
          </p>
          <h2 className="mt-2 font-display text-5xl text-white sm:text-6xl">
            Pedir es cosa de 3 pasos
          </h2>
        </div>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.n}
              className="rounded-3xl border-4 border-pollo-amber/40 bg-white/5 p-7"
            >
              <span className="grid size-16 place-items-center rounded-2xl bg-pollo-amber font-display text-3xl text-pollo-navy">
                {s.n}
              </span>
              <h3 className="mt-5 font-display text-3xl text-white">
                {s.title}
              </h3>
              <p className="mt-2 font-medium leading-relaxed text-white/75">
                {s.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Banner final ─────────────────────────────────────────────────── */

function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] border-6 border-pollo-navy bg-pollo-red px-8 py-14 text-center shadow-[var(--shadow-poster)]">
        <div className="pointer-events-none absolute inset-0 bg-halftone opacity-40" />
        <div className="relative">
          <span className="text-6xl">🍗</span>
          <h2 className="mt-4 font-display text-5xl text-white sm:text-6xl">
            ¿Se te antojó?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-lg font-semibold text-white/90">
            Hacé tu pedido ahora y te lo llevamos calentito hasta la puerta de
            tu casa.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/menu"
              className="rounded-full bg-pollo-amber px-8 py-4 font-display text-xl text-pollo-navy shadow-lg transition hover:-translate-y-1 hover:bg-white"
            >
              Hacer mi pedido
            </Link>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="rounded-full border-4 border-white px-8 py-4 font-display text-xl text-white transition hover:-translate-y-1 hover:bg-white hover:text-pollo-red"
            >
              Llamar {site.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Piezas reutilizables ─────────────────────────────────────────── */

export function SectionTitle({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      <p className="font-display text-lg tracking-[0.2em] text-white drop-shadow">
        {kicker}
      </p>
      <h2 className="mt-1 font-display text-5xl text-pollo-navy drop-poster sm:text-6xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-xl font-semibold text-pollo-navy">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function DbNotice() {
  return (
    <div className="mx-auto mt-10 max-w-xl rounded-3xl border-4 border-dashed border-pollo-navy/40 bg-white/70 p-8 text-center">
      <p className="text-4xl">🔌</p>
      <h3 className="mt-3 font-display text-2xl text-pollo-navy">
        Menú no disponible
      </h3>
      <p className="mt-2 text-sm font-medium text-pollo-charcoal/75">
        No pudimos conectar con la base de datos. Verificá que{" "}
        <code className="rounded bg-pollo-navy/10 px-1.5 py-0.5 font-mono text-xs">
          DATABASE_URL
        </code>{" "}
        esté configurada y que hayas corrido{" "}
        <code className="rounded bg-pollo-navy/10 px-1.5 py-0.5 font-mono text-xs">
          npm run db:setup
        </code>
        .
      </p>
    </div>
  );
}
