-- =====================================================================
-- Suspen Store: código SKU de cada anúncio (10/11/2026)
-- Pedido do João, aprovado pelo Gilberto. Formato: SS-SUBCATEGORIA-MODELO, tudo maiúsculo, sem espaço e sem acento.
--   SS            = Suspen Store
--   SUBCATEGORIA  = tipo da peça (SLIM = kit rosca slim; AIR = suspensão a ar; etc.)
--   MODELO        = carro/versão, junto (GOLG5, PARATISURF, VECTRA2006...)
-- Exemplo: SS-SLIM-GOLG5. O SKU é único: dois anúncios não podem ter o mesmo.
-- O pedido também guarda o SKU de cada item (para separar no estoque e, no futuro, mandar para o Bling).
-- Pode rodar de novo sem estragar nada.
-- =====================================================================

alter table public.produtos add column if not exists sku text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'produtos_sku_formato') then
    alter table public.produtos
      add constraint produtos_sku_formato check (sku is null or sku ~ '^SS(-[A-Z0-9]+){2,}$');
  end if;
end $$;

create unique index if not exists produtos_sku_unico on public.produtos (sku);

alter table public.pedido_itens add column if not exists sku text;

-- SKU dos kits que já estão no site
update public.produtos p
set sku = a.sku
from (values
  -- Volkswagen
  ('kit-rosca-slim-gol-quadrado',       'SS-SLIM-GOLQUADRADO'),
  ('kit-rosca-slim-gol-bola-g1',        'SS-SLIM-GOLBOLAG1'),
  ('kit-rosca-slim-gol-bola-g2',        'SS-SLIM-GOLBOLAG2'),
  ('kit-rosca-slim-gol-bola-g3',        'SS-SLIM-GOLBOLAG3'),
  ('kit-rosca-slim-gol-bola-g4',        'SS-SLIM-GOLBOLAG4'),
  ('kit-rosca-slim-gol-g5',             'SS-SLIM-GOLG5'),
  ('kit-rosca-slim-gol-g6',             'SS-SLIM-GOLG6'),
  ('kit-rosca-slim-gol-g7',             'SS-SLIM-GOLG7'),
  ('kit-rosca-slim-gol-gt-84',          'SS-SLIM-GOLGT84'),
  ('kit-rosca-slim-voyage-quadrado',    'SS-SLIM-VOYAGEQUADRADO'),
  ('kit-rosca-slim-saveiro-quadrada',   'SS-SLIM-SAVEIROQUADRADA'),
  ('kit-rosca-slim-saveiro-surf',       'SS-SLIM-SAVEIROSURF'),
  ('kit-rosca-slim-santana-ate-99',     'SS-SLIM-SANTANA99'),
  ('kit-rosca-slim-parati-g1',          'SS-SLIM-PARATIG1'),
  ('kit-rosca-slim-parati-g2',          'SS-SLIM-PARATIG2'),
  ('kit-rosca-slim-parati-g3',          'SS-SLIM-PARATIG3'),
  ('kit-rosca-slim-parati-g4',          'SS-SLIM-PARATIG4'),
  ('kit-rosca-slim-parati-surf-ate-g4', 'SS-SLIM-PARATISURF'),
  ('kit-rosca-slim-up',                 'SS-SLIM-UP'),
  -- Chevrolet
  ('kit-rosca-slim-astra',              'SS-SLIM-ASTRA2000'),
  ('kit-rosca-slim-vectra',             'SS-SLIM-VECTRA2000'),
  ('kit-rosca-slim-vectra-2006',        'SS-SLIM-VECTRA2006'),
  ('kit-rosca-slim-corsa',              'SS-SLIM-CORSAG1'),
  ('kit-rosca-slim-corsa-g2',           'SS-SLIM-CORSAG2'),
  ('kit-rosca-slim-celta',              'SS-SLIM-CELTA'),
  ('kit-rosca-slim-prisma-g1',          'SS-SLIM-PRISMAG1'),
  -- Fiat
  ('kit-rosca-slim-uno-fire',           'SS-SLIM-UNOFIRE'),
  ('kit-rosca-slim-uno-quadrado',       'SS-SLIM-UNOQUADRADO'),
  ('kit-rosca-slim-uno-way-vivace',     'SS-SLIM-UNOWAY'),
  ('kit-rosca-slim-uno-vivace',         'SS-SLIM-UNOVIVACE'),
  ('kit-rosca-slim-palio-96-2012',      'SS-SLIM-PALIO'),
  ('kit-rosca-slim-palio-fire',         'SS-SLIM-PALIOFIRE'),
  ('kit-rosca-slim-palio-furo-reto',    'SS-SLIM-PALIOFURORETO'),
  ('kit-rosca-slim-siena-97-2012',      'SS-SLIM-SIENA'),
  -- Ford
  ('kit-rosca-slim-verona',             'SS-SLIM-VERONA')
) as a(slug, sku)
where p.slug = a.slug and p.sku is distinct from a.sku;

-- Confere: lista todos os anúncios com o SKU (nenhum deve ficar vazio)
select sku, nome, montadora
from public.produtos
order by montadora, sku nulls first;
