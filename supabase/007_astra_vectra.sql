-- =====================================================================
-- Suspen Store: aplicação do Kit Rosca Slim Astra (29/10/2026, Gilberto)
-- O kit da foto do Astra serve para Astra 2000 em diante e Vectra 2006 em diante. Pode rodar de novo.
-- =====================================================================
update public.produtos
set nome    = 'Kit Rosca Slim Astra / Vectra',
    modelos = array['Astra 2000 em diante','Vectra 2006 em diante'],
    anos    = 'Astra 2000 em diante e Vectra 2006 em diante'
where slug = 'kit-rosca-slim-astra';

select nome, modelos, anos from public.produtos where slug = 'kit-rosca-slim-astra';
