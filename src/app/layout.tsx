import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CarrinhoProvider } from "@/components/CarrinhoProvider";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { WhatsAppFlutuante } from "@/components/WhatsAppFlutuante";
import { SoNaLoja } from "@/components/SoNaLoja";
import { loja } from "@/data/loja";

const site = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: `${loja.nome} | ${loja.slogan}`, template: `%s | ${loja.nome}` },
  description: loja.descricao,
  icons: { icon: "/marca/logo-suspen-store-transparente.png" },
  openGraph: {
    title: `${loja.nome} | ${loja.slogan}`,
    description: loja.descricao,
    images: ["/marca/logo-suspen-store.png"],
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#121214" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;1,700;1,800&family=Barlow:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <CarrinhoProvider>
          <SoNaLoja>
            <Cabecalho />
          </SoNaLoja>
          <main>{children}</main>
          <SoNaLoja>
            <Rodape />
            <WhatsAppFlutuante />
          </SoNaLoja>
        </CarrinhoProvider>
      </body>
    </html>
  );
}
