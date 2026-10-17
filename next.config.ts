import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fotos: as antigas ficam em /public/produtos; as enviadas pelo painel ficam no Supabase Storage.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  // Permite enviar fotos de até 4 MB pelo painel (o limite da Vercel é 4,5 MB).
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
