-- =====================================================================
-- Suspen Store: nomes e textos dos kits para o Google (11/11/2026)
-- Pedido do João: o nome precisa ter "Suspensão" (é o que as pessoas buscam) e dizer que o kit é COMPLETO,
-- com amortecedores, porque o Google lê o texto e não a foto.
-- O kit completo vem com: 4 amortecedores reduzidos com tubos de rosca, 4 molas e 4 batentes.
--   Antes:  Kit Rosca Slim Gol G5
--   Depois: Kit Suspensão Rosca Slim Completo Gol G5 com Amortecedores
-- O endereço da página (slug) NÃO muda, então links antigos continuam funcionando.
-- Pode rodar de novo sem estragar nada (só mexe em quem ainda tem o nome antigo).
-- =====================================================================

update public.produtos
set
  nome = 'Kit Suspensão Rosca Slim Completo ' || substr(nome, length('Kit Rosca Slim ') + 1) || ' com Amortecedores',
  resumo = 'Kit de suspensão a rosca slim completo, com amortecedores, para '
    || coalesce(modelos[1], substr(nome, length('Kit Rosca Slim ') + 1))
    || '. Vem com 4 amortecedores reduzidos com tubos de rosca, 4 molas e 4 batentes: o jogo para as 4 rodas,'
    || ' dianteira e traseira, com regulagem de altura para deixar o carro baixo do jeito que você quer.'
where slug like 'kit-rosca-slim-%'
  and nome like 'Kit Rosca Slim %';

-- Confere: os 35 kits com o nome novo
select nome, resumo
from public.produtos
where slug like 'kit-rosca-slim-%'
order by montadora, ordem, nome;
