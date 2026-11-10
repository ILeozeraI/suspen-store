-- =====================================================================
-- Suspen Store: arte de regulagem de altura como ÚLTIMA foto de cada kit (09/11/2026)
-- Medida Social (Baixo 2 cm, Alto 4 a 8 cm), com a frente do próprio carro. Aprovado pelo Gilberto.
-- As imagens ficam em public/produtos/regulagem/. Pode rodar de novo sem duplicar.
-- =====================================================================

update public.produtos p
set fotos_extras = array_remove(p.fotos_extras, a.arte) || a.arte
from (values
  ('kit-rosca-slim-gol-g5', '/produtos/regulagem/regulagem-gol-g5.jpg'),
  ('kit-rosca-slim-gol-g6', '/produtos/regulagem/regulagem-gol-g6.jpg'),
  ('kit-rosca-slim-gol-g7', '/produtos/regulagem/regulagem-gol-g7.jpg'),
  ('kit-rosca-slim-gol-quadrado', '/produtos/regulagem/regulagem-gol-quadrado.jpg'),
  ('kit-rosca-slim-gol-bola-g1', '/produtos/regulagem/regulagem-gol-bola-g1.jpg'),
  ('kit-rosca-slim-gol-bola-g2', '/produtos/regulagem/regulagem-gol-bola-g2.jpg'),
  ('kit-rosca-slim-gol-bola-g3', '/produtos/regulagem/regulagem-gol-bola-g3.jpg'),
  ('kit-rosca-slim-gol-bola-g4', '/produtos/regulagem/regulagem-gol-bola-g4.jpg'),
  ('kit-rosca-slim-gol-gt-84', '/produtos/regulagem/regulagem-gol-gt-84.jpg'),
  ('kit-rosca-slim-voyage-quadrado', '/produtos/regulagem/regulagem-voyage-quadrado.jpg'),
  ('kit-rosca-slim-saveiro-quadrada', '/produtos/regulagem/regulagem-saveiro-quadrada.jpg'),
  ('kit-rosca-slim-saveiro-surf', '/produtos/regulagem/regulagem-saveiro-surf.jpg'),
  ('kit-rosca-slim-santana-ate-99', '/produtos/regulagem/regulagem-santana-ate-99.jpg'),
  ('kit-rosca-slim-parati-g1', '/produtos/regulagem/regulagem-parati-g1.jpg'),
  ('kit-rosca-slim-parati-g2', '/produtos/regulagem/regulagem-parati-g2.jpg'),
  ('kit-rosca-slim-parati-g3', '/produtos/regulagem/regulagem-parati-g3.jpg'),
  ('kit-rosca-slim-parati-g4', '/produtos/regulagem/regulagem-parati-g4.jpg'),
  ('kit-rosca-slim-parati-surf-ate-g4', '/produtos/regulagem/regulagem-parati-surf-ate-g4.jpg'),
  ('kit-rosca-slim-up', '/produtos/regulagem/regulagem-up.jpg'),
  ('kit-rosca-slim-astra', '/produtos/regulagem/regulagem-astra.jpg'),
  ('kit-rosca-slim-vectra', '/produtos/regulagem/regulagem-vectra.jpg'),
  ('kit-rosca-slim-vectra-2006', '/produtos/regulagem/regulagem-vectra-2006.jpg'),
  ('kit-rosca-slim-corsa', '/produtos/regulagem/regulagem-corsa.jpg'),
  ('kit-rosca-slim-corsa-g2', '/produtos/regulagem/regulagem-corsa-g2.jpg'),
  ('kit-rosca-slim-celta', '/produtos/regulagem/regulagem-celta.jpg'),
  ('kit-rosca-slim-prisma-g1', '/produtos/regulagem/regulagem-prisma-g1.jpg'),
  ('kit-rosca-slim-uno-fire', '/produtos/regulagem/regulagem-uno-fire.jpg'),
  ('kit-rosca-slim-uno-quadrado', '/produtos/regulagem/regulagem-uno-quadrado.jpg'),
  ('kit-rosca-slim-uno-way-vivace', '/produtos/regulagem/regulagem-uno-way-vivace.jpg'),
  ('kit-rosca-slim-uno-vivace', '/produtos/regulagem/regulagem-uno-vivace.jpg'),
  ('kit-rosca-slim-palio-fire', '/produtos/regulagem/regulagem-palio-fire.jpg'),
  ('kit-rosca-slim-palio-furo-reto', '/produtos/regulagem/regulagem-palio-furo-reto.jpg'),
  ('kit-rosca-slim-palio-96-2012', '/produtos/regulagem/regulagem-palio-96-2012.jpg'),
  ('kit-rosca-slim-siena-97-2012', '/produtos/regulagem/regulagem-siena-97-2012.jpg'),
  ('kit-rosca-slim-verona', '/produtos/regulagem/regulagem-verona.jpg')
) as a(slug, arte)
where p.slug = a.slug;

-- Confere: cada kit com a arte no fim da lista (deve listar 35 kits)
select nome, fotos_extras[array_length(fotos_extras, 1)] as ultima_foto
from public.produtos
where exists (select 1 from unnest(fotos_extras) f where f like '/produtos/regulagem/%')
order by ordem, nome;
