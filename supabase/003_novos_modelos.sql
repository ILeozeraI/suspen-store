-- =====================================================================
-- Suspen Store: novos modelos (28/10/2026)
-- Gol G6 e Gol G7+ (foto do Gol G5), Uno Quadrado (foto do Uno Fire) e Palio Furo Reto (foto do Palio Fire).
-- O antigo "Palio Fire (furo reto)" passa a se chamar só "Palio Fire".
-- Cada novo kit copia do kit de origem: fornecedor, preço, peso, medidas, frete grátis, custo e textos.
-- Pode rodar de novo sem duplicar.
-- =====================================================================

-- Palio Fire: tira o "furo reto" do nome e da observação
update public.produtos
set nome = 'Kit Rosca Slim Palio Fire',
    observacao = 'Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.'
where slug = 'kit-rosca-slim-palio-fire';

-- Novos kits, copiados do kit de origem
insert into public.produtos
  (slug, nome, categoria, montadora, modelos, anos, imagem, preco, preco_antigo, destaque, resumo, observacao,
   estoque, ativo, ordem, fornecedor_id, frete_gratis, peso_kg, altura_cm, largura_cm, comprimento_cm)
select n.slug, n.nome, o.categoria, o.montadora, n.modelos, null, o.imagem, o.preco, o.preco_antigo, false, o.resumo,
       coalesce(n.obs, o.observacao), o.estoque, true, o.ordem, o.fornecedor_id, o.frete_gratis,
       o.peso_kg, o.altura_cm, o.largura_cm, o.comprimento_cm
from (values
  ('kit-rosca-slim-gol-g5',      'kit-rosca-slim-gol-g6',          'Kit Rosca Slim Gol G6',           array['Gol G6'],          null),
  ('kit-rosca-slim-gol-g5',      'kit-rosca-slim-gol-g7',          'Kit Rosca Slim Gol G7+',          array['Gol G7+'],         null),
  ('kit-rosca-slim-uno-fire',    'kit-rosca-slim-uno-quadrado',    'Kit Rosca Slim Uno Quadrado',     array['Uno Quadrado'],    null),
  ('kit-rosca-slim-palio-fire',  'kit-rosca-slim-palio-furo-reto', 'Kit Rosca Slim Palio Furo Reto',  array['Palio Furo Reto'],
   'Versão para Palio com fixação de furo reto. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.')
) as n(origem, slug, nome, modelos, obs)
join public.produtos o on o.slug = n.origem
on conflict (slug) do nothing;

-- Custo (só admin): copia do kit de origem, se existir
insert into public.produtos_custos (produto_id, custo)
select novo.id, c.custo
from (values
  ('kit-rosca-slim-gol-g5', 'kit-rosca-slim-gol-g6'),
  ('kit-rosca-slim-gol-g5', 'kit-rosca-slim-gol-g7'),
  ('kit-rosca-slim-uno-fire', 'kit-rosca-slim-uno-quadrado'),
  ('kit-rosca-slim-palio-fire', 'kit-rosca-slim-palio-furo-reto')
) as m(origem, destino)
join public.produtos o on o.slug = m.origem
join public.produtos novo on novo.slug = m.destino
join public.produtos_custos c on c.produto_id = o.id
on conflict (produto_id) do nothing;

-- Ordem no site: cada novo kit logo depois do kit de origem
update public.produtos set ordem = o.ordem
from public.produtos o
where (public.produtos.slug, o.slug) in (
  ('kit-rosca-slim-gol-g6', 'kit-rosca-slim-gol-g5'),
  ('kit-rosca-slim-gol-g7', 'kit-rosca-slim-gol-g5'),
  ('kit-rosca-slim-uno-quadrado', 'kit-rosca-slim-uno-fire'),
  ('kit-rosca-slim-palio-furo-reto', 'kit-rosca-slim-palio-fire'));

-- Confere: deve listar 13 kits
select nome, modelos, imagem from public.produtos order by ordem, nome;
