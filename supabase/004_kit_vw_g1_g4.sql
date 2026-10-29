-- =====================================================================
-- Suspen Store: Kit Rosca Slim Volkswagen linha G1 a G4 (28/10/2026)
-- Foto: public/produtos/kit-rosca-slim-vw-g1-g4.jpg (vai pelo GitHub/Vercel).
-- Fornecedor, peso, medidas e textos copiados do Kit Gol G5. Pode rodar de novo sem duplicar.
-- =====================================================================
insert into public.produtos
  (slug, nome, categoria, montadora, modelos, imagem, preco, destaque, resumo, observacao,
   ativo, ordem, fornecedor_id, frete_gratis, peso_kg, altura_cm, largura_cm, comprimento_cm)
select 'kit-rosca-slim-vw-g1-g4', 'Kit Rosca Slim Volkswagen Linha G1 a G4', 'suspensao-a-rosca', 'Volkswagen',
       array['Gol G1','Gol G2','Gol G3','Gol G4'], '/produtos/kit-rosca-slim-vw-g1-g4.jpg', null, false, o.resumo,
       'Kit para a linha Volkswagen G1 a G4. Antes de comprar, confirme a aplicação para o seu carro (modelo, ano e motor) com a nossa equipe pelo WhatsApp.',
       true, o.ordem, o.fornecedor_id, o.frete_gratis, o.peso_kg, o.altura_cm, o.largura_cm, o.comprimento_cm
from public.produtos o where o.slug = 'kit-rosca-slim-gol-g5'
on conflict (slug) do nothing;

select nome, modelos, imagem from public.produtos where slug = 'kit-rosca-slim-vw-g1-g4';
