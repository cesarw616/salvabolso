import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AppSidebar from "@/components/AppSidebar";

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar user={session.user} />
      <main className="pb-16 md:pb-0 md:pl-64">{children}</main>
    </div>
  );
}
