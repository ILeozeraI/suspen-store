"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Recarrega a página do pedido a cada 8 segundos enquanto o pagamento não cai.
export function AtualizarSozinho() {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(t);
  }, [router]);
  return null;
}

export function CopiarPix({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <>
      <textarea readOnly value={codigo} onFocus={(e) => e.target.select()} aria-label="Código Pix copia e cola" />
      <button
        type="button"
        className="btn btn--vermelho btn--grande"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(codigo);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2500);
          } catch {}
        }}
      >
        {copiado ? "Código copiado!" : "Copiar código Pix"}
      </button>
    </>
  );
}
