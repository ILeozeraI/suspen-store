import Image from "next/image";
import Link from "next/link";
import { sair } from "@/app/admin/acoes";

const ABAS = [
  { href: "/admin", nome: "Produtos", chave: "produtos" },
  { href: "/admin/fornecedores", nome: "Fornecedores", chave: "fornecedores" },
  { href: "/admin/vendas", nome: "Vendas", chave: "vendas" },
] as const;

export function TopoAdmin({ email, aba }: { email?: string; aba?: (typeof ABAS)[number]["chave"] }) {
  return (
    <>
      <header className="admin__topo">
        <Link href="/admin" className="admin__marca">
          <Image src="/marca/logo-suspen-store-texto.png" alt="Suspen Store" width={180} height={47} />
          <span>Painel</span>
        </Link>
        <nav>
          <Link href="/" target="_blank">
            Ver site ↗
          </Link>
          {email && (
            <form action={sair}>
              <button type="submit" title={email}>
                Sair
              </button>
            </form>
          )}
        </nav>
      </header>
      {email && (
        <nav className="admin__abas" aria-label="Seções do painel">
          {ABAS.map((a) => (
            <Link key={a.chave} href={a.href} className={aba === a.chave ? "ativo" : ""}>
              {a.nome}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
