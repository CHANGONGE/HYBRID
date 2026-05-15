import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { InstallBanner } from "@/components/layout/InstallBanner";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      <InstallBanner />
      <main className="page-content max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
