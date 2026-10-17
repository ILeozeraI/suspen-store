import Image from "next/image";
import Link from "next/link";
import { buscarCategoria, esgotado, formatarPreco, type Produto } from "@/data/produtos";
import { BotaoAdicionar } from "./BotaoAdicionar";

export function CartaoProduto({ produto }: { produto: Produto }) {
  const desconto =
    produto.preco && produto.precoAntigo ? Math.round((1 - produto.preco / produto.precoAntigo) * 100) : 0;

  return (
    <article className="cartao">
      <Link href={`/produto/${produto.slug}`} className="cartao__foto">
        <Image
          src={produto.imagem}
          alt={produto.nome}
          width={600}
          height={600}
          sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 280px"
        />
        {desconto > 0 && <span className="selo-desconto">-{desconto}%</span>}
      </Link>
      <div className="cartao__corpo">
        <span className="cartao__cat">
          {buscarCategoria(produto.categoria)?.nome} · {produto.montadora}
        </span>
        <h3 className="cartao__nome">
          <Link href={`/produto/${produto.slug}`}>{produto.nome}</Link>
        </h3>
        <div className="cartao__preco">
          {produto.preco ? (
            <>
              {produto.precoAntigo && <s>{formatarPreco(produto.precoAntigo)}</s>}
              <strong>{formatarPreco(produto.preco)}</strong>
              <small>em até 12x no cartão</small>
            </>
          ) : (
            <span className="consulte">Consulte o preço</span>
          )}
        </div>
        {esgotado(produto) ? (
          <span className="btn btn--escuro" aria-disabled="true">
            Esgotado
          </span>
        ) : (
          <BotaoAdicionar slug={produto.slug} />
        )}
      </div>
    </article>
  );
}
