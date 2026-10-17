"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCarrinho } from "@/components/CarrinhoProvider";
import { linkWhatsApp } from "@/data/loja";
import { buscarProduto, formatarPreco } from "@/data/produtos";

const pagamentoOnline = process.env.NEXT_PUBLIC_PAGAMENTO_ONLINE === "true";

export default function Carrinho() {
  const { itens, alterar, remover } = useCarrinho();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const linhas = itens
    .map((i) => ({ ...i, produto: buscarProduto(i.slug) }))
    .filter((l): l is typeof l & { produto: NonNullable<typeof l.produto> } => !!l.produto);

  const todosComPreco = linhas.every((l) => l.produto.preco);
  const total = linhas.reduce((s, l) => s + (l.produto.preco ?? 0) * l.quantidade, 0);

  const mensagem =
    "Olá! Vim pelo site da Suspen Store e quero fazer este pedido:\n\n" +
    linhas
      .map(
        (l) =>
          `• ${l.quantidade}x ${l.produto.nome}${l.produto.preco ? ` (${formatarPreco(l.produto.preco * l.quantidade)})` : ""}`
      )
      .join("\n") +
    (todosComPreco && total ? `\n\nTotal dos produtos: ${formatarPreco(total)}` : "") +
    "\n\nMeu carro (modelo e ano): \nMeu CEP para o frete: ";

  async function pagarNoSite() {
    setErro("");
    setCarregando(true);
    try {
      const r = await fetch("/api/pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itens: itens.map((i) => ({ slug: i.slug, quantidade: i.quantidade })) }),
      });
      const dados = await r.json();
      if (!r.ok || !dados.link) throw new Error(dados.erro || "Não foi possível iniciar o pagamento.");
      window.location.href = dados.link;
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível iniciar o pagamento.");
      setCarregando(false);
    }
  }

  if (linhas.length === 0) {
    return (
      <div className="container pagina-simples">
        <h1>Seu carrinho está vazio</h1>
        <p>Escolha o kit pelo modelo do seu carro e adicione ao carrinho.</p>
        <Link href="/produtos" className="btn btn--vermelho">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="pagina-topo">
        <div className="container">
          <h1>Seu carrinho</h1>
          <p>Confira os itens e escolha como quer fechar o pedido.</p>
        </div>
      </section>

      <div className="container carrinho">
        <div className="carrinho__lista">
          {linhas.map((l) => (
            <div key={l.slug} className="linha-carrinho">
              <Link href={`/produto/${l.slug}`} className="linha-carrinho__foto">
                <Image src={l.produto.imagem} alt={l.produto.nome} width={168} height={168} />
              </Link>
              <div className="linha-carrinho__nome">
                <Link href={`/produto/${l.slug}`}>{l.produto.nome}</Link>
                <div>
                  <div className="qtd">
                    <button type="button" aria-label="Diminuir quantidade" onClick={() => alterar(l.slug, l.quantidade - 1)}>
                      −
                    </button>
                    <span>{l.quantidade}</span>
                    <button type="button" aria-label="Aumentar quantidade" onClick={() => alterar(l.slug, l.quantidade + 1)}>
                      +
                    </button>
                  </div>
                  <button type="button" className="remover" onClick={() => remover(l.slug)}>
                    Remover
                  </button>
                </div>
              </div>
              <div className="linha-carrinho__valor">
                {l.produto.preco ? formatarPreco(l.produto.preco * l.quantidade) : "A consultar"}
              </div>
            </div>
          ))}
        </div>

        <aside className="resumo" aria-label="Resumo do pedido">
          <h2>Resumo</h2>
          <div className="resumo__linha">
            <span>Produtos</span>
            <span>{todosComPreco ? formatarPreco(total) : "A consultar"}</span>
          </div>
          <div className="resumo__linha">
            <span>Frete</span>
            <span>Calculado no fechamento</span>
          </div>
          <div className="resumo__linha resumo__total">
            <span>Total</span>
            <span>{todosComPreco ? formatarPreco(total) : "A consultar"}</span>
          </div>

          {pagamentoOnline && (
            <button
              type="button"
              className="btn btn--vermelho btn--grande"
              onClick={pagarNoSite}
              disabled={carregando || !todosComPreco}
            >
              {carregando ? "Abrindo o Mercado Pago..." : "Pagar no site"}
            </button>
          )}
          {pagamentoOnline && !todosComPreco && (
            <p>Algum item ainda está sem preço no site. Finalize pelo WhatsApp.</p>
          )}

          <a href={linkWhatsApp(mensagem)} target="_blank" rel="noopener" className="btn btn--whats btn--grande">
            Finalizar pelo WhatsApp
          </a>
          <p>
            Pelo WhatsApp, nossa equipe confirma a aplicação no seu carro, o valor do frete e a forma de pagamento.
          </p>
          {erro && <p className="erro">{erro}</p>}
        </aside>
      </div>
    </>
  );
}
