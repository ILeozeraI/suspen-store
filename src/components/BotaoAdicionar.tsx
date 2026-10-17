"use client";

import { useCarrinho } from "./CarrinhoProvider";

export function BotaoAdicionar({ slug, grande = false }: { slug: string; grande?: boolean }) {
  const { adicionar } = useCarrinho();
  return (
    <button type="button" className={`btn btn--escuro ${grande ? "btn--grande" : ""}`} onClick={() => adicionar(slug)}>
      Adicionar ao carrinho
    </button>
  );
}
