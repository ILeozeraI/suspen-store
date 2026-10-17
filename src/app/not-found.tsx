import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="container pagina-simples">
      <span className="eyebrow">Erro 404</span>
      <h1>Página não encontrada</h1>
      <p>O endereço que você abriu não existe ou o produto saiu do catálogo.</p>
      <Link href="/produtos" className="btn btn--vermelho">
        Ver produtos
      </Link>
    </div>
  );
}
