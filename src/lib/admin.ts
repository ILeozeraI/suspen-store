import "server-only";
import { redirect } from "next/navigation";
import { supabaseConfigurado } from "./supabase/config";
import { supabaseComSessao } from "./supabase/servidor";

// Garante que quem está acessando é administrador. Se não for, manda para o login.
// A segurança de verdade está no banco (RLS): mesmo que alguém pule esta checagem,
// o Supabase recusa qualquer alteração de quem não está na tabela "admins".
export async function exigirAdmin() {
  if (!supabaseConfigurado) redirect("/admin/login?erro=" + encodeURIComponent("Supabase não configurado."));
  const sb = await supabaseComSessao();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: ehAdmin } = await sb.rpc("is_admin");
  if (!ehAdmin) {
    await sb.auth.signOut();
    redirect("/admin/login?erro=" + encodeURIComponent("Este usuário não tem acesso ao painel."));
  }
  return { sb, user };
}
