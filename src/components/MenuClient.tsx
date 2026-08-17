"use client";

import { useMemo, useState } from "react";

import ProductCard from "@/components/ProductCard";
import type { Category, Product } from "@/lib/types";

export default function MenuClient({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const [active, setActive] = useState<string>("todos");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchCategory = active === "todos" || p.category_slug === active;
      const matchQuery =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [products, active, query]);

  // Agrupamos por categoría solo cuando se ven todas, para que el menú
  // se lea como una carta de verdad.
  const groups = useMemo(() => {
    if (active !== "todos") return null;
    return categories
      .map((c) => ({
        category: c,
        items: filtered.filter((p) => p.category_slug === c.slug),
      }))
      .filter((g) => g.items.length > 0);
  }, [categories, filtered, active]);

  return (
    <>
      <div className="sticky top-18 z-30 -mx-4 mb-10 border-b-4 border-pollo-navy bg-pollo-cream/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
            <FilterChip
              label="Todo el menú"
              emoji="🍽️"
              active={active === "todos"}
              onClick={() => setActive("todos")}
            />
            {categories.map((c) => (
              <FilterChip
                key={c.slug}
                label={c.name}
                emoji={c.emoji ?? "🍗"}
                active={active === c.slug}
                onClick={() => setActive(c.slug)}
              />
            ))}
          </div>

          <div className="relative shrink-0 lg:w-64">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar un plato…"
              aria-label="Buscar un plato"
              className="w-full rounded-full border-3 border-pollo-navy bg-white py-2.5 pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-pollo-red"
            />
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-pollo-navy/40"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-5xl">🔍</p>
          <p className="mt-4 font-display text-3xl text-pollo-navy drop-poster">
            No encontramos ese plato
          </p>
          <p className="mt-1 font-semibold text-pollo-navy/70">
            Probá con otra búsqueda o mirá todo el menú.
          </p>
        </div>
      ) : groups ? (
        <div className="space-y-14">
          {groups.map(({ category, items }) => (
            <section key={category.slug} id={category.slug}>
              <div className="mb-6 flex items-end gap-3 border-b-4 border-pollo-navy pb-3">
                <span className="text-4xl">{category.emoji ?? "🍗"}</span>
                <div>
                  <h2 className="font-display text-4xl text-pollo-navy drop-poster">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-sm font-semibold text-pollo-navy/70">
                      {category.description}
                    </p>
                  )}
                </div>
                <span className="ml-auto pb-1 font-display text-base text-pollo-navy/60">
                  {items.length} {items.length === 1 ? "plato" : "platos"}
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

function FilterChip({
  label,
  emoji,
  active,
  onClick,
}: {
  label: string;
  emoji: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex shrink-0 items-center gap-2 rounded-full border-3 border-pollo-navy px-4 py-2.5 font-display text-base transition ${
        active
          ? "bg-pollo-navy text-pollo-amber shadow-md"
          : "bg-white text-pollo-navy hover:bg-pollo-amber"
      }`}
    >
      <span aria-hidden>{emoji}</span>
      {label}
    </button>
  );
}
