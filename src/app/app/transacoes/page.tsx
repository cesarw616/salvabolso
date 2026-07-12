import { formatDate, mockTransactions } from "@/lib/mockFinance";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function TransacoesPage() {
  return (
    <div className="min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground">Transações</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Dados de exemplo. Em breve você poderá cadastrar suas próprias
          transações.
        </p>

        <div className="mt-6 divide-y divide-black/10 overflow-hidden rounded-xl border border-black/10 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-white/5">
          {mockTransactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {t.description}
                </p>
                <p className="text-xs text-foreground/50">
                  {formatDate(t.date)} · {t.category}
                </p>
              </div>
              <span
                className={`shrink-0 text-sm font-semibold ${
                  t.type === "entrada" ? "text-brand-600" : "text-foreground/80"
                }`}
              >
                {t.type === "entrada" ? "+" : "-"}
                {currency.format(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
