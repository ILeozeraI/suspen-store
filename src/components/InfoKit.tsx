// Bloco "O que vem no kit" e selos de confiança da página do produto.
// O João pediu as informações em destaque no site (e não escritas nas fotos, por causa do Google Shopping).
// O Gilberto quer que o cliente resolva tudo no site: os selos passam segurança para quem não conhece a loja.

export function OQueVemNoKit() {
  const itens = [
    { n: 4, t: "Amortecedores", d: "reduzidos, com tubo de rosca" },
    { n: 4, t: "Molas slim", d: "2 dianteiras e 2 traseiras" },
    { n: 4, t: "Batentes", d: "1 para cada amortecedor" },
  ];
  return (
    <section className="kit-itens" aria-label="O que vem no kit">
      <h2>O que vem no kit</h2>
      <ul>
        {itens.map((i) => (
          <li key={i.t}>
            <strong>{i.n}</strong>
            <span>
              {i.t}
              <small>{i.d}</small>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SelosConfianca() {
  const selos = [
    { icone: "🛡️", t: "Garantia de 6 meses", d: "contra defeito de fabricação" },
    { icone: "🔄", t: "Troca em até 7 dias", d: "se não servir no seu carro" },
    { icone: "🚚", t: "Envio para todo o Brasil", d: "frete calculado pelo CEP" },
    { icone: "🔒", t: "Pagamento seguro", d: "Pix, cartão em até 12x ou boleto" },
  ];
  return (
    <ul className="selos" aria-label="Compra segura">
      {selos.map((s) => (
        <li key={s.t}>
          <span aria-hidden="true">{s.icone}</span>
          <div>
            <strong>{s.t}</strong>
            <small>{s.d}</small>
          </div>
        </li>
      ))}
    </ul>
  );
}
