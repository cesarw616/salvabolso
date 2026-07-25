import { redirect } from "next/navigation";
import { auth } from "@/auth";
import StatTile from "@/components/dashboard/StatTile";
import CategoryBarChart from "@/components/dashboard/CategoryBarChart";
import DailyFlowChart from "@/components/dashboard/DailyFlowChart";
import MonthlyBreakdown from "@/components/dashboard/MonthlyBreakdown";
import {
  currency,
  getCategoryTotals,
  getDailyNet,
  getMonthlyBreakdown,
  getMonthSummary,
  getSaldo,
  getUserTransactions,
} from "@/lib/finance";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const transactions = await getUserTransactions(session.user.id);
  const saldo = getSaldo(transactions);
  const { receitas, despesas, economia } = getMonthSummary(transactions);
  const expenseCategoryTotals = getCategoryTotals(transactions, "saida");
  const incomeCategoryTotals = getCategoryTotals(transactions, "entrada");
  const dailyNet = getDailyNet(transactions);
  const monthlyBreakdown = getMonthlyBreakdown(transactions);

  return (
    <div className="min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Resumo das suas transações.
        </p>

        <h2 className="mt-8 text-sm font-semibold text-foreground/70">
          Balanço geral (todos os meses)
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="Saldo atual" value={currency.format(saldo)} />
          <StatTile
            label="Receitas"
            value={currency.format(receitas)}
            tone="good"
          />
          <StatTile label="Despesas" value={currency.format(despesas)} />
          <StatTile
            label="Economia"
            value={currency.format(economia)}
            tone={economia >= 0 ? "good" : "bad"}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CategoryBarChart
            title="Despesas por categoria"
            subtitle="Total de saídas no período, por categoria."
            data={expenseCategoryTotals}
            tone="expense"
          />
          <CategoryBarChart
            title="Receitas por categoria"
            subtitle="Total de entradas no período, por categoria."
            data={incomeCategoryTotals}
            tone="income"
          />
        </div>

        <div className="mt-6">
          <DailyFlowChart data={dailyNet} />
        </div>

        <div className="mt-6">
          <MonthlyBreakdown data={monthlyBreakdown} />
        </div>
      </div>
    </div>
  );
}
