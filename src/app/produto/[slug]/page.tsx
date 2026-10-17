import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotaoAdicionar } from "@/components/BotaoAdicionar";
import { CartaoProduto } from "@/components/CartaoProduto";
import { linkWhatsApp } from "@/data/loja";
import { buscarCategoria, esgotado, formatarPreco } from "@/data/produtos";
import { buscarProduto, listarProdutos } from "@/lib/catalogo";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await listarProdutos()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await buscarProduto(slug);
  if (!p) return {};
  return {
    title: p.nome,
    description: p.resumo,
    openGraph: { title: p.nome, description: p.resumo, images: [p.imagem] },
  };
}

export default async function PaginaProduto({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await buscarProduto(slug);
  if (!p) notFound();
  const produtos = await listarProdutos();

  const cat = buscarCategoria(p.categoria);
  const relacionados = produtos.filter((x) => x.categoria === p.categoria && x.slug !== p.slug).slice(0, 4);
  const msgDuvida = `Olá! Tenho interesse no ${p.nome}. Meu carro é: (modelo, ano e motor)`;

  return (
    <div className="container">
      <nav className="trilha" aria-label="Você está em">
        <Link href="/">Início</Link> / <Link href={`/produtos?categoria=${p.categoria}`}>{cat?.nome}</Link> /{" "}
        <span>{p.nome}</span>
      </nav>

      <div className="produto">
        <div className="produto__foto">
          <Image src={p.imagem} alt={p.nome} width={1254} height={1254} priority sizes="(max-width: 760px) 100vw, 600px" />
        </div>

        <div className="produto__info">
          <span className="eyebrow">
            {cat?.nome} · {p.montadora}
          </span>
          <h1>{p.nome}</h1>
          <p style={{ margin: 0 }}>{p.resumo}</p>

          <div className="produto__preco">
            {p.preco ? (
              <>
                {p.precoAntigo && <s>{formatarPreco(p.precoAntigo)}</s>}
                <strong>{formatarPreco(p.preco)}</strong>
                <small>Em até 12x no cartão pelo Mercado Pago, ou Pix e boleto</small>
              </>
            ) : (
              <>
                <span className="consulte">Consulte o preço</span>
                <small>Adicione ao carrinho e finalize pelo WhatsApp para receber o valor e o frete.</small>
              </>
            )}
          </div>

          <div className="produto__acoes">
            {esgotado(p) ? (
              <span className="btn btn--escuro btn--grande" aria-disabled="true">
                Esgotado
              </span>
            ) : (
              <BotaoAdicionar slug={p.slug} grande />
            )}
            <a href={linkWhatsApp(msgDuvida)} target="_blank" rel="noopener" className="btn btn--whats btn--grande">
              Tirar dúvida sobre aplicação
            </a>
          </div>

          <dl className="ficha">
            <dt>Categoria</dt>
            <dd>{cat?.nome}</dd>
            <dt>Montadora</dt>
            <dd>{p.montadora}</dd>
            <dt>Aplicação</dt>
            <dd>
              {p.modelos.join(", ")}
              {p.anos ? ` (${p.anos})` : ""}
            </dd>
          </dl>

          {p.observacao && <div className="aviso-aplicacao">{p.observacao}</div>}
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="secao" style={{ paddingTop: 8 }}>
          <div className="secao__topo">
            <h2>Veja também</h2>
          </div>
          <div className="grade">
            {relacionados.map((r) => (
              <CartaoProduto key={r.slug} produto={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
