-- =====================================================================
-- Suspen Store: SKU final dos kits completos (11/11/2026)
-- O João pediu um código simples com abreviações; o Gilberto concordou.
--   SS     = Suspen Store (sempre no começo)
--   SLIMC  = kit rosca slim COMPLETO (SLIMP = kit parcial, sem amortecedor)
--   CARRO  = modelo junto, sem espaço (GOLG5, PARATISURF...)
--   4      = jogo com 4 (2 = par, D = par dianteiro, T = par traseiro)
-- Ex.: SS-SLIM-GOLG5  ->  SS-SLIMC-GOLG5-4
-- Pode rodar de novo sem estragar nada (só mexe em quem ainda está no formato antigo).
-- =====================================================================

update public.produtos
set sku = 'SS-SLIMC-' || substr(sku, length('SS-SLIM-') + 1) || '-4'
where sku like 'SS-SLIM-%';

-- Confere: os 35 kits com o SKU novo
select sku, nome
from public.produtos
where sku like 'SS-SLIMC-%'
order by montadora, sku;
