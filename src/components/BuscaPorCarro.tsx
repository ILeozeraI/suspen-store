"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Filtro "Encontre pelo seu carro": montadora -> modelo -> lista de produtos.
export function BuscaPorCarro({
  modelos,
  inicialMontadora = "",
  inicialModelo = "",
}: {
  modelos: Record<string, string[]>;
  inicialMontadora?: string;
  inicialModelo?: string;
}) {
  const router = useRouter();
  const [montadora, setMontadora] = useState(inicialMontadora);
  const [modelo, setModelo] = useState(inicialModelo);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (montadora) p.set("montadora", montadora);
    if (modelo) p.set("modelo", modelo);
    router.push(`/produtos${p.toString() ? `?${p}` : ""}`);
  }

  return (
    <form className="busca-carro" onSubmit={enviar}>
      <div className="busca-carro__titulo">
        <h2>Encontre pelo seu carro</h2>
        <p>Escolha a montadora e o modelo para ver os kits que servem.</p>
      </div>
      <label htmlFor="bc-montadora">
        Montadora
        <select
          id="bc-montadora"
          value={montadora}
          onChange={(e) => {
            setMontadora(e.target.value);
            setModelo("");
          }}
        >
          <option value="">Todas</option>
          {Object.keys(modelos).map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
      <label htmlFor="bc-modelo">
        Modelo
        <select id="bc-modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} disabled={!montadora}>
          <option value="">{montadora ? "Todos" : "Escolha a montadora"}</option>
          {(modelos[montadora] ?? []).map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn btn--vermelho">
        Ver peças
      </button>
    </form>
  );
}
