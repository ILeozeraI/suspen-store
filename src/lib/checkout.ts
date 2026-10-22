import "server-only";
// Montagem do pedido no servidor: confere produtos, preços, estoque e frete.
// Nada que vem do navegador é usado como preço: só os slugs, as quantidades e o serviço de frete escolhido.

import { listarProdutos } from "@/lib/catalogo";
import { cotarPacote, ErroFrete, montarPacotes, type ItemPacote, type OpcaoPacote, type Pacote } from "@/lib/frete/pacotes";
import { soNumeros } from "@/lib/site";

export class ErroCheckout extends Error {}
export { ErroFrete };

export type ItemEntrada = { slug: string; quantidade: number };

export async function validarCarrinho(entrada: unknown): Promise<ItemPacote[]> {
  if (!Array.isArray(entrada) || entrada.length === 0) throw new ErroCheckout("Carrinho vazio.");
  if (entrada.length > 30) throw new ErroCheckout("Carrinho com itens demais.");
  const catalogo = await listarProdutos();
  const juntos = new Map<string, number>();
  for (const i of entrada as ItemEntrada[]) {
    const q = Math.floor(Number(i?.quantidade));
    if (typeof i?.slug !== "string" || !Number.isFinite(q) || q < 1 || q > 20) throw new ErroCheckout("Item inválido no carrinho.");
    juntos.set(i.slug, (juntos.get(i.slug) ?? 0) + q);
  }
  return [...juntos].map(([slug, quantidade]) => {
    const produto = catalogo.find((p) => p.slug === slug);
    if (!produto) throw new ErroCheckout("Um dos produtos saiu do catálogo. Atualize o carrinho.");
    if (!produto.preco) throw new ErroCheckout(`"${produto.nome}" ainda não tem preço no site. Finalize pelo WhatsApp.`);
    if (produto.estoque !== null && produto.estoque !== undefined && quantidade > produto.estoque)
      throw new ErroCheckout(
        produto.estoque === 0 ? `"${produto.nome}" esgotou.` : `Só temos ${produto.estoque} unidade(s) de "${produto.nome}".`
      );
    return { produto, quantidade };
  });
}

export function lerCep(v: unknown) {
  const cep = soNumeros(v);
  if (cep.length !== 8) throw new ErroCheckout("CEP inválido.");
  return cep;
}

export type PacoteCotado = { pacote: Pacote; opcoes: OpcaoPacote[] };

export async function cotarCarrinho(itens: ItemPacote[], cep: string): Promise<PacoteCotado[]> {
  const pacotes = await montarPacotes(itens);
  return Promise.all(
    pacotes.map(async (pacote) => {
      const opcoes = await cotarPacote(pacote, cep);
      if (opcoes.length === 0) throw new ErroFrete("Nenhuma transportadora entrega neste CEP. Fale com a gente no WhatsApp.");
      return { pacote, opcoes };
    })
  );
}

// O que o navegador pode ver da cotação (sem nome do fornecedor nem custo real).
export function cotacaoPublica(cotados: PacoteCotado[]) {
  return cotados.map(({ pacote, opcoes }, n) => ({
    id: pacote.fornecedor.id,
    titulo: `Pacote ${n + 1}`,
    origem: `${pacote.fornecedor.cidade}/${pacote.fornecedor.uf}`,
    itens: pacote.itens.map((i) => `${i.quantidade}x ${i.produto.nome}`),
    opcoes: opcoes.map((o) => ({ id: o.id, nome: o.nome, transportadora: o.transportadora, prazo: o.prazo, preco: o.precoCliente })),
  }));
}

export function cpfValido(v: string) {
  const c = soNumeros(v);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  const dig = (n: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += Number(c[i]) * (n + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dig(9) === Number(c[9]) && dig(10) === Number(c[10]);
}
