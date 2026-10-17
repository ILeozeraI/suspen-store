// Recebe o carrinho do cliente e devolve o link de pagamento do Mercado Pago.
// Os preços são SEMPRE recalculados aqui no servidor, a partir do catálogo.
// Nunca confiamos no preço que vem do navegador.

import { NextResponse } from "next/server";
import { buscarProduto } from "@/data/produtos";
import { criarPagamento } from "@/lib/payments/mercadopago";

export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_PAGAMENTO_ONLINE !== "true") {
    return NextResponse.json({ erro: "Pagamento online ainda não está ativo." }, { status: 503 });
  }

  let corpo: { itens?: { slug: string; quantidade: number }[] };
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const itens = [];
  for (const i of corpo.itens ?? []) {
    const p = buscarProduto(i.slug);
    const qtd = Math.floor(Number(i.quantidade));
    if (!p || !Number.isFinite(qtd) || qtd < 1 || qtd > 20) {
      return NextResponse.json({ erro: "Item inválido no carrinho." }, { status: 400 });
    }
    if (!p.preco) {
      return NextResponse.json({ erro: `"${p.nome}" ainda não tem preço. Finalize pelo WhatsApp.` }, { status: 400 });
    }
    itens.push({ id: p.slug, titulo: p.nome, quantidade: qtd, precoUnitario: p.preco, imagem: p.imagem });
  }
  if (itens.length === 0) return NextResponse.json({ erro: "Carrinho vazio." }, { status: 400 });

  try {
    const pagamento = await criarPagamento(itens);
    return NextResponse.json({ link: pagamento.link });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ erro: "Não foi possível iniciar o pagamento. Tente pelo WhatsApp." }, { status: 502 });
  }
}
