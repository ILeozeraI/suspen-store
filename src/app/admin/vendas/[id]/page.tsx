import Link from "next/link";
import { notFound } from "next/navigation";
import { atualizarRastreio, gerarEtiqueta, mudarStatusEnvio, mudarStatusPedido } from "../acoes";
import { formatarPreco } from "@/data/produtos";
import { exigirAdmin } from "@/lib/admin";
import type { Envio, Fornecedor, Pedido, PedidoItem } from "@/lib/tipos";
import { NOME_FRETE_MODELO, NOME_STATUS } from "@/lib/tipos";
import { calcularLinha } from "@/lib/vendas";
import { Avisos } from "@/components/admin/Avisos";
import { BotaoEnviar } from "@/components/admin/BotaoEnviar";
import { TopoAdmin } from "@/components/admin/TopoAdmin";

export const dynamic = "force-dynamic";

export default async function DetalheVenda({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string; ok?: string }>;
}) {
  const { id } = await params;
  const { erro, ok } = await searchParams;
  const { sb, user } = await exigirAdmin();
  const { data } = await sb.from("pedidos").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as Pedido;
  const [{ data: its }, { data: ens }] = await Promise.all([
    sb.from("pedido_itens").select("*").eq("pedido_id", id),
    sb.from("envios").select("*").eq("pedido_id", id).order("criado_em"),
  ]);
  const itens = (its ?? []) as PedidoItem[];
  const envios = (ens ?? []) as Envio[];
  const idsForn = [...new Set([...itens.map((i) => i.fornecedor_id), ...envios.map((e) => e.fornecedor_id)].filter(Boolean))] as string[];
  const { data: fs } = idsForn.length ? await sb.from("fornecedores").select("*").in("id", idsForn) : { data: [] };
  const fornecedores = (fs ?? []) as Fornecedor[];
  const nomeF = (fid: string | null) => fornecedores.find((f) => f.id === fid)?.nome ?? "—";
  const conta = calcularLinha(p, itens, envios);

  const avisoWhats = (e: Envio) => {
    const f = fornecedores.find((x) => x.id === e.fornecedor_id);
    if (!f?.telefone) return null;
    const txt = `Olá, ${f.nome}! Tem etiqueta nova do pedido ${p.numero} da Suspen Store para postar. Ela já está na sua área: https://suspen-store.vercel.app/fornecedor`;
    return `https://wa.me/55${f.telefone}?text=${encodeURIComponent(txt)}`;
  };

  return (
    <>
      <TopoAdmin email={user.email} aba="vendas" />
      <div className="admin__conteudo admin__conteudo--largo">
        <Link href="/admin/vendas" className="admin__voltar">
          ← Vendas
        </Link>
        <div className="admin__titulo">
          <h1>Pedido {p.numero}</h1>
          <span className={`selo selo--${p.status}`}>{NOME_STATUS[p.status]}</span>
        </div>
        <Avisos erro={erro} ok={ok} />

        <div className="admin__resumo">
          <div>
            <span>Total pago pelo cliente</span>
            <strong>{formatarPreco(Number(p.total))}</strong>
          </div>
          <div>
            <span>Frete pago (Melhor Envio)</span>
            <strong>{formatarPreco(conta.freteReal)}</strong>
          </div>
          <div>
            <span>Taxa Mercado Pago</span>
            <strong>{formatarPreco(conta.taxa)}</strong>
          </div>
          <div>
            <span>Repasse fornecedores</span>
            <strong>{formatarPreco(conta.repasse)}</strong>
          </div>
          <div className={conta.lucro >= 0 ? "positivo" : "negativo"}>
            <span>Fica para a loja</span>
            <strong>{formatarPreco(conta.lucro)}</strong>
          </div>
        </div>

        <section className="admin__bloco">
          <h2>Cliente</h2>
          <p>
            <strong>{p.cliente_nome}</strong>
            {p.cliente_cpf && ` · CPF ${p.cliente_cpf}`}
            {p.cliente_telefone && (
              <>
                {" "}
                ·{" "}
                <a href={`https://wa.me/55${p.cliente_telefone}`} target="_blank" rel="noopener">
                  WhatsApp {p.cliente_telefone}
                </a>
              </>
            )}
            {p.cliente_email && ` · ${p.cliente_email}`}
          </p>
          {p.rua && (
            <p>
              {p.rua}, {p.numero_end}
              {p.complemento ? ` (${p.complemento})` : ""} · {p.bairro} · {p.cidade}/{p.uf} · CEP {p.cep}
            </p>
          )}
          <p className="admin__dica">
            {p.origem === "site" ? "Venda pelo site" : "Venda pelo WhatsApp"} · criado em {new Date(p.criado_em).toLocaleString("pt-BR")}
            {p.pago_em && ` · pago em ${new Date(p.pago_em).toLocaleString("pt-BR")}`}
            {p.metodo && ` · ${p.metodo}${p.parcelas && p.parcelas > 1 ? ` em ${p.parcelas}x` : ""}`}
            {p.mp_payment_id && ` · Mercado Pago nº ${p.mp_payment_id}`}
          </p>
          {p.observacao && <p>Obs.: {p.observacao}</p>}
          {p.origem === "whatsapp" && (
            <form action={mudarStatusPedido} className="admin__linha-form">
              <input type="hidden" name="pedido_id" value={p.id} />
              <select name="status" defaultValue={p.status} className="admin__select">
                <option value="pago">Pago</option>
                <option value="aguardando_pagamento">Aguardando pagamento</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <BotaoEnviar texto="Mudar status" enviando="..." className="btn btn--contorno" />
            </form>
          )}
        </section>

        <section className="admin__bloco">
          <h2>Itens</h2>
          <div className="admin__rolar">
            <table className="admin__grade">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Fornecedor</th>
                  <th className="num">Qtd</th>
                  <th className="num">Preço un.</th>
                  <th className="num">Total</th>
                  <th className="num">Comissão loja</th>
                  <th className="num">Repasse</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((i) => (
                  <tr key={i.id}>
                    <td>{i.nome}</td>
                    <td>{nomeF(i.fornecedor_id)}</td>
                    <td className="num">{i.quantidade}</td>
                    <td className="num">{formatarPreco(Number(i.preco_unitario))}</td>
                    <td className="num">{formatarPreco(Number(i.preco_unitario) * i.quantidade)}</td>
                    <td className="num">{formatarPreco(Number(i.comissao))}</td>
                    <td className="num">{formatarPreco(Number(i.repasse))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin__bloco">
          <h2>Envios ({envios.length})</h2>
          {envios.map((e, n) => {
            const whats = avisoWhats(e);
            return (
              <div key={e.id} className="admin__envio">
                <p>
                  <strong>
                    Pacote {n + 1} · {nomeF(e.fornecedor_id)}
                  </strong>{" "}
                  <span className={`selo selo--${e.status}`}>{NOME_STATUS[e.status]}</span>
                </p>
                <p className="admin__dica">
                  {e.transportadora} {e.servico_nome} {e.prazo_dias ? `· ${e.prazo_dias} dias úteis` : ""} · cliente pagou{" "}
                  {formatarPreco(Number(e.valor_cobrado))} · frete {e.etiqueta_url ? "pago" : "estimado"} {formatarPreco(Number(e.valor_real))} ·{" "}
                  {NOME_FRETE_MODELO[e.frete_modelo]}
                  {Number(e.desconto_fornecedor) > 0 && ` · desconta ${formatarPreco(Number(e.desconto_fornecedor))} do fornecedor`}
                  {e.peso_kg && ` · ${String(e.peso_kg).replace(".", ",")} kg, ${e.altura_cm}×${e.largura_cm}×${e.comprimento_cm} cm`}
                </p>
                {e.rastreio && (
                  <p>
                    Rastreio:{" "}
                    <a href={`https://www.melhorrastreio.com.br/rastreio/${e.rastreio}`} target="_blank" rel="noopener">
                      {e.rastreio}
                    </a>
                  </p>
                )}
                <div className="admin__linha-form">
                  {!e.etiqueta_url && p.status === "pago" && e.status === "pendente" && (
                    <form action={gerarEtiqueta} className="admin__linha-form">
                      <input type="hidden" name="envio_id" value={e.id} />
                      <label>
                        Chave da nota fiscal (se tiver)
                        <input name="nota_fiscal" inputMode="numeric" placeholder="44 números" />
                      </label>
                      <BotaoEnviar texto="Pagar e gerar etiqueta" enviando="Gerando no Melhor Envio..." className="btn btn--vermelho" />
                    </form>
                  )}
                  {e.etiqueta_url && (
                    <a href={e.etiqueta_url} target="_blank" rel="noopener" className="btn btn--escuro">
                      Ver etiqueta
                    </a>
                  )}
                  {e.etiqueta_url && whats && (
                    <a href={whats} target="_blank" rel="noopener" className="btn btn--whats">
                      Avisar fornecedor no WhatsApp
                    </a>
                  )}
                  {e.me_pedido_id && (
                    <form action={atualizarRastreio}>
                      <input type="hidden" name="envio_id" value={e.id} />
                      <BotaoEnviar texto="Atualizar rastreio" enviando="Consultando..." className="btn btn--contorno" />
                    </form>
                  )}
                  <form action={mudarStatusEnvio} className="admin__linha-form">
                    <input type="hidden" name="envio_id" value={e.id} />
                    <select name="status" defaultValue={e.status} className="admin__select">
                      <option value="pendente">Etiqueta pendente</option>
                      <option value="etiqueta_gerada">Etiqueta gerada</option>
                      <option value="postado">Postado</option>
                      <option value="entregue">Entregue</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                    <BotaoEnviar texto="Mudar" enviando="..." className="btn btn--contorno" />
                  </form>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
