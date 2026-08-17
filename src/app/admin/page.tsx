import type { Metadata } from "next";

import AdminDashboard from "@/components/AdminDashboard";
import AdminLogin from "@/components/AdminLogin";
import { isAuthenticated } from "@/lib/auth";
import { getOrderStats, getOrders } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Panel de administración",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    return <AdminLogin />;
  }

  const [orders, stats] = await Promise.all([getOrders(), getOrderStats()]);

  return <AdminDashboard orders={orders} stats={stats} />;
}
