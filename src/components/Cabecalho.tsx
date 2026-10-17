"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { categorias } from "@/data/produtos";
import { loja } from "@/data/loja";
import { useCarrinho } from "./CarrinhoProvider";

export function Cabecalho() {
  const { totalItens } = useCarrinho();
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const q = busca.trim();
    router.push(q ? `/produtos?busca=${encodeURIComponent(q)}` : "/produtos");
    setMenuAberto(false);
  }

  return (
    <header className="cabecalho">
      <div className="faixa-topo">
        <div className="container faixa-topo__in">
          <span>Envio para todo o Brasil</span>
          <span className="so-desktop">Atendimento: {loja.horario}</span>
          <a href={`https://wa.me/${loja.whatsapp}`} target="_blank" rel="noopener">
            WhatsApp {loja.whatsappExibicao}
          </a>
        </div>
      </div>

      <div className="container cabecalho__in">
        <button
          className="cabecalho__menu-btn"
          aria-label="Abrir menu de categorias"
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <Link href="/" className="cabecalho__logo" aria-label="Suspen Store, página inicial">
          <Image src="/marca/logo-suspen-store-texto.png" alt="Suspen Store" width={520} height={139} priority />
        </Link>

        <form className="cabecalho__busca" onSubmit={buscar} role="search">
          <input
            id="busca-topo"
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Busque pelo carro ou peça: Gol, Corsa, rosca..."
            aria-label="Buscar produtos"
          />
          <button type="submit">Buscar</button>
        </form>

        <Link href="/carrinho" className="cabecalho__carrinho" aria-label={`Carrinho com ${totalItens} itens`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
            <circle cx="10" cy="20" r="1.3" />
            <circle cx="17" cy="20" r="1.3" />
          </svg>
          <span className="so-desktop">Carrinho</span>
          <span className="cabecalho__qtd">{totalItens}</span>
        </Link>
      </div>

      <nav className={`menu-categorias ${menuAberto ? "aberto" : ""}`} aria-label="Categorias">
        <div className="container menu-categorias__in">
          <Link href="/produtos" onClick={() => setMenuAberto(false)}>
            Todos os produtos
          </Link>
          {categorias.map((c) => (
            <Link key={c.slug} href={`/produtos?categoria=${c.slug}`} onClick={() => setMenuAberto(false)}>
              {c.nome}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
