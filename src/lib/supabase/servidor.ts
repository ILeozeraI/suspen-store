import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

// Cliente com a sessão de quem está logado (usado no painel admin).
export async function supabaseComSessao() {
  const loja = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => loja.getAll(),
      setAll: (lista) => {
        try {
          for (const { name, value, options } of lista) loja.set(name, value, options);
        } catch {
          // Chamado de um Server Component: o middleware já cuida de renovar a sessão.
        }
      },
    },
  });
}
