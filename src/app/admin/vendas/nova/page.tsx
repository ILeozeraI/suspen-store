import Link from "next/link";
import { registrarVendaManual } from "../acoes";
import { exigirAdmin } from "@/lib/admin";
import { Avisos } from "@/components/admin/Avisos";
import { BotaoEnviar } from "@/components/admin/BotaoEnviar";
import { CampoCep } from "@/components/admin/CampoCep";
import { ItensVendaManual } from "@/components/admin/ItensVendaManual";
import { TopoAdmin } from "@/components/admin/TopoAdmin";

export const dynamic = "force-dynamic";

export default async function NovaVenda({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const { sb, user } = await exigirAdmin();
  const [{ data: produtos }, { data: fornecedores }, { data: custos }] = await Promise.all([
    sb.from("produtos").select("id, nome, preco, fornecedor_id").order("nome"),
    sb.from("fornecedores").select("id, nome, modelo").eq("ativo", true).order("nome"),
    sb.from("produtos_custos").select("produto_id, custo"),
  ]);
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <>
      <TopoAdmin email={user.email} aba="vendas" />
      <div className="admin__conteudo admin__conteudo--largo">
        <Link href="/admin/vendas" className="admin__voltar">
          ← Vendas
        </Link>
        <h1>Lançar venda do WhatsApp</h1>
        <p className="admin__dica">
          A venda entra nos relatórios e no saldo do fornecedor. O preço pode ser diferente do site, e dá para lançar produto que não
          está no site.
        </p>
        <Avisos erro={erro} />
        <form action={registrarVendaManual} className="admin__form">
          <fieldset>
            <legend>Itens</legend>
            <div className="admin__largo">
              <ItensVendaManual
                produtos={(produtos ?? []).map((p) => ({
                  id: p.id,
                  nome: p.nome,
                  preco: p.preco ? Number(p.preco) : null,
                  fornecedorId: p.fornecedor_id,
                  custo: Number(custos?.find((c) => c.produto_id === p.id)?.custo ?? 0) || null,
                }))}
                fornecedores={fornecedores ?? []}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Cliente ou loja</legend>
            <label className="admin__largo">
              Nome *
              <input name="cliente_nome" required />
            </label>
            <label>
              WhatsApp
              <input name="cliente_telefone" inputMode="tel" />
            </label>
            <label>
              CPF/CNPJ<small>Necessário para gerar etiqueta</small>
              <input name="cliente_cpf" inputMode="numeric" />
            </label>
            <label>
              Data da venda
              <input name="data" type="date" defaultValue={hoje} />
            </label>
          </fieldset>

          <fieldset>
            <legend>Entrega (para gerar etiqueta pelo site)</legend>
            <CampoCep obrigatorio={false} />
            <label className="admin__largo">
              Rua
              <input name="rua" />
            </label>
            <label>
              Número
              <input name="numero" />
            </label>
            <label>
              Complemento
              <input name="complemento" />
            </label>
            <label>
              Bairro
              <input name="bairro" />
            </label>
            <label>
              Cidade
              <input name="cidade" />
            </label>
            <label>
              UF
              <input name="uf" maxLength={2} />
            </label>
            <label className="admin__check admin__largo">
              <input type="checkbox" name="sem_envio" /> Já foi entregue / retirada (não precisa de etiqueta)
            </label>
          </fieldset>

          <fieldset>
            <legend>Valores</legend>
            <label>
              Frete cobrado do cliente (R$)
              <input name="frete_cobrado" inputMode="decimal" placeholder="0,00" />
            </label>
            <label>
              Frete pago pela loja (R$)<small>Se já souber; a etiqueta atualiza</small>
              <input name="frete_real" inputMode="decimal" placeholder="0,00" />
            </label>
            <label>
              Taxa de pagamento (R$)<small>Maquininha, link de pagamento...</small>
              <input name="taxa" inputMode="decimal" placeholder="0,00" />
            </label>
            <label className="admin__largo">
              Observação
              <textarea name="observacao" rows={2} />
            </label>
          </fieldset>

          <div className="admin__acoes">
            <BotaoEnviar texto="Registrar venda" enviando="Salvando..." className="btn btn--vermelho btn--grande" />
            <Link href="/admin/vendas" className="btn btn--contorno btn--grande">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
