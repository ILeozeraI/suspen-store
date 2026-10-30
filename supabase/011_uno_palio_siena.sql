-- =====================================================================
-- Suspen Store: aplicações do Uno e do Palio (30/10/2026, Gilberto)
-- Foto do Uno Fire = Uno Quadrado 1984 a 2013. Foto do Palio Fire = Palio 1996 a 2012 e Siena 1997 a 2012.
-- Pode rodar de novo sem duplicar.
-- =====================================================================

-- Uno Quadrado: anos e versões
update public.produtos
set nome = 'Kit Rosca Slim Uno Quadrado (1984 a 2013)',
    modelos = array['Uno Quadrado (1984 a 2013)'],
    observacao = 'Versões: Uno S, CS e SX, 1.5 R, Uno Mille, Turbo i.e., Mille Brio, Grazie Mille. '
              || 'Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.'
where slug = 'kit-rosca-slim-uno-quadrado';

-- Palio e Siena: kits novos, copiados do Kit Palio Fire (mesma foto, fornecedor, preço, peso e medidas)
insert into public.produtos
  (slug, nome, categoria, montadora, modelos, imagem, preco, preco_antigo, destaque, resumo, observacao,
   estoque, ativo, ordem, fornecedor_id, frete_gratis, peso_kg, altura_cm, largura_cm, comprimento_cm)
select n.slug, n.nome, o.categoria, o.montadora, n.modelos, o.imagem, o.preco, o.preco_antigo, false, o.resumo, n.obs,
       o.estoque, true, o.ordem, o.fornecedor_id, o.frete_gratis, o.peso_kg, o.altura_cm, o.largura_cm, o.comprimento_cm
from (values
  ('kit-rosca-slim-palio-96-2012', 'Kit Rosca Slim Palio (1996 a 2012)', array['Palio (1996 a 2012)'],
   'Versões: Hatch, EL 1.5, EDX 1.0, ED 1.0, MPi, EX, ELX, Citymatic, Young, Stile, Fire, HLX, 1.8 R, Economy. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.'),
  ('kit-rosca-slim-siena-97-2012', 'Kit Rosca Slim Siena (1997 a 2012)', array['Siena (1997 a 2012)'],
   'Versões: EL, HL, ELX, Stile, Fire, EX, Essence, Attractive, Tetrafuel. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.')
) as n(slug, nome, modelos, obs)
join public.produtos o on o.slug = 'kit-rosca-slim-palio-fire'
on conflict (slug) do nothing;

select nome, modelos from public.produtos where slug like 'kit-rosca-slim-uno%' or slug like 'kit-rosca-slim-palio%' or slug like 'kit-rosca-slim-siena%' order by nome;
