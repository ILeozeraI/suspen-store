// Contas do painel de vendas. Funções puras: recebem pedidos, itens e envios e devolvem os números.
import type { Envio, Pedido, PedidoItem } from "./tipos";
import { arred } from "./site";

export type LinhaVenda = {
  pedido: Pedido;
  itens: PedidoItem[];
  envios: Envio[];
  vendaProdutos: number;
  freteCobrado: number; // o que o cliente pagou de frete
  freteReal: number; // o que a loja paga no Melhor Envio (estimado até gerar a etiqueta)
  taxa: number; // taxa do Mercado Pago (proporcional, quando filtrado por fornecedor)
  repasse: number; // o que vai para o(s) fornecedor(es): repasses − fretes descontados
  comissao: number;
  lucro: number; // o que sobra para a loja
};

// fornecedorId: quando informado, só conta a parte daquele fornecedor no pedido.
export function calcularLinha(pedido: Pedido, itensTodos: PedidoItem[], enviosTodos: Envio[], fornecedorId?: string): LinhaVenda {
  const itens = fornecedorId ? itensTodos.filter((i) => i.fornecedor_id === fornecedorId) : itensTodos;
  const envios = fornecedorId ? enviosTodos.filter((e) => e.fornecedor_id === fornecedorId) : enviosTodos;

  const vendaProdutos = arred(itens.reduce((s, i) => s + Number(i.preco_unitario) * i.quantidade, 0));
  const freteCobrado = arred(envios.reduce((s, e) => s + Number(e.valor_cobrado), 0));
  const freteReal = arred(envios.reduce((s, e) => s + Number(e.valor_real), 0));
  const desconto = arred(envios.reduce((s, e) => s + Number(e.desconto_fornecedor), 0));
  const repasse = arred(itens.reduce((s, i) => s + Number(i.repasse), 0) - desconto);
  const comissao = arred(itens.reduce((s, i) => s + Number(i.comissao), 0));

  const totalPedido = Number(pedido.total) || 1;
  const parte = fornecedorId ? (vendaProdutos + freteCobrado) / totalPedido : 1;
  const taxa = arred(Number(pedido.taxa_pagamento) * parte);

  const lucro = arred(vendaProdutos + freteCobrado - freteReal - taxa - repasse);
  return { pedido, itens, envios, vendaProdutos, freteCobrado, freteReal, taxa, repasse, comissao, lucro };
}

export function somar(linhas: LinhaVenda[]) {
  const s = (k: keyof Omit<LinhaVenda, "pedido" | "itens" | "envios">) => arred(linhas.reduce((t, l) => t + l[k], 0));
  return {
    pedidos: linhas.length,
    vendaProdutos: s("vendaProdutos"),
    freteCobrado: s("freteCobrado"),
    freteReal: s("freteReal"),
    taxa: s("taxa"),
    repasse: s("repasse"),
    comissao: s("comissao"),
    lucro: s("lucro"),
  };
}
