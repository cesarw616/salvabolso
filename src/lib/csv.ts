export type ParsedCsvRow = {
  description: string;
  category: string;
  type: "entrada" | "saida";
  amount: number;
  date: Date;
};

export type CsvParseResult = {
  rows: ParsedCsvRow[];
  errors: string[];
};

const DIACRITICS = new RegExp("[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]", "g");

function normalizeHeader(text: string) {
  return text.toLowerCase().normalize("NFD").replace(DIACRITICS, "").trim();
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      result.push(cur);
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur);
  return result;
}

function parseDate(raw: string): Date | null {
  const s = raw.trim();

  let m = s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (m) {
    const [, year, month, day] = m;
    const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (m) {
    const [, day, month, year] = m;
    const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function parseAmount(raw: string): number | null {
  let s = raw.trim().replace(/^R\$\s?/i, "");
  if (!s) return null;

  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1);
  } else if (s.startsWith("+")) {
    s = s.slice(1);
  }
  s = s.replace(/\s/g, "");

  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");

  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (lastComma > -1) {
    s = s.replace(",", ".");
  }

  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

const ENTRADA_HINTS = new Set(["entrada", "credito", "credit", "receita", "deposito"]);
const SAIDA_HINTS = new Set(["saida", "debito", "debit", "despesa", "pagamento"]);

type CategoryRule = { category: string; keywords: string[] };

const EXPENSE_CATEGORY_RULES: CategoryRule[] = [
  { category: "Moradia", keywords: ["aluguel", "condominio", "iptu", "imobiliaria"] },
  {
    category: "Alimentação",
    keywords: [
      "mercado", "supermercado", "ifood", "restaurante", "lanchonete", "padaria",
      "feira", "hortifruti", "acougue", "rappi", "delivery",
    ],
  },
  {
    category: "Transporte",
    keywords: [
      "uber", "99app", "99pop", "combustivel", "posto ", "gasolina", "etanol",
      "estacionamento", "pedagio", "metro", "onibus", "taxi",
    ],
  },
  {
    category: "Saúde",
    keywords: ["farmacia", "drogaria", "hospital", "clinica", "laboratorio", "plano de saude", "academia"],
  },
  {
    category: "Lazer",
    keywords: [
      "netflix", "spotify", "prime video", "cinema", "ingresso", "disney",
      "hbo", "youtube premium", "steam", "playstation", "xbox",
    ],
  },
  { category: "Educação", keywords: ["escola", "faculdade", "curso", "udemy", "livraria", "mensalidade escolar"] },
  {
    category: "Contas",
    keywords: ["energia", "eletrica", "agua", "saneamento", "internet", "telefone", "celular", "vivo", "claro", "tim ", "gas "],
  },
  { category: "Compras", keywords: ["shopping", "magazine", "amazon", "mercado livre", "shopee", "aliexpress", "loja"] },
];

const INCOME_CATEGORY_RULES: CategoryRule[] = [
  { category: "Salário", keywords: ["salario", "folha de pagamento", "holerite"] },
  {
    category: "Transferência recebida",
    keywords: ["pix recebido", "ted recebid", "transferencia recebida", "deposito"],
  },
  { category: "Rendimentos", keywords: ["rendimento", "dividendo", "juros"] },
];

function guessCategory(description: string, type: "entrada" | "saida"): string {
  const normalized = normalizeHeader(description);
  const rules = type === "entrada" ? INCOME_CATEGORY_RULES : EXPENSE_CATEGORY_RULES;

  for (const rule of rules) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.category;
    }
  }

  return type === "entrada" ? "Outras receitas" : "Outros gastos";
}

export function parseBankStatementCsv(text: string): CsvParseResult {
  const lines = text.split(/\r\n|\n|\r/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return { rows: [], errors: ["Arquivo vazio."] };
  }

  const headerLine = lines[0];
  const semicolons = (headerLine.match(/;/g) ?? []).length;
  const commas = (headerLine.match(/,/g) ?? []).length;
  const delimiter = semicolons >= commas ? ";" : ",";

  const headers = parseCsvLine(headerLine, delimiter).map((h) => normalizeHeader(h));
  const findIndex = (candidates: string[]) => headers.findIndex((h) => candidates.includes(h));

  const dateIdx = findIndex(["data", "date", "dt"]);
  const descIdx = findIndex(["descricao", "description", "historico", "title", "memo"]);
  const amountIdx = findIndex(["valor", "amount", "value"]);
  const categoryIdx = findIndex(["categoria", "category"]);
  const typeIdx = findIndex(["tipo", "type"]);

  if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) {
    return {
      rows: [],
      errors: [
        "Não foi possível identificar as colunas de data, descrição e valor. Verifique o cabeçalho do CSV.",
      ],
    };
  }

  const rows: ParsedCsvRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i], delimiter);
    if (cols.every((c) => c.trim() === "")) continue;

    const lineNumber = i + 1;
    const rawDate = cols[dateIdx]?.trim() ?? "";
    const rawDesc = cols[descIdx]?.trim() ?? "";
    const rawAmount = cols[amountIdx]?.trim() ?? "";
    const rawCategory = categoryIdx >= 0 ? (cols[categoryIdx]?.trim() ?? "") : "";
    const rawType = typeIdx >= 0 ? normalizeHeader(cols[typeIdx]?.trim() ?? "") : "";

    const date = parseDate(rawDate);
    const amount = parseAmount(rawAmount);

    if (!date || !rawDesc || amount === null || amount === 0) {
      errors.push(`Linha ${lineNumber}: dados inválidos ou incompletos.`);
      continue;
    }

    let type: "entrada" | "saida";
    if (ENTRADA_HINTS.has(rawType)) {
      type = "entrada";
    } else if (SAIDA_HINTS.has(rawType)) {
      type = "saida";
    } else {
      type = amount >= 0 ? "entrada" : "saida";
    }

    rows.push({
      description: rawDesc,
      category: rawCategory || guessCategory(rawDesc, type),
      type,
      amount: Math.abs(amount),
      date,
    });
  }

  return { rows, errors };
}

const monthYearFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function describeCsvPeriod(rows: ParsedCsvRow[]): string | null {
  if (rows.length === 0) return null;

  const timestamps = rows.map((r) => r.date.getTime());
  const min = new Date(Math.min(...timestamps));
  const max = new Date(Math.max(...timestamps));

  const minLabel = capitalize(monthYearFormatter.format(min));
  const maxLabel = capitalize(monthYearFormatter.format(max));

  return minLabel === maxLabel ? minLabel : `${minLabel} a ${maxLabel}`;
}
