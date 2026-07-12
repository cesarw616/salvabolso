import { currency, formatDate } from "@/lib/mockFinance";

type DailyNet = { date: string; net: number };

const ZONE_HEIGHT = 90;

export default function DailyFlowChart({ data }: { data: DailyNet[] }) {
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.net)), 1);
  const maxPositive = Math.max(...data.map((d) => d.net));
  const maxNegativeAbs = Math.abs(Math.min(...data.map((d) => d.net), 0));

  return (
    <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      <h2 className="text-sm font-semibold text-foreground">
        Fluxo diário (entradas − saídas)
      </h2>
      <p className="mt-0.5 text-xs text-foreground/50">
        Verde: saldo positivo no dia · Vermelho: saldo negativo no dia
      </p>

      <div className="mt-6 flex items-end justify-between gap-1">
        {data.map((d) => {
          const isPositive = d.net >= 0;
          const barHeight = Math.max(
            (Math.abs(d.net) / maxAbs) * ZONE_HEIGHT,
            d.net === 0 ? 0 : 3,
          );
          const isExtreme =
            (isPositive && d.net === maxPositive && maxPositive > 0) ||
            (!isPositive && Math.abs(d.net) === maxNegativeAbs && maxNegativeAbs > 0);

          return (
            <div key={d.date} className="flex flex-1 flex-col items-center">
              <div
                className="flex flex-col justify-end"
                style={{ height: ZONE_HEIGHT }}
              >
                {isExtreme && isPositive && (
                  <span className="mb-1 text-center text-[10px] font-medium tabular-nums text-foreground/70">
                    {currency.format(d.net)}
                  </span>
                )}
                <div
                  title={`${formatDate(d.date)}: ${currency.format(d.net)}`}
                  className={`w-4 self-center rounded-t transition-[filter] hover:brightness-110 ${
                    isPositive ? "bg-brand-600" : "invisible"
                  }`}
                  style={{ height: isPositive ? barHeight : 0 }}
                />
              </div>

              <div className="h-px w-full bg-black/15 dark:bg-white/15" />

              <div
                className="flex flex-col justify-start"
                style={{ height: ZONE_HEIGHT }}
              >
                <div
                  title={`${formatDate(d.date)}: ${currency.format(d.net)}`}
                  className={`w-4 self-center rounded-b transition-[filter] hover:brightness-110 ${
                    !isPositive ? "bg-red-600" : "invisible"
                  }`}
                  style={{ height: !isPositive ? barHeight : 0 }}
                />
                {isExtreme && !isPositive && (
                  <span className="mt-1 text-center text-[10px] font-medium tabular-nums text-foreground/70">
                    {currency.format(d.net)}
                  </span>
                )}
              </div>

              <span className="mt-2 text-center text-[10px] text-foreground/50">
                {formatDate(d.date).slice(0, 5)}
              </span>
            </div>
          );
        })}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-xs font-medium text-brand-600 hover:text-brand-700">
          Ver como tabela
        </summary>
        <table className="mt-2 w-full text-left text-xs">
          <thead>
            <tr className="text-foreground/50">
              <th className="py-1 font-medium">Data</th>
              <th className="py-1 font-medium">Saldo do dia</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.date} className="border-t border-black/5 dark:border-white/10">
                <td className="py-1.5 text-foreground/80">{formatDate(d.date)}</td>
                <td className="py-1.5 tabular-nums text-foreground/80">
                  {currency.format(d.net)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
