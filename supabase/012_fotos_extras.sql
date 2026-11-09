-- =====================================================================
-- Suspen Store: várias fotos por kit (09/11/2026)
-- "imagem" continua sendo a foto principal (cards e carrinho). "fotos_extras" são as outras fotos da página do
-- produto, na ordem em que aparecem (ex.: a arte de regulagem de altura de cada carro). Pode rodar de novo.
-- =====================================================================
alter table public.produtos add column if not exists fotos_extras text[] not null default '{}';

select count(*) as kits, count(*) filter (where cardinality(fotos_extras) > 0) as com_fotos_extras from public.produtos;
