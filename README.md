<img width="1600" height="792" alt="suspen-store-home" src="https://github.com/user-attachments/assets/f7bbb0a9-f818-4931-b62c-43c3e6ecffcd" />

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
- Painel administrativo (`/admin`) com login: cadastro de produtos, preço, estoque e fotos, protegido por RLS no Supabase
- Layout responsivo (celular e computador) e metadados para SEO e compartilhamento

## Tecnologias

Next.js 15 · React 19 · TypeScript · CSS · Supabase (Postgres, Auth, Storage) · Mercado Pago · (em breve) Melhor Envio · Vercel

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # no Windows: copy .env.example .env.local
npm run dev
```

Acesse http://localhost:3000.

## Roadmap

- [x] Vitrine, busca, filtro por carro, carrinho e pedido pelo WhatsApp
- [x] Painel administrativo com Supabase (produtos, preços, fotos e estoque)
- [ ] Pagamento online (Mercado Pago) e cálculo de frete (Melhor Envio)
- [ ] Páginas institucionais, indicação de instalador e domínio próprio

Detalhes técnicos e decisões do projeto: [CLAUDE.md](./CLAUDE.md).
