// Integração com o Mercado Pago (Checkout Pro).
//
// Como funciona: o site cria uma "preferência" de pagamento com os itens do carrinho e o
// Mercado Pago devolve um link. O cliente é levado para a página do Mercado Pago e paga lá
// (Pix, cartão ou boleto). Os dados do cartão NUNCA passam pelo nosso site.
//
// Status: código pronto, mas DESLIGADO até:
//   1. o Gilberto ter o MEI e a conta Mercado Pago no CNPJ;
//   2. os produtos terem preço (produtos sem preço não podem ser pagos no site);
//   3. a chave MP_ACCESS_TOKEN estar no .env.local (teste) e na Vercel (produção);
//   4. NEXT_PUBLIC_PAGAMENTO_ONLINE=true.
// Frete (Melhor Envio) entra na fase 3 junto com isto.

import "server-only";

export type ItemPagamento = {
  id: string;
  titulo: string;
  quantidade: number;
  precoUnitario: number;
  imagem?: string;
};

export async function criarPagamento(itens: ItemPagamento[]) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN não configurado");

  const site = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

  const resposta = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      items: itens.map((i) => ({
        id: i.id,
        title: i.titulo,
        quantity: i.quantidade,
        unit_price: i.precoUnitario,
        currency_id: "BRL",
        picture_url: i.imagem ? `${site}${i.imagem}` : undefined,
      })),
      payment_methods: { installments: 12 },
      back_urls: {
        success: `${site}/pedido/concluido`,
        pending: `${site}/pedido/pendente`,
        failure: `${site}/carrinho?pagamento=falhou`,
      },
      auto_return: "approved",
      statement_descriptor: "SUSPEN STORE",
    }),
    cache: "no-store",
  });

  if (!resposta.ok) {
    const erro = await resposta.text();
    throw new Error(`Mercado Pago recusou a criação do pagamento: ${resposta.status} ${erro}`);
  }

  const dados = (await resposta.json()) as { id: string; init_point: string; sandbox_init_point: string };
  // Com credencial de teste, o link de pagamento é o sandbox_init_point.
  const teste = token.startsWith("TEST-");
  return { id: dados.id, link: teste ? dados.sandbox_init_point : dados.init_point };
}
