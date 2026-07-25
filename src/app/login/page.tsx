"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Suspense, useState, type FormEvent } from "react";
import Logo from "@/components/Logo";
import { rememberAccount } from "@/lib/knownAccounts";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setIsSubmitting(false);
      setError("E-mail ou senha inválidos.");
      return;
    }

    const session = await getSession();
    if (session?.user?.email) {
      rememberAccount({ email: session.user.email, name: session.user.name ?? session.user.email });
    }

    router.push("/app/chat");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-1">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-950 p-12 text-brand-50 lg:flex">
        <Logo className="text-white [&_span]:text-white" />

        <div className="max-w-sm">
          <h1 className="text-3xl font-bold leading-tight text-white">
            Organize suas finanças e alcance seus objetivos.
          </h1>
          <p className="mt-4 text-brand-100">
            Acompanhe seus gastos, defina metas e economize com mais
            inteligência usando o SalvaBolso.
          </p>
        </div>

        <p className="text-sm text-brand-200">
          &copy; {new Date().getFullYear()} SalvaBolso. Projeto de TCC.
        </p>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-brand-300/10 blur-3xl"
        />
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>

          <h2 className="text-2xl font-bold text-foreground">Entrar</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Acesse sua conta para continuar.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className="mt-1.5 block w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-foreground shadow-sm outline-none placeholder:text-foreground/40 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-white/10 dark:bg-white/5"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Senha
                </label>
                <Link
                  href="/esqueci-senha"
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 pr-11 text-foreground shadow-sm outline-none placeholder:text-foreground/40 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-white/10 dark:bg-white/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-foreground/50 hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-black/20 text-brand-600 focus:ring-brand-500/40"
              />
              <label htmlFor="remember" className="text-sm text-foreground/80">
                Lembrar de mim
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200"
              >
                {error}
              </p>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-foreground/60">
            Não tem uma conta?{" "}
            <Link
              href="/cadastro"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
