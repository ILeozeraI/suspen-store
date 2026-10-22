import Link from "next/link";
import { formatarPreco } from "@/data/produtos";
import { exigirAdmin } from "@/lib/admin";
import type { Envio, Pedido, PedidoItem } from "@/lib/tipos";
import { NOME_STATUS } from "@/lib/tipos";
import { calcularLinha, somar } from "@/lib/vendas";
import { Avisos } from "@/components/admin/Avisos";
import { TopoAdmin } from "@/components/admin/TopoAdmin";

export const dynamic = "force-dynamic";

type Filtros = { fornecedor?: string; de?: string; ate?: string; status?: string; origem?: string; erro?: string; ok?: string };

function inicioDoMes() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default async function Vendas({ searchParams }: { searchParams: Promise<Filtros> }) {
  const f = await searchParams;
  const { sb, user } = await exigirAdmin();
  const de = f.de || inicioDoMes();
  const ate = f.ate || new Date().toISOString().slice(0, 10);
  const status = f.status ?? "pago";

  const { data: fornecedores } = await sb.from("fornecedores").select("id, nome").order("nome");

  let consulta = sb
    .from("pedidos")
    .select("*")
    .gte("criado_em", `${de}T00:00:00-03:00`)
    .lte("criado_em", `${ate}T23:59:59-03:00`)
    .order("criado_em", { ascending: false })
    .limit(1000);
  if (status !== "todos") consulta = consulta.eq("status", status);
  if (f.origem) consulta = consulta.eq("origem", f.origem);
  const { data: pedidosData, error } = await consulta;
  const pedidos = (pedidosData ?? []) as Pedido[];
  const ids = pedidos.map((p) => p.id);

  const [{ data: itensData }, { data: enviosData }] = ids.length
    ? await Promise.all([sb.from("pedido_itens").select("*").in("pedido_id", ids), sb.from("envios").select("*").in("pedido_id", ids)])
    : [{ data: [] }, { data: [] }];
  const itens = (itensData ?? []) as PedidoItem[];
  const envios = (enviosData ?? []) as Envio[];

  const linhas = pedidos
    .map((p) =>
      calcularLinha(
        p,
        itens.filter((i) => i.pedido_id === p.id),
        envios.filter((e) => e.pedido_id === p.id),
        f.fornecedor || undefined
      )
    )
    .filter((l) => !f.fornecedor || l.itens.length > 0);
  const t = somar(linhas);
  const nomeForn = fornecedores?.find((x) => x.id === f.fornecedor)?.nome;

  const csv = [
    ["Pedido", "Data", "Origem", "Status", "Cliente", "Produtos", "Frete cobrado", "Frete real", "Taxa MP", "Repasse", "Lucro"],
    ...linhas.map((l) => [
      l.pedido.numero,
      new Date(l.pedido.criado_em).toLocaleDateString("pt-BR"),
      l.pedido.origem,
      l.pedido.status,
      l.pedido.cliente_nome,
      l.vendaProdutos,
      l.freteCobrado,
      l.freteReal,
      l.taxa,
      l.repasse,
      l.lucro,
    ]),
  ]
    .map((r) => r.map((c) => (typeof c === "number" ? String(c).replace(".", ",") : `"${String(c).replace(/"/g, '""')}"`)).join(";"))
    .join("\n");

  return (
    <>
      <TopoAdmin email={user.email} aba="vendas" />
      <div className="admin__conteudo admin__conteudo--largo">
        <div className="admin__titulo">
          <h1>Vendas{nomeForn ? ` · ${nomeForn}` : ""}</h1>
          <Link href="/admin/vendas/nova" className="btn btn--vermelho">
            + Lançar venda do WhatsApp
          </Link>
        </div>
        <Avisos erro={f.erro ?? error?.message} ok={f.ok} />

        <form className="admin__filtros">
          <label>
            Fornecedor
            <select name="fornecedor" defaultValue={f.fornecedor ?? ""}>
              <option value="">Todos</option>
              {(fornecedores ?? []).map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            De
            <input type="date" name="de" defaultValue={de} />
          </label>
          <label>
            Até
            <input type="date" name="ate" defaultValue={ate} />
          </label>
          <label>
            Status
            <select name="status" defaultValue={status}>
              <option value="pago">Pagos</option>
              <option value="aguardando_pagamento">Aguardando pagamento</option>
              <option value="todos">Todos</option>
            </select>
          </label>
          <label>
            Origem
            <select name="origem" defaultValue={f.origem ?? ""}>
              <option value="">Site e WhatsApp</option>
              <option value="site">Só site</option>
              <option value="whatsapp">Só WhatsApp</option>
            </select>
          </label>
          <button type="submit" className="btn btn--escuro">
            Filtrar
          </button>
          <a
            className="btn btn--contorno"
            href={`data:text/csv;charset=utf-8,${encodeURIComponent("﻿" + csv)}`}
            download={`vendas-${de}-a-${ate}.csv`}
          >
            Baixar planilha
          </a>
        </form>

        <div className="admin__resumo">
          <div>
            <span>Pedidos</span>
            <strong>{t.pedidos}</strong>
          </div>
          <div>
            <span>Vendido em produtos</span>
            <strong>{formatarPreco(t.vendaProdutos)}</strong>
          </div>
          <div>
            <span>Frete cobrado</span>
            <strong>{formatarPreco(t.freteCobrado)}</strong>
          </div>
          <div>
            <span>Frete pago (Melhor Envio)</span>
            <strong>{formatarPreco(t.freteReal)}</strong>
          </div>
          <div>
            <span>Taxa Mercado Pago</span>
            <strong>{formatarPreco(t.taxa)}</strong>
          </div>
          <div>
            <span>Repasse a fornecedores</span>
            <strong>{formatarPreco(t.repasse)}</strong>
          </div>
          <div className={t.lucro >= 0 ? "positivo" : "negativo"}>
            <span>Fica para a loja</span>
            <strong>{formatarPreco(t.lucro)}</strong>
          </div>
        </div>
        <p className="admin__dica">
          Fica para a loja = produtos + frete cobrado − frete pago − taxa do Mercado Pago − repasse. Antes de gerar a etiqueta, o
          frete pago é a estimativa da cotação.
        </p>

        <div className="admin__rolar">
          <table className="admin__grade">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Origem</th>
                <th>Status</th>
                <th className="num">Produtos</th>
                <th className="num">Frete cobrado</th>
                <th className="num">Frete pago</th>
                <th className="num">Taxa MP</th>
                <th className="num">Repasse</th>
                <th className="num">Loja</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.pedido.id}>
                  <td>
                    <Link href={`/admin/vendas/${l.pedido.id}`}>{l.pedido.numero}</Link>
                  </td>
                  <td>{new Date(l.pedido.criado_em).toLocaleDateString("pt-BR")}</td>
                  <td>{l.pedido.cliente_nome}</td>
                  <td>{l.pedido.origem === "site" ? "Site" : "WhatsApp"}</td>
                  <td>
                    <span className={`selo selo--${l.pedido.status}`}>{NOME_STATUS[l.pedido.status]}</span>
                  </td>
                  <td className="num">{formatarPreco(l.vendaProdutos)}</td>
                  <td className="num">{formatarPreco(l.freteCobrado)}</td>
                  <td className="num">{formatarPreco(l.freteReal)}</td>
                  <td className="num">{formatarPreco(l.taxa)}</td>
                  <td className="num">{formatarPreco(l.repasse)}</td>
                  <td className="num">{formatarPreco(l.lucro)}</td>
                </tr>
              ))}
              {linhas.length === 0 && (
                <tr>
                  <td colSpan={11}>Nenhuma venda nesse filtro.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
