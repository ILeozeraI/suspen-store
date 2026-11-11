# Suspen Store: guia do projeto

Este arquivo explica o projeto para qualquer pessoa (ou IA) que for mexer no site.
**Leia inteiro antes de alterar qualquer coisa.** Quando uma decisão nova for tomada, atualize este arquivo.

## O que é

Loja virtual da **Suspen Store** ("A loja do carro rebaixado"): kits de suspensão a rosca, suspensão a ar,
suspensão fixa, amortecedores e molas esportivas.

- Dono do negócio: **Gilberto** (tio do Leonardo). Aprova mudanças junto com o **João**.
- Responsável pelo site: **Leonardo Cavalcanti da Silva** (GitHub: ILeozeraI).
- Estoque em Osasco/SP, venda só online, envio para todo o Brasil. Atendimento das 7h30 às 17h.
- Domínio: **www.suspenstore.com.br** (comprado na Hostinger, DNS no Cloudflare gerido pelo João: CNAME @ e www para a
  Vercel, proxy desligado). O site antigo em WordPress saiu do ar em 09/11/2026.

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
| Hospedagem | Vercel, plano Hobby | No ar em **https://www.suspenstore.com.br** desde 09/11/2026 (o domínio sem www redireciona; suspen-store.vercel.app continua funcionando). Publica sozinho a cada push na `main` |
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
Também já estão as credenciais de **produção** do Mercado Pago (29/10/2026): `NEXT_PUBLIC_MP_PUBLIC_KEY` (Config) e
`MP_ACCESS_TOKEN` (Secret). O Access Token passou por WhatsApp: **renovar no painel do Mercado Pago antes de ligar o
pagamento** e trocar na Vercel. Faltam `MP_WEBHOOK_SECRET`, preços/peso/medidas dos kits e ligar
`NEXT_PUBLIC_PAGAMENTO_ONLINE=true`. Domínio suspenstore.com.br adicionado na Vercel (DNS no Cloudflare: CNAME @ e www
para o endereço que a Vercel mostra em Settings > Domains, proxy desligado). **O `.env.local` nunca vai para o GitHub.**

## Onde fica cada coisa

```
supabase/
  schema.sql             parte 1: produtos, admins, fotos e os 9 kits iniciais
  002_fornecedores_vendas.sql  parte 2: fornecedores, custos, pedidos, itens, envios, acertos, funções da área do fornecedor
  003_novos_modelos.sql  Gol G6, Gol G7+, Uno Quadrado e Palio Furo Reto (fotos reaproveitadas); Palio Fire renomeado
  004_kit_vw_g1_g4.sql   Kit Rosca Slim Volkswagen Linha G1 a G4 (foto própria, gerada no ChatGPT, flange azul)
  005_vw_g1_g4_aplicacoes.sql  primeira lista de carros do kit VW G1 a G4 (substituída pela 006)
  006_vw_g1_g4_lista_final.sql  lista completa (15 carros) do kit VW G1 a G4, mandada pelo Gilberto em 29/10/2026
  007_astra_vectra.sql   kit do Astra vira "Astra / Vectra": Astra 2000 em diante e Vectra 2006 em diante
  008_corsa_celta_prisma.sql  kit do Corsa vira "Corsa / Celta / Prisma" (versões na observação)
  009_um_kit_por_carro.sql  **um card por carro**: VW G1-G4 vira 15 kits, Astra/Vectra 2, Corsa/Celta/Prisma 4, Uno Way/Vivace 2
  010_vectra_antigo.sql  kit Vectra da foto antiga = "Vectra até 2000" (Gilberto vai mandar outros carros; falta foto do kit Vectra 2000 a 2005)
  011_uno_palio_siena.sql  Uno Quadrado 1984 a 2013 (versões), kits novos Palio 1996 a 2012 e Siena 1997 a 2012 (foto do Palio Fire)
  012_fotos_extras.sql   coluna fotos_extras: várias fotos por kit (galeria na página do produto)
  013_artes_regulagem.sql  arte de regulagem de altura no fim das fotos extras dos 35 kits (public/produtos/regulagem/)
  014_sku.sql            coluna sku (código do anúncio, único) nos produtos e nos itens do pedido; SKU dos 35 kits
  015_nomes_seo.sql      nomes para o Google: "Kit Suspensão Rosca Slim Completo <carro> com Amortecedores" e resumo com o que vem
                         no kit (4 amortecedores reduzidos com tubos de rosca, 4 molas e 4 batentes); slug não muda
  016_sku_kits_completos.sql  SKU final dos kits completos: SS-SLIM-GOLG5 vira SS-SLIMC-GOLG5-4
public/
  googlef3704ecf39541f9e.html  verificação do Google Search Console (conta suspenstoreoficial@gmail.com). **Não apagar.**
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
  app/sitemap.ts, robots.ts  mapa do site para o Google (/sitemap.xml, atualiza sozinho) e o que fica fora das buscas
  app/trocas-e-garantia/ página de trocas, devoluções e garantia (regras do Gilberto, 11/11/2026; link no rodapé)
  app/privacidade/       política de privacidade (LGPD), rascunho de 11/11/2026 para o Gilberto revisar; link no rodapé
  app/perguntas-frequentes/  perguntas frequentes (11/11/2026), com dados estruturados para o Google; link no rodapé
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

**Fotos extras de um kit:** `/admin` > kit > "Adicionar fotos extras" (aparecem depois da foto principal, com
miniaturas). A última foto de cada kit deve ser a **arte de regulagem de altura** daquele carro: medida **Social**
(Baixo: 2 cm entre pneu e para-lama; Alto: 4 a 8 cm), com a frente do próprio carro (pedido do Gilberto, 09/11/2026).
As fotos do carro são geradas no ChatGPT sem texto; os textos e a logo são montados por cima. As 35 artes estão em
`public/produtos/regulagem/regulagem-<parte do slug>.jpg` e são ligadas aos kits pelo `013_artes_regulagem.sql`
(o Uno Fire e o Uno Quadrado usam a mesma foto do carro, com nomes diferentes na arte). Kit novo: gerar a arte e
acrescentar uma linha nesse SQL.

**Venda do WhatsApp:** `/admin/vendas` > "Lançar venda do WhatsApp". Preço livre e produto fora do site.

**Mudar telefone ou WhatsApp:** `src/data/loja.ts` (e a variável `NEXT_PUBLIC_WHATSAPP`).

**Mudar cores:** variáveis no topo de `src/app/globals.css`.

## Decisões já tomadas (não mudar sem falar com o Leonardo)

- O pedido pode ser fechado de **duas formas, permanentes**: pagando no site (Mercado Pago) ou pelo WhatsApp.
  O WhatsApp não é provisório.
  **O site é o foco** (Gilberto e João, 10/11/2026): o cliente deve resolver e finalizar a compra no site. O WhatsApp
  fecha só casos especiais (kit super alto ou super baixo, projeto técnico) e pedidos grandes de lojista. Ideia para
  depois: botão ou chat no site para falar com alguém ou com uma IA.
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
- **Trocas e garantia** (Gilberto, 11/11/2026): garantia de **6 meses** em qualquer peça dos kits; não cobre
  instalação errada fora do diagrama de instalação; troca por compra errada em até **7 dias**, o comprador paga o
  frete para devolver a peça. Desistência em 7 dias (art. 49 do CDC) ou cancelamento: devolve o valor pago, incluindo
  o frete, e a loja paga o frete da devolução. Garantia e erro no envio: cliente não paga frete (fica com o fornecedor).
- Visual inspirado no site da Castor Suspensões (castorsuspensoes.com.br), com a identidade da logo da Suspen Store:
  preto, vermelho e prata. Títulos em Barlow Condensed itálico, texto em Barlow.
- **SKU em revisão (10/11/2026):** a loja vai vender kit completo (4 amortecedores reduzidos, 4 tubos, 4 molas e
  4 batentes), kit parcial sem amortecedor (4 tubos, 4 PUs e 4 molas), pares dianteiro/traseiro e peças avulsas
  (molas, roscas/tubos, PU, amortecedor sem rosca, batentes, molas esportivas, ponta de eixo, peças de kit ar e kit ar).
  Combinado até agora: `SLIMC` = kit completo, `SLIMP` = kit parcial; tubo de rosca usa `ROSCA` (é o termo mais
  buscado); peças pela **medida**, não pelo carro (Gilberto: evita o cliente comprar errado); quantidade no fim
  (4 = jogo, 2 = par, D/T = par dianteiro/traseiro). **Rosca (tubo) fechado em 10/11/2026:** marca + diâmetro
  interno, ex.: `SS-ROSCA-FORMULA-51MM-INTER`, `SS-ROSCA-FORMULA-47MM-INTER`, `SS-ROSCA-FORMULA-45MM-INTER`. O
  encaixe (interno) é o que importa; a altura vai na descrição. Dianteira/traseira **não** vai no código, porque
  depende do carro (a 47 mm do Corsa serve na dianteira e, com arruela soldada, na traseira; a 45 mm é só traseira; a
  51 mm serve na traseira de BMW e na dianteira de metade dos carros): isso vai na descrição. **Kits completos fechados em
  11/11/2026:** `SS-SLIMC-<CARRO>-4` (ex.: SS-SLIMC-GOLG5-4), aplicado pelo `016_sku_kits_completos.sql`. Em aberto: molas.
- **SKU (código do anúncio)** no formato **SS-SUBCATEGORIA-MODELO**, maiúsculo, sem espaço nem acento (pedido do João,
  aprovado pelo Gilberto em 10/11/2026, inspirado na Redcoil: SS-AIR-8VBLUETOOTH). Kits rosca slim completos usam
  `SLIMC` + carro + quantidade (ex.: SS-SLIMC-GOLG5-4, SS-SLIMC-PARATISURF-4). Cada anúncio tem um SKU diferente (o banco não deixa
  repetir). Aparece na página do produto, no painel, na mensagem do WhatsApp e fica guardado em cada item do pedido
  (para separar no estoque e, no futuro, usar no Bling). Produto novo: preencher o campo SKU no `/admin`.
- **Um kit (card) para cada carro** (decisão do Leonardo, 29/10/2026), como no Mercado Livre: mesmo que a peça e a
  foto sejam iguais, cada carro/geração tem o seu produto, com o ano no nome quando precisar (ex.: "Vectra 2006 em
  diante"). Mudança de preço em massa: fazer por SQL filtrando pela imagem ou pelo nome. A lista reserva em
  `src/data/produtos.ts` não acompanha mais todos os kits: o banco é a fonte.
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
2. **Painel admin** (feito, em https://www.suspenstore.com.br/admin): Supabase com login (por enquanto só o Leonardo), cadastro de produto, preço, foto e estoque.
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
- [x] Domínio suspenstore.com.br apontado para o site novo (09/11/2026)
- [x] Google Search Console: propriedade https://www.suspenstore.com.br/ verificada (arquivo HTML) e sitemap.xml enviado
  em 11/11/2026, na conta suspenstoreoficial@gmail.com. Acompanhar em Indexação > Páginas e Desempenho.
- [ ] Endereço completo do estoque (hoje: CEP 06150108 provisório, só para frete; CNPJ 69.743.693/0001-09 já cadastrado)
- [ ] Verificação da conta do Melhor Envio (precisa ser feita pela titular) e saldo para etiquetas
- [ ] Conta do Bling (CNPJ novo ainda não aparecia na Receita em 22/10/2026)
- [ ] Catálogo dos fornecedores parceiros e valores (comissão)
- [ ] CEP **07022-290** (Guarulhos/SP), é do **fornecedor** da loja (confirmado pelo Gilberto em
  10/11/2026): de lá vão sair alguns dos produtos. Falta nome, endereço completo e comissão para cadastrar em `/admin/fornecedores`

## Respostas do Gilberto e do João em 11/11/2026 (ainda não aplicadas no site)

- **Preço:** o preço de venda tem que cobrir o que o fornecedor quer receber + custos + porcentagem do site + porcentagem
  do Leonardo + lucro da sociedade. A porcentagem do Leonardo ainda não foi fechada. Gilberto e João vão calcular.
- **Custos levantados:** frete, plataforma (mensalidade do site, se houver), ADS, Bling, NF-e (se emitir). O chip do
  WhatsApp é pré-pago (R$ 30 a cada 2 meses). Leonardo respondeu (11/11): hoje Vercel, Supabase e
  Hostinger (domínio) estão em planos grátis ou anuais; no futuro vai precisar pagar. **Vercel Hobby é só para uso não
  comercial: passar para o Pro (US$ 20/mês) antes de ligar o pagamento.** Supabase Pro: US$ 25/mês.
- **Fretes:** a loja paga o primeiro envio e o retorno da peça em desistência ou cancelamento. Garantia e erro no envio:
  frete por conta do fornecedor. Compra errada: o comprador paga o frete de ida. Gilberto perguntou se ativar a logística
  reversa (devolução) no Melhor Envio encarece o frete. Página /trocas-e-garantia já atualizada (11/11).
- **VPS:** o João perguntou (11/11) se dá para subir o site numa VPS depois. Dá: Next.js roda em VPS (Node ou Docker), o
  Supabase continua igual. Na VPS é preciso cuidar de deploy, https, atualizações e do cron `/api/manter-ativo`.
  Pode sair mais barato que a Vercel Pro. Ainda não decidido; falta saber qual VPS eles têm.
- **Rosca slim:** todos os kits saem do fornecedor de Guarulhos (CEP 07022-290). Vão entrar outros fornecedores com os
  mesmos produtos (outro endereço). O Gilberto está pegando os dados do fornecedor.
- **Nota fiscal:** no começo a loja opera como se comprasse e revendesse; emite nota só quando o cliente pedir (Bling
  integra os pedidos). Atenção ao limite de faturamento anual (João citou R$ 80 mil).
- **SKU:** o João disse para simplificar: uma identificação simples com abreviações, como a dos tubos que o Gilberto fez,
  e seguir em frente. Aplicado: SS-SLIMC-<CARRO>-4.

## Lembretes para o Leonardo

- [ ] Mandar para o Gilberto e o João conferirem as páginas **/trocas-e-garantia**, **/privacidade** e
  **/perguntas-frequentes** (rascunhos de 11/11/2026). A de privacidade idealmente passa por contador/advogado.

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
