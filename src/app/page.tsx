import Image from "next/image";
import Link from "next/link";
import { BuscaPorCarro } from "@/components/BuscaPorCarro";
import { CartaoProduto } from "@/components/CartaoProduto";
import { linkWhatsApp } from "@/data/loja";
import { categorias, modelosPorMontadora, produtos } from "@/data/produtos";

export default function Inicio() {
  const destaques = produtos.filter((p) => p.destaque);
  const qtdPorCategoria = (slug: string) => produtos.filter((p) => p.categoria === slug).length;

  return (
    <>
      <section className="hero">
        <div className="container hero__in">
          <div className="hero__txt">
            <span className="eyebrow">Kit Rosca Slim</span>
            <h1>
              Deixe seu carro <em>no chão</em> com regulagem
            </h1>
            <p>
              Kits de suspensão a rosca com molas vermelhas, roscas cromadas e flanges de ajuste. Escolha pelo modelo do
              seu carro e feche pelo site ou pelo WhatsApp.
            </p>
            <div className="hero__acoes">
              <Link href="/produtos?categoria=suspensao-a-rosca" className="btn btn--vermelho btn--grande">
                Ver kits rosca slim
              </Link>
              <a
                href={linkWhatsApp("Olá! Vim pelo site da Suspen Store e quero ajuda para escolher um kit.")}
                target="_blank"
                rel="noopener"
                className="btn btn--contorno btn--grande"
              >
                Tirar dúvida no WhatsApp
              </a>
            </div>
          </div>
          <div className="hero__foto">
            <Image
              src="/produtos/kit-rosca-slim-gol-g5.jpg"
              alt="Kit Rosca Slim com molas vermelhas"
              width={1254}
              height={1254}
              priority
              sizes="(max-width: 760px) 90vw, 520px"
            />
            <span className="hero__selo">9 modelos de carro</span>
          </div>
        </div>
      </section>

      <div className="container secao-busca">
        <BuscaPorCarro modelos={modelosPorMontadora()} />
      </div>

      <section className="secao container">
        <div className="secao__topo">
          <h2>Categorias</h2>
          <Link href="/produtos">Ver todos os produtos →</Link>
        </div>
        <div className="categorias">
          {categorias.map((c) => {
            const qtd = qtdPorCategoria(c.slug);
            return (
              <Link key={c.slug} href={`/produtos?categoria=${c.slug}`} className="categoria">
                <div>
                  <h3>{c.nome}</h3>
                  <p>{c.resumo}</p>
                </div>
                <span className="categoria__qtd">{qtd > 0 ? `${qtd} produtos` : "Em breve"}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="secao container" style={{ paddingTop: 0 }}>
        <div className="secao__topo">
          <h2>Mais procurados</h2>
          <Link href="/produtos?categoria=suspensao-a-rosca">Ver todos os kits →</Link>
        </div>
        <div className="grade">
          {destaques.map((p) => (
            <CartaoProduto key={p.slug} produto={p} />
          ))}
        </div>
      </section>

      <section className="vantagens">
        <div className="container vantagens__grade">
          <div className="vantagem">
            <strong>Compra segura</strong>
            <span>Pagamento pelo Mercado Pago, sem expor os dados do seu cartão</span>
          </div>
          <div className="vantagem">
            <strong>Até 12x no cartão</strong>
            <span>Ou Pix e boleto à vista</span>
          </div>
          <div className="vantagem">
            <strong>Envio para todo o Brasil</strong>
            <span>Correios e transportadoras parceiras</span>
          </div>
          <div className="vantagem">
            <strong>Instalador parceiro</strong>
            <span>Indicamos onde instalar depois da compra</span>
          </div>
        </div>
      </section>

      <section className="secao container">
        <div className="secao__topo">
          <h2>Como comprar</h2>
        </div>
        <div className="passos">
          <div className="passo">
            <h3>Escolha pelo carro</h3>
            <p>Use a busca por montadora e modelo para ver os kits que servem no seu carro.</p>
          </div>
          <div className="passo">
            <h3>Feche do seu jeito</h3>
            <p>Pague direto no site pelo Mercado Pago ou finalize o pedido com a nossa equipe pelo WhatsApp.</p>
          </div>
          <div className="passo">
            <h3>Receba e instale</h3>
            <p>Enviamos para todo o Brasil e indicamos um instalador parceiro perto de você.</p>
          </div>
        </div>
      </section>
    </>
  );
}
