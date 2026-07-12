"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Logo from "@/components/Logo";

const navItems = [
  {
    href: "/app/chat",
    label: "Chat IA",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M8 10h8M8 14h5M21 12c0 4.418-4.03 8-9 8-1.06 0-2.076-.163-3.016-.463L3 21l1.532-4.088C3.564 15.62 3 13.87 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"
      />
    ),
  },
  {
    href: "/app/transacoes",
    label: "Transações",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3 10h18M7 15h3M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"
      />
    ),
  },
  {
    href: "/app/dashboard",
    label: "Dashboard",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M4 19V10m6 9V5m6 14v-7m6 7V9"
      />
    ),
  },
];

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

type User = {
  name?: string | null;
  email?: string | null;
};

export default function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const initial = (user.name ?? user.email ?? "U").charAt(0).toUpperCase();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-black/10 bg-white px-4 py-6 dark:border-white/10 dark:bg-brand-950 md:flex">
        <Logo />

        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-600 text-white"
                    : "text-foreground/70 hover:bg-brand-50 hover:text-foreground dark:hover:bg-white/5"
                }`}
              >
                <NavIcon>{item.icon}</NavIcon>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-black/10 pt-4 dark:border-white/10">
          <div className="flex items-center gap-2.5 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-800 dark:text-brand-100">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name ?? "Usuário"}
              </p>
              <p className="truncate text-xs text-foreground/50">
                {user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground/70 hover:bg-brand-50 hover:text-foreground dark:hover:bg-white/5"
          >
            Sair
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-black/10 bg-white dark:border-white/10 dark:bg-brand-950 md:hidden">
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                active ? "text-brand-600" : "text-foreground/50"
              }`}
            >
              <NavIcon>{item.icon}</NavIcon>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
