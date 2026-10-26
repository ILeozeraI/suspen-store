// Mantém o projeto do Supabase ativo. No plano grátis, o Supabase pausa o projeto depois de 7 dias sem uso.
// A Vercel chama este endereço uma vez por dia (vercel.json > crons), e ele faz uma leitura simples no banco.
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigurado } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Se CRON_SECRET estiver configurado na Vercel, só a própria Vercel consegue chamar.
  const segredo = process.env.CRON_SECRET;
  if (segredo && req.headers.get("authorization") !== `Bearer ${segredo}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!supabaseConfigurado) return NextResponse.json({ ok: false, motivo: "Supabase não configurado" }, { status: 503 });

  const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { error } = await sb.from("produtos").select("id").limit(1);
  if (error) return NextResponse.json({ ok: false, erro: error.message }, { status: 502 });
  return NextResponse.json({ ok: true, em: new Date().toISOString() });
}
