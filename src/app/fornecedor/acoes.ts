"use server";
import { redirect } from "next/navigation";
import { exigirFornecedor } from "@/lib/fornecedor";
import { supabaseComSessao } from "@/lib/supabase/servidor";

export async function entrarFornecedor(form: FormData) {
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");
  const sb = await supabaseComSessao();
  const { error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error) redirect("/fornecedor/login?erro=" + encodeURIComponent("E-mail ou senha incorretos."));
  redirect("/fornecedor");
}

export async function sairFornecedor() {
  const sb = await supabaseComSessao();
  await sb.auth.signOut();
  redirect("/fornecedor/login");
}

export async function marcarPostado(form: FormData) {
  const { sb } = await exigirFornecedor();
  await sb.rpc("portal_marcar_postado", { envio: String(form.get("envio_id")) });
  redirect("/fornecedor?ok=" + encodeURIComponent("Pacote marcado como postado."));
}
