"use client";
// Galeria da página do produto: foto grande + miniaturas para trocar.
import Image from "next/image";
import { useState } from "react";

export function GaleriaProduto({ fotos, nome }: { fotos: string[]; nome: string }) {
  const [atual, setAtual] = useState(0);
  return (
    <div className="galeria">
      <div className="produto__foto">
        <Image
          src={fotos[atual]}
          alt={atual === 0 ? nome : `${nome} - foto ${atual + 1}`}
          width={1254}
          height={1254}
          priority={atual === 0}
          sizes="(max-width: 760px) 100vw, 600px"
        />
      </div>
      {fotos.length > 1 && (
        <div className="galeria__miniaturas" role="list">
          {fotos.map((f, n) => (
            <button
              key={f}
              type="button"
              role="listitem"
              className={n === atual ? "ativa" : ""}
              onClick={() => setAtual(n)}
              aria-label={`Ver foto ${n + 1} de ${fotos.length}`}
            >
              <Image src={f} alt="" width={96} height={96} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
