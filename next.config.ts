import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 sólo permite las calidades declaradas acá. El 95 es para los
    // afiches de promociones, que tienen precios y letra chica.
    qualities: [75, 95],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
