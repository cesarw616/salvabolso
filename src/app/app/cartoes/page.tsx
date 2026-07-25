import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { currency } from "@/lib/finance";
import { createCard, deleteCard } from "./actions";
import DeleteButton from "@/components/transacoes/DeleteButton";

export default async function CartoesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const cards = await prisma.card.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground">Cartões</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Cadastre seus cartões manualmente por enquanto. Em breve você vai poder
          conectar sua conta automaticamente via Open Finance.
        </p>

        <form
          action={createCard}
          className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5 md:grid-cols-5"
        >
          <input
            type="text"
            name="name"
            placeholder="Apelido (ex: Nubank Roxinho)"
            required
            className="col-span-2 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 md:col-span-2"
          />
          <input
            type="text"
            name="bank"
            placeholder="Banco/Instituição"
            required
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10"
          />
          <select
            name="type"
            required
            defaultValue="credito"
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10"
          >
            <option value="credito">Crédito</option>
            <option value="debito">Débito</option>
          </select>
          <input
            type="text"
            name="lastDigits"
            placeholder="Últimos 4 dígitos"
            inputMode="numeric"
            maxLength={4}
            pattern="\d{4}"
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10"
          />
          <input
            type="number"
            name="limit"
            step="0.01"
            min="0"
            placeholder="Limite (opcional)"
            className="col-span-2 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 md:col-span-2"
          />
          <button
            type="submit"
            className="col-span-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 md:col-span-1"
          >
            Adicionar
          </button>
        </form>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cards.length === 0 && (
            <p className="col-span-full rounded-xl border border-black/10 bg-white px-4 py-6 text-center text-sm text-foreground/50 dark:border-white/10 dark:bg-white/5">
              Nenhum cartão cadastrado ainda.
            </p>
          )}
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {card.name}
                </p>
                <p className="text-xs text-foreground/50">
                  {card.bank} · {card.type === "credito" ? "Crédito" : "Débito"}
                  {card.lastDigits ? ` · •••• ${card.lastDigits}` : ""}
                </p>
                {card.limit != null && (
                  <p className="mt-1 text-xs text-foreground/70">
                    Limite: {currency.format(card.limit)}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/app/cartoes/${card.id}`}
                  className="rounded-lg p-1.5 text-foreground/40 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
                  aria-label="Editar cartão"
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
                <DeleteButton
                  id={card.id}
                  action={deleteCard}
                  confirmMessage="Excluir este cartão?"
                  label="Excluir cartão"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
