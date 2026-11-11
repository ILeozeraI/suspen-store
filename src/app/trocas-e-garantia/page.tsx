import type { Metadata } from "next";
import Link from "next/link";
import { metaPagina } from "@/lib/metadados";
import { loja, linkWhatsApp } from "@/data/loja";

// Regras definidas pelo Gilberto em 11/11/2026. Para mudar prazo ou regra, edite os textos abaixo.
export const metadata: Metadata = metaPagina(
  "Trocas, devoluções e garantia",
  "Garantia de 6 meses em todas as peças dos kits, troca em até 7 dias e direito de desistência. Veja como funciona na Suspen Store."
);

export default function TrocasEGarantia() {
  return (
    <div className="container texto-legal">
      <nav className="trilha" aria-label="Você está em">
        <Link href="/">Início</Link> / <span>Trocas e garantia</span>
      </nav>

      <span className="eyebrow">Ajuda</span>
      <h1>Trocas, devoluções e garantia</h1>
      <p className="texto-legal__intro">
        Queremos que você compre com segurança. Aqui está, de forma simples, como funcionam a garantia, as trocas e as
        devoluções na {loja.nome}.
      </p>

      <section>
        <h2>Garantia de 6 meses</h2>
        <p>
          <strong>Todas as peças dos kits têm garantia de 6 meses</strong>, contados a partir do dia em que você recebe o
          pedido. A garantia cobre defeito de fabricação das peças.
        </p>
        <h3>O que a garantia não cobre</h3>
        <ul>
          <li>
            <strong>Instalação errada</strong>, feita fora das regras do <strong>diagrama de instalação</strong> que
            acompanha o produto.
          </li>
        </ul>
        <p>Por isso, recomendamos que a instalação seja feita por um profissional, seguindo o diagrama.</p>
        <h3>Frete na garantia</h3>
        <p>
          Se o defeito for confirmado, <strong>você não paga frete</strong>: o envio da peça de volta e da peça nova fica
          por nossa conta. O mesmo vale se enviarmos um produto errado.
        </p>
      </section>

      <section>
        <h2>Comprou o modelo errado? Troca em até 7 dias</h2>
        <p>
          Se o kit ou a peça não serve no seu carro, você pode pedir a troca em até <strong>7 dias</strong> depois de
          receber o pedido.
        </p>
        <ul>
          <li>
            O produto deve voltar <strong>sem sinais de instalação</strong>, com todas as peças e na embalagem original.
          </li>
          <li>
            <strong>O frete para devolver a peça é por conta do comprador.</strong>
          </li>
        </ul>
        <p>
          Para evitar isso, confirme a aplicação antes de comprar: fale com a nossa equipe pelo WhatsApp com o modelo, o
          ano e o motor do seu carro.
        </p>
      </section>

      <section>
        <h2>Desistência da compra (direito de arrependimento)</h2>
        <p>
          Pelo Código de Defesa do Consumidor (art. 49), quem compra pela internet pode desistir da compra em até{" "}
          <strong>7 dias</strong> depois de receber o pedido, sem precisar explicar o motivo. Nesse caso, devolvemos{" "}
          <strong>o valor que você pagou, incluindo o frete</strong>, depois que o produto chegar de volta, e{" "}
          <strong>o frete da devolução fica por nossa conta</strong>. O mesmo vale se o pedido for cancelado.
        </p>
      </section>

      <section>
        <h2>Como pedir troca, devolução ou garantia</h2>
        <ol>
          <li>
            Chame a nossa equipe no WhatsApp <span className="selecionavel">{loja.whatsappExibicao}</span> ({loja.horario}
            ).
          </li>
          <li>Informe o número do pedido e o que aconteceu.</li>
          <li>Em caso de garantia, envie fotos ou um vídeo mostrando o problema.</li>
          <li>Nós respondemos com as instruções de envio e o prazo.</li>
        </ol>
        <a
          href={linkWhatsApp("Olá! Quero falar sobre troca, devolução ou garantia. Meu pedido é: ")}
          target="_blank"
          rel="noopener"
          className="btn btn--whats"
        >
          Falar no WhatsApp
        </a>
      </section>
    </div>
  );
}
