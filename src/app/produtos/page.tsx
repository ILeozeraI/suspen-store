import type { Metadata } from "next";
import Link from "next/link";
import { BuscaPorCarro } from "@/components/BuscaPorCarro";
import { CartaoProduto } from "@/components/CartaoProduto";
import { linkWhatsApp } from "@/data/loja";
import { buscarCategoria, categorias, filtrarProdutos, modelosPorMontadora, produtos } from "@/data/produtos";

type Params = { categoria?: string; montadora?: string; modelo?: string; busca?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<Params> }): Promise<Metadata> {
  const sp = await searchParams;
  const cat = sp.categoria ? buscarCategoria(sp.categoria) : undefined;
  return { title: cat ? cat.nome : "Produtos" };
}

function montarLink(atual: Params, mudanca: Partial<Params>) {
  const p = new URLSearchParams();
  const final = { ...atual, ...mudanca };
  for (const [k, v] of Object.entries(final)) if (v) p.set(k, v);
  const s = p.toString();
  return `/produtos${s ? `?${s}` : ""}`;
}

export default async function Produtos({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const lista = filtrarProdutos(sp);
  const cat = sp.categoria ? buscarCategoria(sp.categoria) : undefined;

  const partes: string[] = [];
  if (cat) partes.push(cat.nome);
  if (sp.modelo) partes.push(sp.modelo);
  else if (sp.montadora) partes.push(sp.montadora);
  if (sp.busca) partes.push(`“${sp.busca}”`);
  const titulo = partes.length ? partes.join(" · ") : "Todos os produtos";
  const temFiltro = partes.length > 0;

  const pedidoWhats = `Olá! Procuro ${cat ? cat.nome.toLowerCase() : "uma peça"}${
    sp.modelo ? ` para ${sp.modelo}` : sp.montadora ? ` para ${sp.montadora}` : ""
  } e não encontrei no site. Vocês têm?`;

  return (
    <>
      <section className="pagina-topo">
        <div className="container">
          <h1>{titulo}</h1>
          <p>{cat ? cat.resumo : "Kits e peças para suspensão, separados por categoria e modelo de carro."}</p>
        </div>
      </section>

      <div className="container listagem">
        <aside className="filtros" aria-label="Filtros">
          <h2>Categorias</h2>
          <ul>
            <li>
              <Link href={montarLink(sp, { categoria: undefined })} className={!sp.categoria ? "ativo" : ""}>
                Todas <small>{produtos.length}</small>
              </Link>
            </li>
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link href={montarLink(sp, { categoria: c.slug })} className={sp.categoria === c.slug ? "ativo" : ""}>
                  {c.nome} <small>{produtos.filter((p) => p.categoria === c.slug).length}</small>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div>
          <div style={{ marginBottom: 18 }}>
            <BuscaPorCarro
              key={`${sp.montadora}-${sp.modelo}`}
              modelos={modelosPorMontadora()}
              inicialMontadora={sp.montadora}
              inicialModelo={sp.modelo}
            />
          </div>

          <div className="resultado-topo">
            <span>
              {lista.length} {lista.length === 1 ? "produto encontrado" : "produtos encontrados"}
            </span>
            {temFiltro && <Link href="/produtos">Limpar filtros</Link>}
          </div>

          {lista.length ? (
            <div className="grade">
              {lista.map((p) => (
                <CartaoProduto key={p.slug} produto={p} />
              ))}
            </div>
          ) : (
            <div className="vazio">
              <h2>{cat && produtos.every((p) => p.categoria !== cat.slug) ? "Em breve" : "Nada encontrado"}</h2>
              <p>
                {cat && produtos.every((p) => p.categoria !== cat.slug)
                  ? "Estamos cadastrando os produtos desta categoria. Fale com a gente no WhatsApp que verificamos para você."
                  : "Não encontramos produtos com esses filtros. Fale com a gente no WhatsApp que procuramos a peça certa para o seu carro."}
              </p>
              <a href={linkWhatsApp(pedidoWhats)} target="_blank" rel="noopener" className="btn btn--whats">
                Falar no WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
