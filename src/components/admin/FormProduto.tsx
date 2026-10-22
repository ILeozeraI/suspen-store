import Image from "next/image";
import Link from "next/link";
import { salvarProduto } from "@/app/admin/acoes";
import { categorias } from "@/data/produtos";
import type { LinhaProduto } from "@/lib/catalogo";
import type { Fornecedor } from "@/lib/tipos";
import { BotaoEnviar } from "./BotaoEnviar";

// Formulário de cadastro e edição de produto.
export function FormProduto({
  p,
  fornecedores,
  custo,
}: {
  p?: LinhaProduto;
  fornecedores: Pick<Fornecedor, "id" | "nome" | "cidade" | "uf">[];
  custo?: number | null;
}) {
  const preco = (v: number | null | undefined) => (v ? Number(v).toFixed(2).replace(".", ",") : "");
  return (
    <form action={salvarProduto} className="admin__form">
      {p && <input type="hidden" name="id" value={p.id} />}
      {p && <input type="hidden" name="imagem_atual" value={p.imagem} />}

      <fieldset>
        <legend>Produto</legend>
        <label className="admin__largo">
          Nome *
          <input name="nome" defaultValue={p?.nome} required maxLength={120} placeholder="Kit Rosca Slim Gol G5" />
        </label>
        <label>
          Categoria *
          <select name="categoria" defaultValue={p?.categoria ?? "suspensao-a-rosca"} required>
            {categorias.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          Montadora *
          <input name="montadora" defaultValue={p?.montadora} required placeholder="Volkswagen" list="montadoras" />
          <datalist id="montadoras">
            {["Chevrolet", "Fiat", "Ford", "Honda", "Hyundai", "Peugeot", "Renault", "Toyota", "Volkswagen"].map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </label>
        <label>
          Modelos de carro *<small>Separe por vírgula. Ex.: Uno Way, Uno Vivace</small>
          <input name="modelos" defaultValue={p?.modelos.join(", ")} required />
        </label>
        <label>
          Anos de aplicação<small>Ex.: 2008 a 2012 (opcional)</small>
          <input name="anos" defaultValue={p?.anos ?? ""} />
        </label>
      </fieldset>

      <fieldset>
        <legend>Preço e estoque</legend>
        <label>
          Preço (R$)<small>Vazio = &quot;Consulte o preço&quot;</small>
          <input name="preco" defaultValue={preco(p?.preco)} inputMode="decimal" placeholder="1399,90" />
        </label>
        <label>
          Preço antigo (R$)<small>Aparece riscado, para promoção</small>
          <input name="preco_antigo" defaultValue={preco(p?.preco_antigo)} inputMode="decimal" />
        </label>
        <label>
          Estoque<small>Vazio = não controlar · 0 = esgotado</small>
          <input name="estoque" defaultValue={p?.estoque ?? ""} inputMode="numeric" />
        </label>
      </fieldset>

      <fieldset>
        <legend>Fornecedor e custo</legend>
        <label>
          Fornecedor *<small>O frete sai do endereço dele</small>
          <select name="fornecedor_id" defaultValue={p?.fornecedor_id ?? fornecedores[0]?.id ?? ""} required>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome} ({f.cidade}/{f.uf})
              </option>
            ))}
          </select>
        </label>
        <label>
          Custo (R$)<small>Só no modelo revenda: quanto a loja paga ao fornecedor. Só o admin vê</small>
          <input name="custo" defaultValue={preco(custo)} inputMode="decimal" placeholder="900,00" />
        </label>
      </fieldset>

      <fieldset>
        <legend>Frete</legend>
        <label className="admin__check admin__largo">
          <input type="checkbox" name="frete_gratis" defaultChecked={p?.frete_gratis ?? false} /> Frete grátis (a loja paga o frete)
        </label>
        <label>
          Peso embalado (kg) *
          <input name="peso_kg" defaultValue={p?.peso_kg ? String(p.peso_kg).replace(".", ",") : ""} inputMode="decimal" placeholder="12,5" />
        </label>
        <label>
          Altura da caixa (cm) *
          <input name="altura_cm" defaultValue={p?.altura_cm ?? ""} inputMode="numeric" />
        </label>
        <label>
          Largura da caixa (cm) *
          <input name="largura_cm" defaultValue={p?.largura_cm ?? ""} inputMode="numeric" />
        </label>
        <label>
          Comprimento da caixa (cm) *
          <input name="comprimento_cm" defaultValue={p?.comprimento_cm ?? ""} inputMode="numeric" />
        </label>
        <p className="admin__dica admin__largo">Sem peso e medidas o site não consegue calcular o frete deste produto.</p>
      </fieldset>

      <fieldset>
        <legend>Foto</legend>
        {p?.imagem && <Image src={p.imagem} alt="Foto atual" width={160} height={160} className="admin__foto" />}
        <label className="admin__largo">
          {p ? "Trocar foto" : "Foto *"}
          <small>JPG, PNG ou WEBP, até 4 MB. De preferência quadrada e com fundo branco.</small>
          <input type="file" name="foto" accept="image/jpeg,image/png,image/webp" required={!p} />
        </label>
      </fieldset>

      <fieldset>
        <legend>Textos</legend>
        <label className="admin__largo">
          Descrição *
          <textarea name="resumo" defaultValue={p?.resumo} required rows={3} />
        </label>
        <label className="admin__largo">
          Observação<small>Aparece em destaque na página do produto</small>
          <textarea name="observacao" defaultValue={p?.observacao ?? ""} rows={2} />
        </label>
      </fieldset>

      <fieldset>
        <legend>Exibição</legend>
        <label className="admin__check">
          <input type="checkbox" name="ativo" defaultChecked={p?.ativo ?? true} /> Aparece no site
        </label>
        <label className="admin__check">
          <input type="checkbox" name="destaque" defaultChecked={p?.destaque ?? false} /> Mostrar em &quot;Mais procurados&quot;
        </label>
        <label>
          Ordem<small>Menor aparece primeiro</small>
          <input name="ordem" defaultValue={p?.ordem ?? 0} inputMode="numeric" />
        </label>
        <label>
          Endereço (slug)<small>Vazio = gerado pelo nome</small>
          <input name="slug" defaultValue={p?.slug} placeholder="kit-rosca-slim-gol-g5" />
        </label>
      </fieldset>

      <div className="admin__acoes">
        <BotaoEnviar texto="Salvar" enviando="Salvando..." className="btn btn--vermelho btn--grande" />
        <Link href="/admin" className="btn btn--contorno btn--grande">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
