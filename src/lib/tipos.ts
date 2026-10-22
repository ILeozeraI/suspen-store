// Tipos das tabelas de fornecedores, pedidos e envios (iguais às colunas do banco).
export type Fornecedor = {
  id: string;
  nome: string;
  documento: string | null;
  telefone: string | null;
  email: string | null;
  cep: string;
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  user_id: string | null;
  modelo: "comissao" | "revenda";
  comissao_tipo: "percentual" | "fixo";
  comissao_valor: number;
  frete_modelo: "cliente" | "loja" | "fornecedor";
  ativo: boolean;
  observacao: string | null;
};

export type StatusPedido = "aguardando_pagamento" | "pago" | "cancelado" | "recusado" | "reembolsado";
export type StatusEnvio = "pendente" | "etiqueta_gerada" | "postado" | "entregue" | "cancelado";

export type Pedido = {
  id: string;
  numero: number;
  acesso: string;
  origem: "site" | "whatsapp";
  status: StatusPedido;
  cliente_nome: string;
  cliente_email: string | null;
  cliente_cpf: string | null;
  cliente_telefone: string | null;
  cep: string | null;
  rua: string | null;
  numero_end: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  total_produtos: number;
  total_frete: number;
  total: number;
  metodo: string | null;
  parcelas: number | null;
  taxa_pagamento: number;
  mp_payment_id: string | null;
  mp_status: string | null;
  mp_status_detail: string | null;
  pix_copia_cola: string | null;
  pix_qr_base64: string | null;
  boleto_url: string | null;
  observacao: string | null;
  criado_em: string;
  pago_em: string | null;
};

export type PedidoItem = {
  id: string;
  pedido_id: string;
  produto_id: string | null;
  fornecedor_id: string | null;
  nome: string;
  quantidade: number;
  preco_unitario: number;
  custo_unitario: number;
  comissao: number;
  repasse: number;
  frete_gratis: boolean;
};

export type Envio = {
  id: string;
  pedido_id: string;
  fornecedor_id: string | null;
  servico_id: number | null;
  servico_nome: string | null;
  transportadora: string | null;
  prazo_dias: number | null;
  valor_cobrado: number;
  valor_real: number;
  frete_modelo: "cliente" | "loja" | "fornecedor";
  desconto_fornecedor: number;
  peso_kg: number | null;
  altura_cm: number | null;
  largura_cm: number | null;
  comprimento_cm: number | null;
  me_pedido_id: string | null;
  etiqueta_url: string | null;
  rastreio: string | null;
  nota_fiscal: string | null;
  status: StatusEnvio;
};

export const NOME_FRETE_MODELO: Record<string, string> = {
  cliente: "Cliente paga",
  loja: "Loja paga (grátis pro cliente)",
  fornecedor: "Fornecedor paga (grátis pro cliente)",
};

export const NOME_STATUS: Record<string, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  cancelado: "Cancelado",
  recusado: "Recusado",
  reembolsado: "Reembolsado",
  pendente: "Etiqueta pendente",
  etiqueta_gerada: "Etiqueta gerada",
  postado: "Postado",
  entregue: "Entregue",
};
