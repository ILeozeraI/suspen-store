"use client";
// Esconde cabeçalho, rodapé e botão do WhatsApp dentro do painel /admin.
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SoNaLoja({ children }: { children: ReactNode }) {
  const caminho = usePathname();
  if (caminho?.startsWith("/admin")) return null;
  return <>{children}</>;
}
