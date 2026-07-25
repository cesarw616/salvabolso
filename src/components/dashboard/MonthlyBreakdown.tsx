import { currency } from "@/lib/finance";
import type { MonthSummary } from "@/lib/finance";

export default function MonthlyBreakdown({ data }: { data: MonthSummary[] }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      <h2 className="text-sm font-semibold text-foreground">Resumo por mês</h2>
      <p className="mt-0.5 text-xs text-foreground/50">
        Receitas, despesas e saldo de cada mês com transações lançadas.
      </p>

      {data.length === 0 ? (
        <p className="mt-4 text-center text-sm text-foreground/50">
          Nenhum mês com transações ainda.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-black/10 dark:divide-white/10">
          {data.map((m) => (
            <div key={m.key} className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm font-medium text-foreground">{m.label}</span>
              <div className="flex shrink-0 items-center gap-4 text-xs">
                <span className="text-brand-600">+{currency.format(m.receitas)}</span>
                <span className="text-foreground/70">-{currency.format(m.despesas)}</span>
                <span
                  className={`w-24 text-right font-semibold tabular-nums ${
                    m.saldo >= 0
                      ? "text-brand-700 dark:text-brand-300"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {currency.format(m.saldo)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
