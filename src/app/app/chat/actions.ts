"use server";

import { auth } from "@/auth";
import { getAssistantReply, getUserTransactions } from "@/lib/finance";

export async function askAssistant(message: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const transactions = await getUserTransactions(session.user.id);
  return getAssistantReply(message, transactions);
}
