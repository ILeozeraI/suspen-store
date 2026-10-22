"use server";
// Ações do painel de vendas: etiquetas, rastreio, venda manual do WhatsApp.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/admin";
import { comprarEtiqueta, cotar, freteConfigurado, rastrear } from "@/lib/frete/melhorenvio";
import { calcularItem, descontoFrete } from "@/lib/repasse";
import { arred, lerDecimal, soNumeros } from "@/lib/site";
import { servicoConfigurado, supabaseServico } from "@/lib/supabase/servico";
import type { Envio, Fornecedor, Pedido, PedidoItem } from "@/lib/tipos";

function voltar(caminho: string, msg: { erro?: string; ok?: string }): never {
  const q = msg.erro ? `erro=${encodeURIComponent(msg.erro)}` : `ok=${encodeURIComponent(msg.ok ?? "")}`;
  redirect(`${caminho}?${q}`);
}

// Paga e gera a etiqueta no Melhor Envio. Ela aparece na hora na área do fornecedor para impressão.
export async function gerarEtiqueta(form: FormData) {
  const { sb } = await exigirAdmin();
  const envioId = String(form.get("envio_id"));
  const notaFiscal = String(form.get("nota_fiscal") ?? "").replace(/\D/g, "") || null;
  const { data: e } = await sb.from("envios").select("*").eq("id", envioId).single();
  if (!e) voltar("/admin/vendas", { erro: "Envio não encontrado." });
  const envio = e as Envio;
  const volta = `/admin/vendas/${envio.pedido_id}`;
  if (!freteConfigurado) voltar(volta, { erro: "Melhor Envio ainda não configurado (ME_TOKEN)." });
  if (envio.etiqueta_url) voltar(volta, { erro: "Este pacote já tem etiqueta." });

  const [{ data: p }, { data: f }, { data: its }] = await Promise.all([
    sb.from("pedidos").select("*").eq("id", envio.pedido_id).single(),
    sb.from("fornecedores").select("*").eq("id", envio.fornecedor_id!).single(),
    sb.from("pedido_itens").select("*").eq("pedido_id", envio.pedido_id).eq("fornecedor_id", envio.fornecedor_id!),
  ]);
  const pedido = p as Pedido;
  const forn = f as Fornecedor;
  const itens = (its ?? []) as PedidoItem[];
  if (pedido.status !== "pago") voltar(volta, { erro: "Só dá para gerar etiqueta de pedido pago." });
  if (!pedido.cep || !pedido.rua || !pedido.cidade) voltar(volta, { erro: "O pedido está sem endereço de entrega." });
  if (!pedido.cliente_cpf) voltar(volta, { erro: "O Melhor Envio exige o CPF do cliente." });
  if (!envio.peso_kg || !envio.altura_cm || !envio.largura_cm || !envio.comprimento_cm)
    voltar(volta, { erro: "Pacote sem peso e medidas. Edite os produtos ou o envio." });

  try {
    const valorItens = arred(itens.reduce((s, i) => s + Number(i.preco_unitario) * i.quantidade, 0));
    let servico = envio.servico_id;
    if (!servico) {
      const ops = await cotar(forn.cep, pedido.cep!, [
        {
          id: "pacote",
          largura: envio.largura_cm!,
          altura: envio.altura_cm!,
          comprimento: envio.comprimento_cm!,
          peso: Number(envio.peso_kg),
          valor: valorItens,
          quantidade: 1,
        },
      ]);
      if (!ops[0]) throw new Error("Nenhuma transportadora disponível para este CEP.");
      servico = ops[0].id;
    }
    const r = await comprarEtiqueta({
      servico,
      pedidoNumero: pedido.numero,
      de: { ...forn, telefone: forn.telefone, documento: forn.documento },
      para: {
        nome: pedido.cliente_nome,
        telefone: pedido.cliente_telefone,
        email: pedido.cliente_email,
        documento: pedido.cliente_cpf,
        cep: pedido.cep!,
        rua: pedido.rua!,
        numero: pedido.numero_end ?? "s/n",
        complemento: pedido.complemento,
        bairro: pedido.bairro ?? "",
        cidade: pedido.cidade!,
        uf: pedido.uf!,
      },
      produtos: itens.map((i) => ({ nome: i.nome, quantidade: i.quantidade, valor: Number(i.preco_unitario) })),
      volume: {
        altura: envio.altura_cm!,
        largura: envio.largura_cm!,
        comprimento: envio.comprimento_cm!,
        peso: Number(envio.peso_kg),
      },
      valorSeguro: valorItens,
      notaFiscal,
    });
    const valorReal = r.valor > 0 ? r.valor : Number(envio.valor_real);
    await sb
      .from("envios")
      .update({
        servico_id: servico,
        me_pedido_id: r.mePedidoId,
        etiqueta_url: r.etiquetaUrl,
        rastreio: r.rastreio,
        valor_real: valorReal,
        desconto_fornecedor: descontoFrete(envio.frete_modelo, valorReal, Number(envio.valor_cobrado)),
        nota_fiscal: notaFiscal,
        status: "etiqueta_gerada",
      })
      .eq("id", envio.id);
  } catch (err) {
    voltar(volta, { erro: err instanceof Error ? err.message : "Erro ao gerar etiqueta." });
  }
  revalidatePath(volta);
  voltar(volta, { ok: "Etiqueta gerada. Ela já aparece na área do fornecedor para imprimir." });
}

export async function atualizarRastreio(form: FormData) {
  const { sb } = await exigirAdmin();
  const envioId = String(form.get("envio_id"));
  const { data: e } = await sb.from("envios").select("id, pedido_id, me_pedido_id, status").eq("id", envioId).single();
  if (!e?.me_pedido_id) voltar("/admin/vendas", { erro: "Envio sem etiqueta." });
  const volta = `/admin/vendas/${e.pedido_id}`;
  try {
    const r = await rastrear(e.me_pedido_id);
    const status = r.status === "delivered" ? "entregue" : r.status === "posted" ? "postado" : e.status;
    await sb.from("envios").update({ rastreio: r.rastreio, status }).eq("id", envioId);
  } catch (err) {
    voltar(volta, { erro: err instanceof Error ? err.message : "Erro ao consultar rastreio." });
  }
  voltar(volta, { ok: "Rastreio atualizado." });
}

export async function mudarStatusEnvio(form: FormData) {
  const { sb } = await exigirAdmin();
  const envioId = String(form.get("envio_id"));
  const status = String(form.get("status"));
  if (!["pendente", "etiqueta_gerada", "postado", "entregue", "cancelado"].includes(status)) return;
  const { data: e } = await sb.from("envios").update({ status }).eq("id", envioId).select("pedido_id").single();
  voltar(`/admin/vendas/${e?.pedido_id}`, { ok: "Status do envio atualizado." });
}

export async function mudarStatusPedido(form: FormData) {
  const { sb } = await exigirAdmin();
  const id = String(form.get("pedido_id"));
  const status = String(form.get("status"));
  if (!["pago", "cancelado", "aguardando_pagamento"].includes(status)) return;
  const { data: antes } = await sb.from("pedidos").select("origem").eq("id", id).single();
  if (antes?.origem === "site" && status === "pago")
    voltar(`/admin/vendas/${id}`, { erro: "Pedido do site só fica pago pela confirmação do Mercado Pago." });
  await sb
    .from("pedidos")
    .update({ status, ...(status === "pago" ? { pago_em: new Date().toISOString() } : {}) })
    .eq("id", id);
  voltar(`/admin/vendas/${id}`, { ok: "Status do pedido atualizado." });
}

// Venda fechada pelo WhatsApp: entra nos relatórios e no saldo do fornecedor.
type ItemManual = { produtoId?: string; nome: string; fornecedorId: string; quantidade: number; preco: number; custo: number };

export async function registrarVendaManual(form: FormData) {
  const { sb } = await exigirAdmin();
  const volta = "/admin/vendas/nova";
  const txt = (k: string) => String(form.get(k) ?? "").trim();

  let itens: ItemManual[];
  try {
    itens = JSON.parse(txt("itens"));
  } catch {
    voltar(volta, { erro: "Itens inválidos." });
  }
  itens = itens.filter((i) => i.nome && i.fornecedorId && i.quantidade > 0);
  if (!itens.length) voltar(volta, { erro: "Adicione pelo menos um item com fornecedor." });
  if (itens.some((i) => !Number.isFinite(i.preco) || i.preco < 0 || !Number.isInteger(i.quantidade)))
    voltar(volta, { erro: "Confira quantidade e preço dos itens." });
  const nome = txt("cliente_nome");
  if (!nome) voltar(volta, { erro: "Preencha o nome do cliente ou da loja." });

  const freteCobrado = arred(lerDecimal(txt("frete_cobrado")));
  const freteReal = arred(lerDecimal(txt("frete_real")));
  const data = txt("data") || new Date().toISOString().slice(0, 10);
  const totalProdutos = arred(itens.reduce((s, i) => s + i.preco * i.quantidade, 0));

  const idsForn = [...new Set(itens.map((i) => i.fornecedorId))];
  const { data: fs } = await sb.from("fornecedores").select("*").in("id", idsForn);
  const fornecedores = (fs ?? []) as Fornecedor[];

  const { data: pedido, error } = await sb
    .from("pedidos")
    .insert({
      origem: "whatsapp",
      status: "pago",
      cliente_nome: nome,
      cliente_telefone: soNumeros(form.get("cliente_telefone")) || null,
      cliente_cpf: soNumeros(form.get("cliente_cpf")) || null,
      cep: soNumeros(form.get("cep")) || null,
      rua: txt("rua") || null,
      numero_end: txt("numero") || null,
      complemento: txt("complemento") || null,
      bairro: txt("bairro") || null,
      cidade: txt("cidade") || null,
      uf: txt("uf").toUpperCase() || null,
      total_produtos: totalProdutos,
      total_frete: freteCobrado,
      total: arred(totalProdutos + freteCobrado),
      metodo: "whatsapp",
      taxa_pagamento: arred(lerDecimal(txt("taxa"))),
      observacao: txt("observacao") || null,
      criado_em: `${data}T12:00:00-03:00`,
      pago_em: `${data}T12:00:00-03:00`,
    })
    .select("id")
    .single();
  if (error || !pedido) voltar(volta, { erro: `Não consegui salvar: ${error?.message}` });

  const { data: prods } = await sb
    .from("produtos")
    .select("id, peso_kg, altura_cm, largura_cm, comprimento_cm")
    .in("id", itens.map((i) => i.produtoId).filter(Boolean) as string[]);

  const linhas = itens.map((i) => {
    const f = fornecedores.find((x) => x.id === i.fornecedorId)!;
    const conta = calcularItem(f, i.preco, i.quantidade, i.custo || 0);
    return {
      pedido_id: pedido.id,
      produto_id: i.produtoId || null,
      fornecedor_id: i.fornecedorId,
      nome: i.nome.slice(0, 160),
      quantidade: i.quantidade,
      preco_unitario: i.preco,
      custo_unitario: i.custo || 0,
      comissao: conta.comissao,
      repasse: conta.repasse,
    };
  });

  // Um envio por fornecedor. O frete informado fica no primeiro pacote.
  const envios = idsForn.map((fid, n) => {
    const f = fornecedores.find((x) => x.id === fid)!;
    const doForn = itens.filter((i) => i.fornecedorId === fid);
    const pr = doForn.map((i) => ({ i, p: prods?.find((x) => x.id === i.produtoId) }));
    const temMedidas = pr.every(({ p }) => p?.peso_kg && p.altura_cm && p.largura_cm && p.comprimento_cm);
    const cobrado = n === 0 ? freteCobrado : 0;
    const real = n === 0 ? freteReal : 0;
    return {
      pedido_id: pedido.id,
      fornecedor_id: fid,
      valor_cobrado: cobrado,
      valor_real: real,
      frete_modelo: f.frete_modelo,
      desconto_fornecedor: descontoFrete(f.frete_modelo, real, cobrado),
      ...(temMedidas
        ? {
            peso_kg: arred(pr.reduce((s, { i, p }) => s + Number(p!.peso_kg) * i.quantidade, 0)),
            altura_cm: pr.reduce((s, { i, p }) => s + p!.altura_cm! * i.quantidade, 0),
            largura_cm: Math.max(...pr.map(({ p }) => p!.largura_cm!)),
            comprimento_cm: Math.max(...pr.map(({ p }) => p!.comprimento_cm!)),
          }
        : {}),
      status: form.get("sem_envio") === "on" ? "entregue" : "pendente",
    };
  });

  const [r1, r2] = await Promise.all([sb.from("pedido_itens").insert(linhas), sb.from("envios").insert(envios)]);
  if (r1.error || r2.error) {
    await sb.from("pedidos").delete().eq("id", pedido.id);
    voltar(volta, { erro: `Não consegui salvar os itens: ${r1.error?.message ?? r2.error?.message}` });
  }
  if (servicoConfigurado) await supabaseServico().rpc("baixar_estoque", { pedido: pedido.id });

  revalidatePath("/admin/vendas");
  redirect(`/admin/vendas/${pedido.id}?ok=${encodeURIComponent("Venda do WhatsApp registrada.")}`);
}
