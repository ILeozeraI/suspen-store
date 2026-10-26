import "server-only";
// Lê os produtos do Supabase. Sem Supabase configurado, usa a lista reserva de src/data/produtos.ts.
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { produtosIniciais, type Produto } from "@/data/produtos";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigurado } from "./supabase/config";

export type LinhaProduto = {
  id: string;
  slug: string;
  nome: string;
  categoria: string;
  montadora: string;
  modelos: string[];
  anos: string | null;
  imagem: string;
  preco: number | null;
  preco_antigo: number | null;
  destaque: boolean;
  resumo: string;
  observacao: string | null;
  estoque: number | null;
  ativo: boolean;
  ordem: number;
  fornecedor_id: string | null;
  frete_gratis: boolean;
  peso_kg: number | null;
  altura_cm: number | null;
  largura_cm: number | null;
  comprimento_cm: number | null;
};

export function deLinha(l: LinhaProduto): Produto {
  return {
    id: l.id,
    slug: l.slug,
    nome: l.nome,
    categoria: l.categoria,
    montadora: l.montadora,
    modelos: l.modelos ?? [],
    anos: l.anos ?? undefined,
    imagem: l.imagem,
    preco: l.preco === null ? null : Number(l.preco),
    precoAntigo: l.preco_antigo === null ? undefined : Number(l.preco_antigo),
    destaque: l.destaque,
    resumo: l.resumo,
    observacao: l.observacao ?? undefined,
    estoque: l.estoque,
    fornecedorId: l.fornecedor_id ?? null,
    freteGratis: l.frete_gratis ?? false,
    pesoKg: l.peso_kg === null || l.peso_kg === undefined ? null : Number(l.peso_kg),
    alturaCm: l.altura_cm ?? null,
    larguraCm: l.largura_cm ?? null,
    comprimentoCm: l.comprimento_cm ?? null,
  };
}

// Só produtos ativos (o que o cliente vê). `cache` evita buscar duas vezes na mesma página.
export const listarProdutos = cache(async (): Promise<Produto[]> => {
  if (!supabaseConfigurado) return produtosIniciais;
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { data, error } = await sb
    .from("produtos")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true })
    .order("nome", { ascending: true });
  if (error) {
    // Durante a publicação (build), um Supabase fora do ar não pode derrubar o deploy: as páginas saem vazias
    // e se atualizam sozinhas com os dados reais em até 5 minutos (revalidate). Fora do build, o erro aparece.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn(`[catalogo] Supabase indisponível durante o build, seguindo sem produtos: ${error.message.slice(0, 200)}`);
      return [];
    }
    throw new Error(`Erro ao ler produtos do Supabase: ${error.message}`);
  }
  return (data as LinhaProduto[]).map(deLinha);
});

export async function buscarProduto(slug: string) {
  return (await listarProdutos()).find((p) => p.slug === slug);
}
