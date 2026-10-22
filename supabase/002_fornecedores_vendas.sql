-- =====================================================================
-- Suspen Store: parte 2 do banco (fornecedores, pedidos, envios, acertos)
-- Rodar DEPOIS do schema.sql. Como usar: Supabase > SQL Editor > New query > colar tudo > Run.
-- Pode rodar de novo sem problema.
-- =====================================================================

-- ---------- Fornecedores (quem envia o produto) ----------
create table if not exists public.fornecedores (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null check (char_length(nome) between 1 and 120),
  documento    text,                       -- CPF ou CNPJ, só números (vai na etiqueta)
  telefone     text,                       -- só números, com DDD
  email        text,
  cep          text not null check (cep ~ '^[0-9]{8}$'),
  rua          text not null,
  numero       text not null,
  complemento  text,
  bairro       text not null,
  cidade       text not null,
  uf           text not null check (uf ~ '^[A-Z]{2}$'),
  user_id      uuid unique references auth.users(id) on delete set null, -- login da área do fornecedor
  -- Modelo de negócio com este fornecedor:
  --   comissao: a venda é do fornecedor; a loja fica com a comissão (como o Mercado Livre)
  --   revenda:  a loja compra do fornecedor e revende; o fornecedor recebe o custo do produto
  modelo          text not null default 'comissao' check (modelo in ('comissao','revenda')),
  comissao_tipo   text not null default 'percentual' check (comissao_tipo in ('percentual','fixo')),
  comissao_valor  numeric(10,2) not null default 0 check (comissao_valor >= 0), -- % ou R$ por peça
  -- Quem paga o frete dos pacotes deste fornecedor:
  --   cliente:    o cliente paga no checkout
  --   loja:       frete grátis para o cliente; a loja paga e o fornecedor nem vê
  --   fornecedor: frete grátis para o cliente; o valor é descontado do repasse do fornecedor
  frete_modelo    text not null default 'cliente' check (frete_modelo in ('cliente','loja','fornecedor')),
  ativo        boolean not null default true,
  observacao   text,
  criado_em    timestamptz not null default now()
);

-- ---------- Campos novos no produto ----------
alter table public.produtos add column if not exists fornecedor_id  uuid references public.fornecedores(id) on delete restrict;
alter table public.produtos add column if not exists frete_gratis   boolean not null default false;
alter table public.produtos add column if not exists peso_kg        numeric(6,3) check (peso_kg is null or peso_kg > 0);
alter table public.produtos add column if not exists altura_cm      integer check (altura_cm is null or altura_cm > 0);
alter table public.produtos add column if not exists largura_cm     integer check (largura_cm is null or largura_cm > 0);
alter table public.produtos add column if not exists comprimento_cm integer check (comprimento_cm is null or comprimento_cm > 0);

-- Custo do produto fica numa tabela separada, só o admin lê (a tabela produtos é pública).
create table if not exists public.produtos_custos (
  produto_id  uuid primary key references public.produtos(id) on delete cascade,
  custo       numeric(10,2) not null check (custo >= 0)
);

-- ---------- Pedidos ----------
create sequence if not exists public.pedidos_numero_seq start 1001;

create table if not exists public.pedidos (
  id               uuid primary key default gen_random_uuid(),
  numero           integer not null unique default nextval('public.pedidos_numero_seq'),
  acesso           text not null unique default replace(gen_random_uuid()::text, '-', ''), -- link do cliente acompanhar
  origem           text not null default 'site' check (origem in ('site','whatsapp')),
  status           text not null default 'aguardando_pagamento'
                   check (status in ('aguardando_pagamento','pago','cancelado','recusado','reembolsado')),
  cliente_nome     text not null,
  cliente_email    text,
  cliente_cpf      text,
  cliente_telefone text,
  cep              text,
  rua              text,
  numero_end       text,
  complemento      text,
  bairro           text,
  cidade           text,
  uf               text,
  total_produtos   numeric(10,2) not null default 0,
  total_frete      numeric(10,2) not null default 0,   -- o que o cliente pagou de frete
  total            numeric(10,2) not null default 0,
  metodo           text,                                -- pix, cartao, boleto, whatsapp
  parcelas         integer,
  taxa_pagamento   numeric(10,2) not null default 0,   -- taxa do Mercado Pago
  mp_payment_id    text unique,
  mp_status        text,
  mp_status_detail text,
  pix_copia_cola   text,
  pix_qr_base64    text,
  boleto_url       text,
  observacao       text,
  criado_em        timestamptz not null default now(),
  pago_em          timestamptz
);
create index if not exists pedidos_criado_em_idx on public.pedidos (criado_em desc);

create table if not exists public.pedido_itens (
  id              uuid primary key default gen_random_uuid(),
  pedido_id       uuid not null references public.pedidos(id) on delete cascade,
  produto_id      uuid references public.produtos(id) on delete set null,
  fornecedor_id   uuid references public.fornecedores(id) on delete restrict,
  nome            text not null,
  quantidade      integer not null check (quantidade between 1 and 100),
  preco_unitario  numeric(10,2) not null check (preco_unitario >= 0),
  custo_unitario  numeric(10,2) not null default 0 check (custo_unitario >= 0), -- usado no modelo revenda
  comissao        numeric(10,2) not null default 0,  -- total da comissão da loja neste item
  repasse         numeric(10,2) not null default 0,  -- total que o fornecedor recebe por este item
  frete_gratis    boolean not null default false
);
alter table public.pedido_itens add column if not exists comissao numeric(10,2) not null default 0;
alter table public.pedido_itens add column if not exists repasse  numeric(10,2) not null default 0;
create index if not exists pedido_itens_pedido_idx on public.pedido_itens (pedido_id);
create index if not exists pedido_itens_fornecedor_idx on public.pedido_itens (fornecedor_id);

-- Um envio (pacote) por fornecedor dentro do pedido
create table if not exists public.envios (
  id              uuid primary key default gen_random_uuid(),
  pedido_id       uuid not null references public.pedidos(id) on delete cascade,
  fornecedor_id   uuid references public.fornecedores(id) on delete restrict,
  servico_id      integer,
  servico_nome    text,
  transportadora  text,
  prazo_dias      integer,
  valor_cobrado   numeric(10,2) not null default 0,  -- o que o cliente pagou por este pacote
  valor_real      numeric(10,2) not null default 0,  -- quanto a loja paga no Melhor Envio
  frete_modelo    text not null default 'cliente',   -- cópia do modelo do fornecedor no momento da venda
  desconto_fornecedor numeric(10,2) not null default 0, -- frete descontado do repasse (modelo 'fornecedor')
  peso_kg         numeric(6,3),
  altura_cm       integer,
  largura_cm      integer,
  comprimento_cm  integer,
  me_pedido_id    text,
  etiqueta_url    text,
  rastreio        text,
  nota_fiscal     text,                              -- chave da NF, se houver
  status          text not null default 'pendente'
                  check (status in ('pendente','etiqueta_gerada','postado','entregue','cancelado')),
  criado_em       timestamptz not null default now()
);
alter table public.envios add column if not exists frete_modelo text not null default 'cliente';
alter table public.envios add column if not exists desconto_fornecedor numeric(10,2) not null default 0;
create index if not exists envios_pedido_idx on public.envios (pedido_id);
create index if not exists envios_fornecedor_idx on public.envios (fornecedor_id);

-- Pagamentos feitos ao fornecedor (acerto)
create table if not exists public.acertos (
  id             uuid primary key default gen_random_uuid(),
  fornecedor_id  uuid not null references public.fornecedores(id) on delete cascade,
  valor          numeric(10,2) not null check (valor > 0),
  data           date not null default current_date,
  observacao     text,
  criado_em      timestamptz not null default now()
);

-- ---------- Segurança (RLS) ----------
-- Pedidos, itens, envios e acertos: só o admin. O site cria pedidos pelo servidor (chave secreta).
alter table public.fornecedores enable row level security;
alter table public.pedidos      enable row level security;
alter table public.pedido_itens enable row level security;
alter table public.envios       enable row level security;
alter table public.acertos      enable row level security;
alter table public.produtos_custos enable row level security;

do $$
declare t text;
begin
  foreach t in array array['fornecedores','produtos_custos','pedidos','pedido_itens','envios','acertos'] loop
    execute format('drop policy if exists "%1$s: admin" on public.%1$I', t);
    execute format('create policy "%1$s: admin" on public.%1$I for all to authenticated
                    using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- O fornecedor enxerga o próprio cadastro (para saber quem ele é)
drop policy if exists "fornecedores: ver a si mesmo" on public.fornecedores;
create policy "fornecedores: ver a si mesmo" on public.fornecedores
  for select to authenticated using (user_id = (select auth.uid()));

grant usage, select on sequence public.pedidos_numero_seq to authenticated;

-- ---------- Área do fornecedor ----------
-- O fornecedor NÃO lê as tabelas de pedidos diretamente (veria preço de venda e dados de outros).
-- Estas funções devolvem só o que é dele, e só o custo.

drop function if exists public.portal_saldo();
drop function if exists public.portal_vendas(date, date);
drop function if exists public.portal_envios();

create or replace function public.meu_fornecedor_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select id from public.fornecedores where user_id = (select auth.uid()) and ativo;
$$;

create or replace function public.portal_vendas(de date, ate date)
returns table (
  pedido_numero integer, data timestamptz, origem text, produto text, quantidade integer,
  valor_venda numeric, comissao numeric, repasse numeric
) language sql stable security definer set search_path = '' as $$
  select p.numero, coalesce(p.pago_em, p.criado_em), p.origem, i.nome, i.quantidade,
         i.preco_unitario * i.quantidade, i.comissao, i.repasse
  from public.pedido_itens i
  join public.pedidos p on p.id = i.pedido_id
  where i.fornecedor_id = public.meu_fornecedor_id()
    and p.status = 'pago'
    and coalesce(p.pago_em, p.criado_em)::date between de and ate
  order by coalesce(p.pago_em, p.criado_em) desc;
$$;

-- Fretes que entram na conta do fornecedor: só quando o frete é dele (desconto) ou pago pelo cliente.
-- Frete pago pela loja não aparece.
create or replace function public.portal_fretes(de date, ate date)
returns table (pedido_numero integer, data timestamptz, quem_paga text, valor numeric, desconto numeric)
language sql stable security definer set search_path = '' as $$
  select p.numero, coalesce(p.pago_em, p.criado_em), e.frete_modelo,
         case when e.frete_modelo = 'fornecedor' then e.desconto_fornecedor else e.valor_cobrado end,
         e.desconto_fornecedor
  from public.envios e
  join public.pedidos p on p.id = e.pedido_id
  where e.fornecedor_id = public.meu_fornecedor_id()
    and p.status = 'pago'
    and e.frete_modelo in ('cliente','fornecedor')
    and coalesce(p.pago_em, p.criado_em)::date between de and ate
  order by coalesce(p.pago_em, p.criado_em) desc;
$$;

-- Etiquetas para o fornecedor imprimir. Sem dados do cliente (só cidade/UF de destino aparecem na etiqueta).
create or replace function public.portal_envios()
returns table (
  envio_id uuid, pedido_numero integer, data timestamptz, status text, servico_nome text,
  transportadora text, etiqueta_url text, rastreio text, itens text
) language sql stable security definer set search_path = '' as $$
  select e.id, p.numero, coalesce(p.pago_em, p.criado_em), e.status, e.servico_nome,
         e.transportadora, e.etiqueta_url, e.rastreio,
         (select string_agg(i.quantidade || 'x ' || i.nome, ', ')
            from public.pedido_itens i
            where i.pedido_id = p.id and i.fornecedor_id = e.fornecedor_id)
  from public.envios e
  join public.pedidos p on p.id = e.pedido_id
  where e.fornecedor_id = public.meu_fornecedor_id()
    and p.status = 'pago'
  order by coalesce(p.pago_em, p.criado_em) desc
  limit 200;
$$;

-- Saldo = repasses de tudo que foi vendido e pago − fretes descontados − acertos já feitos
create or replace function public.portal_saldo()
returns table (total_repasse numeric, total_descontos numeric, total_pago numeric, saldo numeric)
language sql stable security definer set search_path = '' as $$
  with f as (select public.meu_fornecedor_id() as id),
  v as (
    select coalesce(sum(i.repasse), 0) as total
    from public.pedido_itens i join public.pedidos p on p.id = i.pedido_id, f
    where i.fornecedor_id = f.id and p.status = 'pago'
  ),
  d as (
    select coalesce(sum(e.desconto_fornecedor), 0) as total
    from public.envios e join public.pedidos p on p.id = e.pedido_id, f
    where e.fornecedor_id = f.id and p.status = 'pago'
  ),
  a as (select coalesce(sum(valor), 0) as total from public.acertos, f where fornecedor_id = f.id)
  select v.total, d.total, a.total, v.total - d.total - a.total from v, d, a;
$$;

-- O fornecedor marca o pacote como postado
create or replace function public.portal_marcar_postado(envio uuid)
returns void language sql security definer set search_path = '' as $$
  update public.envios set status = 'postado'
  where id = envio and fornecedor_id = public.meu_fornecedor_id() and status = 'etiqueta_gerada';
$$;

revoke all on function public.meu_fornecedor_id() from public;
revoke all on function public.portal_vendas(date, date) from public;
revoke all on function public.portal_envios() from public;
revoke all on function public.portal_fretes(date, date) from public;
revoke all on function public.portal_saldo() from public;
revoke all on function public.portal_marcar_postado(uuid) from public;
grant execute on function public.meu_fornecedor_id() to authenticated;
grant execute on function public.portal_vendas(date, date) to authenticated;
grant execute on function public.portal_envios() to authenticated;
grant execute on function public.portal_fretes(date, date) to authenticated;
grant execute on function public.portal_saldo() to authenticated;
grant execute on function public.portal_marcar_postado(uuid) to authenticated;

-- ---------- Baixa de estoque quando o pedido é pago ----------
create or replace function public.baixar_estoque(pedido uuid)
returns void language sql security definer set search_path = '' as $$
  update public.produtos pr
  set estoque = greatest(pr.estoque - i.qtd, 0)
  from (select produto_id, sum(quantidade) as qtd from public.pedido_itens where pedido_id = pedido group by produto_id) i
  where pr.id = i.produto_id and pr.estoque is not null;
$$;
revoke all on function public.baixar_estoque(uuid) from public, anon, authenticated;
grant execute on function public.baixar_estoque(uuid) to service_role;

-- ---------- Fornecedor inicial: o estoque da própria Suspen Store ----------
-- Endereço provisório: o Gilberto confirma e o Leonardo corrige pelo painel.
insert into public.fornecedores (nome, cep, rua, numero, bairro, cidade, uf, modelo, observacao)
select 'Suspen Store (estoque próprio)', '06010000', 'A confirmar', 's/n', 'Centro', 'Osasco', 'SP', 'revenda',
       'Endereço provisório: corrigir com o endereço real de onde sai o envio.'
where not exists (select 1 from public.fornecedores);

update public.produtos set fornecedor_id = (select id from public.fornecedores order by criado_em limit 1)
where fornecedor_id is null;
