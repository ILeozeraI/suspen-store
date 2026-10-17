import Image from "next/image";
import Link from "next/link";
import { categorias } from "@/data/produtos";
import { loja } from "@/data/loja";

export function Rodape() {
  return (
    <footer className="rodape">
      <div className="container rodape__grid">
        <div className="rodape__marca">
          <Image src="/marca/logo-suspen-store-transparente.png" alt="Suspen Store" width={140} height={134} />
          <p>{loja.descricao}</p>
        </div>

        <div>
          <h2>Categorias</h2>
          <ul>
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link href={`/produtos?categoria=${c.slug}`}>{c.nome}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Atendimento</h2>
          <ul>
            <li>
              WhatsApp: <span className="selecionavel">{loja.whatsappExibicao}</span>
            </li>
            <li>{loja.horario}</li>
            {loja.email && <li>{loja.email}</li>}
            {loja.instagram && <li>Instagram: {loja.instagram}</li>}
          </ul>
        </div>

        <div>
          <h2>Compra segura</h2>
          <ul>
            <li>Pagamento pelo Mercado Pago</li>
            <li>Pix, cartão em até 12x ou boleto</li>
            <li>Envio para todo o Brasil</li>
            <li>Indicação de instalador parceiro</li>
          </ul>
        </div>
      </div>
      <div className="rodape__fim">
        <div className="container">
          © {new Date().getFullYear()} {loja.nome}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
