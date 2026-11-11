import type { Metadata } from "next";
import { loja } from "@/data/loja";

// Título, descrição e prévia de link (WhatsApp, Facebook...) de uma página.
// Sem isto, a prévia do link mostra o título geral da loja em todas as páginas.
export function metaPagina(titulo: string, descricao: string, imagem = "/marca/logo-suspen-store.png"): Metadata {
  return {
    title: titulo,
    description: descricao,
    openGraph: {
      title: `${titulo} | ${loja.nome}`,
      description: descricao,
      images: [imagem],
      locale: "pt_BR",
      type: "website",
    },
  };
}
