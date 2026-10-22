import Image from "next/image";
import Link from "next/link";
import { buscarCategoria, formatarPreco } from "@/data/produtos";
import { exigirAdmin } from "@/lib/admin";
import type { LinhaProduto } from "@/lib/catalogo";
import { Avisos } from "@/components/admin/Avisos";
import { TopoAdmin } from "@/components/admin/TopoAdmin";

export const dynamic = "force-dynamic";

export default async function PainelAdmin({ searchParams }: { searchParams: Promise<{ erro?: string; ok?: string }> }) {
  const { erro, ok } = await searchParams;
  const { sb, user } = await exigirAdmin();
  const { data, error } = await sb.from("produtos").select("*").order("ordem").order("nome");
  const lista = (data ?? []) as LinhaProduto[];

  return (
    <>
      <TopoAdmin email={user.email} aba="produtos" />
      <div className="admin__conteudo">
        <div className="admin__titulo">
          <h1>Produtos ({lista.length})</h1>
          <Link href="/admin/produtos/novo" className="btn btn--vermelho">
            + Novo produto
          </Link>
        </div>
        <Avisos erro={erro ?? error?.message} ok={ok} />

        <div className="admin__tabela">
          {lista.map((p) => (
            <Link key={p.id} href={`/admin/produtos/${p.id}`} className={`admin__linha ${p.ativo ? "" : "admin__linha--oculto"}`}>
              <Image src={p.imagem} alt="" width={64} height={64} />
              <div>
                <strong>{p.nome}</strong>
                <small>
                  {buscarCategoria(p.categoria)?.nome} · {p.montadora}
                  {!p.ativo && " · fora do site"}
                  {p.destaque && " · destaque"}
                </small>
              </div>
              <span>{p.preco ? formatarPreco(Number(p.preco)) : "Consulte"}</span>
              <span>{p.estoque === null ? "—" : p.estoque === 0 ? "Esgotado" : `${p.estoque} un.`}</span>
              <span className="admin__editar">Editar →</span>
            </Link>
          ))}
          {lista.length === 0 && <p>Nenhum produto cadastrado ainda.</p>}
        </div>
      </div>
    </>
  );
}
