import Link from "next/link";
import { notFound } from "next/navigation";
import { criarAcesso, excluirAcerto, registrarAcerto, removerAcesso } from "../acoes";
import { formatarPreco } from "@/data/produtos";
import { exigirAdmin } from "@/lib/admin";
import { saldosFornecedores } from "@/lib/saldos";
import type { Fornecedor } from "@/lib/tipos";
import { Avisos } from "@/components/admin/Avisos";
import { BotaoEnviar } from "@/components/admin/BotaoEnviar";
import { FormFornecedor } from "@/components/admin/FormFornecedor";
import { TopoAdmin } from "@/components/admin/TopoAdmin";

export const dynamic = "force-dynamic";

export default async function EditarFornecedor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string; ok?: string }>;
}) {
  const { id } = await params;
  const { erro, ok } = await searchParams;
  const { sb, user } = await exigirAdmin();
  const { data } = await sb.from("fornecedores").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const f = data as Fornecedor;
  const [saldos, { data: acertos }, { data: produtos }] = await Promise.all([
    saldosFornecedores(sb),
    sb.from("acertos").select("*").eq("fornecedor_id", id).order("data", { ascending: false }),
    sb.from("produtos").select("id, nome").eq("fornecedor_id", id).order("nome"),
  ]);
  const s = saldos[id] ?? { repasse: 0, descontos: 0, pago: 0, saldo: 0 };
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <>
      <TopoAdmin email={user.email} aba="fornecedores" />
      <div className="admin__conteudo">
        <Link href="/admin/fornecedores" className="admin__voltar">
          ← Fornecedores
        </Link>
        <div className="admin__titulo">
          <h1>{f.nome}</h1>
          <Link href={`/admin/vendas?fornecedor=${f.id}`}>Ver vendas →</Link>
        </div>
        <Avisos erro={erro} ok={ok} />

        <div className="admin__resumo">
          <div>
            <span>Repasse das vendas pagas</span>
            <strong>{formatarPreco(s.repasse)}</strong>
          </div>
          <div>
            <span>Fretes descontados</span>
            <strong>{formatarPreco(s.descontos)}</strong>
          </div>
          <div>
            <span>Já pago ao fornecedor</span>
            <strong>{formatarPreco(s.pago)}</strong>
          </div>
          <div className={s.saldo > 0 ? "negativo" : "positivo"}>
            <span>Saldo a pagar</span>
            <strong>{formatarPreco(s.saldo)}</strong>
          </div>
        </div>

        <FormFornecedor f={f} />

        <section className="admin__bloco">
          <h2>Acertos (pagamentos ao fornecedor)</h2>
          <form action={registrarAcerto} className="admin__linha-form">
            <input type="hidden" name="fornecedor_id" value={f.id} />
            <label>
              Valor (R$)
              <input name="valor" inputMode="decimal" required placeholder="1250,00" />
            </label>
            <label>
              Data
              <input name="data" type="date" defaultValue={hoje} />
            </label>
            <label style={{ flex: 1, minWidth: 180 }}>
              Observação
              <input name="observacao" placeholder="Pix referente a outubro" />
            </label>
            <BotaoEnviar texto="Registrar acerto" enviando="Salvando..." className="btn btn--escuro" />
          </form>
          {(acertos ?? []).length > 0 && (
            <div className="admin__rolar">
              <table className="admin__grade">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Observação</th>
                    <th className="num">Valor</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(acertos ?? []).map((a) => (
                    <tr key={a.id}>
                      <td>{new Date(a.data + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                      <td>{a.observacao}</td>
                      <td className="num">{formatarPreco(Number(a.valor))}</td>
                      <td>
                        <form action={excluirAcerto}>
                          <input type="hidden" name="fornecedor_id" value={f.id} />
                          <input type="hidden" name="acerto_id" value={a.id} />
                          <button type="submit" className="admin__link-perigo">
                            Excluir
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin__bloco">
          <h2>Login da área do fornecedor</h2>
          {f.user_id ? (
            <>
              <p>
                Este fornecedor entra em <strong>/fornecedor</strong> com o e-mail <strong>{f.email}</strong>. Ele vê o que
                vendeu, a comissão, os fretes da conta dele, o saldo e as etiquetas para imprimir. Não vê dados do cliente.
              </p>
              <form action={removerAcesso}>
                <input type="hidden" name="id" value={f.id} />
                <button type="submit" className="btn admin__perigo">
                  Remover login
                </button>
              </form>
            </>
          ) : (
            <form action={criarAcesso} className="admin__linha-form">
              <input type="hidden" name="id" value={f.id} />
              <label>
                E-mail do fornecedor
                <input name="email" type="email" required defaultValue={f.email ?? ""} />
              </label>
              <label>
                Senha inicial (mín. 8)
                <input name="senha" type="text" required minLength={8} autoComplete="off" />
              </label>
              <BotaoEnviar texto="Criar login" enviando="Criando..." className="btn btn--escuro" />
            </form>
          )}
        </section>

        <section className="admin__bloco">
          <h2>Produtos deste fornecedor ({(produtos ?? []).length})</h2>
          {(produtos ?? []).length ? (
            <ul>
              {(produtos ?? []).map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/produtos/${p.id}`}>{p.nome}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin__dica">Nenhum produto ainda. Escolha o fornecedor no cadastro do produto.</p>
          )}
        </section>
      </div>
    </>
  );
}
