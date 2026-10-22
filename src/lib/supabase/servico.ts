import "server-only";
// Cliente com a CHAVE SECRETA do Supabase. Ignora as regras RLS, então só roda no servidor e só é usado onde
// não existe um admin logado: criar o pedido no checkout, confirmar pagamento (webhook), calcular frete
// (precisa do CEP do fornecedor) e criar o login de um fornecedor.
// A chave fica em SUPABASE_SECRET_KEY (Vercel > Environment Variables, tipo Secret). Nunca no código.
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

const SECRETA = process.env.SUPABASE_SECRET_KEY ?? "";
export const servicoConfigurado = Boolean(SUPABASE_URL && SECRETA);

export function supabaseServico() {
  if (!servicoConfigurado) throw new Error("SUPABASE_SECRET_KEY não configurada.");
  return createClient(SUPABASE_URL, SECRETA, { auth: { persistSession: false, autoRefreshToken: false } });
}
