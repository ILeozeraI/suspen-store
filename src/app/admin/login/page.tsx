import Image from "next/image";
import { entrar } from "../acoes";
import { Avisos } from "@/components/admin/Avisos";
import { BotaoEnviar } from "@/components/admin/BotaoEnviar";

export default async function Login({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <div className="admin__login">
      <form action={entrar} className="admin__cartao">
        <Image src="/marca/logo-suspen-store-texto.png" alt="Suspen Store" width={220} height={57} />
        <h1>Painel da loja</h1>
        <Avisos erro={erro} />
        <label>
          E-mail
          <input type="email" name="email" autoComplete="username" required />
        </label>
        <label>
          Senha
          <input type="password" name="senha" autoComplete="current-password" required />
        </label>
        <BotaoEnviar texto="Entrar" enviando="Entrando..." className="btn btn--vermelho btn--grande" />
      </form>
    </div>
  );
}
