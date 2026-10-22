// Endereço público do site (links de retorno, webhook, etc.)
export function urlSite() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  ).replace(/\/$/, "");
}

export const soNumeros = (v: unknown) => String(v ?? "").replace(/\D/g, "");

export function arred(v: number) {
  return Math.round(v * 100) / 100;
}

// Lê números digitados no jeito brasileiro: "1.399,90", "1399,90", "1399.90", "R$ 15". Vazio = 0.
export function lerDecimal(v: unknown) {
  let t = String(v ?? "").replace(/[R$%\s]/g, "");
  if (!t) return 0;
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  return Number(t);
}
