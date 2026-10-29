-- =====================================================================
-- Suspen Store: aplicação do Kit Rosca Slim Corsa (29/10/2026, Gilberto)
-- Também limpa o campo "anos" do kit Astra / Vectra (os anos já estão no nome dos modelos). Pode rodar de novo.
-- =====================================================================
update public.produtos
set nome       = 'Kit Rosca Slim Corsa / Celta / Prisma',
    modelos    = array['Corsa G1 (1994 a 2001)','Corsa G2 (2002 a 2004)','Celta (todos)','Prisma G1 (2007 a 2012)'],
    anos       = null,
    observacao = 'Versões: Corsa G1 1994 a 2001 (Milenium/Wind); Corsa G2 2002 a 2004 (AutoClutch/Super/Joy/Maxx/Premium); '
              || 'Celta todos (Energy/Super/Life/Spirit/LS/Advantage); Prisma G1 2007 a 2012 (Joy/LS/Maxx/LT). '
              || 'Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.'
where slug = 'kit-rosca-slim-corsa';

update public.produtos set anos = null where slug = 'kit-rosca-slim-astra';

select nome, modelos from public.produtos where slug in ('kit-rosca-slim-corsa','kit-rosca-slim-astra');
