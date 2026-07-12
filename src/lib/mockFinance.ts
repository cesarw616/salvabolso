export type Transaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "entrada" | "saida";
  amount: number;
};

export const mockTransactions: Transaction[] = [
  { id: "1", date: "2026-07-10", description: "Salário", category: "Renda", type: "entrada", amount: 4200 },
  { id: "2", date: "2026-07-10", description: "Aluguel", category: "Moradia", type: "saida", amount: 1350 },
  { id: "3", date: "2026-07-09", description: "Supermercado Extra", category: "Mercado", type: "saida", amount: 386.4 },
  { id: "4", date: "2026-07-08", description: "Uber", category: "Transporte", type: "saida", amount: 27.9 },
  { id: "5", date: "2026-07-07", description: "Netflix", category: "Assinatura", type: "saida", amount: 44.9 },
  { id: "6", date: "2026-07-06", description: "Restaurante", category: "Lazer", type: "saida", amount: 98.5 },
  { id: "7", date: "2026-07-05", description: "Farmácia", category: "Saúde", type: "saida", amount: 63.2 },
  { id: "8", date: "2026-07-03", description: "Freelance", category: "Renda extra", type: "entrada", amount: 600 },
];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
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

function formatTransactionsSummary() {
  const recent = mockTransactions.slice(0, 5);
  const lines = recent.map((t) => {
    const sign = t.type === "entrada" ? "+" : "-";
    return `• ${formatDate(t.date)} — ${t.description} (${t.category}): ${sign}${currency.format(t.amount)}`;
  });

  const saldo = mockTransactions.reduce(
    (acc, t) => acc + (t.type === "entrada" ? t.amount : -t.amount),
    0,
  );

  return [
    "Aqui estão suas últimas transações:",
    "",
    ...lines,
    "",
    `Saldo atual estimado: ${currency.format(saldo)}.`,
  ].join("\n");
}

function formatSaldo() {
  const saldo = mockTransactions.reduce(
    (acc, t) => acc + (t.type === "entrada" ? t.amount : -t.amount),
    0,
  );
  return `Seu saldo atual estimado é de ${currency.format(saldo)}, considerando as movimentações registradas até agora.`;
}

export function getAssistantReply(userMessage: string): string {
  const msg = normalize(userMessage);

  const isTransacoes = /historic|transac|extrato|gastei|gastos|movimenta/.test(msg);
  const isSaldo = /saldo|quanto tenho|quanto sobrou/.test(msg);
  const isDicas = /dica|economiz|poupar|poupanca|orcamento|investir|investimento|reduzir gasto/.test(msg);
  const isGreeting = /^(oi|ola|bom dia|boa tarde|boa noite|opa|eae)\b/.test(msg);

  if (isTransacoes) return formatTransactionsSummary();
  if (isSaldo) return formatSaldo();
  if (isDicas) {
    const tip = savingTips[Math.floor(Math.random() * savingTips.length)];
    return `Aqui vai uma dica para economizar mais:\n\n${tip}`;
  }
  if (isGreeting) {
    return "Olá! Posso te ajudar com dicas de economia, mostrar seu histórico de transações ou seu saldo atual. O que você gostaria de saber?";
  }

  return "Ainda estou aprendendo a responder isso. Posso te ajudar com: dicas de economia, seu histórico de transações ou seu saldo atual — é só perguntar.";
}
