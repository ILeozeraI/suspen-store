import "server-only";
// Integração com o Mercado Pago, Checkout Transparente (o cliente paga sem sair do site).
//
// Os dados do cartão NUNCA passam pelo nosso servidor: o formulário do Mercado Pago (Payment Brick) roda no
// navegador e troca o cartão por um "token". O servidor só recebe esse token e cria o pagamento.
//
// Variáveis (Vercel > Environment Variables):
//   NEXT_PUBLIC_MP_PUBLIC_KEY  chave pública (pode ir para o navegador)
//   MP_ACCESS_TOKEN            chave secreta (tipo Secret, nunca no código)
//   MP_WEBHOOK_SECRET          assinatura secreta das notificações (painel do MP > Webhooks)

import crypto from "node:crypto";

const TOKEN = process.env.MP_ACCESS_TOKEN ?? "";
export const mpConfigurado = Boolean(TOKEN && process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);

export type PagamentoMP = {
  id: number;
  status: string; // approved, pending, in_process, rejected, cancelled, refunded, charged_back
  status_detail: string;
  payment_method_id: string;
  payment_type_id: string; // credit_card, debit_card, bank_transfer (pix), ticket (boleto)
  installments: number;
  transaction_amount: number;
  external_reference: string | null;
  date_approved: string | null;
  fee_details?: { type: string; amount: number; fee_payer: string }[];
  transaction_details?: { net_received_amount?: number; external_resource_url?: string | null };
  point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string; ticket_url?: string } };
};

async function mp<T>(caminho: string, init: RequestInit & { idempotencia?: string } = {}): Promise<T> {
  if (!TOKEN) throw new Error("MP_ACCESS_TOKEN não configurado.");
  const r = await fetch(`https://api.mercadopago.com${caminho}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init.idempotencia ? { "X-Idempotency-Key": init.idempotencia } : {}),
    },
    cache: "no-store",
  });
  const dados = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Mercado Pago (${r.status}): ${JSON.stringify(dados).slice(0, 300)}`);
  return dados as T;
}

// Campos do formulário do Brick que repassamos ao Mercado Pago. O valor é SEMPRE o calculado no servidor.
export type DadosBrick = {
  token?: string;
  payment_method_id: string;
  issuer_id?: string | number;
  installments?: number;
  payer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    identification?: { type?: string; number?: string };
    address?: Record<string, string>;
  };
  transaction_details?: { financial_institution?: string };
};

export async function criarPagamento(opts: {
  dados: DadosBrick;
  valor: number;
  pedidoId: string;
  pedidoNumero: number;
  urlNotificacao: string;
  cliente: { nome: string; email: string; cpf: string };
}) {
  const [primeiro, ...resto] = opts.cliente.nome.trim().split(/\s+/);
  const d = opts.dados;
  const corpo = {
    transaction_amount: opts.valor,
    description: `Pedido ${opts.pedidoNumero} - Suspen Store`,
    payment_method_id: d.payment_method_id,
    ...(d.token ? { token: d.token } : {}),
    ...(d.issuer_id ? { issuer_id: Number(d.issuer_id) } : {}),
    installments: d.installments ?? 1,
    ...(d.transaction_details?.financial_institution ? { transaction_details: d.transaction_details } : {}),
    payer: {
      email: d.payer?.email || opts.cliente.email,
      first_name: d.payer?.first_name || primeiro,
      last_name: d.payer?.last_name || resto.join(" ") || primeiro,
      identification: d.payer?.identification?.number
        ? d.payer.identification
        : { type: "CPF", number: opts.cliente.cpf },
      ...(d.payer?.address ? { address: d.payer.address } : {}),
    },
    external_reference: opts.pedidoId,
    notification_url: opts.urlNotificacao.startsWith("https://") ? opts.urlNotificacao : undefined,
    statement_descriptor: "SUSPENSTORE",
  };
  return mp<PagamentoMP>("/v1/payments", { method: "POST", body: JSON.stringify(corpo), idempotencia: opts.pedidoId });
}

export function buscarPagamento(id: string | number) {
  return mp<PagamentoMP>(`/v1/payments/${id}`);
}

// Confere a assinatura do webhook (cabeçalho x-signature), para ninguém fingir ser o Mercado Pago.
// https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
export function assinaturaValida(xSignature: string | null, xRequestId: string | null, dataId: string) {
  const segredo = process.env.MP_WEBHOOK_SECRET;
  if (!segredo) return true; // sem segredo configurado, a segurança vem de sempre consultar o pagamento na API
  if (!xSignature) return false;
  const partes = Object.fromEntries(xSignature.split(",").map((p) => p.trim().split("=") as [string, string]));
  if (!partes.ts || !partes.v1) return false;
  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifesto = `id:${id};${xRequestId ? `request-id:${xRequestId};` : ""}ts:${partes.ts};`;
  const esperado = crypto.createHmac("sha256", segredo).update(manifesto).digest("hex");
  return esperado.length === partes.v1.length && crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(partes.v1));
}

// Traduz o pagamento do Mercado Pago para os campos do nosso pedido.
export function camposDoPagamento(p: PagamentoMP) {
  const status =
    p.status === "approved"
      ? "pago"
      : p.status === "rejected"
        ? "recusado"
        : p.status === "cancelled"
          ? "cancelado"
          : p.status === "refunded" || p.status === "charged_back"
            ? "reembolsado"
            : "aguardando_pagamento";
  const metodo =
    p.payment_type_id === "bank_transfer" || p.payment_method_id === "pix"
      ? "pix"
      : p.payment_type_id === "ticket"
        ? "boleto"
        : "cartao";
  const taxa = (p.fee_details ?? []).filter((f) => f.fee_payer === "collector").reduce((s, f) => s + Number(f.amount), 0);
  const td = p.point_of_interaction?.transaction_data;
  return {
    status,
    metodo,
    parcelas: p.installments ?? 1,
    mp_payment_id: String(p.id),
    mp_status: p.status,
    mp_status_detail: p.status_detail,
    taxa_pagamento: Math.round(taxa * 100) / 100,
    pix_copia_cola: td?.qr_code ?? null,
    pix_qr_base64: td?.qr_code_base64 ?? null,
    boleto_url: p.transaction_details?.external_resource_url ?? td?.ticket_url ?? null,
    pago_em: p.status === "approved" ? (p.date_approved ?? new Date().toISOString()) : null,
  } as const;
}
