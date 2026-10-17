"use client";
import { excluirProduto } from "@/app/admin/acoes";

export function BotaoExcluir({ id, nome }: { id: string; nome: string }) {
  return (
    <form
      action={excluirProduto}
      onSubmit={(e) => {
        if (!window.confirm(`Excluir "${nome}" de vez? Se for só tirar do site por um tempo, desmarque "Aparece no site".`))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn admin__perigo">
        Excluir produto
      </button>
    </form>
  );
}
