-- =====================================================================
-- Suspen Store: carros que o Kit Rosca Slim Volkswagen Linha G1 a G4 atende (28/10/2026, lista do Gilberto)
-- Atualiza a lista de modelos (usada na busca por carro e na ficha do produto). Pode rodar de novo.
-- =====================================================================
update public.produtos
set modelos = array['Gol Quadrado','Gol Bola G1','Gol Bola G2','Gol Bola G3','Gol Bola G4',
                    'Voyage Quadrado','Saveiro Quadrada','Saveiro Surf','Santana até 99']
where slug = 'kit-rosca-slim-vw-g1-g4';

select nome, modelos from public.produtos where slug = 'kit-rosca-slim-vw-g1-g4';
