"use client";
// Linhas de itens da venda manual (WhatsApp). Pode escolher um produto do site ou digitar um que não está no site.
import { useState } from "react";
import { formatarPreco } from "@/data/produtos";

type ProdutoOpcao = { id: string; nome: string; preco: number | null; fornecedorId: string | null; custo: number | null };
type FornecedorOpcao = { id: string; nome: string; modelo: string };
type Linha = { produtoId: string; nome: string; fornecedorId: string; quantidade: number; preco: string; custo: string };

const num = (v: string) => {
  let t = v.replace(/[R$\s]/g, "");
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  return Number(t) || 0;
};
const txt = (v: number | null) => (v ? v.toFixed(2).replace(".", ",") : "");

export function ItensVendaManual({ produtos, fornecedores }: { produtos: ProdutoOpcao[]; fornecedores: FornecedorOpcao[] }) {
  const nova = (): Linha => ({ produtoId: "", nome: "", fornecedorId: fornecedores[0]?.id ?? "", quantidade: 1, preco: "", custo: "" });
  const [linhas, setLinhas] = useState<Linha[]>([nova()]);
  const mudar = (i: number, m: Partial<Linha>) => setLinhas((ls) => ls.map((l, n) => (n === i ? { ...l, ...m } : l)));
  const total = linhas.reduce((s, l) => s + num(l.preco) * l.quantidade, 0);
  const json = JSON.stringify(
    linhas.map((l) => ({
      produtoId: l.produtoId || undefined,
      nome: l.nome,
      fornecedorId: l.fornecedorId,
      quantidade: l.quantidade,
      preco: num(l.preco),
      custo: num(l.custo),
    }))
  );

  return (
    <div className="admin__itens-manual">
      <input type="hidden" name="itens" value={json} />
      {linhas.map((l, i) => (
        <div key={i} className="admin__item-manual">
          <label>
            Produto do site
            <select
              value={l.produtoId}
              onChange={(e) => {
                const p = produtos.find((x) => x.id === e.target.value);
                mudar(
                  i,
                  p
                    ? { produtoId: p.id, nome: p.nome, fornecedorId: p.fornecedorId ?? l.fornecedorId, preco: txt(p.preco), custo: txt(p.custo) }
                    : { produtoId: "" }
                );
              }}
            >
              <option value="">Outro (não está no site)</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            Descrição
            <input value={l.nome} onChange={(e) => mudar(i, { nome: e.target.value })} required placeholder="Amortecedor dianteiro..." />
          </label>
          <label>
            Fornecedor
            <select value={l.fornecedorId} onChange={(e) => mudar(i, { fornecedorId: e.target.value })}>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            Qtd
            <input type="number" min={1} value={l.quantidade} onChange={(e) => mudar(i, { quantidade: Math.max(1, Number(e.target.value)) })} />
          </label>
          <label>
            Preço un. (R$)
            <input value={l.preco} onChange={(e) => mudar(i, { preco: e.target.value })} inputMode="decimal" required />
          </label>
          <label title="Só para fornecedor no modelo revenda">
            Custo un. (revenda)
            <input value={l.custo} onChange={(e) => mudar(i, { custo: e.target.value })} inputMode="decimal" />
          </label>
          <button
            type="button"
            className="admin__link-perigo"
            onClick={() => setLinhas((ls) => (ls.length > 1 ? ls.filter((_, n) => n !== i) : ls))}
            aria-label="Remover item"
          >
            Remover
          </button>
        </div>
      ))}
      <div className="admin__linha-form" style={{ justifyContent: "space-between" }}>
        <button type="button" className="btn btn--contorno" onClick={() => setLinhas((ls) => [...ls, nova()])}>
          + Adicionar item
        </button>
        <strong>Produtos: {formatarPreco(total)}</strong>
      </div>
    </div>
  );
}
