import type { Metadata } from "next";

export const metadata: Metadata = { title: "Área do fornecedor", robots: { index: false, follow: false } };

export default function LayoutFornecedor({ children }: { children: React.ReactNode }) {
  return <div className="admin">{children}</div>;
}
