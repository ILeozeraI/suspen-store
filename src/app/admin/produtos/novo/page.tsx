import Link from "next/link";
import { exigirAdmin } from "@/lib/admin";
import { Avisos } from "@/components/admin/Avisos";
import { FormProduto } from "@/components/admin/FormProduto";
import { TopoAdmin } from "@/components/admin/TopoAdmin";

export const dynamic = "force-dynamic";

export default async function NovoProduto({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const { user } = await exigirAdmin();
  return (
    <>
      <TopoAdmin email={user.email} />
      <div className="admin__conteudo">
        <Link href="/admin" className="admin__voltar">
          ← Produtos
        </Link>
        <h1>Novo produto</h1>
        <Avisos erro={erro} />
        <FormProduto />
      </div>
    </>
  );
}
