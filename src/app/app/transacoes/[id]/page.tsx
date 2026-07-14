import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateTransaction } from "../actions";

export default async function EditarTransacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!transaction) notFound();

  const action = updateTransaction.bind(null, id);

  return (
    <div className="min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-foreground">
          Editar transação
        </h1>

        <form
          action={action}
          className="mt-6 flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5"
        >
          <label className="text-sm">
            Descrição
            <input
              type="text"
              name="description"
              defaultValue={transaction.description}
              required
              className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10"
            />
          </label>
          <label className="text-sm">
            Categoria
            <input
              type="text"
              name="category"
              defaultValue={transaction.category}
              required
              className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10"
            />
          </label>
          <label className="text-sm">
            Tipo
            <select
              name="type"
              defaultValue={transaction.type}
              required
              className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10"
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </label>
          <label className="text-sm">
            Valor
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0.01"
              defaultValue={transaction.amount}
              required
              className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10"
            />
          </label>
          <label className="text-sm">
            Data
            <input
              type="date"
              name="date"
              defaultValue={transaction.date.toISOString().slice(0, 10)}
              required
              className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10"
            />
          </label>

          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              Salvar
            </button>
            <a
              href="/app/transacoes"
              className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-center text-sm font-medium text-foreground/80 transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
            >
              Cancelar
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
