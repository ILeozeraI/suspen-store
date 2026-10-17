// Informações gerais da loja. Para mudar telefone, e-mail ou textos fixos, edite aqui.

export const loja = {
  nome: "Suspen Store",
  slogan: "A loja do carro rebaixado",
  descricao:
    "Kits de suspensão a rosca, suspensão a ar e amortecedores para quem quer o carro baixo, com regulagem e conforto.",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "5511968334426",
  whatsappExibicao: "(11) 96833-4426",
  email: "", // preencher quando houver e-mail comercial
  instagram: "", // preencher com o @ da loja
  horario: "Segunda a sexta, das 7h30 às 17h",
  cidade: "Osasco, SP",
};

export function linkWhatsApp(mensagem: string) {
  return `https://wa.me/${loja.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}
