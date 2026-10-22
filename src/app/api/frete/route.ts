// Cotação de frete do checkout: um pacote por fornecedor, do CEP dele até o CEP do cliente.
import { NextResponse } from "next/server";
import { cotacaoPublica, cotarCarrinho, ErroCheckout, ErroFrete, lerCep, validarCarrinho } from "@/lib/checkout";
import { freteConfigurado } from "@/lib/frete/melhorenvio";

export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_PAGAMENTO_ONLINE !== "true" || !freteConfigurado) {
    return NextResponse.json({ erro: "Cálculo de frete ainda não está ativo. Finalize pelo WhatsApp." }, { status: 503 });
  }
  try {
    const corpo = await req.json();
    const itens = await validarCarrinho(corpo?.itens);
    const cep = lerCep(corpo?.cep);
    return NextResponse.json({ pacotes: cotacaoPublica(await cotarCarrinho(itens, cep)) });
  } catch (e) {
    if (e instanceof ErroCheckout || e instanceof ErroFrete) return NextResponse.json({ erro: e.message }, { status: 400 });
    console.error(e);
    return NextResponse.json({ erro: "Não consegui calcular o frete agora. Tente de novo ou fale no WhatsApp." }, { status: 502 });
  }
}
