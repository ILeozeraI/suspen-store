-- =====================================================================
-- Suspen Store: um card (produto) para cada carro (29/10/2026, pedido do Leonardo)
-- Antes: "Volkswagen Linha G1 a G4", "Astra / Vectra" e "Corsa / Celta / Prisma" juntavam vários carros.
-- Agora: cada carro da lista do Gilberto vira um kit separado, com a mesma foto, fornecedor, preço, peso e medidas
-- do kit de origem. Pode rodar de novo sem duplicar.
-- =====================================================================

-- 1. Kits novos, copiados do kit de origem
insert into public.produtos
  (slug, nome, categoria, montadora, modelos, anos, imagem, preco, preco_antigo, destaque, resumo, observacao,
   estoque, ativo, ordem, fornecedor_id, frete_gratis, peso_kg, altura_cm, largura_cm, comprimento_cm)
select n.slug, n.nome, o.categoria, o.montadora, n.modelos, null, o.imagem, o.preco, o.preco_antigo, false, o.resumo,
       n.obs, o.estoque, true, o.ordem, o.fornecedor_id, o.frete_gratis, o.peso_kg, o.altura_cm, o.largura_cm, o.comprimento_cm
from (values
  ('kit-rosca-slim-vw-g1-g4', 'kit-rosca-slim-gol-quadrado', 'Kit Rosca Slim Gol Quadrado', array['Gol Quadrado'], 'Kit da linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 0),
  ('kit-rosca-slim-vw-g1-g4', 'kit-rosca-slim-gol-bola-g1', 'Kit Rosca Slim Gol Bola G1', array['Gol Bola G1'], 'Kit da linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 1),
  ('kit-rosca-slim-vw-g1-g4', 'kit-rosca-slim-gol-bola-g2', 'Kit Rosca Slim Gol Bola G2', array['Gol Bola G2'], 'Kit da linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 2),
  ('kit-rosca-slim-vw-g1-g4', 'kit-rosca-slim-gol-bola-g3', 'Kit Rosca Slim Gol Bola G3', array['Gol Bola G3'], 'Kit da linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 3),
  ('kit-rosca-slim-vw-g1-g4', 'kit-rosca-slim-gol-bola-g4', 'Kit Rosca Slim Gol Bola G4', array['Gol Bola G4'], 'Kit da linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 4),
  ('kit-rosca-slim-vw-g1-g4', 'kit-rosca-slim-gol-gt-84', 'Kit Rosca Slim Gol GT 84', array['Gol GT 84'], 'Kit da linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 5),
  ('kit-rosca-slim-vw-g1-g4', 'kit-rosca-slim-voyage-quadrado', 'Kit Rosca Slim Voyage Quadrado', array['Voyage Quadrado'], 'Kit da linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 6),
  ('kit-rosca-slim-vw-g1-g4', 'kit-rosca-slim-saveiro-quadrada', 'Kit Rosca Slim Saveiro Quadrada', array['Saveiro Quadrada'], 'Kit da linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 7),
  ('kit-rosca-slim-vw-g1-g4', 'kit-rosca-slim-saveiro-surf', 'Kit Rosca Slim Saveiro Surf', array['Saveiro Surf'], 'Kit da linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 8),
  ('kit-rosca-slim-vw-g1-g4', 'kit-rosca-slim-santana-ate-99', 'Kit Rosca Slim Santana até 99', array['Santana até 99'], 'Kit da linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 9),
  ('kit-rosca-slim-vw-g1-g4', 'kit-rosca-slim-parati-g1', 'Kit Rosca Slim Parati G1', array['Parati G1'], 'Kit da linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 10),
  ('kit-rosca-slim-vw-g1-g4', 'kit-rosca-slim-parati-g2', 'Kit Rosca Slim Parati G2', array['Parati G2'], 'Kit da linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 11),
  ('kit-rosca-slim-vw-g1-g4', 'kit-rosca-slim-parati-g3', 'Kit Rosca Slim Parati G3', array['Parati G3'], 'Kit da linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 12),
  ('kit-rosca-slim-vw-g1-g4', 'kit-rosca-slim-parati-g4', 'Kit Rosca Slim Parati G4', array['Parati G4'], 'Kit da linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 13),
  ('kit-rosca-slim-vw-g1-g4', 'kit-rosca-slim-parati-surf-ate-g4', 'Kit Rosca Slim Parati Surf até G4', array['Parati Surf até G4'], 'Kit da linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 14),
  ('kit-rosca-slim-corsa', 'kit-rosca-slim-corsa-g2', 'Kit Rosca Slim Corsa G2 (2002 a 2004)', array['Corsa G2 (2002 a 2004)'], 'Versões: AutoClutch/Super/Joy/Maxx/Premium. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 15),
  ('kit-rosca-slim-corsa', 'kit-rosca-slim-celta', 'Kit Rosca Slim Celta', array['Celta'], 'Serve em todos os Celta (Energy/Super/Life/Spirit/LS/Advantage). Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 16),
  ('kit-rosca-slim-corsa', 'kit-rosca-slim-prisma-g1', 'Kit Rosca Slim Prisma G1 (2007 a 2012)', array['Prisma G1 (2007 a 2012)'], 'Versões: Joy/LS/Maxx/LT. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 17),
  ('kit-rosca-slim-uno-way-vivace', 'kit-rosca-slim-uno-vivace', 'Kit Rosca Slim Uno Vivace', array['Uno Vivace'], 'Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 98),
  ('kit-rosca-slim-astra', 'kit-rosca-slim-vectra-2006', 'Kit Rosca Slim Vectra 2006 em diante', array['Vectra 2006 em diante'], 'Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.', 18)
) as n(origem, slug, nome, modelos, obs, pos)
join public.produtos o on o.slug = n.origem
on conflict (slug) do nothing;

-- 2. Os kits de origem viram o primeiro carro de cada lista
update public.produtos
set nome = 'Kit Rosca Slim Astra 2000 em diante', modelos = array['Astra 2000 em diante'], anos = null,
    observacao = 'Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.'
where slug = 'kit-rosca-slim-astra';

update public.produtos
set nome = 'Kit Rosca Slim Corsa G1 (1994 a 2001)', modelos = array['Corsa G1 (1994 a 2001)'], anos = null,
    observacao = 'Versões: Milenium/Wind. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.'
where slug = 'kit-rosca-slim-corsa';

update public.produtos
set nome = 'Kit Rosca Slim Uno Way', modelos = array['Uno Way']
where slug = 'kit-rosca-slim-uno-way-vivace';

-- 3. O kit VW combinado sai do site (cada carro agora tem o seu)
delete from public.produtos where slug = 'kit-rosca-slim-vw-g1-g4';

-- Confere
select nome, modelos from public.produtos where categoria = 'suspensao-a-rosca' order by ordem, nome;
