"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { importTransactionsCsv, type ImportCsvState } from "@/app/app/transacoes/actions";
import { describeCsvPeriod, parseBankStatementCsv } from "@/lib/csv";

const initialState: ImportCsvState = null;

type FilePreview = {
  fileName: string;
  count: number;
  period: string | null;
};

export default function ImportCsvForm() {
  const [state, formAction, pending] = useActionState(importTransactionsCsv, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<FilePreview | null>(null);

  useEffect(() => {
    if (state) formRef.current?.reset();
  }, [state]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }

    const text = await file.text();
    const { rows } = parseBankStatementCsv(text);
    setPreview({
      fileName: file.name,
      count: rows.length,
      period: describeCsvPeriod(rows),
    });
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-6 rounded-xl border border-dashed border-black/15 bg-white p-4 dark:border-white/15 dark:bg-white/5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Importar extrato bancário (CSV)
          </p>
          <p className="text-xs text-foreground/50">
            Colunas esperadas: data, descrição e valor. Valores negativos entram como saída.
            Se o arquivo não tiver coluna de categoria, tentamos adivinhar (Moradia, Alimentação,
            Transporte...) pela descrição. Transações já importadas (mesma data e descrição) são
            atualizadas só se o valor mudar.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            onChange={handleFileChange}
            className="text-xs text-foreground/70 file:mr-2 file:rounded-lg file:border-0 file:bg-black/5 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-black/10 dark:file:bg-white/10 dark:hover:file:bg-white/20"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {pending ? "Importando..." : "Importar"}
          </button>
        </div>
      </div>

      {preview && !state && (
        <p className="mt-3 text-xs text-foreground/60">
          {preview.count > 0 ? (
            <>
              Arquivo <span className="font-medium text-foreground/80">{preview.fileName}</span> —{" "}
              {preview.period ? (
                <>referente a <span className="font-medium text-foreground/80">{preview.period}</span></>
              ) : (
                "período não identificado"
              )}
              {" · "}
              {preview.count} transação(ões) reconhecida(s)
            </>
          ) : (
            <>Não foi possível reconhecer transações no arquivo {preview.fileName}.</>
          )}
        </p>
      )}

      {state && (
        <div className="mt-3">
          <p
            className={`text-xs ${
              state.created > 0 || state.updated > 0
                ? "text-brand-600"
                : "text-foreground/60"
            }`}
          >
            {state.message}
            {state.skipped > 0 ? ` (${state.skipped} linha(s) ignorada(s))` : ""}
          </p>
          {state.errors.length > 0 && (
            <ul className="mt-1 list-inside list-disc text-xs text-red-600/80">
              {state.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
