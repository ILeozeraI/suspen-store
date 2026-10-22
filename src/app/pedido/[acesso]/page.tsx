import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AtualizarSozinho, CopiarPix } from "@/components/PedidoCliente";
import { linkWhatsApp } from "@/data/loja";
import { formatarPreco } from "@/data/produtos";
import { servicoConfigurado, supabaseServico } from "@/lib/supabase/servico";
import type { Envio, Pedido, PedidoItem } from "@/lib/tipos";

export const metadata: Metadata = { title: "Seu pedido", robots: { index: false } };
export const dynamic = "force-dynamic";

const TITULOS: Record<string, [string, string]> = {
  pago: ["Pagamento aprovado!", "Recebemos seu pagamento. Agora separamos e enviamos seu pedido. O código de rastreio aparece aqui."],
  aguardando_pagamento: ["Falta pouco", "Seu pedido foi registrado e está aguardando o pagamento."],
  recusado: ["Pagamento recusado", "O pagamento não foi aprovado. Você pode tentar de novo ou falar com a gente."],
  cancelado: ["Pedido cancelado", "Este pedido foi cancelado."],
  reembolsado: ["Pagamento devolvido", "O valor deste pedido foi devolvido."],
};

// Página que o cliente acompanha. O endereço tem um código aleatório (acesso), não o número do pedido.
export default async function PaginaPedido({ params }: { params: Promise<{ acesso: string }> }) {
  const { acesso } = await params;
  if (!servicoConfigurado || !/^[a-f0-9]{32}$/.test(acesso)) notFound();
  const sb = supabaseServico();
  const { data } = await sb.from("pedidos").select("*").eq("acesso", acesso).maybeSingle();
  if (!data) notFound();
  const p = data as Pedido;
  const [{ data: itens }, { data: envios }] = await Promise.all([
    sb.from("pedido_itens").select("nome, quantidade, preco_unitario").eq("pedido_id", p.id),
    sb.from("envios").select("servico_nome, transportadora, prazo_dias, rastreio, status").eq("pedido_id", p.id),
  ]);
  const [titulo, texto] = TITULOS[p.status] ?? TITULOS.aguardando_pagamento;

  return (
    <>
      <section className="pagina-topo">
        <div className="container">
          <span className="eyebrow">Pedido nº {p.numero}</span>
          <h1>{titulo}</h1>
          <p>{texto}</p>
        </div>
      </section>
      <div className="container pedido-status">
        <div className="checkout__caixa">
          {p.status === "aguardando_pagamento" && <AtualizarSozinho />}

          {p.status === "aguardando_pagamento" && p.metodo === "pix" && p.pix_copia_cola && (
            <div className="pix">
              <h2>Pague com Pix</h2>
              {p.pix_qr_base64 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`data:image/png;base64,${p.pix_qr_base64}`} alt="QR Code do Pix" />
              )}
              <p className="checkout__dica">Abra o app do seu banco, escolha Pix e leia o QR Code, ou copie o código abaixo.</p>
              <CopiarPix codigo={p.pix_copia_cola} />
              <p className="checkout__dica">Esta página atualiza sozinha quando o pagamento cair.</p>
            </div>
          )}

          {p.status === "aguardando_pagamento" && p.metodo === "boleto" && p.boleto_url && (
            <div className="pix">
              <h2>Pague o boleto</h2>
              <a href={p.boleto_url} target="_blank" rel="noopener" className="btn btn--vermelho btn--grande">
                Abrir boleto
              </a>
              <p className="checkout__dica">A compensação do boleto pode levar até 2 dias úteis.</p>
            </div>
          )}

          {(envios as Partial<Envio>[] | null)?.length ? (
            <>
              <h2>Entrega</h2>
              {(envios as Partial<Envio>[]).map((e, n) => (
                <p key={n}>
                  <strong>Pacote {n + 1}:</strong> {e.transportadora} {e.servico_nome} · até {e.prazo_dias} dias úteis após a postagem
                  {e.rastreio ? (
                    <>
                      {" "}
                      · Rastreio:{" "}
                      <a href={`https://www.melhorrastreio.com.br/rastreio/${e.rastreio}`} target="_blank" rel="noopener">
                        {e.rastreio}
                      </a>
                    </>
                  ) : (
                    " · rastreio disponível após a postagem"
                  )}
                </p>
              ))}
            </>
          ) : null}

          <p style={{ marginTop: 20 }}>
            <a
              href={linkWhatsApp(`Olá! Tenho uma dúvida sobre o meu pedido nº ${p.numero}.`)}
              target="_blank"
              rel="noopener"
              className="btn btn--whats"
            >
              Falar com a equipe
            </a>{" "}
            <Link href="/" className="btn btn--contorno">
              Voltar para a loja
            </Link>
          </p>
        </div>

        <aside className="resumo">
          <h2>Resumo</h2>
          {(itens as Partial<PedidoItem>[] | null)?.map((i, n) => (
            <div key={n} className="resumo__linha">
              <span>
                {i.quantidade}x {i.nome}
              </span>
              <span>{formatarPreco(Number(i.preco_unitario) * Number(i.quantidade))}</span>
            </div>
          ))}
          <div className="resumo__linha">
            <span>Frete</span>
            <span>{Number(p.total_frete) === 0 ? "Grátis" : formatarPreco(Number(p.total_frete))}</span>
          </div>
          <div className="resumo__linha resumo__total">
            <span>Total</span>
            <span>{formatarPreco(Number(p.total))}</span>
          </div>
          {p.metodo === "cartao" && p.parcelas && p.parcelas > 1 && <p className="checkout__dica">Em {p.parcelas}x no cartão</p>}
        </aside>
      </div>
    </>
  );
}
