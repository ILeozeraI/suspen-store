import Link from "next/link";
import { formatarPreco } from "@/data/produtos";
import { exigirAdmin } from "@/lib/admin";
import { saldosFornecedores } from "@/lib/saldos";
import type { Fornecedor } from "@/lib/tipos";
import { Avisos } from "@/components/admin/Avisos";
import { TopoAdmin } from "@/components/admin/TopoAdmin";

export const dynamic = "force-dynamic";

export default async function Fornecedores({ searchParams }: { searchParams: Promise<{ erro?: string; ok?: string }> }) {
  const { erro, ok } = await searchParams;
  const { sb, user } = await exigirAdmin();
  const [{ data, error }, { data: prods }, saldos] = await Promise.all([
    sb.from("fornecedores").select("*").order("nome"),
    sb.from("produtos").select("fornecedor_id"),
    saldosFornecedores(sb),
  ]);
  const lista = (data ?? []) as Fornecedor[];
  const qtdProdutos = (id: string) => (prods ?? []).filter((p) => p.fornecedor_id === id).length;

  return (
    <>
      <TopoAdmin email={user.email} aba="fornecedores" />
      <div className="admin__conteudo admin__conteudo--largo">
        <div className="admin__titulo">
          <h1>Fornecedores ({lista.length})</h1>
          <Link href="/admin/fornecedores/novo" className="btn btn--vermelho">
            + Novo fornecedor
          </Link>
        </div>
        <Avisos erro={erro ?? error?.message} ok={ok} />
        <div className="admin__rolar">
          <table className="admin__grade">
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th>Cidade</th>
                <th className="num">Produtos</th>
                <th>Acesso</th>
                <th className="num">A pagar</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((f) => (
                <tr key={f.id} style={f.ativo ? undefined : { opacity: 0.55 }}>
                  <td>
                    <strong>{f.nome}</strong>
                  </td>
                  <td>
                    {f.cidade}/{f.uf}
                  </td>
                  <td className="num">{qtdProdutos(f.id)}</td>
                  <td>{f.user_id ? <span className="selo selo--pago">Tem login</span> : <span className="selo">Sem login</span>}</td>
                  <td className="num">{formatarPreco(saldos[f.id]?.saldo ?? 0)}</td>
                  <td>
                    <Link href={`/admin/fornecedores/${f.id}`}>Abrir →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="admin__dica">
          &quot;A pagar&quot; = repasse das vendas pagas, menos fretes descontados, menos acertos já registrados.
        </p>
      </div>
    </>
  );
}
