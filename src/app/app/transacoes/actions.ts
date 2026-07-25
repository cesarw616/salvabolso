"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseBankStatementCsv } from "@/lib/csv";
import { toIsoDate } from "@/lib/finance";

function parseTransactionInput(formData: FormData) {
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const amount = Number(formData.get("amount"));
  const dateInput = String(formData.get("date") ?? "");
  const date = new Date(`${dateInput}T00:00:00`);

  if (
    !description ||
    !category ||
    (type !== "entrada" && type !== "saida") ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    Number.isNaN(date.getTime())
  ) {
    throw new Error("Dados inválidos para a transação.");
  }

  return { description, category, type, amount, date };
}

export async function createTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = parseTransactionInput(formData);

  await prisma.transaction.create({
    data: { ...data, userId: session.user.id },
  });

  revalidatePath("/app/transacoes");
  revalidatePath("/app/dashboard");
}

export async function updateTransaction(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) throw new Error("Transação não encontrada.");

  const data = parseTransactionInput(formData);

  await prisma.transaction.update({
    where: { id },
    data,
  });

  revalidatePath("/app/transacoes");
  revalidatePath("/app/dashboard");
  redirect("/app/transacoes");
}

export type ImportCsvState = {
  message: string;
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  errors: string[];
} | null;

function centavos(amount: number) {
  return Math.round(amount * 100);
}

function transactionKey(date: Date, description: string) {
  return `${toIsoDate(date)}::${description.trim().toLowerCase()}`;
}

export async function importTransactionsCsv(
  _prevState: ImportCsvState,
  formData: FormData,
): Promise<ImportCsvState> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return {
      message: "Selecione um arquivo CSV.",
      created: 0,
      updated: 0,
      unchanged: 0,
      skipped: 0,
      errors: [],
    };
  }

  const text = await file.text();
  const { rows, errors } = parseBankStatementCsv(text);

  const existing = await prisma.transaction.findMany({
    where: { userId: session.user.id },
  });

  const byKey = new Map<string, (typeof existing)[number]>();
  for (const t of existing) {
    byKey.set(transactionKey(t.date, t.description), t);
  }

  let created = 0;
  let updated = 0;
  let unchanged = 0;

  for (const row of rows) {
    const key = transactionKey(row.date, row.description);
    const match = byKey.get(key);

    if (!match) {
      const createdTx = await prisma.transaction.create({
        data: { ...row, userId: session.user.id },
      });
      byKey.set(key, createdTx);
      created++;
      continue;
    }

    const isSame =
      centavos(match.amount) === centavos(row.amount) && match.type === row.type;

    if (isSame) {
      unchanged++;
      continue;
    }

    const updatedTx = await prisma.transaction.update({
      where: { id: match.id },
      data: { amount: row.amount, type: row.type },
    });
    byKey.set(key, updatedTx);
    updated++;
  }

  if (created > 0 || updated > 0) {
    revalidatePath("/app/transacoes");
    revalidatePath("/app/dashboard");
  }

  const parts: string[] = [];
  if (created > 0) parts.push(`${created} nova(s)`);
  if (updated > 0) parts.push(`${updated} atualizada(s)`);
  if (unchanged > 0) parts.push(`${unchanged} sem alteração`);

  return {
    message:
      parts.length > 0
        ? `Importação concluída: ${parts.join(", ")}.`
        : "Nenhuma transação válida encontrada no arquivo.",
    created,
    updated,
    unchanged,
    skipped: errors.length,
    errors: errors.slice(0, 10),
  };
}

export async function deleteTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Transação inválida.");

  await prisma.transaction.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/app/transacoes");
  revalidatePath("/app/dashboard");
}
