import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// Saldo de cada fornecedor = repasses do que foi vendido e pago − fretes descontados dele − acertos já feitos.
export async function saldosFornecedores(sb: SupabaseClient) {
  const [{ data: itens }, { data: envios }, { data: acertos }] = await Promise.all([
    sb.from("pedido_itens").select("fornecedor_id, repasse, pedidos!inner(status)").eq("pedidos.status", "pago"),
    sb.from("envios").select("fornecedor_id, desconto_fornecedor, pedidos!inner(status)").eq("pedidos.status", "pago"),
    sb.from("acertos").select("fornecedor_id, valor"),
  ]);
  const mapa: Record<string, { repasse: number; descontos: number; pago: number; saldo: number }> = {};
  const de = (id: string) => (mapa[id] ??= { repasse: 0, descontos: 0, pago: 0, saldo: 0 });
  for (const i of itens ?? []) if (i.fornecedor_id) de(i.fornecedor_id).repasse += Number(i.repasse);
  for (const e of envios ?? []) if (e.fornecedor_id) de(e.fornecedor_id).descontos += Number(e.desconto_fornecedor);
  for (const a of acertos ?? []) de(a.fornecedor_id).pago += Number(a.valor);
  for (const k in mapa) {
    const m = mapa[k];
    m.saldo = Math.round((m.repasse - m.descontos - m.pago) * 100) / 100;
  }
  return mapa;
}
