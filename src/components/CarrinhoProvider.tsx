"use client";

// Carrinho guardado no navegador do cliente (localStorage).
// Não precisa de login: o cliente adiciona os kits e escolhe como fechar o pedido.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ItemCarrinho = { slug: string; quantidade: number };

type CarrinhoCtx = {
  itens: ItemCarrinho[];
  totalItens: number;
  adicionar: (slug: string, quantidade?: number) => void;
  alterar: (slug: string, quantidade: number) => void;
  remover: (slug: string) => void;
  limpar: () => void;
  aviso: string | null;
};

const Ctx = createContext<CarrinhoCtx | null>(null);
const CHAVE = "suspen-carrinho";

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (salvo) setItens(JSON.parse(salvo));
    } catch {}
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    try {
      localStorage.setItem(CHAVE, JSON.stringify(itens));
    } catch {}
  }, [itens, carregado]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2200);
    return () => clearTimeout(t);
  }, [aviso]);

  const adicionar = (slug: string, quantidade = 1) => {
    setItens((atual) => {
      const existe = atual.find((i) => i.slug === slug);
      if (existe) return atual.map((i) => (i.slug === slug ? { ...i, quantidade: i.quantidade + quantidade } : i));
      return [...atual, { slug, quantidade }];
    });
    setAviso("Kit adicionado ao carrinho");
  };

  const alterar = (slug: string, quantidade: number) =>
    setItens((atual) =>
      quantidade <= 0 ? atual.filter((i) => i.slug !== slug) : atual.map((i) => (i.slug === slug ? { ...i, quantidade } : i))
    );

  const remover = (slug: string) => setItens((atual) => atual.filter((i) => i.slug !== slug));
  const limpar = () => setItens([]);
  const totalItens = itens.reduce((s, i) => s + i.quantidade, 0);

  return (
    <Ctx.Provider value={{ itens, totalItens, adicionar, alterar, remover, limpar, aviso }}>
      {children}
      {aviso && (
        <div className="toast" role="status">
          {aviso}
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useCarrinho() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCarrinho precisa estar dentro de <CarrinhoProvider>");
  return c;
}
