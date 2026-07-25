"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { forgetAccount, getKnownAccounts, type KnownAccount } from "@/lib/knownAccounts";

type User = {
  name?: string | null;
  email?: string | null;
};

function switchToAccount(email?: string) {
  const callbackUrl = email ? `/login?email=${encodeURIComponent(email)}` : "/login";
  signOut({ callbackUrl });
}

export default function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "accounts">("menu");
  const [otherAccounts, setOtherAccounts] = useState<KnownAccount[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const initial = (user.name ?? user.email ?? "U").charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function openMenu() {
    const currentEmail = (user.email ?? "").toLowerCase();
    setOtherAccounts(getKnownAccounts().filter((a) => a.email.toLowerCase() !== currentEmail));
    setView("menu");
    setOpen(true);
  }

  function closeMenu() {
    setOpen(false);
    setTimeout(() => setView("menu"), 150);
  }

  function handleForget(email: string, event: React.MouseEvent) {
    event.stopPropagation();
    forgetAccount(email);
    setOtherAccounts((prev) => prev.filter((a) => a.email.toLowerCase() !== email.toLowerCase()));
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        role="menu"
        className={`absolute inset-x-0 bottom-full z-20 mb-2 origin-bottom overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg transition-all duration-150 ease-out dark:border-white/10 dark:bg-brand-900 ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-1 scale-95 opacity-0"
        }`}
      >
        {view === "menu" ? (
          <div className="p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => setView("accounts")}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-foreground/80 transition-colors hover:bg-brand-50 hover:text-foreground dark:hover:bg-white/10"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0"
              >
                <path d="M16 3H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
                <path d="m14 8-4 4 4 4" />
                <path d="M10 12h11" />
              </svg>
              Entrar em outra conta
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => switchToAccount()}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              Sair da conta
            </button>
          </div>
        ) : (
          <div className="p-1.5">
            <button
              type="button"
              onClick={() => setView("menu")}
              className="mb-1 flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-foreground/50 transition-colors hover:text-foreground"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Contas neste navegador
            </button>

            {otherAccounts.length === 0 && (
              <p className="px-2.5 py-2 text-xs text-foreground/50">
                Nenhuma outra conta lembrada aqui ainda.
              </p>
            )}

            {otherAccounts.map((account) => (
              <div
                key={account.email}
                role="menuitem"
                onClick={() => switchToAccount(account.email)}
                className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-foreground/80 transition-colors hover:bg-brand-50 hover:text-foreground dark:hover:bg-white/10"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-800 dark:text-brand-100">
                  {account.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{account.name}</p>
                  <p className="truncate text-xs text-foreground/50">{account.email}</p>
                </div>
                <button
                  type="button"
                  onClick={(event) => handleForget(account.email, event)}
                  aria-label={`Esquecer conta ${account.email}`}
                  className="shrink-0 rounded-md p-1 text-foreground/30 opacity-0 transition-opacity hover:bg-black/5 hover:text-foreground/70 group-hover:opacity-100 dark:hover:bg-white/10"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              type="button"
              role="menuitem"
              onClick={() => switchToAccount()}
              className="mt-1 flex w-full items-center gap-2.5 rounded-lg border-t border-black/5 px-2.5 py-2 pt-2.5 text-left text-sm text-brand-600 transition-colors hover:bg-brand-50 dark:border-white/10 dark:hover:bg-white/10"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Usar outro e-mail
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => (open ? closeMenu() : openMenu())}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-brand-50 dark:hover:bg-white/5"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-800 dark:text-brand-100">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {user.name ?? "Usuário"}
          </p>
          <p className="truncate text-xs text-foreground/50">{user.email}</p>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`shrink-0 text-foreground/40 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}
