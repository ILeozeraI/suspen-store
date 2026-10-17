import Image from "next/image";
import Link from "next/link";
import { sair } from "@/app/admin/acoes";

export function TopoAdmin({ email }: { email?: string }) {
  return (
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
  );
}
