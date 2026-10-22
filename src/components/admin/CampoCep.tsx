"use client";
// Campo de CEP que preenche rua, bairro, cidade e UF sozinho (ViaCEP).
// Os outros campos precisam estar no mesmo <form> com name = rua | bairro | cidade | uf.
import { useState } from "react";

export function CampoCep({ nome = "cep", valor = "", obrigatorio = true }: { nome?: string; valor?: string; obrigatorio?: boolean }) {
  const [aviso, setAviso] = useState("");

  async function buscar(e: React.FocusEvent<HTMLInputElement>) {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setAviso("Buscando endereço...");
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (d.erro) return setAviso("CEP não encontrado. Preencha à mão.");
      const form = e.target.form;
      const por = (n: string) => form?.elements.namedItem(n) as HTMLInputElement | null;
      const preencher = (n: string, v: string) => {
        const el = por(n);
        if (el && v && !el.value) el.value = v;
      };
      preencher("rua", d.logradouro);
      preencher("bairro", d.bairro);
      preencher("cidade", d.localidade);
      preencher("uf", d.uf);
      setAviso("");
      por("numero")?.focus();
    } catch {
      setAviso("Não consegui buscar o CEP. Preencha à mão.");
    }
  }

  return (
    <label>
      CEP {obrigatorio && "*"}
      {aviso && <small>{aviso}</small>}
      <input name={nome} defaultValue={valor} required={obrigatorio} inputMode="numeric" maxLength={9} placeholder="06010-000" onBlur={buscar} />
    </label>
  );
}
