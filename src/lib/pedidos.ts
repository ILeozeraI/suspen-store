import "server-only";
// Regras de pedido usadas pelo checkout e pelo webhook do Mercado Pago.

import { camposDoPagamento, type PagamentoMP } from "@/lib/payments/mercadopago";
import { supabaseServico } from "@/lib/supabase/servico";

// Grava o resultado do pagamento no pedido. Na primeira vez que fica "pago", baixa o estoque.
export async function aplicarPagamento(pedidoId: string, pagamento: PagamentoMP) {
  const sb = supabaseServico();
  const campos = camposDoPagamento(pagamento);
  const { data: antes } = await sb.from("pedidos").select("status, pix_copia_cola").eq("id", pedidoId).single();
  if (!antes) throw new Error(`Pedido ${pedidoId} não encontrado.`);

  const atualizacao: Record<string, unknown> = { ...campos };
  // O QR do Pix só vem na criação; consultas depois podem vir sem ele. Não apagar.
  if (!campos.pix_copia_cola) {
    delete atualizacao.pix_copia_cola;
    delete atualizacao.pix_qr_base64;
  }
  if (!campos.pago_em) delete atualizacao.pago_em;
  // Pedido pago não volta para "aguardando" por notificação atrasada
  if (antes.status === "pago" && campos.status === "aguardando_pagamento") delete atualizacao.status;

  const { error } = await sb.from("pedidos").update(atualizacao).eq("id", pedidoId);
  if (error) throw new Error(error.message);

  if (antes.status !== "pago" && campos.status === "pago") {
    await sb.rpc("baixar_estoque", { pedido: pedidoId });
  }
  return campos.status;
}
