// Notificações do Mercado Pago (pagamento aprovado, Pix pago, boleto compensado, estorno...).
// Nunca confiamos no conteúdo da notificação: consultamos o pagamento direto na API do Mercado Pago.
import { NextResponse } from "next/server";
import { aplicarPagamento } from "@/lib/pedidos";
import { assinaturaValida, buscarPagamento, mpConfigurado } from "@/lib/payments/mercadopago";
import { servicoConfigurado } from "@/lib/supabase/servico";

export async function POST(req: Request) {
  if (!mpConfigurado || !servicoConfigurado) return NextResponse.json({ ok: false }, { status: 503 });
  const url = new URL(req.url);
  const corpo = await req.json().catch(() => ({}) as Record<string, unknown>);
  const tipo = String(url.searchParams.get("type") ?? url.searchParams.get("topic") ?? corpo.type ?? corpo.topic ?? "");
  const id = String(url.searchParams.get("data.id") ?? (corpo.data as { id?: string } | undefined)?.id ?? url.searchParams.get("id") ?? "");

  if (tipo !== "payment" || !id) return NextResponse.json({ ok: true, ignorado: true });
  if (!assinaturaValida(req.headers.get("x-signature"), req.headers.get("x-request-id"), id)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const pagamento = await buscarPagamento(id);
    if (!pagamento.external_reference) return NextResponse.json({ ok: true, ignorado: true });
    await aplicarPagamento(pagamento.external_reference, pagamento);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("webhook MP:", e);
    return NextResponse.json({ ok: false }, { status: 500 }); // o MP tenta de novo depois
  }
}
