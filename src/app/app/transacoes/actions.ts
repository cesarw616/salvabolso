"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
