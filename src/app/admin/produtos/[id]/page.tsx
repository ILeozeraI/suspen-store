import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirAdmin } from "@/lib/admin";
import type { LinhaProduto } from "@/lib/catalogo";
import { Avisos } from "@/components/admin/Avisos";
import { BotaoExcluir } from "@/components/admin/BotaoExcluir";
import { FormProduto } from "@/components/admin/FormProduto";
import { TopoAdmin } from "@/components/admin/TopoAdmin";

export const dynamic = "force-dynamic";

export default async function EditarProduto({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const { erro } = await searchParams;
  const { sb, user } = await exigirAdmin();
  const { data } = await sb.from("produtos").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as LinhaProduto;

  return (
    <>
      <TopoAdmin email={user.email} />
      <div className="admin__conteudo">
        <Link href="/admin" className="admin__voltar">
          ← Produtos
        </Link>
        <div className="admin__titulo">
          <h1>{p.nome}</h1>
          {p.ativo && (
            <Link href={`/produto/${p.slug}`} target="_blank">
              Ver no site ↗
            </Link>
          )}
        </div>
        <Avisos erro={erro} />
        <FormProduto p={p} />
        <div className="admin__zona-perigo">
          <BotaoExcluir id={p.id} nome={p.nome} />
        </div>
      </div>
    </>
  );
}
