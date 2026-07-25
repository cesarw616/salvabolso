const STORAGE_KEY = "salvabolso:known-accounts";
const MAX_ACCOUNTS = 5;

export type KnownAccount = { email: string; name: string };

export function getKnownAccounts(): KnownAccount[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is KnownAccount =>
        !!item && typeof item.email === "string" && typeof item.name === "string",
    );
  } catch {
    return [];
  }
}

export function rememberAccount(account: KnownAccount) {
  if (typeof window === "undefined" || !account.email) return;

  const existing = getKnownAccounts().filter(
    (a) => a.email.toLowerCase() !== account.email.toLowerCase(),
  );
  const next = [account, ...existing].slice(0, MAX_ACCOUNTS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function forgetAccount(email: string) {
  if (typeof window === "undefined") return;

  const next = getKnownAccounts().filter(
    (a) => a.email.toLowerCase() !== email.toLowerCase(),
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
