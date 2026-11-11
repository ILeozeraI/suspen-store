import type { MetadataRoute } from "next";
import { listarProdutos } from "@/lib/catalogo";
import { categorias } from "@/data/produtos";

// Mapa do site para o Google (suspenstore.com.br/sitemap.xml). Atualiza sozinho: kit novo entra na lista.
// No ar, usa sempre o domínio oficial (não o endereço .vercel.app), para o Google indexar o endereço certo.
const site = (
  process.env.VERCEL_ENV === "production"
    ? "https://www.suspenstore.com.br"
    : process.env.NEXT_PUBLIC_SITE_URL || "https://www.suspenstore.com.br"
).replace(/\/$/, "");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const produtos = await listarProdutos();
  return [
    { url: `${site}/`, changeFrequency: "daily", priority: 1 },
    { url: `${site}/produtos`, changeFrequency: "daily", priority: 0.9 },
    ...categorias.map((c) => ({
      url: `${site}/produtos?categoria=${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...produtos.map((p) => ({
      url: `${site}/produto/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${site}/perguntas-frequentes`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${site}/trocas-e-garantia`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${site}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
