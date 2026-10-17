import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fotos dos produtos ficam em /public/produtos por enquanto.
  // Quando forem para o Supabase Storage, adicionar o domínio em images.remotePatterns.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
