# Suspen Store: guia do projeto

Este arquivo explica o projeto para qualquer pessoa (ou IA) que for mexer no site.
**Leia inteiro antes de alterar qualquer coisa.** Quando uma decisão nova for tomada, atualize este arquivo.

## O que é

Loja virtual da **Suspen Store** ("A loja do carro rebaixado"): kits de suspensão a rosca, suspensão a ar,
suspensão fixa, amortecedores e molas esportivas.

- Dono do negócio: **Gilberto** (tio do Leonardo). Aprova mudanças junto com o **João**.
- Responsável pelo site: **Leonardo Cavalcanti da Silva** (GitHub: ILeozeraI).
- Estoque em Osasco/SP, venda só online, envio para todo o Brasil. Atendimento das 7h30 às 17h.
- Domínio pretendido: suspenstore.com.br (hoje aponta para um site antigo em WordPress feito pelo João).

## Tecnologias

| Parte | Ferramenta | Situação |
|---|---|---|
| Site | Next.js 15 (App Router) + React 19 + TypeScript | Pronto |
| Estilo | CSS puro em `src/app/globals.css` (sem Tailwind) | Pronto |
| Produtos | Tabela `produtos` no Supabase, editada pelo painel `/admin` | Pronto |
| Banco, login e fotos | Supabase, projeto `suspen-store` (São Paulo), org. Suspen Store | Pronto (admin: leonardo.devcorp@gmail.com) |
| Pagamento | Mercado Pago, Checkout Pro | Código pronto e **desligado** (fase 3) |
| Frete | Melhor Envio (o Gilberto já tem contrato) | Fase 3 |
| Hospedagem | Vercel, plano Hobby | No ar em https://suspen-store.vercel.app (publica sozinho a cada push na `main`) |
| Repositório | GitHub (`ILeozeraI/suspen-store`) | Criado |

## Como rodar no computador

Precisa do Node.js 20 ou mais novo.

```bash
npm install          # só na primeira vez (ou quando mudar o package.json)
npm run dev          # abre em http://localhost:3000
npm run build        # confere se está tudo certo antes de publicar
```

Copie `.env.example` para `.env.local` e preencha. Na Vercel já estão `NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (tipo Config, ambiente Production). **O `.env.local` nunca vai para o GitHub.**

## Onde fica cada coisa

```
supabase/
  schema.sql             estrutura do banco, regras de segurança, bucket de fotos e os 9 kits iniciais
public/
  marca/                 logo (original, transparente e só o texto para o cabeçalho)
  produtos/              fotos dos produtos (nome: categoria-modelo.jpg, minúsculo, sem espaço)
src/
  data/loja.ts           telefone, WhatsApp, horário, textos fixos da loja
  data/produtos.ts       tipos, categorias, lista reserva de produtos e funções de busca/filtro
  lib/catalogo.ts        lê os produtos do Supabase (ou da lista reserva, se não houver Supabase)
  lib/supabase/          conexão com o Supabase (config e cliente com login)
  lib/admin.ts           checa se quem acessa o painel é admin
  app/admin/             painel: login, lista de produtos, cadastro/edição (acoes.ts = salvar, excluir, sair)
  components/admin/      formulário de produto e peças do painel
  middleware.ts          renova o login do painel
  components/            cabeçalho, rodapé, cartão de produto, carrinho, busca por carro, botão do WhatsApp
  app/page.tsx           página inicial
  app/produtos/          listagem com filtros (?categoria=, ?montadora=, ?modelo=, ?busca=)
  app/produto/[slug]/    página de cada produto
  app/carrinho/          carrinho com "Finalizar pelo WhatsApp" e "Pagar no site"
  app/pedido/            telas de retorno do Mercado Pago (concluído e pendente)
  app/api/pagamento/     cria o pagamento no Mercado Pago (recalcula preços no servidor)
  lib/payments/          integração com o Mercado Pago
  app/globals.css        todo o visual (cores e fontes no topo, em :root)
```

## Tarefas comuns

**Adicionar ou editar produto:** pelo painel em `/admin` (login com e-mail e senha do Supabase). Preço vazio mostra
"Consulte o preço"; estoque vazio não controla, 0 mostra "Esgotado". O site atualiza na hora ao salvar.

**Dar acesso de admin a outra pessoa:** Supabase > Authentication > Users > Add user (com "Auto Confirm"). Depois, no
SQL Editor: `insert into public.admins (user_id) select id from auth.users where email = 'email@da.pessoa';`

**Mudar a estrutura do banco:** edite `supabase/schema.sql` e rode no SQL Editor (o arquivo pode ser rodado de novo).

**Mudar telefone ou WhatsApp:** `src/data/loja.ts` (e a variável `NEXT_PUBLIC_WHATSAPP`).

**Mudar cores:** variáveis no topo de `src/app/globals.css`.

## Decisões já tomadas (não mudar sem falar com o Leonardo)

- O pedido pode ser fechado de **duas formas, permanentes**: pagando no site (Mercado Pago) ou pelo WhatsApp.
  O WhatsApp não é provisório.
- O site só vai **oficialmente** para o ar quando pagamento e frete estiverem funcionando.
- Pagamento: **Mercado Pago, Checkout Pro**. O cliente paga na página do Mercado Pago, e dados de cartão nunca passam
  pelo site. Pix, cartão em até 12x e boleto.
- Preços **sempre recalculados no servidor** (`app/api/pagamento`). Nunca confiar no preço vindo do navegador.
- Repositório público, mas **nenhuma chave ou senha no código**. Tudo em `.env.local` e nas variáveis da Vercel.
- Supabase: o site usa só a **publishable key** (pública). A segurança fica nas regras RLS do banco: visitante só lê
  produtos ativos; só quem está na tabela `admins` cadastra, edita, exclui e envia fotos. A **secret key nunca é usada**.
- Cadastro público de usuários no Supabase fica **desligado**. Admins são criados à mão no painel do Supabase.
- Sem Supabase configurado (ex.: `.env.local` sem as chaves), o site mostra a lista reserva de `src/data/produtos.ts`.
- Visual inspirado no site da Castor Suspensões (castorsuspensoes.com.br), com a identidade da logo da Suspen Store:
  preto, vermelho e prata. Títulos em Barlow Condensed itálico, texto em Barlow.
- Fotos dos kits: fundo branco, molas vermelhas, roscas cromadas, pratos brancos. A **flange de ajuste de baixo é
  vermelha** (pedido do Gilberto). A faixa azul fina de cima, que aparece em alguns modelos, fica azul.
- Manter o Next.js sempre na versão corrigida mais recente: a Vercel **bloqueia o deploy** de versões com falha de
  segurança conhecida (aconteceu com a 15.5.4). O `overrides` do `package.json` força um PostCSS sem falhas.
- No futuro: IA de atendimento no WhatsApp (Meta), marketplaces (Shopee, Mercado Livre, AliExpress, TikTok) e um
  segundo Instagram para suspensão usada. **Nada disso no começo.**

## Fases

1. **Vitrine** (feito): home, categorias, produto, busca, filtro por carro, carrinho, pedido pelo WhatsApp.
2. **Painel admin** (feito, em https://suspen-store.vercel.app/admin): Supabase com login (por enquanto só o Leonardo), cadastro de produto, preço, foto e estoque.
3. **Pagamento e frete**: ligar Mercado Pago (precisa do MEI novo do Gilberto e da conta MP no CNPJ) e Melhor Envio.
4. **Acabamento**: páginas de trocas, privacidade, termos e FAQ, SEO, indicação de instalador depois da compra
   e ligação do domínio suspenstore.com.br.

## Pendências de informação

- [ ] Preços dos kits
- [ ] Anos de aplicação de cada kit (campo "Anos de aplicação" no painel)
- [ ] Produtos das outras categorias (ar, fixa, amortecedores, molas)
- [ ] E-mail comercial e Instagram da loja
- [ ] Número definitivo do WhatsApp comercial (hoje: 11 96833-4426)
- [ ] Lista de instaladores parceiros (nome, cidade, contato)
- [ ] Acesso ao domínio suspenstore.com.br

## Ligar o pagamento (fase 3), passo a passo

1. Criar a aplicação no Mercado Pago: https://www.mercadopago.com.br/developers/panel/app
2. Copiar a **credencial de teste** (começa com `TEST-`) para `MP_ACCESS_TOKEN` no `.env.local`.
3. `NEXT_PUBLIC_PAGAMENTO_ONLINE=true` e dar preço aos produtos.
4. Testar com os cartões de teste do Mercado Pago.
5. Na Vercel: Settings > Environment Variables, com a credencial de **produção**.
6. Ainda falta: webhook de confirmação de pagamento e registro de pedidos no banco (fazer junto com a fase 2/3).
