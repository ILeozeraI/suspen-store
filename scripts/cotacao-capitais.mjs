// Simula o frete (PAC e SEDEX) do fornecedor Formula (Guarulhos) para todas as capitais.
// Uso, na pasta do projeto:
//   node scripts/cotacao-capitais.mjs <peso_kg> <altura_cm> <largura_cm> <comprimento_cm> [valor_do_kit]
// Exemplo: node scripts/cotacao-capitais.mjs 12 30 40 60 1400
// Lê ME_TOKEN e ME_AMBIENTE do arquivo .env.local. Gera o arquivo cotacao-capitais.csv.

import fs from "node:fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^"|"$/g, "")])
);
const TOKEN = env.ME_TOKEN;
if (!TOKEN) {
  console.error("Falta o ME_TOKEN no .env.local");
  process.exit(1);
}
const BASE = env.ME_AMBIENTE === "producao" ? "https://melhorenvio.com.br" : "https://sandbox.melhorenvio.com.br";

const [peso, altura, largura, comprimento, valor = "1000"] = process.argv.slice(2).map(Number);
if (!peso || !altura || !largura || !comprimento) {
  console.error("Uso: node scripts/cotacao-capitais.mjs <peso_kg> <altura_cm> <largura_cm> <comprimento_cm> [valor]");
  process.exit(1);
}

const ORIGEM = "07022290"; // Formula Amortecedores Especiais, Guarulhos/SP
const DESTINOS = [
  ["AC", "Rio Branco", "69900062"], ["AL", "Maceió", "57020000"], ["AP", "Macapá", "68900073"],
  ["AM", "Manaus", "69005040"], ["BA", "Salvador", "40080003"], ["CE", "Fortaleza", "60025000"],
  ["DF", "Brasília", "70040010"], ["ES", "Vitória", "29010010"], ["GO", "Goiânia", "74003010"],
  ["MA", "São Luís", "65010000"], ["MT", "Cuiabá", "78005000"], ["MS", "Campo Grande", "79002000"],
  ["MG", "Belo Horizonte", "30130000"], ["PA", "Belém", "66010000"], ["PB", "João Pessoa", "58010000"],
  ["PR", "Curitiba", "80010000"], ["PE", "Recife", "50010000"], ["PI", "Teresina", "64000020"],
  ["RJ", "Rio de Janeiro", "20010000"], ["RN", "Natal", "59010000"], ["RS", "Porto Alegre", "90010000"],
  ["RO", "Porto Velho", "76801016"], ["RR", "Boa Vista", "69301000"], ["SC", "Florianópolis", "88010000"],
  ["SP", "São Paulo", "01001000"], ["SP", "Campinas (interior)", "13010000"],
  ["SP", "Ribeirão Preto (interior)", "14010000"], ["SE", "Aracaju", "49010000"], ["TO", "Palmas", "77001002"],
];

async function cotar(cep) {
  const r = await fetch(`${BASE}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      "User-Agent": `Suspen Store (${env.ME_EMAIL_CONTATO || "contato@suspenstore.com.br"})`,
    },
    body: JSON.stringify({
      from: { postal_code: ORIGEM },
      to: { postal_code: cep },
      products: [{ id: "kit", width: largura, height: altura, length: comprimento, weight: peso, insurance_value: valor, quantity: 1 }],
      options: { receipt: false, own_hand: false },
    }),
  });
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
  const lista = await r.json();
  const pega = (nome) => {
    const o = lista.find((x) => x.name === nome && !x.error && (x.custom_price || x.price));
    return o ? { preco: Number(o.custom_price ?? o.price), prazo: o.custom_delivery_time ?? o.delivery_time } : null;
  };
  return { pac: pega("PAC"), sedex: pega("SEDEX") };
}

const real = (n) => (n == null ? "-" : n.toFixed(2).replace(".", ","));
const linhas = [["UF", "Cidade", "PAC (R$)", "PAC (dias)", "SEDEX (R$)", "SEDEX (dias)"]];
for (const [uf, cidade, cep] of DESTINOS) {
  try {
    const { pac, sedex } = await cotar(cep);
    linhas.push([uf, cidade, real(pac?.preco), pac?.prazo ?? "-", real(sedex?.preco), sedex?.prazo ?? "-"]);
  } catch (e) {
    linhas.push([uf, cidade, "erro", "", "", String(e.message).slice(0, 80)]);
  }
  console.log(linhas.at(-1).join(" | "));
}
fs.writeFileSync("cotacao-capitais.csv", "﻿" + linhas.map((l) => l.join(";")).join("\n"));
console.log(`\nPronto: cotacao-capitais.csv (${BASE.includes("sandbox") ? "SANDBOX, preços de teste" : "produção"})`);
