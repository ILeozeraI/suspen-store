"use client";
import { useFormStatus } from "react-dom";

export function BotaoEnviar({ texto, enviando, className = "btn btn--vermelho" }: { texto: string; enviando: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? enviando : texto}
    </button>
  );
}
