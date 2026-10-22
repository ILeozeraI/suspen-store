import Image from "next/image";
import { marcarPostado, sairFornecedor } from "./acoes";
import { formatarPreco } from "@/data/produtos";
import { exigirFornecedor } from "@/lib/fornecedor";
import { NOME_STATUS } from "@/lib/tipos";
import { Avisos } from "@/components/admin/Avisos";
import { BotaoEnviar } from "@/components/admin/BotaoEnviar";

export const dynamic = "force-dynamic";

type Venda = { pedido_numero: number; data: string; origem: string; produto: string; quantidade: number; valor_venda: number; comissao: number; repasse: number };
type Frete = { pedido_numero: number; data: string; quem_paga: string; valor: number; desconto: number };
type EnvioPortal = { envio_id: string; pedido_numero: number; data: string; status: string; servico_nome: string | null; transportadora: string | null; etiqueta_url: string | null; rastreio: string | null; itens: string | null };

function inicioDoMes() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
const dataBR = (d: string) => new Date(d).toLocaleDateString("pt-BR");

// Área do fornecedor: o que ele vendeu, a comissão da loja, os fretes da conta dele, o saldo e as etiquetas.
// Sem dados do cliente. Tudo vem de funções do banco que só devolvem o que é deste fornecedor.
export default async function AreaFornecedor({ searchParams }: { searchParams: Promise<{ de?: string; ate?: string; ok?: string }> }) {
  const sp = await searchParams;
  const { sb, user, fornecedor } = await exigirFornecedor();
  const de = sp.de || inicioDoMes();
  const ate = sp.ate || new Date().toISOString().slice(0, 10);

  const [{ data: saldoData }, { data: vendasData }, { data: fretesData }, { data: enviosData }] = await Promise.all([
    sb.rpc("portal_saldo"),
    sb.rpc("portal_vendas", { de, ate }),
    sb.rpc("portal_fretes", { de, ate }),
    sb.rpc("portal_envios"),
  ]);
  const saldo = (saldoData?.[0] ?? { total_repasse: 0, total_descontos: 0, total_pago: 0, saldo: 0 }) as Record<string, number>;
  const vendas = (vendasData ?? []) as Venda[];
  const fretes = (fretesData ?? []) as Frete[];
  const envios = (enviosData ?? []) as EnvioPortal[];
  const pendentes = envios.filter((e) => e.status === "etiqueta_gerada");

  const soma = (k: keyof Venda) => vendas.reduce((s, v) => s + Number(v[k]), 0);
  const descontosPeriodo = fretes.reduce((s, f) => s + Number(f.desconto), 0);

  return (
    <>
      <header className="admin__topo">
        <span className="admin__marca">
          <Image src="/marca/logo-suspen-store-texto.png" alt="Suspen Store" width={180} height={47} />
          <span>Fornecedor</span>
        </span>
        <nav>
          <span style={{ color: "var(--prata)" }}>{fornecedor.nome}</span>
          <form action={sairFornecedor}>
            <button type="submit" title={user.email}>
              Sair
            </button>
          </form>
        </nav>
      </header>

      <div className="admin__conteudo admin__conteudo--largo">
        <Avisos ok={sp.ok} />

        <div className="admin__resumo">
          <div className={Number(saldo.saldo) > 0 ? "positivo" : ""}>
            <span>Seu saldo a receber</span>
            <strong>{formatarPreco(Number(saldo.saldo))}</strong>
          </div>
          <div>
            <span>Total de repasses</span>
            <strong>{formatarPreco(Number(saldo.total_repasse))}</strong>
          </div>
          <div>
            <span>Fretes descontados</span>
            <strong>{formatarPreco(Number(saldo.total_descontos))}</strong>
          </div>
          <div>
            <span>Já recebido</span>
            <strong>{formatarPreco(Number(saldo.total_pago))}</strong>
          </div>
        </div>

        <section className="admin__bloco">
          <h2>Etiquetas para postar ({pendentes.length})</h2>
          {envios.length === 0 && <p className="admin__dica">Nenhuma etiqueta ainda.</p>}
          {envios.length > 0 && (
            <div className="admin__rolar">
              <table className="admin__grade">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Data</th>
                    <th>Itens</th>
                    <th>Envio</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {envios.map((e) => (
                    <tr key={e.envio_id}>
                      <td>{e.pedido_numero}</td>
                      <td>{dataBR(e.data)}</td>
                      <td style={{ whiteSpace: "normal" }}>{e.itens}</td>
                      <td>
                        {e.transportadora} {e.servico_nome}
                        {e.rastreio && <div className="admin__dica">{e.rastreio}</div>}
                      </td>
                      <td>
                        <span className={`selo selo--${e.status}`}>{e.status === "pendente" ? "Aguardando etiqueta" : NOME_STATUS[e.status]}</span>
                      </td>
                      <td>
                        {e.etiqueta_url && (
                          <a href={e.etiqueta_url} target="_blank" rel="noopener" className="btn btn--escuro">
                            Imprimir etiqueta
                          </a>
                        )}{" "}
                        {e.status === "etiqueta_gerada" && (
                          <form action={marcarPostado} style={{ display: "inline" }}>
                            <input type="hidden" name="envio_id" value={e.envio_id} />
                            <BotaoEnviar texto="Já postei" enviando="..." className="btn btn--contorno" />
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin__bloco">
          <h2>Suas vendas</h2>
          <form className="admin__filtros">
            <label>
              De
              <input type="date" name="de" defaultValue={de} />
            </label>
            <label>
              Até
              <input type="date" name="ate" defaultValue={ate} />
            </label>
            <button type="submit" className="btn btn--escuro">
              Filtrar
            </button>
          </form>
          <div className="admin__resumo">
            <div>
              <span>Vendido no período</span>
              <strong>{formatarPreco(soma("valor_venda"))}</strong>
            </div>
            <div>
              <span>Comissão da loja</span>
              <strong>{formatarPreco(soma("comissao"))}</strong>
            </div>
            {descontosPeriodo > 0 && (
              <div>
                <span>Fretes descontados</span>
                <strong>{formatarPreco(descontosPeriodo)}</strong>
              </div>
            )}
            <div className="positivo">
              <span>Você recebe</span>
              <strong>{formatarPreco(soma("repasse") - descontosPeriodo)}</strong>
            </div>
          </div>
          <div className="admin__rolar">
            <table className="admin__grade">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Data</th>
                  <th>Canal</th>
                  <th>Produto</th>
                  <th className="num">Qtd</th>
                  <th className="num">Valor vendido</th>
                  <th className="num">{fornecedor.modelo === "revenda" ? "Margem da loja" : "Comissão"}</th>
                  <th className="num">Você recebe</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((v, n) => (
                  <tr key={n}>
                    <td>{v.pedido_numero}</td>
                    <td>{dataBR(v.data)}</td>
                    <td>{v.origem === "site" ? "Site" : "WhatsApp"}</td>
                    <td>{v.produto}</td>
                    <td className="num">{v.quantidade}</td>
                    <td className="num">{formatarPreco(Number(v.valor_venda))}</td>
                    <td className="num">{formatarPreco(Number(v.comissao))}</td>
                    <td className="num">{formatarPreco(Number(v.repasse))}</td>
                  </tr>
                ))}
                {vendas.length === 0 && (
                  <tr>
                    <td colSpan={8}>Nenhuma venda paga nesse período.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {fretes.length > 0 && (
            <>
              <h2 style={{ marginTop: 20 }}>Fretes</h2>
              <div className="admin__rolar">
                <table className="admin__grade">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Data</th>
                      <th>Quem pagou</th>
                      <th className="num">Valor</th>
                      <th className="num">Descontado de você</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fretes.map((f, n) => (
                      <tr key={n}>
                        <td>{f.pedido_numero}</td>
                        <td>{dataBR(f.data)}</td>
                        <td>{f.quem_paga === "fornecedor" ? "Você (frete grátis pro cliente)" : "Cliente"}</td>
                        <td className="num">{formatarPreco(Number(f.valor))}</td>
                        <td className="num">{formatarPreco(Number(f.desconto))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
