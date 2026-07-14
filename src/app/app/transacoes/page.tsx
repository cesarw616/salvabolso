import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { currency, formatDate, getUserTransactions, toIsoDate } from "@/lib/finance";
import { createTransaction, deleteTransaction } from "./actions";
import DeleteButton from "@/components/transacoes/DeleteButton";

export default async function TransacoesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const transactions = await getUserTransactions(session.user.id);

  return (
    <div className="min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground">Transações</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Cadastre, edite e acompanhe suas movimentações.
        </p>

        <form
          action={createTransaction}
          className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5 md:grid-cols-5"
        >
          <input
            type="text"
            name="description"
            placeholder="Descrição"
            required
            className="col-span-2 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 md:col-span-2"
          />
          <input
            type="text"
            name="category"
            placeholder="Categoria"
            required
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10"
          />
          <select
            name="type"
            required
            defaultValue="saida"
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10"
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <input
            type="number"
            name="amount"
            step="0.01"
            min="0.01"
            placeholder="Valor"
            required
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10"
          />
          <input
            type="date"
            name="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="col-span-2 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 md:col-span-1"
          />
          <button
            type="submit"
            className="col-span-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 md:col-span-1"
          >
            Adicionar
          </button>
        </form>

        <div className="mt-6 divide-y divide-black/10 overflow-hidden rounded-xl border border-black/10 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-white/5">
          {transactions.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-foreground/50">
              Nenhuma transação cadastrada ainda.
            </p>
          )}
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {t.description}
                </p>
                <p className="text-xs text-foreground/50">
                  {formatDate(toIsoDate(t.date))} · {t.category}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`text-sm font-semibold ${
                    t.type === "entrada" ? "text-brand-600" : "text-foreground/80"
                  }`}
                >
                  {t.type === "entrada" ? "+" : "-"}
                  {currency.format(t.amount)}
                </span>
                <Link
                  href={`/app/transacoes/${t.id}`}
                  className="rounded-lg p-1.5 text-foreground/40 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
                  aria-label="Editar transação"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </Link>
                <DeleteButton id={t.id} action={deleteTransaction} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
