# Suspen Store

Loja virtual da Suspen Store, especializada em suspensão para carros rebaixados: kits de suspensão a rosca,
suspensão a ar, suspensão fixa, amortecedores e molas esportivas.

Projeto desenvolvido por **Leonardo Cavalcanti da Silva** ([GitHub](https://github.com/ILeozeraI) ·
[LinkedIn](https://www.linkedin.com/in/leonardo-silva-011319348)).

## Funcionalidades

- Catálogo com categorias, busca por texto e filtro por montadora e modelo do carro
- Página de produto com ficha de aplicação e atalho para tirar dúvida pelo WhatsApp
- Carrinho salvo no navegador, com duas formas de fechar o pedido:
  - **Finalizar pelo WhatsApp**: abre a conversa com o pedido já escrito
  - **Pagar no site**: Mercado Pago Checkout Pro (Pix, cartão em até 12x e boleto), com preço sempre recalculado no servidor
- Layout responsivo (celular e computador) e metadados para SEO e compartilhamento

## Tecnologias

Next.js 15 · React 19 · TypeScript · CSS · Mercado Pago · (em breve) Supabase e Melhor Envio · Vercel

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # no Windows: copy .env.example .env.local
npm run dev
```

Acesse http://localhost:3000.

## Roadmap

- [x] Vitrine, busca, filtro por carro, carrinho e pedido pelo WhatsApp
- [ ] Painel administrativo com Supabase (produtos, preços, fotos e estoque)
- [ ] Pagamento online (Mercado Pago) e cálculo de frete (Melhor Envio)
- [ ] Páginas institucionais, indicação de instalador e domínio próprio

Detalhes técnicos e decisões do projeto: [CLAUDE.md](./CLAUDE.md).
