import Link from "next/link";
import { exigirAdmin } from "@/lib/admin";
import { Avisos } from "@/components/admin/Avisos";
import { FormProduto } from "@/components/admin/FormProduto";
import { TopoAdmin } from "@/components/admin/TopoAdmin";

export const dynamic = "force-dynamic";

export default async function NovoProduto({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const { sb, user } = await exigirAdmin();
  const { data: fornecedores } = await sb.from("fornecedores").select("id, nome, cidade, uf").eq("ativo", true).order("nome");
  return (
    <>
      <TopoAdmin email={user.email} aba="produtos" />
      <div className="admin__conteudo">
        <Link href="/admin" className="admin__voltar">
          ← Produtos
        </Link>
        <h1>Novo produto</h1>
        <Avisos erro={erro} />
        <FormProduto fornecedores={fornecedores ?? []} />
      </div>
    </>
  );
}
