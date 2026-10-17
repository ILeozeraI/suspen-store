-- =====================================================================
-- Suspen Store: estrutura do banco no Supabase
-- Como usar: Supabase > SQL Editor > New query > colar tudo > Run.
-- Pode rodar de novo sem problema (não duplica nada).
-- =====================================================================

-- ---------- Tabela de produtos ----------
create table if not exists public.produtos (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]+$'),
  nome          text not null check (char_length(nome) between 1 and 120),
  categoria     text not null check (categoria in ('suspensao-a-rosca','suspensao-a-ar','suspensao-fixa','amortecedores','molas-esportivas')),
  montadora     text not null,
  modelos       text[] not null default '{}',
  anos          text,
  imagem        text not null,
  preco         numeric(10,2) check (preco is null or preco > 0),
  preco_antigo  numeric(10,2) check (preco_antigo is null or preco_antigo > 0),
  destaque      boolean not null default false,
  resumo        text not null,
  observacao    text,
  estoque       integer check (estoque is null or estoque >= 0),
  ativo         boolean not null default true,
  ordem         integer not null default 0,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create or replace function public.tocar_atualizado_em()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.atualizado_em = now();
  return new;
end $$;

drop trigger if exists produtos_atualizado_em on public.produtos;
create trigger produtos_atualizado_em before update on public.produtos
  for each row execute function public.tocar_atualizado_em();

-- ---------- Quem é administrador ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  criado_em timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

-- ---------- Segurança (RLS) ----------
alter table public.produtos enable row level security;
alter table public.admins   enable row level security;

-- Visitantes veem só produtos ativos; o admin vê todos.
drop policy if exists "produtos: leitura" on public.produtos;
create policy "produtos: leitura" on public.produtos
  for select to anon, authenticated
  using (ativo or (select public.is_admin()));

-- Só o admin cadastra, edita e exclui.
drop policy if exists "produtos: admin insere" on public.produtos;
create policy "produtos: admin insere" on public.produtos
  for insert to authenticated with check ((select public.is_admin()));

drop policy if exists "produtos: admin edita" on public.produtos;
create policy "produtos: admin edita" on public.produtos
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "produtos: admin exclui" on public.produtos;
create policy "produtos: admin exclui" on public.produtos
  for delete to authenticated using ((select public.is_admin()));

-- Cada admin só enxerga a própria linha. Ninguém se adiciona como admin pelo site.
drop policy if exists "admins: ver a si mesmo" on public.admins;
create policy "admins: ver a si mesmo" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- Permissões da API (o projeto foi criado sem expor tabelas automaticamente).
revoke all on public.produtos from anon, authenticated;
revoke all on public.admins   from anon, authenticated;
grant select on public.produtos to anon, authenticated;
grant insert, update, delete on public.produtos to authenticated;
grant select on public.admins to authenticated;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Fotos (Storage) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 4194304, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "fotos: admin envia" on storage.objects;
create policy "fotos: admin envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'produtos' and (select public.is_admin()));

drop policy if exists "fotos: admin troca" on storage.objects;
create policy "fotos: admin troca" on storage.objects
  for update to authenticated using (bucket_id = 'produtos' and (select public.is_admin()));

drop policy if exists "fotos: admin apaga" on storage.objects;
create policy "fotos: admin apaga" on storage.objects
  for delete to authenticated using (bucket_id = 'produtos' and (select public.is_admin()));

-- ---------- Os 9 kits iniciais ----------
insert into public.produtos (slug, nome, categoria, montadora, modelos, imagem, destaque, resumo, observacao, ordem)
select v.slug, v.nome, 'suspensao-a-rosca', v.montadora, v.modelos, '/produtos/' || v.slug || '.jpg', v.destaque,
  'Kit de suspensão a rosca slim com regulagem de altura, para deixar o carro baixo do jeito que você quer. Molas vermelhas, roscas cromadas e flanges de ajuste.',
  coalesce(v.obs_extra, '') || 'Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.',
  v.ordem
from (values
  ('kit-rosca-slim-gol-g5',         'Kit Rosca Slim Gol G5',                  'Volkswagen', array['Gol G5'],                 true,  null, 1),
  ('kit-rosca-slim-up',             'Kit Rosca Slim Up',                      'Volkswagen', array['Up'],                     true,  null, 2),
  ('kit-rosca-slim-astra',          'Kit Rosca Slim Astra',                   'Chevrolet',  array['Astra'],                  true,  null, 3),
  ('kit-rosca-slim-corsa',          'Kit Rosca Slim Corsa',                   'Chevrolet',  array['Corsa'],                  true,  null, 4),
  ('kit-rosca-slim-vectra',         'Kit Rosca Slim Vectra',                  'Chevrolet',  array['Vectra'],                 false, null, 5),
  ('kit-rosca-slim-uno-fire',       'Kit Rosca Slim Uno Fire',                'Fiat',       array['Uno Fire'],               false, null, 6),
  ('kit-rosca-slim-uno-way-vivace', 'Kit Rosca Slim Uno Way / Vivace',        'Fiat',       array['Uno Way','Uno Vivace'],   false, null, 7),
  ('kit-rosca-slim-palio-fire',     'Kit Rosca Slim Palio Fire (furo reto)',  'Fiat',       array['Palio Fire'],             false, 'Versão para Palio Fire com fixação de furo reto. ', 8),
  ('kit-rosca-slim-verona',         'Kit Rosca Slim Verona',                  'Ford',       array['Verona'],                 false, null, 9)
) as v(slug, nome, montadora, modelos, destaque, obs_extra, ordem)
on conflict (slug) do nothing;
