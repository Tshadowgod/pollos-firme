import type { Metadata } from "next";

import CartClient from "@/components/CartClient";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Mi carrito",
  description: "Revisá tu pedido y confirmá la entrega.",
};

export default function CartPage() {
  return (
    <>
      <PageHeader
        kicker="Casi listo"
        title="Mi carrito"
        subtitle="Revisá tu pedido, completá tus datos y te lo mandamos calentito."
      />
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <CartClient />
      </div>
    </>
  );
}
