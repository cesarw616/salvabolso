import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateCard } from "../actions";

export default async function EditarCartaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const card = await prisma.card.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!card) notFound();

  const action = updateCard.bind(null, id);

  return (
    <div className="min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-foreground">Editar cartão</h1>

        <form
          action={action}
          className="mt-6 flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5"
        >
          <label className="text-sm">
            Apelido
            <input
              type="text"
              name="name"
              defaultValue={card.name}
              required
              className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10"
            />
          </label>
          <label className="text-sm">
            Banco/Instituição
            <input
              type="text"
              name="bank"
              defaultValue={card.bank}
              required
              className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10"
            />
          </label>
          <label className="text-sm">
            Tipo
            <select
              name="type"
              defaultValue={card.type}
              required
              className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10"
            >
              <option value="credito">Crédito</option>
              <option value="debito">Débito</option>
            </select>
          </label>
          <label className="text-sm">
            Últimos 4 dígitos
            <input
              type="text"
              name="lastDigits"
              defaultValue={card.lastDigits ?? ""}
              inputMode="numeric"
              maxLength={4}
              pattern="\d{4}"
              className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10"
            />
          </label>
          <label className="text-sm">
            Limite (opcional)
            <input
              type="number"
              name="limit"
              step="0.01"
              min="0"
              defaultValue={card.limit ?? ""}
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
            <Link
              href="/app/cartoes"
              className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-center text-sm font-medium text-foreground/80 transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
