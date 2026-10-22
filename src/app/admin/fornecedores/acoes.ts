"use server";
// Ações do cadastro de fornecedores (rodam só no servidor).

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/admin";
import { lerDecimal, soNumeros } from "@/lib/site";
import { servicoConfigurado, supabaseServico } from "@/lib/supabase/servico";

function voltarCom(caminho: string, erro: string): never {
  redirect(`${caminho}${caminho.includes("?") ? "&" : "?"}erro=${encodeURIComponent(erro)}`);
}
const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function salvarFornecedor(form: FormData) {
  const { sb } = await exigirAdmin();
  const id = txt(form, "id") || null;
  const origem = id ? `/admin/fornecedores/${id}` : "/admin/fornecedores/novo";

  const dados = {
    nome: txt(form, "nome"),
    documento: soNumeros(form.get("documento")) || null,
    telefone: soNumeros(form.get("telefone")) || null,
    email: txt(form, "email").toLowerCase() || null,
    cep: soNumeros(form.get("cep")),
    rua: txt(form, "rua"),
    numero: txt(form, "numero"),
    complemento: txt(form, "complemento") || null,
    bairro: txt(form, "bairro"),
    cidade: txt(form, "cidade"),
    uf: txt(form, "uf").toUpperCase(),
    ativo: form.get("ativo") === "on",
    observacao: txt(form, "observacao") || null,
    modelo: txt(form, "modelo") === "revenda" ? "revenda" : "comissao",
    comissao_tipo: txt(form, "comissao_tipo") === "fixo" ? "fixo" : "percentual",
    comissao_valor: lerDecimal(form.get("comissao_valor")),
    frete_modelo: ["cliente", "loja", "fornecedor"].includes(txt(form, "frete_modelo")) ? txt(form, "frete_modelo") : "cliente",
  };

  if (!Number.isFinite(dados.comissao_valor) || dados.comissao_valor < 0) voltarCom(origem, "Comissão inválida.");
  if (dados.comissao_tipo === "percentual" && dados.comissao_valor > 100) voltarCom(origem, "Comissão em % não pode passar de 100.");
  if (!dados.nome) voltarCom(origem, "Preencha o nome do fornecedor.");
  if (dados.cep.length !== 8) voltarCom(origem, "CEP precisa ter 8 números.");
  if (!dados.rua || !dados.numero || !dados.bairro || !dados.cidade) voltarCom(origem, "Preencha o endereço completo.");
  if (!/^[A-Z]{2}$/.test(dados.uf)) voltarCom(origem, "UF precisa ter 2 letras (ex.: SP).");
  if (dados.documento && ![11, 14].includes(dados.documento.length)) voltarCom(origem, "CPF tem 11 números e CNPJ tem 14.");
  if (dados.telefone && (dados.telefone.length < 10 || dados.telefone.length > 11)) voltarCom(origem, "Telefone com DDD: 10 ou 11 números.");

  const { data, error } = id
    ? await sb.from("fornecedores").update(dados).eq("id", id).select("id").single()
    : await sb.from("fornecedores").insert(dados).select("id").single();
  if (error || !data) voltarCom(origem, `Não consegui salvar: ${error?.message}`);

  revalidatePath("/admin/fornecedores");
  redirect(`/admin/fornecedores/${data.id}?ok=${encodeURIComponent("Fornecedor salvo.")}`);
}

// Cria o login da área do fornecedor (/fornecedor). Usa a chave secreta: só o servidor cria usuários.
export async function criarAcesso(form: FormData) {
  const { sb } = await exigirAdmin();
  const id = txt(form, "id");
  const origem = `/admin/fornecedores/${id}`;
  const email = txt(form, "email").toLowerCase();
  const senha = String(form.get("senha") ?? "");
  if (!servicoConfigurado) voltarCom(origem, "Falta configurar a SUPABASE_SECRET_KEY para criar logins.");
  if (!/^\S+@\S+\.\S+$/.test(email)) voltarCom(origem, "E-mail inválido.");
  if (senha.length < 8) voltarCom(origem, "A senha precisa ter pelo menos 8 caracteres.");

  const adm = supabaseServico();
  const { data, error } = await adm.auth.admin.createUser({ email, password: senha, email_confirm: true });
  if (error || !data.user) voltarCom(origem, `Não consegui criar o login: ${error?.message}`);

  const { error: e2 } = await sb.from("fornecedores").update({ user_id: data.user.id, email }).eq("id", id);
  if (e2) {
    await adm.auth.admin.deleteUser(data.user.id);
    voltarCom(origem, `Não consegui ligar o login ao fornecedor: ${e2.message}`);
  }
  redirect(`${origem}?ok=${encodeURIComponent("Login criado. Passe o e-mail e a senha para o fornecedor.")}`);
}

export async function removerAcesso(form: FormData) {
  const { sb } = await exigirAdmin();
  const id = txt(form, "id");
  const origem = `/admin/fornecedores/${id}`;
  const { data: f } = await sb.from("fornecedores").select("user_id").eq("id", id).single();
  if (f?.user_id && servicoConfigurado) await supabaseServico().auth.admin.deleteUser(f.user_id);
  await sb.from("fornecedores").update({ user_id: null }).eq("id", id);
  redirect(`${origem}?ok=${encodeURIComponent("Login removido.")}`);
}

export async function registrarAcerto(form: FormData) {
  const { sb } = await exigirAdmin();
  const id = txt(form, "fornecedor_id");
  const origem = `/admin/fornecedores/${id}`;
  let v = txt(form, "valor").replace(/[R$\s]/g, "");
  if (v.includes(",")) v = v.replace(/\./g, "").replace(",", ".");
  const valor = Number(v);
  if (!Number.isFinite(valor) || valor <= 0) voltarCom(origem, "Valor do acerto inválido. Ex.: 1250,00");
  const data = txt(form, "data") || new Date().toISOString().slice(0, 10);
  const { error } = await sb.from("acertos").insert({
    fornecedor_id: id,
    valor: Math.round(valor * 100) / 100,
    data,
    observacao: txt(form, "observacao") || null,
  });
  if (error) voltarCom(origem, `Não consegui registrar: ${error.message}`);
  redirect(`${origem}?ok=${encodeURIComponent("Acerto registrado.")}`);
}

export async function excluirAcerto(form: FormData) {
  const { sb } = await exigirAdmin();
  const id = txt(form, "fornecedor_id");
  await sb.from("acertos").delete().eq("id", txt(form, "acerto_id"));
  redirect(`/admin/fornecedores/${id}?ok=${encodeURIComponent("Acerto excluído.")}`);
}
