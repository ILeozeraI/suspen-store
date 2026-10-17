"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCarrinho } from "@/components/CarrinhoProvider";
import { linkWhatsApp } from "@/data/loja";

// Página para onde o Mercado Pago devolve o cliente depois de um pagamento aprovado.
export default function PedidoConcluido() {
  const { limpar } = useCarrinho();
  useEffect(() => limpar(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container pagina-simples">
      <span className="eyebrow">Pagamento aprovado</span>
      <h1>Pedido recebido!</h1>
      <p>
        Obrigado pela compra. Você vai receber a confirmação do Mercado Pago por e-mail, e nossa equipe entra em contato
        para combinar o envio e indicar um instalador parceiro.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a
          href={linkWhatsApp("Olá! Acabei de fazer um pedido pelo site da Suspen Store.")}
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
