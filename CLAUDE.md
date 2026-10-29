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
| Pagamento | Mercado Pago, **Checkout Transparente** (Payment Brick: Pix, cartão 12x, boleto) | Código pronto, **desligado** até ter as chaves |
| Frete e etiquetas | Melhor Envio: cotação por fornecedor, compra/geração/impressão de etiqueta | Código pronto, falta o token |
| Fornecedores e vendas | Tabelas no Supabase + painel `/admin/fornecedores`, `/admin/vendas` e área `/fornecedor` | Código pronto (rodar `supabase/002_fornecedores_vendas.sql`) |
| Hospedagem | Vercel, plano Hobby | No ar em https://suspen-store.vercel.app (publica sozinho a cada push na `main`) |
| Repositório | GitHub (`ILeozeraI/suspen-store`) | Criado |

## Como rodar no computador

Precisa do Node.js 20 ou mais novo.

```bash
npm install          # só na primeira vez (ou quando mudar o package.json)
npm run dev          # abre em http://localhost:3000
npm run build        # confere se está tudo certo antes de publicar
```

Copie `.env.example` para `.env.local` e preencha. Na Vercel (ambiente Production) já estão:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Config), `SUPABASE_SECRET_KEY`, `ME_TOKEN`
(token de produção do Melhor Envio, conta suspenstoreoficial@gmail.com), `ME_AMBIENTE=producao` e `ME_EMAIL_CONTATO` (Secret).
Faltam as chaves do Mercado Pago (`NEXT_PUBLIC_MP_PUBLIC_KEY`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`) e ligar
`NEXT_PUBLIC_PAGAMENTO_ONLINE=true`. **O `.env.local` nunca vai para o GitHub.**

## Onde fica cada coisa

```
supabase/
  schema.sql             parte 1: produtos, admins, fotos e os 9 kits iniciais
  002_fornecedores_vendas.sql  parte 2: fornecedores, custos, pedidos, itens, envios, acertos, funções da área do fornecedor
  003_novos_modelos.sql  Gol G6, Gol G7+, Uno Quadrado e Palio Furo Reto (fotos reaproveitadas); Palio Fire renomeado
  004_kit_vw_g1_g4.sql   Kit Rosca Slim Volkswagen Linha G1 a G4 (foto própria, gerada no ChatGPT, flange azul)
  005_vw_g1_g4_aplicacoes.sql  carros que o kit VW G1 a G4 atende (lista do Gilberto; ele vai mandar mais)
public/
  marca/                 logo (original, transparente e só o texto para o cabeçalho)
  produtos/              fotos dos produtos (nome: categoria-modelo.jpg, minúsculo, sem espaço)
src/
  data/loja.ts           telefone, WhatsApp, horário, textos fixos da loja
  data/produtos.ts       tipos, categorias, lista reserva de produtos e funções de busca/filtro
  lib/catalogo.ts        lê os produtos do Supabase (ou da lista reserva, se não houver Supabase)
  lib/supabase/          conexão com o Supabase (config e cliente com login)
  lib/admin.ts           checa se quem acessa o painel é admin
  app/admin/             painel: login, produtos (acoes.ts), fornecedores/, vendas/ (etiquetas, venda manual do WhatsApp)
  app/fornecedor/        área do fornecedor: vendas, comissão, fretes, saldo e etiquetas para imprimir
  app/checkout/          checkout em 3 etapas (dados → entrega → pagamento)
  app/pedido/[acesso]/   página do cliente acompanhar o pedido (Pix, boleto, rastreio)
  app/api/frete/         cotação de frete (um pacote por fornecedor)
  app/api/pagamento/     cria o pedido e o pagamento (recalcula tudo no servidor)
  app/api/mercadopago/webhook/  confirmação de pagamento do Mercado Pago
  lib/checkout.ts        valida carrinho, cota frete, confere CPF
  lib/frete/             melhorenvio.ts (API) e pacotes.ts (agrupa por fornecedor)
  lib/payments/          mercadopago.ts (Checkout Transparente, webhook)
  lib/repasse.ts         conta da comissão/repasse de cada item
  lib/vendas.ts          contas do painel de vendas (lucro da loja)
  lib/supabase/servico.ts cliente com a chave secreta (só servidor)
  components/admin/      formulário de produto e peças do painel
  middleware.ts          renova o login do painel
  components/            cabeçalho, rodapé, cartão de produto, carrinho, busca por carro, botão do WhatsApp
  app/page.tsx           página inicial
  app/produtos/          listagem com filtros (?categoria=, ?montadora=, ?modelo=, ?busca=)
  app/produto/[slug]/    página de cada produto
  app/carrinho/          carrinho com "Finalizar pelo WhatsApp" e "Pagar no site" (leva ao checkout)
  app/pedido/concluido|pendente  telas antigas do Checkout Pro (não usadas; podem ser apagadas)
  app/globals.css        todo o visual (cores e fontes no topo, em :root)
```

## Tarefas comuns

**Adicionar ou editar produto:** pelo painel em `/admin` (login com e-mail e senha do Supabase). Preço vazio mostra
"Consulte o preço"; estoque vazio não controla, 0 mostra "Esgotado". O site atualiza na hora ao salvar.

**Dar acesso de admin a outra pessoa:** Supabase > Authentication > Users > Add user (com "Auto Confirm"). Depois, no
SQL Editor: `insert into public.admins (user_id) select id from auth.users where email = 'email@da.pessoa';`

**Mudar a estrutura do banco:** crie um arquivo novo `supabase/003_....sql` (ou edite o último) e rode no SQL Editor.
Os arquivos podem ser rodados de novo sem estragar nada.

**Cadastrar fornecedor:** `/admin/fornecedores` > Novo. Endereço de onde sai o envio, modelo (comissão ou revenda),
comissão (% ou R$ por peça) e quem paga o frete. Na página dele: criar login da área do fornecedor e registrar acertos.

**Gerar etiqueta:** `/admin/vendas` > pedido > "Pagar e gerar etiqueta" (paga com o saldo do Melhor Envio). A etiqueta
aparece na área do fornecedor para ele imprimir; o botão "Avisar fornecedor no WhatsApp" manda o aviso.

**Venda do WhatsApp:** `/admin/vendas` > "Lançar venda do WhatsApp". Preço livre e produto fora do site.

**Mudar telefone ou WhatsApp:** `src/data/loja.ts` (e a variável `NEXT_PUBLIC_WHATSAPP`).

**Mudar cores:** variáveis no topo de `src/app/globals.css`.

## Decisões já tomadas (não mudar sem falar com o Leonardo)

- O pedido pode ser fechado de **duas formas, permanentes**: pagando no site (Mercado Pago) ou pelo WhatsApp.
  O WhatsApp não é provisório.
- O site só vai **oficialmente** para o ar quando pagamento e frete estiverem funcionando.
- Pagamento: **Mercado Pago, Checkout Transparente** (pedido do Gilberto e do João). O cliente paga sem sair do site,
  no formulário do Mercado Pago (Payment Brick), que troca o cartão por um token: dados de cartão nunca passam pelo
  nosso servidor. Pix, cartão em até 12x e boleto. Checkout em **3 etapas**: dados → entrega → pagamento.
- O pedido só fica "pago" pela resposta do Mercado Pago (na criação ou pelo webhook, que sempre consulta a API).
- **Modelo de negócio (marketplace, como o Mercado Livre):** a venda é do fornecedor e a loja fica com uma comissão
  (% ou valor fixo por peça, configurável por fornecedor). Fase híbrida: fornecedor no modelo "revenda" recebe o custo
  cadastrado no produto. O estoque próprio da Suspen Store é um fornecedor também.
- **Frete:** um pacote por fornecedor, cotado do CEP dele até o cliente (igual Mercado Livre). Quem paga é escolhido por
  fornecedor: cliente, loja (grátis pro cliente, fornecedor não vê) ou fornecedor (grátis pro cliente, desconta do repasse).
  Produto com "frete grátis" faz a loja pagar o envio mais barato daquele pacote.
- **Etiqueta:** a loja paga no Melhor Envio (conta com e-mail oficial do Gilberto) e o fornecedor imprime na área dele.
- **Área do fornecedor:** vê o que vendeu, valor vendido, comissão, fretes da conta dele, saldo e etiquetas. **Não vê
  dados do cliente e não cadastra produtos** (a loja opera tudo). O acesso aos dados é só por funções do banco
  (`portal_*`) que devolvem o que é dele.
- O custo do produto fica na tabela `produtos_custos` (só admin), porque a tabela `produtos` é pública.
- Painel de vendas: "fica para a loja" = produtos + frete cobrado − frete pago − taxa do Mercado Pago − repasse.
- **Bling** será o "coração" do faturamento (site + WhatsApp). Integração ainda não feita: falta a conta e saber como
  identificar o fornecedor em cada venda no Bling.
- Preços **sempre recalculados no servidor** (`app/api/pagamento`). Nunca confiar no preço vindo do navegador.
- Repositório público, mas **nenhuma chave ou senha no código**. Tudo em `.env.local` e nas variáveis da Vercel.
- Supabase: o navegador usa só a **publishable key** (pública). A segurança fica nas regras RLS do banco: visitante só lê
  produtos ativos; só quem está na tabela `admins` mexe no resto. A **secret key** (`SUPABASE_SECRET_KEY`) é usada
  **só no servidor** (`lib/supabase/servico.ts`) para criar pedidos, confirmar pagamentos, ler o CEP do fornecedor e
  criar logins de fornecedor. Fica só na Vercel (Secret) e no `.env.local`.
- Cadastro público de usuários no Supabase fica **desligado**. Admins são criados à mão no painel do Supabase.
- Sem Supabase configurado (ex.: `.env.local` sem as chaves), o site mostra a lista reserva de `src/data/produtos.ts`.
- Visual inspirado no site da Castor Suspensões (castorsuspensoes.com.br), com a identidade da logo da Suspen Store:
  preto, vermelho e prata. Títulos em Barlow Condensed itálico, texto em Barlow.
- Fotos dos kits: fundo branco, molas vermelhas, roscas cromadas, pratos brancos e **flange de ajuste de baixo AZUL**.
  Em 16/10/2026 a flange foi trocada para vermelha a pedido do Gilberto, mas em 28/10/2026 o Leonardo confirmou que
  o correto é a **azul** (fotos originais). As versões vermelhas não são mais usadas.
- **Supabase grátis pausa o projeto após 7 dias sem uso** (aconteceu em 26/10/2026). A Vercel chama
  `/api/manter-ativo` todo dia às 9h de Brasília (`vercel.json` > `crons`) para manter ativo. Se pausar mesmo assim:
  Supabase > projeto > **Restore project** (dá para restaurar em até 90 dias). Quando a loja tiver movimento ou
  dinheiro, avaliar o plano Pro (não pausa e tem backup diário). Se o Supabase estiver fora do ar durante uma
  publicação, o build não falha mais (`lib/catalogo.ts`): as páginas saem sem produtos e se atualizam em até 5 min.
- Manter o Next.js sempre na versão corrigida mais recente: a Vercel **bloqueia o deploy** de versões com falha de
  segurança conhecida (aconteceu com a 15.5.4). O `overrides` do `package.json` força um PostCSS sem falhas.
- No futuro: IA de atendimento no WhatsApp (Meta), marketplaces (Shopee, Mercado Livre, AliExpress, TikTok) e um
  segundo Instagram para suspensão usada. **Nada disso no começo.**

## Fases

1. **Vitrine** (feito): home, categorias, produto, busca, filtro por carro, carrinho, pedido pelo WhatsApp.
2. **Painel admin** (feito, em https://suspen-store.vercel.app/admin): Supabase com login (por enquanto só o Leonardo), cadastro de produto, preço, foto e estoque.
3. **Pagamento, frete, fornecedores e vendas** (código pronto, falta ligar): Mercado Pago transparente, Melhor Envio,
   fornecedores com comissão, painel de vendas, área do fornecedor. Depois: integração com o Bling.
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
- [ ] Endereço completo do estoque (hoje: CEP 06150108 provisório, só para frete; CNPJ 69.743.693/0001-09 já cadastrado)
- [ ] Verificação da conta do Melhor Envio (precisa ser feita pela titular) e saldo para etiquetas
- [ ] Conta do Bling (CNPJ novo ainda não aparecia na Receita em 22/10/2026)
- [ ] Catálogo dos fornecedores parceiros e valores (comissão)

## Ligar pagamento e frete, passo a passo

1. Rodar `supabase/002_fornecedores_vendas.sql` no SQL Editor do Supabase.
2. Supabase > Project Settings > API Keys > Secret key: colocar em `SUPABASE_SECRET_KEY` (Vercel, Secret).
3. Corrigir o endereço do fornecedor "Suspen Store (estoque próprio)" e cadastrar os outros em `/admin/fornecedores`.
4. Em cada produto: preço, fornecedor, peso e medidas da caixa (sem isso não calcula frete).
5. Mercado Pago (conta no CNPJ): criar aplicação "Checkout Transparente" em
   https://www.mercadopago.com.br/developers/panel/app e copiar Public Key e Access Token **de teste** para
   `NEXT_PUBLIC_MP_PUBLIC_KEY` e `MP_ACCESS_TOKEN`.
6. Mercado Pago > Webhooks: URL `https://<site>/api/mercadopago/webhook`, evento "Pagamentos"; copiar a assinatura
   secreta para `MP_WEBHOOK_SECRET`.
7. Melhor Envio (conta do e-mail oficial): gerar token com permissões de cotação, carrinho, compra, geração,
   impressão e rastreio → `ME_TOKEN`; `ME_AMBIENTE=sandbox` para testar.
8. `NEXT_PUBLIC_PAGAMENTO_ONLINE=true`, testar com os cartões de teste do Mercado Pago, depois trocar para as
   credenciais de produção e `ME_AMBIENTE=producao`.
