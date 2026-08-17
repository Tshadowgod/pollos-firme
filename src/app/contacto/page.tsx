import type { Metadata } from "next";

import PageHeader from "@/components/PageHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Dirección, teléfono y horarios de atención de ${site.name}.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        kicker="Estamos cerca"
        title="Contacto"
        subtitle="Escribinos, llamanos o visitanos. Te esperamos con el pollo caliente."
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-3 lg:px-8">
        <Card emoji="📍" title="Dirección">
          <p>{site.address}</p>
          <p className="text-pollo-charcoal/60">{site.city}</p>
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-bold text-pollo-red hover:underline"
          >
            Ver en Google Maps →
          </a>
        </Card>

        <Card emoji="📱" title="Teléfono y WhatsApp">
          <a
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            className="block font-bold text-pollo-navy hover:text-pollo-red"
          >
            {site.phone}
          </a>
          <a
            href={`https://wa.me/${site.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-95"
          >
            Escribir por WhatsApp
          </a>
          <p className="mt-3 text-sm text-pollo-charcoal/60">{site.email}</p>
        </Card>

        <Card emoji="🕐" title="Horarios de atención">
          <ul className="space-y-1.5">
            {site.hours.map((h) => (
              <li key={h.days} className="flex justify-between gap-3 text-sm">
                <span className="text-pollo-navy/75">{h.days}</span>
                <span className="font-bold text-pollo-navy">{h.time}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-pollo-yellow/25 px-3 py-2 text-sm text-pollo-navy">
            🛵 Delivery: {site.deliveryTime} · Bs. {site.deliveryFee}
          </p>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl shadow-[var(--shadow-card)]">
          <iframe
            title={`Ubicación de ${site.name}`}
            src={`https://www.google.com/maps?q=${site.coords.lat},${site.coords.lng}&z=17&output=embed`}
            className="h-[420px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}

function Card({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border-4 border-pollo-navy bg-white p-7 shadow-[var(--shadow-card)]">
      <span className="text-4xl">{emoji}</span>
      <h2 className="mt-3 font-display text-2xl text-pollo-navy">{title}</h2>
      <div className="mt-3 text-pollo-charcoal/80">{children}</div>
    </div>
  );
}
