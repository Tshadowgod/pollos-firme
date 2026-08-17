import type { Metadata } from "next";

import MenuClient from "@/components/MenuClient";
import PageHeader from "@/components/PageHeader";
import { DbNotice } from "@/app/page";
import { getCategories, getProducts } from "@/lib/queries";
import type { Category, Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Menú",
  description:
    "Todo el menú de Pollo Firme: pollo broaster, pollo a la brasa, combos, guarniciones, bebidas y postres.",
};

export const revalidate = 0;

export default async function MenuPage() {
  let categories: Category[] = [];
  let products: Product[] = [];
  let dbError = false;

  try {
    [categories, products] = await Promise.all([
      getCategories(),
      getProducts(),
    ]);
  } catch {
    dbError = true;
  }

  return (
    <>
      <PageHeader
        kicker="Nuestra carta"
        title="El menú"
        subtitle="Todo se prepara al momento. Elegí tus platos y armá tu pedido."
      />

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {dbError ? (
          <DbNotice />
        ) : (
          <MenuClient categories={categories} products={products} />
        )}
      </div>
    </>
  );
}
