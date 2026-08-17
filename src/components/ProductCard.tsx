"use client";

import Image from "next/image";
import { useState } from "react";

import { useCart } from "@/components/CartProvider";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";

/** Emoji de respaldo cuando el plato todavía no tiene foto cargada. */
const FALLBACK_EMOJI: Record<string, string> = {
  broaster: "🍗",
  brasa: "🔥",
  platos: "🍽️",
  combos: "🍱",
  bebidas: "🥤",
};

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-[1.75rem] border-4 border-pollo-navy bg-white shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-poster)]">
      {/* Imagen del plato, servida sobre "papel" naranja */}
      <div className="relative aspect-4/3 overflow-hidden border-b-4 border-pollo-navy bg-poster">
        <div className="pointer-events-none absolute inset-0 bg-halftone opacity-50" />

        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="relative grid h-full place-items-center">
            {/* Plato blanco, como en los afiches */}
            <span className="grid size-32 place-items-center rounded-full bg-white text-6xl shadow-[var(--shadow-card)] transition duration-500 group-hover:scale-110">
              {FALLBACK_EMOJI[product.category_slug] ?? "🍗"}
            </span>
          </div>
        )}

        {product.badge && (
          <span className="absolute left-3 top-3 -rotate-3 bg-pollo-red px-3 py-1.5 font-display text-sm text-white shadow-md">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl leading-tight text-pollo-navy">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-pollo-charcoal/75">
            {product.description}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="rounded-full border-3 border-pollo-navy bg-pollo-amber px-4 py-1.5 font-price text-2xl text-pollo-navy">
            {money(product.price)}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            className={`rounded-full px-5 py-3 font-display text-base shadow-md transition active:scale-95 ${
              added
                ? "bg-green-600 text-white"
                : "bg-pollo-navy text-white hover:bg-pollo-red"
            }`}
          >
            {added ? "¡Agregado! ✓" : "Agregar +"}
          </button>
        </div>
      </div>
    </article>
  );
}
