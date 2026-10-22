import "server-only";
// Monta os pacotes do carrinho: um por fornecedor, como no Mercado Livre.
// Cada pacote é cotado do CEP do fornecedor até o CEP do cliente.

import type { Produto } from "@/data/produtos";
import { arred } from "@/lib/site";
import { supabaseServico } from "@/lib/supabase/servico";
import type { Fornecedor } from "@/lib/tipos";
import { cotar, type OpcaoFrete, type ProdutoCotacao, type Volume } from "./melhorenvio";

export type ItemPacote = { produto: Produto; quantidade: number };

export type Pacote = {
  fornecedor: Fornecedor;
  itens: ItemPacote[];
  volume: Volume;
  valorItens: number;
  freteGratisTotal: boolean;
};

export type OpcaoPacote = OpcaoFrete & {
  precoCliente: number; // o que o cliente paga (0 se frete grátis)
  precoReal: number; // o que a loja paga
};

export class ErroFrete extends Error {}

function paraCotacao(itens: ItemPacote[]): ProdutoCotacao[] {
  return itens.map(({ produto: p, quantidade }) => ({
    id: p.slug,
    largura: p.larguraCm!,
    altura: p.alturaCm!,
    comprimento: p.comprimentoCm!,
    peso: p.pesoKg!,
    valor: p.preco ?? 0,
    quantidade,
  }));
}

// Caixa única do pacote: maior largura e comprimento, alturas empilhadas, pesos somados.
function volumeDe(itens: ItemPacote[]): Volume {
  return {
    largura: Math.max(...itens.map((i) => i.produto.larguraCm!)),
    comprimento: Math.max(...itens.map((i) => i.produto.comprimentoCm!)),
    altura: itens.reduce((s, i) => s + i.produto.alturaCm! * i.quantidade, 0),
    peso: arred(itens.reduce((s, i) => s + i.produto.pesoKg! * i.quantidade, 0)),
  };
}

export async function montarPacotes(itens: ItemPacote[]): Promise<Pacote[]> {
  for (const { produto: p } of itens) {
    if (!p.fornecedorId) throw new ErroFrete(`"${p.nome}" está sem fornecedor cadastrado.`);
    if (!p.pesoKg || !p.alturaCm || !p.larguraCm || !p.comprimentoCm)
      throw new ErroFrete(`"${p.nome}" ainda está sem peso e medidas. Finalize pelo WhatsApp.`);
  }
  const ids = [...new Set(itens.map((i) => i.produto.fornecedorId!))];
  const { data, error } = await supabaseServico().from("fornecedores").select("*").in("id", ids);
  if (error) throw new Error(error.message);
  const fornecedores = (data ?? []) as Fornecedor[];

  return ids.map((id) => {
    const f = fornecedores.find((x) => x.id === id);
    if (!f) throw new ErroFrete("Fornecedor de um dos produtos não encontrado.");
    const doPacote = itens.filter((i) => i.produto.fornecedorId === id);
    return {
      fornecedor: f,
      itens: doPacote,
      volume: volumeDe(doPacote),
      valorItens: arred(doPacote.reduce((s, i) => s + (i.produto.preco ?? 0) * i.quantidade, 0)),
      // Grátis para o cliente quando o frete é da loja ou do fornecedor, ou quando todos os itens têm frete grátis
      freteGratisTotal: f.frete_modelo !== "cliente" || doPacote.every((i) => i.produto.freteGratis),
    };
  });
}

// Cota um pacote. Se só parte dos itens tem frete grátis, o cliente paga o frete dos outros itens.
export async function cotarPacote(pacote: Pacote, cepDestino: string): Promise<OpcaoPacote[]> {
  const real = await cotar(pacote.fornecedor.cep, cepDestino, paraCotacao(pacote.itens));
  // Frete grátis: a loja paga o envio mais barato; as opções mais rápidas o cliente paga a diferença.
  if (pacote.freteGratisTotal) {
    const maisBarato = real[0]?.preco ?? 0;
    return real.map((o) => ({ ...o, precoReal: o.preco, precoCliente: arred(o.preco - maisBarato) }));
  }

  const pagos = pacote.itens.filter((i) => !i.produto.freteGratis);
  if (pagos.length === pacote.itens.length) return real.map((o) => ({ ...o, precoReal: o.preco, precoCliente: o.preco }));

  const cliente = await cotar(pacote.fornecedor.cep, cepDestino, paraCotacao(pagos));
  return real.map((o) => ({
    ...o,
    precoReal: o.preco,
    precoCliente: Math.min(cliente.find((c) => c.id === o.id)?.preco ?? o.preco, o.preco),
  }));
}
