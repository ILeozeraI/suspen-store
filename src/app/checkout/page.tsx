import type { Metadata } from "next";
import { CheckoutCliente } from "@/components/CheckoutCliente";
import { listarProdutos } from "@/lib/catalogo";

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };
export const revalidate = 300;

export default async function Checkout() {
  return <CheckoutCliente produtos={await listarProdutos()} />;
}
