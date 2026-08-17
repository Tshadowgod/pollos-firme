import type { Metadata } from "next";

import AdminLogin from "@/components/AdminLogin";
import AdminPromotions from "@/components/AdminPromotions";
import { isAuthenticated } from "@/lib/auth";
import { getPromotions } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Promociones",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  if (!(await isAuthenticated())) {
    return <AdminLogin />;
  }

  const promotions = await getPromotions();
  return <AdminPromotions promotions={promotions} />;
}
