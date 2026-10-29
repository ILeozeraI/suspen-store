-- =====================================================================
-- Suspen Store: Kit Vectra antigo (29/10/2026, Gilberto: "específica do Vectra 2000 pra baixo")
-- Ele ainda vai mandar outros carros compatíveis. Pode rodar de novo.
-- =====================================================================
update public.produtos
set nome = 'Kit Rosca Slim Vectra até 2000', modelos = array['Vectra até 2000'], anos = null
where slug = 'kit-rosca-slim-vectra';

select nome, modelos from public.produtos where slug like 'kit-rosca-slim-vectra%';
