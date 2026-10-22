// Cria o pedido e o pagamento (Checkout Transparente do Mercado Pago).
// Preços, frete e total são SEMPRE recalculados aqui. Do navegador só usamos: itens (slug + quantidade),
// dados do cliente, o serviço de frete escolhido em cada pacote e o formulário do Mercado Pago (token do cartão).

import { NextResponse } from "next/server";
import { cotarCarrinho, cpfValido, ErroCheckout, ErroFrete, lerCep, validarCarrinho } from "@/lib/checkout";
import { freteConfigurado } from "@/lib/frete/melhorenvio";
import { aplicarPagamento } from "@/lib/pedidos";
import { criarPagamento, mpConfigurado, type DadosBrick } from "@/lib/payments/mercadopago";
import { calcularItem, descontoFrete } from "@/lib/repasse";
import { arred, soNumeros, urlSite } from "@/lib/site";
import { servicoConfigurado, supabaseServico } from "@/lib/supabase/servico";

type Corpo = {
  itens?: unknown;
  cliente?: Record<string, string>;
  frete?: Record<string, number>; // id do pacote (fornecedor) → id do serviço
  pagamento?: { formData?: DadosBrick & { transaction_amount?: number } };
};

export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_PAGAMENTO_ONLINE !== "true" || !mpConfigurado || !freteConfigurado || !servicoConfigurado) {
    return NextResponse.json({ erro: "Pagamento online ainda não está ativo. Finalize pelo WhatsApp." }, { status: 503 });
  }

  let corpo: Corpo;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  try {
    // 1. Cliente
    const c = corpo.cliente ?? {};
    const cliente = {
      nome: String(c.nome ?? "").trim().slice(0, 120),
      email: String(c.email ?? "").trim().toLowerCase().slice(0, 160),
      cpf: soNumeros(c.cpf),
      telefone: soNumeros(c.telefone),
      cep: lerCep(c.cep),
      rua: String(c.rua ?? "").trim().slice(0, 160),
      numero: String(c.numero ?? "").trim().slice(0, 20),
      complemento: String(c.complemento ?? "").trim().slice(0, 80),
      bairro: String(c.bairro ?? "").trim().slice(0, 80),
      cidade: String(c.cidade ?? "").trim().slice(0, 80),
      uf: String(c.uf ?? "").trim().toUpperCase().slice(0, 2),
    };
    if (cliente.nome.split(/\s+/).length < 2) throw new ErroCheckout("Informe nome e sobrenome.");
    if (!/^\S+@\S+\.\S+$/.test(cliente.email)) throw new ErroCheckout("E-mail inválido.");
    if (!cpfValido(cliente.cpf)) throw new ErroCheckout("CPF inválido.");
    if (cliente.telefone.length < 10) throw new ErroCheckout("Telefone com DDD inválido.");
    if (!cliente.rua || !cliente.numero || !cliente.bairro || !cliente.cidade || !/^[A-Z]{2}$/.test(cliente.uf))
      throw new ErroCheckout("Endereço incompleto.");

    // 2. Produtos e frete (recalculados)
    const itens = await validarCarrinho(corpo.itens);
    const cotados = await cotarCarrinho(itens, cliente.cep);
    const sb = supabaseServico();
    const { data: custos } = await sb
      .from("produtos_custos")
      .select("produto_id, custo")
      .in("produto_id", itens.map((i) => i.produto.id!).filter(Boolean));

    const envios = cotados.map(({ pacote, opcoes }) => {
      const escolhido = corpo.frete?.[pacote.fornecedor.id];
      const op = opcoes.find((o) => o.id === Number(escolhido));
      if (!op) throw new ErroCheckout("Escolha o frete de todos os pacotes.");
      return {
        pacote,
        op,
        frete_modelo: pacote.fornecedor.frete_modelo,
        desconto: descontoFrete(pacote.fornecedor.frete_modelo, op.precoReal, op.precoCliente),
      };
    });

    const totalProdutos = arred(itens.reduce((s, i) => s + i.produto.preco! * i.quantidade, 0));
    const totalFrete = arred(envios.reduce((s, e) => s + e.op.precoCliente, 0));
    const total = arred(totalProdutos + totalFrete);

    const informado = Number(corpo.pagamento?.formData?.transaction_amount ?? total);
    if (Math.abs(informado - total) > 0.01) {
      throw new ErroCheckout("Os valores mudaram desde que você abriu a página. Volte uma etapa e confira o total.");
    }
    if (!corpo.pagamento?.formData?.payment_method_id) throw new ErroCheckout("Escolha a forma de pagamento.");

    // 3. Grava o pedido (aguardando pagamento)
    const { data: pedido, error: ePedido } = await sb
      .from("pedidos")
      .insert({
        origem: "site",
        cliente_nome: cliente.nome,
        cliente_email: cliente.email,
        cliente_cpf: cliente.cpf,
        cliente_telefone: cliente.telefone,
        cep: cliente.cep,
        rua: cliente.rua,
        numero_end: cliente.numero,
        complemento: cliente.complemento || null,
        bairro: cliente.bairro,
        cidade: cliente.cidade,
        uf: cliente.uf,
        total_produtos: totalProdutos,
        total_frete: totalFrete,
        total,
      })
      .select("id, numero, acesso")
      .single();
    if (ePedido || !pedido) throw new Error(ePedido?.message ?? "Falha ao criar pedido");

    const linhasItens = envios.flatMap(({ pacote }) =>
      pacote.itens.map(({ produto: p, quantidade }) => {
        const custo = Number(custos?.find((x) => x.produto_id === p.id)?.custo ?? 0);
        const conta = calcularItem(pacote.fornecedor, p.preco!, quantidade, custo);
        return {
          pedido_id: pedido.id,
          produto_id: p.id,
          fornecedor_id: pacote.fornecedor.id,
          nome: p.nome,
          quantidade,
          preco_unitario: p.preco!,
          custo_unitario: custo,
          comissao: conta.comissao,
          repasse: conta.repasse,
          frete_gratis: Boolean(p.freteGratis),
        };
      })
    );
    const linhasEnvios = envios.map(({ pacote, op, frete_modelo, desconto }) => ({
      pedido_id: pedido.id,
      fornecedor_id: pacote.fornecedor.id,
      servico_id: op.id,
      servico_nome: op.nome,
      transportadora: op.transportadora,
      prazo_dias: op.prazo,
      valor_cobrado: op.precoCliente,
      valor_real: op.precoReal,
      frete_modelo,
      desconto_fornecedor: desconto,
      peso_kg: pacote.volume.peso,
      altura_cm: pacote.volume.altura,
      largura_cm: pacote.volume.largura,
      comprimento_cm: pacote.volume.comprimento,
    }));
    const [r1, r2] = await Promise.all([
      sb.from("pedido_itens").insert(linhasItens),
      sb.from("envios").insert(linhasEnvios),
    ]);
    if (r1.error || r2.error) {
      await sb.from("pedidos").delete().eq("id", pedido.id);
      throw new Error(r1.error?.message ?? r2.error?.message);
    }

    // 4. Cobra no Mercado Pago
    let pagamento: Awaited<ReturnType<typeof criarPagamento>>;
    try {
      pagamento = await criarPagamento({
        dados: corpo.pagamento.formData,
        valor: total,
        pedidoId: pedido.id,
        pedidoNumero: pedido.numero,
        urlNotificacao: `${urlSite()}/api/mercadopago/webhook`,
        cliente: { nome: cliente.nome, email: cliente.email, cpf: cliente.cpf },
      });
    } catch (e) {
      console.error(e);
      await sb.from("pedidos").update({ status: "recusado", mp_status_detail: "erro_ao_criar" }).eq("id", pedido.id);
      return NextResponse.json(
        { erro: "O Mercado Pago não aceitou o pagamento. Confira os dados ou tente outra forma de pagamento." },
        { status: 402 }
      );
    }
    // Se gravar o resultado falhar, o webhook do Mercado Pago corrige depois. Nunca marcar como recusado aqui.
    let status = pagamento.status === "rejected" ? "recusado" : "aguardando_pagamento";
    try {
      status = await aplicarPagamento(pedido.id, pagamento);
    } catch (e) {
      console.error("aplicarPagamento:", e);
    }

    if (status === "recusado") {
      return NextResponse.json(
        { erro: "Pagamento recusado. Confira os dados do cartão ou escolha outra forma de pagamento.", acesso: pedido.acesso },
        { status: 402 }
      );
    }
    return NextResponse.json({ acesso: pedido.acesso, status });
  } catch (e) {
    if (e instanceof ErroCheckout || e instanceof ErroFrete) return NextResponse.json({ erro: e.message }, { status: 400 });
    console.error(e);
    return NextResponse.json({ erro: "Não foi possível concluir o pedido. Tente de novo ou fale no WhatsApp." }, { status: 500 });
  }
}
