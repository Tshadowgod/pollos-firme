import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import PageHeader from "@/components/PageHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conocé la historia de Pollo Firme, la pollería especialista en pollo broaster y pollo a la brasa.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        kicker="Nuestra historia"
        title="Nosotros"
        subtitle="Una receta de familia, una freidora, un carbón y muchas ganas."
      />

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
        {/* El texto va sobre papel claro: marrón sobre el naranja del fondo
            no da contraste suficiente para leer párrafos largos. */}
        <div className="rounded-[2rem] border-4 border-pollo-navy bg-pollo-cream p-7 shadow-[var(--shadow-card)] sm:p-9">
          <h2 className="font-display text-4xl text-pollo-navy">
            Nacimos con una idea simple:
            <span className="text-pollo-red"> hacer el pollo bien.</span>
          </h2>
          <div className="mt-5 space-y-4 font-medium leading-relaxed text-pollo-charcoal">
            <p>
              {site.name} arrancó como un negocio de barrio, con una receta de
              marinado que se pasó de generación en generación. Nada de atajos:
              pollo fresco, especias molidas en casa y el punto exacto de
              cocción.
            </p>
            <p>
              Con los años sumamos la brasa al carbón y el broaster a presión,
              las dos técnicas que hoy son nuestra especialidad. Cambió el
              tamaño de la cocina, pero no la forma de trabajar.
            </p>
            <p className="font-display text-xl text-pollo-red">
              {site.tagline}
            </p>
          </div>

          <Link
            href="/menu"
            className="mt-7 inline-block rounded-full bg-pollo-red px-8 py-3.5 font-display text-lg text-white shadow-[var(--shadow-pop)] transition hover:-translate-y-1 hover:bg-pollo-navy"
          >
            Probá nuestro menú
          </Link>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2.5rem] bg-pollo-yellow/30 blur-2xl" />
          <Image
            src="/logo.png"
            alt={site.name}
            width={600}
            height={600}
            className="relative rounded-[2.5rem] shadow-2xl"
          />
        </div>
      </section>

      <section className="border-y-6 border-pollo-navy bg-pollo-cream py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-5xl text-pollo-navy">
            Lo que cuidamos todos los días
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              {
                emoji: "🐔",
                title: "Materia prima",
                text: "Pollo fresco de proveedores locales, recibido y marinado el mismo día.",
              },
              {
                emoji: "👨‍🍳",
                title: "Preparación",
                text: "Marinado de 12 horas, empanizado a mano y brasa al carbón, sin atajos.",
              },
              {
                emoji: "🧼",
                title: "Higiene",
                text: "Cocina limpia, aceite filtrado a diario y control de temperatura constante.",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-3xl border-4 border-pollo-navy bg-white p-7 text-center"
              >
                <span className="text-5xl">{v.emoji}</span>
                <h3 className="mt-4 font-display text-2xl text-pollo-navy">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-pollo-navy/75">
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
