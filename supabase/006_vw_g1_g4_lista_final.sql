-- =====================================================================
-- Suspen Store: lista completa de carros do Kit Rosca Slim Volkswagen Linha G1 a G4 (29/10/2026, Gilberto)
-- Substitui a lista anterior (005). Pode rodar de novo.
-- =====================================================================
update public.produtos
set modelos = array['Gol Quadrado','Gol Bola G1','Gol Bola G2','Gol Bola G3','Gol Bola G4','Gol GT 84',
                    'Voyage Quadrado','Saveiro Quadrada','Saveiro Surf','Santana até 99',
                    'Parati G1','Parati G2','Parati G3','Parati G4','Parati Surf até G4']
where slug = 'kit-rosca-slim-vw-g1-g4';

select nome, array_length(modelos, 1) as qtd_carros, modelos from public.produtos where slug = 'kit-rosca-slim-vw-g1-g4';
