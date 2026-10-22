// Conta de quanto fica com a loja e quanto vai para o fornecedor em cada item vendido.
import type { Fornecedor } from "./tipos";
import { arred } from "./site";

export function calcularItem(
  f: Pick<Fornecedor, "modelo" | "comissao_tipo" | "comissao_valor">,
  precoUnitario: number,
  quantidade: number,
  custoUnitario: number
) {
  const venda = arred(precoUnitario * quantidade);
  if (f.modelo === "revenda") {
    const repasse = arred(custoUnitario * quantidade);
    return { venda, repasse, comissao: arred(venda - repasse) };
  }
  const comissao =
    f.comissao_tipo === "fixo"
      ? arred(Number(f.comissao_valor) * quantidade)
      : arred((venda * Number(f.comissao_valor)) / 100);
  return { venda, comissao: Math.min(comissao, venda), repasse: arred(venda - Math.min(comissao, venda)) };
}

// Frete descontado do fornecedor: só no modelo "fornecedor", a diferença entre o frete real e o que o cliente pagou.
export function descontoFrete(freteModelo: string, valorReal: number, valorCobrado: number) {
  return freteModelo === "fornecedor" ? arred(Math.max(valorReal - valorCobrado, 0)) : 0;
}
