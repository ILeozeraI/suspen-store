"use server";
// Ações do painel admin (rodam só no servidor).

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { categorias } from "@/data/produtos";
import { exigirAdmin } from "@/lib/admin";
import { supabaseComSessao } from "@/lib/supabase/servidor";

const BUCKET = "produtos";
const TIPOS_FOTO: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_FOTO = 4 * 1024 * 1024;

function voltarCom(caminho: string, erro: string): never {
  redirect(`${caminho}${caminho.includes("?") ? "&" : "?"}erro=${encodeURIComponent(erro)}`);
}

export async function entrar(form: FormData) {
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");
  if (!email || !senha) voltarCom("/admin/login", "Preencha e-mail e senha.");
  const sb = await supabaseComSessao();
  const { error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error) voltarCom("/admin/login", "E-mail ou senha incorretos.");
  redirect("/admin");
}

export async function sair() {
  const sb = await supabaseComSessao();
  await sb.auth.signOut();
  redirect("/admin/login");
}

function gerarSlug(t: string) {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Aceita "1399,90", "1.399,90", "1399.90" ou "R$ 1.399,90". Vazio = null.
function lerPreco(v: FormDataEntryValue | null): number | null | "invalido" {
  let t = String(v ?? "").replace(/[R$\s]/g, "");
  if (!t) return null;
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0 || n > 1_000_000) return "invalido";
  return Math.round(n * 100) / 100;
}

function lerInteiro(v: FormDataEntryValue | null): number | null | "invalido" {
  const t = String(v ?? "").trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isInteger(n) || n < 0 || n > 100000) return "invalido";
  return n;
}

export async function salvarProduto(form: FormData) {
  const { sb } = await exigirAdmin();
  const id = String(form.get("id") ?? "") || null;
  const origem = id ? `/admin/produtos/${id}` : "/admin/produtos/novo";

  const nome = String(form.get("nome") ?? "").trim();
  const slug = gerarSlug(String(form.get("slug") ?? "").trim() || nome);
  const categoria = String(form.get("categoria") ?? "");
  const montadora = String(form.get("montadora") ?? "").trim();
  const modelos = String(form.get("modelos") ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  const anos = String(form.get("anos") ?? "").trim() || null;
  const resumo = String(form.get("resumo") ?? "").trim();
  const observacao = String(form.get("observacao") ?? "").trim() || null;
  const preco = lerPreco(form.get("preco"));
  const precoAntigo = lerPreco(form.get("preco_antigo"));
  const estoque = lerInteiro(form.get("estoque"));
  const ordem = lerInteiro(form.get("ordem"));
  const destaque = form.get("destaque") === "on";
  const ativo = form.get("ativo") === "on";
  const foto = form.get("foto");
  const fornecedorId = String(form.get("fornecedor_id") ?? "") || null;
  const custo = lerPreco(form.get("custo"));
  const freteGratis = form.get("frete_gratis") === "on";
  const pesoTxt = String(form.get("peso_kg") ?? "").trim().replace(",", ".");
  const pesoKg = pesoTxt ? Number(pesoTxt) : null;
  const altura = lerInteiro(form.get("altura_cm"));
  const largura = lerInteiro(form.get("largura_cm"));
  const comprimento = lerInteiro(form.get("comprimento_cm"));

  if (!nome || nome.length > 120) voltarCom(origem, "Preencha o nome (até 120 letras).");
  if (!slug) voltarCom(origem, "Endereço (slug) inválido.");
  if (!categorias.some((c) => c.slug === categoria)) voltarCom(origem, "Escolha uma categoria.");
  if (!montadora) voltarCom(origem, "Preencha a montadora.");
  if (modelos.length === 0) voltarCom(origem, "Preencha pelo menos um modelo de carro.");
  if (!resumo) voltarCom(origem, "Preencha a descrição.");
  if (preco === "invalido") voltarCom(origem, "Preço inválido. Exemplo: 1399,90");
  if (precoAntigo === "invalido") voltarCom(origem, "Preço antigo inválido. Exemplo: 1599,90");
  if (estoque === "invalido") voltarCom(origem, "Estoque precisa ser um número inteiro (ou vazio).");
  if (ordem === "invalido") voltarCom(origem, "Ordem precisa ser um número inteiro (ou vazio).");
  if (!fornecedorId) voltarCom(origem, "Escolha o fornecedor.");
  if (custo === "invalido") voltarCom(origem, "Custo inválido. Exemplo: 900,00");
  if (pesoKg !== null && (!Number.isFinite(pesoKg) || pesoKg <= 0 || pesoKg > 300)) voltarCom(origem, "Peso inválido. Exemplo: 12,5");
  if (altura === "invalido" || largura === "invalido" || comprimento === "invalido")
    voltarCom(origem, "Medidas da caixa em centímetros, número inteiro.");

  let imagem = String(form.get("imagem_atual") ?? "") || null;
  if (foto instanceof File && foto.size > 0) {
    const ext = TIPOS_FOTO[foto.type];
    if (!ext) voltarCom(origem, "A foto precisa ser JPG, PNG ou WEBP.");
    if (foto.size > MAX_FOTO) voltarCom(origem, "A foto pode ter no máximo 4 MB.");
    const caminho = `${slug}-${Date.now()}.${ext}`;
    const { error } = await sb.storage.from(BUCKET).upload(caminho, foto, { contentType: foto.type });
    if (error) voltarCom(origem, `Não consegui enviar a foto: ${error.message}`);
    imagem = sb.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
  }
  if (!imagem) voltarCom(origem, "Envie uma foto do produto.");

  const dados = {
    slug,
    nome,
    categoria,
    montadora,
    modelos,
    anos,
    imagem,
    preco,
    preco_antigo: precoAntigo,
    destaque,
    resumo,
    observacao,
    estoque,
    ativo,
    ordem: ordem ?? 0,
    fornecedor_id: fornecedorId,
    frete_gratis: freteGratis,
    peso_kg: pesoKg,
    altura_cm: altura || null,
    largura_cm: largura || null,
    comprimento_cm: comprimento || null,
  };

  const { data: salvo, error } = id
    ? await sb.from("produtos").update(dados).eq("id", id).select("id").single()
    : await sb.from("produtos").insert(dados).select("id").single();
  if (error || !salvo) {
    if (error?.code === "23505") voltarCom(origem, "Já existe um produto com esse endereço (slug). Mude o nome ou o slug.");
    voltarCom(origem, `Não consegui salvar: ${error?.message}`);
  }

  // Custo fica numa tabela só do admin (a tabela de produtos é pública)
  const { error: eCusto } =
    custo === null
      ? await sb.from("produtos_custos").delete().eq("produto_id", salvo.id)
      : await sb.from("produtos_custos").upsert({ produto_id: salvo.id, custo });
  if (eCusto) voltarCom(`/admin/produtos/${salvo.id}`, `Produto salvo, mas o custo não: ${eCusto.message}`);

  revalidatePath("/", "layout");
  redirect(`/admin?ok=${encodeURIComponent(`"${nome}" salvo.`)}`);
}

export async function excluirProduto(form: FormData) {
  const { sb } = await exigirAdmin();
  const id = String(form.get("id") ?? "");
  const { error } = await sb.from("produtos").delete().eq("id", id);
  if (error) voltarCom(`/admin/produtos/${id}`, `Não consegui excluir: ${error.message}`);
  revalidatePath("/", "layout");
  redirect(`/admin?ok=${encodeURIComponent("Produto excluído.")}`);
}
