// Endereço e chave pública do Supabase.
// A "publishable key" pode aparecer no navegador: quem protege os dados são as regras (RLS) do banco,
// definidas em supabase/schema.sql. A chave secreta (service_role) NUNCA é usada neste projeto.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const supabaseConfigurado = Boolean(SUPABASE_URL && SUPABASE_KEY);
