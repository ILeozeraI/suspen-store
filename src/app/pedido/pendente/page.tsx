import Link from "next/link";
import { linkWhatsApp } from "@/data/loja";

// Para Pix ou boleto ainda não compensados.
export default function PedidoPendente() {
  return (
    <div className="container pagina-simples">
      <span className="eyebrow">Aguardando pagamento</span>
      <h1>Falta pouco</h1>
      <p>
        Seu pedido foi registrado e está esperando a confirmação do pagamento. Se pagou por boleto, a compensação pode
        levar até 2 dias úteis. Assim que for aprovado, nossa equipe entra em contato.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a
          href={linkWhatsApp("Olá! Fiz um pedido pelo site da Suspen Store e o pagamento está pendente.")}
          target="_blank"
          rel="noopener"
          className="btn btn--whats"
        >
          Falar com a equipe
        </a>
        <Link href="/" className="btn btn--contorno">
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
