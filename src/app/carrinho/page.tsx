import type { Metadata } from "next";
import { CarrinhoCliente } from "@/components/CarrinhoCliente";
import { listarProdutos } from "@/lib/catalogo";

export const metadata: Metadata = { title: "Carrinho" };
export const revalidate = 300;

export default async function Carrinho() {
  return <CarrinhoCliente produtos={await listarProdutos()} />;
}
