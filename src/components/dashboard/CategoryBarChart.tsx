import { currency } from "@/lib/finance";

type CategoryTotal = { category: string; amount: number };

export default function CategoryBarChart({ data }: { data: CategoryTotal[] }) {
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      <h2 className="text-sm font-semibold text-foreground">
        Gastos por categoria
      </h2>
      <p className="mt-0.5 text-xs text-foreground/50">
        Total de saídas no período, por categoria.
      </p>

      <div className="mt-5 space-y-2.5">
        {data.map((d) => (
          <div key={d.category} className="flex items-center gap-3">
            <span className="w-24 shrink-0 truncate text-xs text-foreground/70">
              {d.category}
            </span>
            <div className="flex-1">
              <div
                title={`${d.category}: ${currency.format(d.amount)}`}
                className="h-3 rounded-r bg-brand-600 transition-[filter] hover:brightness-110"
                style={{ width: `${Math.max((d.amount / max) * 100, 4)}%` }}
              />
            </div>
            <span className="w-20 shrink-0 text-right text-xs font-medium tabular-nums text-foreground/80">
              {currency.format(d.amount)}
            </span>
          </div>
        ))}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-xs font-medium text-brand-600 hover:text-brand-700">
          Ver como tabela
        </summary>
        <table className="mt-2 w-full text-left text-xs">
          <thead>
            <tr className="text-foreground/50">
              <th className="py-1 font-medium">Categoria</th>
              <th className="py-1 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.category} className="border-t border-black/5 dark:border-white/10">
                <td className="py-1.5 text-foreground/80">{d.category}</td>
                <td className="py-1.5 tabular-nums text-foreground/80">
                  {currency.format(d.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
