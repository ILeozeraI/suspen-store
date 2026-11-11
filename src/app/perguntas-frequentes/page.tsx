import type { Metadata } from "next";
import Link from "next/link";
import { metaPagina } from "@/lib/metadados";
import { loja, linkWhatsApp } from "@/data/loja";

// Perguntas frequentes (11/11/2026). Só com informações confirmadas pelo Gilberto e pelo João.
// Para acrescentar uma pergunta, é só incluir um item na lista abaixo.
type Pergunta = { p: string; r: React.ReactNode; texto: string };

const perguntas: Pergunta[] = [
  {
    p: "O que vem no kit de suspensão rosca slim completo?",
    texto:
      "O kit completo vem com 4 amortecedores reduzidos com tubos de rosca, 4 molas e 4 batentes: o jogo para as 4 rodas, dianteira e traseira.",
    r: (
      <>
        O kit completo vem com <strong>4 amortecedores reduzidos com tubos de rosca, 4 molas e 4 batentes</strong>: o
        jogo para as 4 rodas, dianteira e traseira.
      </>
    ),
  },
  {
    p: "Como sei se o kit serve no meu carro?",
    texto:
      "Na página de cada kit aparece a aplicação (modelo e versões). Antes de comprar, confirme com a nossa equipe pelo WhatsApp informando o modelo, o ano e o motor do seu carro.",
    r: (
      <>
        Na página de cada kit aparece a <strong>aplicação</strong> (modelo e versões). Antes de comprar, confirme com a
        nossa equipe pelo WhatsApp informando <strong>o modelo, o ano e o motor</strong> do seu carro.
      </>
    ),
  },
  {
    p: "Quanto o carro fica baixo?",
    texto:
      "Com a regulagem a rosca você escolhe a altura. Na medida social, mais baixo fica com cerca de 2 cm entre o pneu e o para-lama, e mais alto com 4 a 8 cm. Cada kit tem uma imagem mostrando as duas alturas no próprio carro.",
    r: (
      <>
        Com a regulagem a rosca, <strong>você escolhe a altura</strong>. Na medida social, mais baixo fica com cerca de{" "}
        <strong>2 cm</strong> entre o pneu e o para-lama, e mais alto com <strong>4 a 8 cm</strong>. Cada kit tem uma
        imagem mostrando as duas alturas no próprio carro.
      </>
    ),
  },
  {
    p: "Precisa de um profissional para instalar?",
    texto:
      "Recomendamos que a instalação seja feita por um profissional, seguindo o diagrama de instalação que acompanha o produto. A garantia não cobre instalação feita fora das regras do diagrama.",
    r: (
      <>
        Recomendamos que a instalação seja feita <strong>por um profissional</strong>, seguindo o diagrama de instalação
        que acompanha o produto. A garantia não cobre instalação feita fora das regras do diagrama.
      </>
    ),
  },
  {
    p: "Qual é a garantia?",
    texto:
      "Todas as peças dos kits têm garantia de 6 meses contra defeito de fabricação, contados a partir do recebimento.",
    r: (
      <>
        Todas as peças dos kits têm <strong>garantia de 6 meses</strong> contra defeito de fabricação, contados a partir
        do recebimento. Veja os detalhes em <Link href="/trocas-e-garantia">Trocas, devoluções e garantia</Link>.
      </>
    ),
  },
  {
    p: "Comprei o modelo errado. Posso trocar?",
    texto:
      "Sim, em até 7 dias depois de receber, com o produto sem sinais de instalação, com todas as peças e na embalagem original. O frete para devolver a peça é por conta do comprador.",
    r: (
      <>
        Sim, em até <strong>7 dias</strong> depois de receber, com o produto sem sinais de instalação, com todas as peças
        e na embalagem original. O frete para devolver a peça é por conta do comprador. Veja em{" "}
        <Link href="/trocas-e-garantia">Trocas, devoluções e garantia</Link>.
      </>
    ),
  },
  {
    p: "Quais são as formas de pagamento?",
    texto:
      "Pix, cartão de crédito em até 12x ou boleto, pelo Mercado Pago. Se preferir, você também pode fechar o pedido com a nossa equipe pelo WhatsApp.",
    r: (
      <>
        <strong>Pix, cartão de crédito em até 12x ou boleto</strong>, pelo Mercado Pago. Se preferir, você também pode
        fechar o pedido com a nossa equipe pelo WhatsApp.
      </>
    ),
  },
  {
    p: "Vocês entregam na minha cidade? Quanto custa o frete?",
    texto:
      "Enviamos para todo o Brasil. O valor e o prazo do frete são calculados pelo seu CEP na hora da compra.",
    r: (
      <>
        Enviamos para <strong>todo o Brasil</strong>. O valor e o prazo do frete são calculados pelo seu CEP na hora da
        compra.
      </>
    ),
  },
  {
    p: "Vocês emitem nota fiscal?",
    texto: "Sim. Se precisar de nota fiscal, é só pedir à nossa equipe.",
    r: <>Sim. Se precisar de nota fiscal, é só pedir à nossa equipe.</>,
  },
  {
    p: "Quero o carro muito alto ou muito baixo, ou um projeto diferente. Vocês fazem?",
    texto:
      "Casos especiais, como kit super alto, super baixo ou um projeto técnico, são atendidos pelo WhatsApp com a nossa equipe.",
    r: (
      <>
        Casos especiais, como kit super alto, super baixo ou um projeto técnico, são atendidos{" "}
        <strong>pelo WhatsApp</strong> com a nossa equipe.
      </>
    ),
  },
  {
    p: "Qual é o horário de atendimento?",
    texto: `${loja.horario}, pelo WhatsApp ${loja.whatsappExibicao}.`,
    r: (
      <>
        {loja.horario}, pelo WhatsApp <span className="selecionavel">{loja.whatsappExibicao}</span>.
      </>
    ),
  },
];

export const metadata: Metadata = metaPagina(
  "Perguntas frequentes",
  "Tire suas dúvidas sobre os kits de suspensão rosca slim: o que vem no kit, aplicação, altura, instalação, garantia, troca, pagamento e frete."
);

export default function PerguntasFrequentes() {
  // Dados estruturados: ajudam o Google a mostrar as perguntas direto na busca.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: perguntas.map((x) => ({
      "@type": "Question",
      name: x.p,
      acceptedAnswer: { "@type": "Answer", text: x.texto },
    })),
  };

  return (
    <div className="container texto-legal">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="trilha" aria-label="Você está em">
        <Link href="/">Início</Link> / <span>Perguntas frequentes</span>
      </nav>

      <span className="eyebrow">Ajuda</span>
      <h1>Perguntas frequentes</h1>
      <p className="texto-legal__intro">As dúvidas mais comuns sobre os nossos kits. Clique na pergunta para ver a resposta.</p>

      <div className="faq">
        {perguntas.map((x) => (
          <details key={x.p}>
            <summary>{x.p}</summary>
            <p>{x.r}</p>
          </details>
        ))}
      </div>

      <section>
        <h2>Não achou sua dúvida?</h2>
        <p>Fale com a nossa equipe. A gente ajuda você a escolher o kit certo para o seu carro.</p>
        <a
          href={linkWhatsApp("Olá! Tenho uma dúvida sobre os kits de suspensão.")}
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
