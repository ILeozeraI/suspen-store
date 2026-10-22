"use client";
// Checkout em 3 etapas: 1. Seus dados  2. Entrega  3. Pagamento.
// Os valores mostrados aqui são só para o cliente acompanhar: o servidor recalcula tudo antes de cobrar.

import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCarrinho } from "./CarrinhoProvider";
import { formatarPreco, type Produto } from "@/data/produtos";
import { linkWhatsApp } from "@/data/loja";

const CHAVE_PUBLICA = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? "";
const ATIVO = process.env.NEXT_PUBLIC_PAGAMENTO_ONLINE === "true" && Boolean(CHAVE_PUBLICA);
let mpIniciado = false;

type Cliente = {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};
type Opcao = { id: number; nome: string; transportadora: string; prazo: number; preco: number };
type PacoteFrete = { id: string; titulo: string; origem: string; itens: string[]; opcoes: Opcao[] };

const VAZIO: Cliente = { nome: "", email: "", cpf: "", telefone: "", cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" };
const CHAVE_DADOS = "suspen-checkout-dados";

const mascaraCpf = (v: string) =>
  v.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const mascaraCep = (v: string) => v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
const mascaraTel = (v: string) =>
  v.replace(/\D/g, "").slice(0, 11).replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4,5})(\d{4})$/, "$1-$2");

export function CheckoutCliente({ produtos }: { produtos: Produto[] }) {
  const router = useRouter();
  const { itens, limpar } = useCarrinho();
  const [etapa, setEtapa] = useState<1 | 2 | 3>(1);
  const [cliente, setCliente] = useState<Cliente>(VAZIO);
  const [pacotes, setPacotes] = useState<PacoteFrete[]>([]);
  const [escolhas, setEscolhas] = useState<Record<string, number>>({});
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // Lembra os dados do cliente neste navegador (conveniência; nada de pagamento é guardado)
  useEffect(() => {
    try {
      const s = localStorage.getItem(CHAVE_DADOS);
      if (s) setCliente({ ...VAZIO, ...JSON.parse(s) });
    } catch {}
  }, []);
  useEffect(() => {
    if (ATIVO && !mpIniciado) {
      initMercadoPago(CHAVE_PUBLICA, { locale: "pt-BR" });
      mpIniciado = true;
    }
  }, []);

  const linhas = useMemo(
    () =>
      itens
        .map((i) => ({ ...i, produto: produtos.find((p) => p.slug === i.slug) }))
        .filter((l): l is typeof l & { produto: Produto } => !!l.produto),
    [itens, produtos]
  );
  const totalProdutos = linhas.reduce((s, l) => s + (l.produto.preco ?? 0) * l.quantidade, 0);
  const totalFrete = pacotes.reduce((s, p) => s + (p.opcoes.find((o) => o.id === escolhas[p.id])?.preco ?? 0), 0);
  const total = Math.round((totalProdutos + totalFrete) * 100) / 100;
  const semPreco = linhas.some((l) => !l.produto.preco);

  const campo = (k: keyof Cliente) => ({
    value: cliente[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value;
      if (k === "cpf") v = mascaraCpf(v);
      if (k === "cep") v = mascaraCep(v);
      if (k === "telefone") v = mascaraTel(v);
      if (k === "uf") v = v.toUpperCase().slice(0, 2);
      setCliente((c) => ({ ...c, [k]: v }));
    },
  });

  async function buscarCep() {
    const cep = cliente.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      const d = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`)).json();
      if (d.erro) return;
      setCliente((c) => ({
        ...c,
        rua: c.rua || d.logradouro || "",
        bairro: c.bairro || d.bairro || "",
        cidade: d.localidade || c.cidade,
        uf: d.uf || c.uf,
      }));
    } catch {}
  }

  async function irParaEntrega(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    try {
      localStorage.setItem(CHAVE_DADOS, JSON.stringify(cliente));
    } catch {}
    setCarregando(true);
    try {
      const r = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itens: itens.map(({ slug, quantidade }) => ({ slug, quantidade })), cep: cliente.cep }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro);
      setPacotes(d.pacotes);
      setEscolhas(Object.fromEntries(d.pacotes.map((p: PacoteFrete) => [p.id, p.opcoes[0]?.id])));
      setEtapa(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErro(e instanceof Error && e.message ? e.message : "Não consegui calcular o frete.");
    } finally {
      setCarregando(false);
    }
  }

  async function pagar(param: { formData: object }) {
    setErro("");
    const r = await fetch("/api/pagamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itens: itens.map(({ slug, quantidade }) => ({ slug, quantidade })),
        cliente,
        frete: escolhas,
        pagamento: { formData: param.formData },
      }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.acesso) {
      setErro(d.erro || "Não foi possível concluir o pagamento.");
      throw new Error(d.erro); // o Brick volta a liberar o botão
    }
    limpar();
    router.push(`/pedido/${d.acesso}`);
  }

  if (!ATIVO) {
    return (
      <div className="container pagina-simples">
        <h1>Pagamento no site em breve</h1>
        <p>Por enquanto, finalize seu pedido com a nossa equipe pelo WhatsApp.</p>
        <Link href="/carrinho" className="btn btn--vermelho">
          Voltar para o carrinho
        </Link>
      </div>
    );
  }
  if (linhas.length === 0) {
    return (
      <div className="container pagina-simples">
        <h1>Seu carrinho está vazio</h1>
        <Link href="/produtos" className="btn btn--vermelho">
          Ver produtos
        </Link>
      </div>
    );
  }
  if (semPreco) {
    return (
      <div className="container pagina-simples">
        <h1>Algum item está sem preço no site</h1>
        <p>Finalize este pedido pelo WhatsApp que a nossa equipe passa o valor.</p>
        <a href={linkWhatsApp("Olá! Quero finalizar um pedido do site.")} className="btn btn--whats" target="_blank" rel="noopener">
          Falar no WhatsApp
        </a>
      </div>
    );
  }

  const ETAPAS = ["Seus dados", "Entrega", "Pagamento"];

  return (
    <>
      <section className="pagina-topo">
        <div className="container">
          <h1>Finalizar compra</h1>
          <ol className="etapas" aria-label="Etapas">
            {ETAPAS.map((nome, i) => (
              <li key={nome} className={etapa === i + 1 ? "atual" : etapa > i + 1 ? "feita" : ""}>
                <span>{i + 1}</span> {nome}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="container checkout">
        <div>
          {erro && (
            <p className="checkout__erro" role="alert">
              {erro}
            </p>
          )}

          {etapa === 1 && (
            <form className="checkout__caixa" onSubmit={irParaEntrega}>
              <h2>1. Seus dados</h2>
              <div className="checkout__campos">
                <label className="largo">
                  Nome completo
                  <input {...campo("nome")} required autoComplete="name" />
                </label>
                <label>
                  E-mail
                  <input {...campo("email")} type="email" required autoComplete="email" />
                </label>
                <label>
                  CPF
                  <input {...campo("cpf")} required inputMode="numeric" placeholder="000.000.000-00" />
                </label>
                <label>
                  Celular (WhatsApp)
                  <input {...campo("telefone")} required inputMode="tel" autoComplete="tel" placeholder="(11) 99999-9999" />
                </label>
              </div>
              <h3>Endereço de entrega</h3>
              <div className="checkout__campos">
                <label>
                  CEP
                  <input {...campo("cep")} onBlur={buscarCep} required inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" />
                </label>
                <label className="largo">
                  Rua
                  <input {...campo("rua")} required autoComplete="address-line1" />
                </label>
                <label>
                  Número
                  <input {...campo("numero")} required />
                </label>
                <label>
                  Complemento
                  <input {...campo("complemento")} placeholder="Apto, bloco..." />
                </label>
                <label>
                  Bairro
                  <input {...campo("bairro")} required />
                </label>
                <label>
                  Cidade
                  <input {...campo("cidade")} required />
                </label>
                <label>
                  UF
                  <input {...campo("uf")} required maxLength={2} />
                </label>
              </div>
              <button type="submit" className="btn btn--vermelho btn--grande" disabled={carregando}>
                {carregando ? "Calculando o frete..." : "Continuar para a entrega"}
              </button>
            </form>
          )}

          {etapa === 2 && (
            <div className="checkout__caixa">
              <h2>2. Entrega</h2>
              <p className="checkout__dica">
                Entregar em: {cliente.rua}, {cliente.numero} · {cliente.cidade}/{cliente.uf} ·{" "}
                <button type="button" className="checkout__link" onClick={() => setEtapa(1)}>
                  alterar
                </button>
              </p>
              {pacotes.length > 1 && (
                <p className="checkout__dica">Seu pedido sai de {pacotes.length} lugares diferentes, então chega em {pacotes.length} pacotes.</p>
              )}
              {pacotes.map((p) => (
                <fieldset key={p.id} className="checkout__pacote">
                  <legend>
                    {p.titulo} · enviado de {p.origem}
                  </legend>
                  <p className="checkout__dica">{p.itens.join(" · ")}</p>
                  {p.opcoes.map((o) => (
                    <label key={o.id} className={`checkout__opcao ${escolhas[p.id] === o.id ? "ativa" : ""}`}>
                      <input
                        type="radio"
                        name={`frete-${p.id}`}
                        checked={escolhas[p.id] === o.id}
                        onChange={() => setEscolhas((e) => ({ ...e, [p.id]: o.id }))}
                      />
                      <span>
                        <strong>
                          {o.transportadora} {o.nome}
                        </strong>
                        <small>até {o.prazo} dias úteis</small>
                      </span>
                      <b>{o.preco === 0 ? "Grátis" : formatarPreco(o.preco)}</b>
                    </label>
                  ))}
                </fieldset>
              ))}
              <div className="checkout__botoes">
                <button type="button" className="btn btn--contorno" onClick={() => setEtapa(1)}>
                  Voltar
                </button>
                <button
                  type="button"
                  className="btn btn--vermelho btn--grande"
                  onClick={() => {
                    setEtapa(3);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Continuar para o pagamento
                </button>
              </div>
            </div>
          )}

          {etapa === 3 && (
            <div className="checkout__caixa">
              <h2>3. Pagamento</h2>
              <p className="checkout__dica">
                Pagamento processado pelo Mercado Pago. Os dados do seu cartão não ficam no nosso site.
              </p>
              <Payment
                key={total}
                initialization={{ amount: total, payer: { email: cliente.email } }}
                customization={{
                  paymentMethods: { creditCard: "all", bankTransfer: "all", ticket: "all", maxInstallments: 12 },
                  visual: { style: { theme: "default", customVariables: { baseColor: "#e3141b" } } },
                }}
                onSubmit={pagar}
                onError={(e) => console.error("Brick:", e)}
              />
              <button type="button" className="btn btn--contorno" onClick={() => setEtapa(2)} style={{ marginTop: 12 }}>
                Voltar para a entrega
              </button>
            </div>
          )}
        </div>

        <aside className="resumo" aria-label="Resumo do pedido">
          <h2>Resumo</h2>
          {linhas.map((l) => (
            <div key={l.slug} className="resumo__item">
              <Image src={l.produto.imagem} alt="" width={56} height={56} />
              <span>
                {l.quantidade}x {l.produto.nome}
              </span>
              <span>{formatarPreco(l.produto.preco! * l.quantidade)}</span>
            </div>
          ))}
          <div className="resumo__linha">
            <span>Produtos</span>
            <span>{formatarPreco(totalProdutos)}</span>
          </div>
          <div className="resumo__linha">
            <span>Frete</span>
            <span>{etapa === 1 ? "Na próxima etapa" : totalFrete === 0 ? "Grátis" : formatarPreco(totalFrete)}</span>
          </div>
          <div className="resumo__linha resumo__total">
            <span>Total</span>
            <span>{formatarPreco(total)}</span>
          </div>
          <Link href="/carrinho" className="checkout__link">
            ← Voltar ao carrinho
          </Link>
        </aside>
      </div>
    </>
  );
}
