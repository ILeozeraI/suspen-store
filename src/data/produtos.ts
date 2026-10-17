// Tipos, categorias e funções do catálogo.
// Os produtos de verdade ficam no Supabase e são cadastrados pelo painel /admin.
// A lista `produtosIniciais` abaixo serve de reserva: é usada quando o Supabase não está configurado
// (ex.: rodando no PC sem .env.local) e foi a base para preencher o banco (supabase/schema.sql).
//
// preco: valor em reais (ex.: 1399.9). null mostra "Consulte o preço".
// precoAntigo: valor riscado de promoção (opcional).
// estoque: null = não controla estoque; 0 = esgotado.

export type Categoria = {
  slug: string;
  nome: string;
  resumo: string;
};

export type Produto = {
  id?: string;
  slug: string;
  nome: string;
  categoria: string; // slug da categoria
  montadora: string;
  modelos: string[]; // modelos de carro atendidos
  anos?: string; // ex.: "2008 a 2012". Preencher quando o Gilberto confirmar
  imagem: string;
  preco: number | null;
  precoAntigo?: number;
  destaque?: boolean;
  resumo: string;
  observacao?: string;
  estoque?: number | null;
};

export const categorias: Categoria[] = [
  { slug: "suspensao-a-rosca", nome: "Suspensão a rosca", resumo: "Kits rosca slim com regulagem de altura" },
  { slug: "suspensao-a-ar", nome: "Suspensão a ar", resumo: "Bolsas, kits e componentes pneumáticos" },
  { slug: "suspensao-fixa", nome: "Suspensão fixa", resumo: "Rebaixamento fixo com molas e amortecedores" },
  { slug: "amortecedores", nome: "Amortecedores", resumo: "Amortecedores originais por modelo" },
  { slug: "molas-esportivas", nome: "Molas esportivas", resumo: "Molas para rebaixar com segurança" },
];

const resumoRosca =
  "Kit de suspensão a rosca slim com regulagem de altura, para deixar o carro baixo do jeito que você quer. Molas vermelhas, roscas cromadas e flanges de ajuste.";

const obsAplicacao =
  "Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.";

export const produtosIniciais: Produto[] = [
  {
    slug: "kit-rosca-slim-gol-g5",
    nome: "Kit Rosca Slim Gol G5",
    categoria: "suspensao-a-rosca",
    montadora: "Volkswagen",
    modelos: ["Gol G5"],
    imagem: "/produtos/kit-rosca-slim-gol-g5.jpg",
    preco: null,
    destaque: true,
    resumo: resumoRosca,
    observacao: obsAplicacao,
  },
  {
    slug: "kit-rosca-slim-up",
    nome: "Kit Rosca Slim Up",
    categoria: "suspensao-a-rosca",
    montadora: "Volkswagen",
    modelos: ["Up"],
    imagem: "/produtos/kit-rosca-slim-up.jpg",
    preco: null,
    destaque: true,
    resumo: resumoRosca,
    observacao: obsAplicacao,
  },
  {
    slug: "kit-rosca-slim-astra",
    nome: "Kit Rosca Slim Astra",
    categoria: "suspensao-a-rosca",
    montadora: "Chevrolet",
    modelos: ["Astra"],
    imagem: "/produtos/kit-rosca-slim-astra.jpg",
    preco: null,
    destaque: true,
    resumo: resumoRosca,
    observacao: obsAplicacao,
  },
  {
    slug: "kit-rosca-slim-corsa",
    nome: "Kit Rosca Slim Corsa",
    categoria: "suspensao-a-rosca",
    montadora: "Chevrolet",
    modelos: ["Corsa"],
    imagem: "/produtos/kit-rosca-slim-corsa.jpg",
    preco: null,
    destaque: true,
    resumo: resumoRosca,
    observacao: obsAplicacao,
  },
  {
    slug: "kit-rosca-slim-vectra",
    nome: "Kit Rosca Slim Vectra",
    categoria: "suspensao-a-rosca",
    montadora: "Chevrolet",
    modelos: ["Vectra"],
    imagem: "/produtos/kit-rosca-slim-vectra.jpg",
    preco: null,
    resumo: resumoRosca,
    observacao: obsAplicacao,
  },
  {
    slug: "kit-rosca-slim-uno-fire",
    nome: "Kit Rosca Slim Uno Fire",
    categoria: "suspensao-a-rosca",
    montadora: "Fiat",
    modelos: ["Uno Fire"],
    imagem: "/produtos/kit-rosca-slim-uno-fire.jpg",
    preco: null,
    resumo: resumoRosca,
    observacao: obsAplicacao,
  },
  {
    slug: "kit-rosca-slim-uno-way-vivace",
    nome: "Kit Rosca Slim Uno Way / Vivace",
    categoria: "suspensao-a-rosca",
    montadora: "Fiat",
    modelos: ["Uno Way", "Uno Vivace"],
    imagem: "/produtos/kit-rosca-slim-uno-way-vivace.jpg",
    preco: null,
    resumo: resumoRosca,
    observacao: obsAplicacao,
  },
  {
    slug: "kit-rosca-slim-palio-fire",
    nome: "Kit Rosca Slim Palio Fire (furo reto)",
    categoria: "suspensao-a-rosca",
    montadora: "Fiat",
    modelos: ["Palio Fire"],
    imagem: "/produtos/kit-rosca-slim-palio-fire.jpg",
    preco: null,
    resumo: resumoRosca,
    observacao: "Versão para Palio Fire com fixação de furo reto. " + obsAplicacao,
  },
  {
    slug: "kit-rosca-slim-verona",
    nome: "Kit Rosca Slim Verona",
    categoria: "suspensao-a-rosca",
    montadora: "Ford",
    modelos: ["Verona"],
    imagem: "/produtos/kit-rosca-slim-verona.jpg",
    preco: null,
    resumo: resumoRosca,
    observacao: obsAplicacao,
  },
];

// ---------- funções de consulta (recebem a lista de produtos) ----------

export function buscarCategoria(slug: string) {
  return categorias.find((c) => c.slug === slug);
}

export function esgotado(p: Produto) {
  return p.estoque === 0;
}

export function modelosPorMontadora(produtos: Produto[]) {
  const mapa: Record<string, string[]> = {};
  for (const p of produtos) {
    mapa[p.montadora] ??= [];
    for (const m of p.modelos) if (!mapa[p.montadora].includes(m)) mapa[p.montadora].push(m);
  }
  for (const k in mapa) mapa[k].sort();
  return mapa;
}

function normalizar(t: string) {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function filtrarProdutos(
  produtos: Produto[],
  f: { categoria?: string; montadora?: string; modelo?: string; busca?: string }
) {
  return produtos.filter((p) => {
    if (f.categoria && p.categoria !== f.categoria) return false;
    if (f.montadora && p.montadora !== f.montadora) return false;
    if (f.modelo && !p.modelos.includes(f.modelo)) return false;
    if (f.busca) {
      const alvo = normalizar([p.nome, p.montadora, ...p.modelos, buscarCategoria(p.categoria)?.nome ?? ""].join(" "));
      const termos = normalizar(f.busca).split(/\s+/).filter(Boolean);
      if (!termos.every((t) => alvo.includes(t))) return false;
    }
    return true;
  });
}

export function formatarPreco(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
