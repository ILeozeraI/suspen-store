// Informações gerais da loja. Para mudar telefone, e-mail ou textos fixos, edite aqui.

export const loja = {
  nome: "Suspen Store",
  slogan: "A loja do carro rebaixado",
  descricao:
    "Kits de suspensão a rosca, suspensão a ar e amortecedores para quem quer o carro baixo, com regulagem e conforto.",
  // Contato direto da Suspen Store (Gilberto, 11/11/2026). Mudar aqui muda o site inteiro.
  whatsapp: "5511965981230",
  whatsappExibicao: "(11) 96598-1230",
  email: "", // preencher quando houver e-mail comercial
  instagram: "", // preencher com o @ da loja
  horario: "Segunda a sexta, das 7h30 às 17h",
  cidade: "Osasco, SP",
};

export function linkWhatsApp(mensagem: string) {
  return `https://wa.me/${loja.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}
