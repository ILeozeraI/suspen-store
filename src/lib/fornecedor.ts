import "server-only";
import { redirect } from "next/navigation";
import { supabaseConfigurado } from "./supabase/config";
import { supabaseComSessao } from "./supabase/servidor";

// Garante que quem acessa /fornecedor tem login de fornecedor ativo.
export async function exigirFornecedor() {
  if (!supabaseConfigurado) redirect("/fornecedor/login");
  const sb = await supabaseComSessao();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/fornecedor/login");
  const { data: f } = await sb.from("fornecedores").select("id, nome, frete_modelo, modelo").eq("user_id", user.id).eq("ativo", true).maybeSingle();
  if (!f) {
    await sb.auth.signOut();
    redirect("/fornecedor/login?erro=" + encodeURIComponent("Este login não está ligado a um fornecedor ativo."));
  }
  return { sb, user, fornecedor: f };
}
