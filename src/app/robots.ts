import type { MetadataRoute } from "next";

// Diz ao Google o que pode aparecer nas buscas. Painel, checkout, pedidos e área do fornecedor ficam de fora.
// No ar, usa sempre o domínio oficial (não o endereço .vercel.app), para o Google indexar o endereço certo.
const site = (
  process.env.VERCEL_ENV === "production"
    ? "https://www.suspenstore.com.br"
    : process.env.NEXT_PUBLIC_SITE_URL || "https://www.suspenstore.com.br"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/fornecedor", "/checkout", "/carrinho", "/pedido", "/api"],
    },
    sitemap: `${site}/sitemap.xml`,
  };
}
