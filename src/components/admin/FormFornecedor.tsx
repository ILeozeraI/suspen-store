import Link from "next/link";
import { salvarFornecedor } from "@/app/admin/fornecedores/acoes";
import type { Fornecedor } from "@/lib/tipos";
import { BotaoEnviar } from "./BotaoEnviar";
import { CampoCep } from "./CampoCep";

export function FormFornecedor({ f }: { f?: Fornecedor }) {
  return (
    <form action={salvarFornecedor} className="admin__form">
      {f && <input type="hidden" name="id" value={f.id} />}
      <fieldset>
        <legend>Dados</legend>
        <label className="admin__largo">
          Nome *
          <input name="nome" defaultValue={f?.nome} required maxLength={120} placeholder="Nome da empresa ou da pessoa" />
        </label>
        <label>
          CPF ou CNPJ<small>Vai na etiqueta como remetente</small>
          <input name="documento" defaultValue={f?.documento ?? ""} inputMode="numeric" />
        </label>
        <label>
          Telefone (com DDD)
          <input name="telefone" defaultValue={f?.telefone ?? ""} inputMode="tel" placeholder="11999998888" />
        </label>
        <label>
          E-mail
          <input name="email" type="email" defaultValue={f?.email ?? ""} />
        </label>
      </fieldset>

      <fieldset>
        <legend>Endereço de onde sai o envio</legend>
        <CampoCep valor={f?.cep ?? ""} />
        <label className="admin__largo">
          Rua *
          <input name="rua" defaultValue={f?.rua} required />
        </label>
        <label>
          Número *
          <input name="numero" defaultValue={f?.numero} required />
        </label>
        <label>
          Complemento
          <input name="complemento" defaultValue={f?.complemento ?? ""} />
        </label>
        <label>
          Bairro *
          <input name="bairro" defaultValue={f?.bairro} required />
        </label>
        <label>
          Cidade *
          <input name="cidade" defaultValue={f?.cidade} required />
        </label>
        <label>
          UF *
          <input name="uf" defaultValue={f?.uf} required maxLength={2} placeholder="SP" />
        </label>
      </fieldset>

      <fieldset>
        <legend>Negócio com este fornecedor</legend>
        <label>
          Modelo *
          <select name="modelo" defaultValue={f?.modelo ?? "comissao"}>
            <option value="comissao">Comissão (a venda é do fornecedor)</option>
            <option value="revenda">Revenda (a loja compra e revende)</option>
          </select>
          <small>Em revenda o fornecedor recebe o custo cadastrado em cada produto</small>
        </label>
        <label>
          Tipo de comissão
          <select name="comissao_tipo" defaultValue={f?.comissao_tipo ?? "percentual"}>
            <option value="percentual">Porcentagem da venda (%)</option>
            <option value="fixo">Valor fixo por peça (R$)</option>
          </select>
        </label>
        <label>
          Comissão<small>Ex.: 15 (para 15%) ou 50,00 (para R$ 50 por peça)</small>
          <input name="comissao_valor" defaultValue={f ? String(f.comissao_valor).replace(".", ",") : ""} inputMode="decimal" />
        </label>
        <label>
          Quem paga o frete *
          <select name="frete_modelo" defaultValue={f?.frete_modelo ?? "cliente"}>
            <option value="cliente">O cliente (cobrado no checkout)</option>
            <option value="loja">A loja (grátis pro cliente; o fornecedor não vê)</option>
            <option value="fornecedor">O fornecedor (grátis pro cliente; desconta do repasse)</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Outros</legend>
        <label className="admin__check">
          <input type="checkbox" name="ativo" defaultChecked={f?.ativo ?? true} /> Fornecedor ativo
        </label>
        <label className="admin__largo">
          Observação (só o admin vê)
          <textarea name="observacao" defaultValue={f?.observacao ?? ""} rows={2} />
        </label>
      </fieldset>

      <div className="admin__acoes">
        <BotaoEnviar texto="Salvar" enviando="Salvando..." className="btn btn--vermelho btn--grande" />
        <Link href="/admin/fornecedores" className="btn btn--contorno btn--grande">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
