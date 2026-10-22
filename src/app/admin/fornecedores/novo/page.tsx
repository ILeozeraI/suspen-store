import Link from "next/link";
import { exigirAdmin } from "@/lib/admin";
import { Avisos } from "@/components/admin/Avisos";
import { FormFornecedor } from "@/components/admin/FormFornecedor";
import { TopoAdmin } from "@/components/admin/TopoAdmin";

export const dynamic = "force-dynamic";

export default async function NovoFornecedor({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const { user } = await exigirAdmin();
  return (
    <>
      <TopoAdmin email={user.email} aba="fornecedores" />
      <div className="admin__conteudo">
        <Link href="/admin/fornecedores" className="admin__voltar">
          ← Fornecedores
        </Link>
        <h1>Novo fornecedor</h1>
        <Avisos erro={erro} />
        <FormFornecedor />
      </div>
    </>
  );
}
