import { prisma } from "@/lib/prisma";
import type { TransactionModel as Transaction } from "@/generated/prisma/models/Transaction";

export type { Transaction };

export const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getUserTransactions(userId: string) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

export function getSaldo(transactions: Transaction[]) {
  return transactions.reduce(
    (acc, t) => acc + (t.type === "entrada" ? t.amount : -t.amount),
    0,
  );
}

export function getMonthSummary(transactions: Transaction[]) {
  const receitas = transactions
    .filter((t) => t.type === "entrada")
    .reduce((acc, t) => acc + t.amount, 0);
  const despesas = transactions
    .filter((t) => t.type === "saida")
    .reduce((acc, t) => acc + t.amount, 0);

  return { receitas, despesas, economia: receitas - despesas };
}

export function getCategoryTotals(transactions: Transaction[]) {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "saida") continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
  }
  return Array.from(totals, ([category, amount]) => ({ category, amount })).sort(
    (a, b) => b.amount - a.amount,
  );
}

export function getDailyNet(transactions: Transaction[]) {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    const key = toIsoDate(t.date);
    const delta = t.type === "entrada" ? t.amount : -t.amount;
    totals.set(key, (totals.get(key) ?? 0) + delta);
  }
  return Array.from(totals, ([date, net]) => ({ date, net })).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

const savingTips = [
  "Separe 10% do seu salário assim que ele cair na conta — antes de gastar, não depois. Isso cria o hábito da poupança automática.",
  "Revise suas assinaturas (streaming, apps, academia). É comum descobrir 2 ou 3 serviços que você quase não usa e pode cancelar.",
  "Use a regra 50-30-20: 50% para gastos essenciais, 30% para desejos e 20% para poupança/investimentos.",
  "Antes de compras por impulso, espere 24 horas. Muitas vezes a vontade passa e você economiza sem esforço.",
  "Compare preços de mercado por app antes de fazer compras grandes — pequenas diferenças de preço somam bastante no fim do mês.",
  "Defina uma meta clara (ex: reserva de emergência de 6 meses) — metas específicas motivam mais do que 'economizar' de forma genérica.",
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]", "g"), "");
}

function formatTransactionsSummary(transactions: Transaction[]) {
  const recent = transactions.slice(0, 5);
  if (recent.length === 0) {
    return "Você ainda não tem transações cadastradas. Que tal adicionar a primeira em 'Transações'?";
  }

  const lines = recent.map((t) => {
    const sign = t.type === "entrada" ? "+" : "-";
    return `• ${formatDate(toIsoDate(t.date))} — ${t.description} (${t.category}): ${sign}${currency.format(t.amount)}`;
  });

  return [
    "Aqui estão suas últimas transações:",
    "",
    ...lines,
    "",
    `Saldo atual: ${currency.format(getSaldo(transactions))}.`,
  ].join("\n");
}

function formatSaldo(transactions: Transaction[]) {
  return `Seu saldo atual é de ${currency.format(getSaldo(transactions))}, considerando as movimentações registradas até agora.`;
}

export function getAssistantReply(userMessage: string, transactions: Transaction[]): string {
  const msg = normalize(userMessage);

  const isTransacoes = /historic|transac|extrato|gastei|gastos|movimenta/.test(msg);
  const isSaldo = /saldo|quanto tenho|quanto sobrou/.test(msg);
  const isDicas = /dica|economiz|poupar|poupanca|orcamento|investir|investimento|reduzir gasto/.test(msg);
  const isGreeting = /^(oi|ola|bom dia|boa tarde|boa noite|opa|eae)\b/.test(msg);

  if (isTransacoes) return formatTransactionsSummary(transactions);
  if (isSaldo) return formatSaldo(transactions);
  if (isDicas) {
    const tip = savingTips[Math.floor(Math.random() * savingTips.length)];
    return `Aqui vai uma dica para economizar mais:\n\n${tip}`;
  }
  if (isGreeting) {
    return "Olá! Posso te ajudar com dicas de economia, mostrar seu histórico de transações ou seu saldo atual. O que você gostaria de saber?";
  }

  return "Ainda estou aprendendo a responder isso. Posso te ajudar com: dicas de economia, seu histórico de transações ou seu saldo atual — é só perguntar.";
}
