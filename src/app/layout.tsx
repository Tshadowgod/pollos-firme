import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/components/CartProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";
import { site } from "@/lib/site";

// Anton: tipografía de póster, pesada y condensada, como los flyers.
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · Pollo Broaster y a la Brasa`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "pollo broaster",
    "pollo a la brasa",
    "pollería",
    "delivery de pollo",
    site.city,
  ],
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "es_BO",
    type: "website",
    images: [{ url: "/logo.png", width: 1250, height: 1250, alt: site.name }],
  },
  // Íconos generados a partir de la mascota del logo (el logo completo
  // pesa 1,3 MB y no se lee a 32 px).
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#dc1a22",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${anton.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
