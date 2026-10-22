import "server-only";
// Integração com o Melhor Envio: cotação de frete e compra/geração/impressão de etiquetas.
// Documentação: https://docs.melhorenvio.com.br
//
// Variáveis (Vercel > Environment Variables; token como Secret):
//   ME_TOKEN          token gerado no painel do Melhor Envio (Configurações > Permissões de acesso > Tokens)
//   ME_AMBIENTE       "sandbox" para testes ou "producao"
//   ME_EMAIL_CONTATO  e-mail técnico (o Melhor Envio exige no cabeçalho User-Agent)
//   FRETE_SIMULADO    "true" só para testar sem Melhor Envio: inventa preços de frete. Nunca em produção.

const TOKEN = process.env.ME_TOKEN ?? "";
const SANDBOX = (process.env.ME_AMBIENTE ?? "sandbox") !== "producao";
const BASE = SANDBOX ? "https://sandbox.melhorenvio.com.br" : "https://melhorenvio.com.br";
const CONTATO = process.env.ME_EMAIL_CONTATO || "contato@suspenstore.com.br";
export const freteSimulado = !TOKEN && process.env.FRETE_SIMULADO === "true";
export const freteConfigurado = Boolean(TOKEN) || freteSimulado;

export type ProdutoCotacao = {
  id: string;
  largura: number;
  altura: number;
  comprimento: number;
  peso: number; // kg
  valor: number; // valor unitário para o seguro
  quantidade: number;
};

export type OpcaoFrete = {
  id: number;
  nome: string;
  transportadora: string;
  preco: number;
  prazo: number; // dias úteis
};

export type Endereco = {
  nome: string;
  telefone?: string | null;
  email?: string | null;
  documento?: string | null; // CPF (11) ou CNPJ (14)
  cep: string;
  rua: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  uf: string;
};

export type Volume = { altura: number; largura: number; comprimento: number; peso: number };

async function me<T>(caminho: string, corpo: unknown): Promise<T> {
  const r = await fetch(`${BASE}/api/v2/me${caminho}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      "User-Agent": `Suspen Store (${CONTATO})`,
    },
    body: JSON.stringify(corpo),
    cache: "no-store",
  });
  const texto = await r.text();
  let dados: unknown;
  try {
    dados = JSON.parse(texto);
  } catch {
    dados = texto;
  }
  if (!r.ok) {
    const msg = typeof dados === "object" && dados && "message" in dados ? String((dados as { message: unknown }).message) : texto;
    throw new Error(`Melhor Envio (${r.status}): ${msg.slice(0, 300)}`);
  }
  return dados as T;
}

// ---------- Cotação ----------
export async function cotar(deCep: string, paraCep: string, produtos: ProdutoCotacao[]): Promise<OpcaoFrete[]> {
  if (freteSimulado) return cotacaoSimulada(deCep, paraCep, produtos);
  if (!TOKEN) throw new Error("Melhor Envio não configurado (ME_TOKEN).");

  type Resp = {
    id: number;
    name: string;
    price?: string;
    custom_price?: string;
    delivery_time?: number;
    custom_delivery_time?: number;
    error?: string;
    company?: { name: string };
  }[];
  const resp = await me<Resp>("/shipment/calculate", {
    from: { postal_code: deCep },
    to: { postal_code: paraCep },
    products: produtos.map((p) => ({
      id: p.id,
      width: p.largura,
      height: p.altura,
      length: p.comprimento,
      weight: p.peso,
      insurance_value: p.valor,
      quantity: p.quantidade,
    })),
    options: { receipt: false, own_hand: false },
  });
  return resp
    .filter((o) => !o.error && (o.custom_price || o.price))
    .map((o) => ({
      id: o.id,
      nome: o.name,
      transportadora: o.company?.name ?? "",
      preco: Number(o.custom_price ?? o.price),
      prazo: Number(o.custom_delivery_time ?? o.delivery_time ?? 0),
    }))
    .sort((a, b) => a.preco - b.preco);
}

function cotacaoSimulada(deCep: string, paraCep: string, produtos: ProdutoCotacao[]): OpcaoFrete[] {
  const peso = produtos.reduce((s, p) => s + p.peso * p.quantidade, 0);
  const longe = deCep.slice(0, 1) !== paraCep.slice(0, 1) ? 1.8 : 1;
  const base = Math.round((22 + peso * 2.4) * longe * 100) / 100;
  return [
    { id: 1, nome: "PAC", transportadora: "Correios (simulado)", preco: base, prazo: longe > 1 ? 9 : 5 },
    { id: 2, nome: "SEDEX", transportadora: "Correios (simulado)", preco: Math.round(base * 1.7 * 100) / 100, prazo: longe > 1 ? 4 : 2 },
    { id: 3, nome: ".Package", transportadora: "Jadlog (simulado)", preco: Math.round(base * 0.9 * 100) / 100, prazo: longe > 1 ? 8 : 4 },
  ].sort((a, b) => a.preco - b.preco);
}

// ---------- Etiqueta ----------
// Fluxo do Melhor Envio: coloca no carrinho → paga com o saldo da conta → gera → pega o link de impressão.
export async function comprarEtiqueta(opts: {
  servico: number;
  de: Endereco;
  para: Endereco;
  produtos: { nome: string; quantidade: number; valor: number }[];
  volume: Volume;
  valorSeguro: number;
  notaFiscal?: string | null;
  pedidoNumero: number;
}): Promise<{ mePedidoId: string; etiquetaUrl: string; valor: number; rastreio: string | null }> {
  if (freteSimulado) {
    return { mePedidoId: `SIMULADO-${opts.pedidoNumero}`, etiquetaUrl: "https://melhorenvio.com.br", valor: 0, rastreio: null };
  }
  if (!TOKEN) throw new Error("Melhor Envio não configurado (ME_TOKEN).");

  const end = (e: Endereco) => {
    const doc = (e.documento ?? "").replace(/\D/g, "");
    return {
      name: e.nome,
      phone: (e.telefone ?? "").replace(/\D/g, "") || undefined,
      email: e.email || undefined,
      ...(doc.length === 14 ? { company_document: doc } : doc ? { document: doc } : {}),
      address: e.rua,
      number: e.numero,
      complement: e.complemento || undefined,
      district: e.bairro,
      city: e.cidade,
      state_abbr: e.uf,
      country_id: "BR",
      postal_code: e.cep,
    };
  };

  const carrinho = await me<{ id: string; price?: string }>("/cart", {
    service: opts.servico,
    from: end(opts.de),
    to: end(opts.para),
    products: opts.produtos.map((p) => ({ name: p.nome, quantity: p.quantidade, unitary_value: p.valor })),
    volumes: [
      {
        height: opts.volume.altura,
        width: opts.volume.largura,
        length: opts.volume.comprimento,
        weight: opts.volume.peso,
      },
    ],
    options: {
      insurance_value: opts.valorSeguro,
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: !opts.notaFiscal, // sem nota fiscal = declaração de conteúdo
      ...(opts.notaFiscal ? { invoice: { key: opts.notaFiscal } } : {}),
      tags: [{ tag: `Pedido ${opts.pedidoNumero}` }],
    },
  });

  await me("/shipment/checkout", { orders: [carrinho.id] });
  await me("/shipment/generate", { orders: [carrinho.id] });
  const impressao = await me<{ url: string }>("/shipment/print", { mode: "public", orders: [carrinho.id] });

  let rastreio: string | null = null;
  try {
    const t = await me<Record<string, { tracking?: string | null }>>("/shipment/tracking", { orders: [carrinho.id] });
    rastreio = t[carrinho.id]?.tracking ?? null;
  } catch {
    // o código de rastreio às vezes só aparece depois da postagem
  }
  return { mePedidoId: carrinho.id, etiquetaUrl: impressao.url, valor: Number(carrinho.price ?? 0), rastreio };
}

export async function rastrear(mePedidoId: string): Promise<{ rastreio: string | null; status: string | null }> {
  if (freteSimulado || !TOKEN) return { rastreio: null, status: null };
  const t = await me<Record<string, { tracking?: string | null; status?: string | null }>>("/shipment/tracking", {
    orders: [mePedidoId],
  });
  return { rastreio: t[mePedidoId]?.tracking ?? null, status: t[mePedidoId]?.status ?? null };
}
