import type { Metadata } from "next";
import Link from "next/link";
import { loja, linkWhatsApp } from "@/data/loja";

// Rascunho feito em 11/11/2026 a partir do que o site realmente coleta. Revisar com o Gilberto.
// Se o site passar a usar outra ferramenta (Google Analytics, pixel do Facebook, chat, Bling), atualizar esta página.
const CNPJ = "69.743.693/0001-09";
const ATUALIZADO = "11 de novembro de 2026";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: `Como a ${loja.nome} usa e protege os seus dados pessoais, de acordo com a LGPD.`,
};

export default function Privacidade() {
  return (
    <div className="container texto-legal">
      <nav className="trilha" aria-label="Você está em">
        <Link href="/">Início</Link> / <span>Privacidade</span>
      </nav>

      <span className="eyebrow">Ajuda</span>
      <h1>Política de privacidade</h1>
      <p className="texto-legal__intro">
        Aqui explicamos, de forma simples, quais dados pessoais a {loja.nome} usa, para quê e com quem compartilha,
        conforme a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018). Atualizada em {ATUALIZADO}.
      </p>

      <section>
        <h2>Quem cuida dos seus dados</h2>
        <p>
          <strong>{loja.nome}</strong>, CNPJ {CNPJ}. Para qualquer assunto sobre os seus dados, fale com a gente pelo
          WhatsApp <span className="selecionavel">{loja.whatsappExibicao}</span> ({loja.horario}).
        </p>
      </section>

      <section>
        <h2>Quais dados usamos e para quê</h2>
        <p>Só pedimos os dados necessários para vender e entregar o seu pedido:</p>
        <ul>
          <li>
            <strong>Nome, CPF, e-mail e telefone:</strong> para identificar o pedido, emitir nota fiscal quando
            solicitada, e falar com você sobre pagamento, entrega, troca ou garantia.
          </li>
          <li>
            <strong>Endereço de entrega:</strong> para calcular o frete e enviar o produto.
          </li>
          <li>
            <strong>Dados do pedido</strong> (produtos, valores, forma de pagamento): para registrar a venda, cumprir
            obrigações fiscais e atender pedidos de troca e garantia.
          </li>
        </ul>
        <p>
          <strong>Não recebemos nem guardamos os dados do seu cartão.</strong> O pagamento é feito no formulário seguro
          do Mercado Pago, dentro do nosso site, e os dados do cartão vão direto para ele.
        </p>
      </section>

      <section>
        <h2>Com quem compartilhamos</h2>
        <p>Não vendemos os seus dados. Compartilhamos apenas o necessário com quem participa da compra:</p>
        <ul>
          <li>
            <strong>Mercado Pago:</strong> para processar o pagamento (Pix, cartão ou boleto).
          </li>
          <li>
            <strong>Melhor Envio e a transportadora ou os Correios:</strong> nome, endereço e telefone, para calcular o
            frete, gerar a etiqueta e entregar.
          </li>
          <li>
            <strong>Fornecedor que envia o produto:</strong> recebe apenas a etiqueta de envio (nome e endereço de
            entrega) para postar o pacote.
          </li>
          <li>
            <strong>ViaCEP:</strong> quando você digita o CEP, consultamos esse serviço para preencher o endereço
            automaticamente.
          </li>
          <li>
            <strong>Serviços que mantêm o site no ar</strong> (hospedagem e banco de dados), que guardam as informações
            com segurança.
          </li>
          <li>
            <strong>Autoridades</strong>, quando a lei exigir.
          </li>
        </ul>
      </section>

      <section>
        <h2>Dados guardados no seu navegador</h2>
        <p>
          Para facilitar a sua compra, o site guarda <strong>no seu próprio navegador</strong> os itens do carrinho e os
          dados que você digitou no checkout, para não precisar digitar de novo. Essas informações ficam só no seu
          aparelho e você pode apagá-las limpando os dados de navegação. Não usamos cookies de propaganda.
        </p>
      </section>

      <section>
        <h2>Por quanto tempo guardamos</h2>
        <p>
          Guardamos os dados dos pedidos enquanto for necessário para a entrega, a garantia e as obrigações legais e
          fiscais. Depois disso, eles são apagados ou mantidos de forma que não identifiquem você.
        </p>
      </section>

      <section>
        <h2>Seus direitos</h2>
        <p>Pela LGPD, você pode, a qualquer momento:</p>
        <ul>
          <li>saber quais dados seus temos e pedir uma cópia;</li>
          <li>corrigir dados incompletos ou errados;</li>
          <li>pedir que apaguemos os dados que não precisamos mais guardar por lei;</li>
          <li>saber com quem compartilhamos os seus dados.</li>
        </ul>
        <p>Para isso, é só chamar a nossa equipe no WhatsApp.</p>
        <a
          href={linkWhatsApp("Olá! Quero falar sobre os meus dados pessoais (privacidade).")}
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
