import AppSidebar from "@/components/AppSidebar";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pb-16 md:pb-0 md:pl-64">{children}</main>
    </div>
  );
}
