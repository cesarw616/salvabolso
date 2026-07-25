"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function parseCardInput(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const bank = String(formData.get("bank") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const lastDigits = String(formData.get("lastDigits") ?? "").trim();
  const limitInput = String(formData.get("limit") ?? "").trim();
  const limit = limitInput ? Number(limitInput) : null;

  if (
    !name ||
    !bank ||
    (type !== "credito" && type !== "debito") ||
    (lastDigits && !/^\d{4}$/.test(lastDigits)) ||
    (limit !== null && !Number.isFinite(limit))
  ) {
    throw new Error("Dados inválidos para o cartão.");
  }

  return { name, bank, type, lastDigits: lastDigits || null, limit };
}

export async function createCard(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = parseCardInput(formData);

  await prisma.card.create({
    data: { ...data, userId: session.user.id },
  });

  revalidatePath("/app/cartoes");
}

export async function updateCard(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await prisma.card.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) throw new Error("Cartão não encontrado.");

  const data = parseCardInput(formData);

  await prisma.card.update({
    where: { id },
    data,
  });

  revalidatePath("/app/cartoes");
  redirect("/app/cartoes");
}

export async function deleteCard(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Cartão inválido.");

  await prisma.card.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/app/cartoes");
}
