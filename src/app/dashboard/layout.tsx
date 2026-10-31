import { Suspense } from "react";
import { auth, isAdminEmail } from "@/auth";
import { redirect } from "next/navigation";
import DashboardShell from "./components/dashboard-shell";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

async function AuthenticatedDashboard({
  children,
}: DashboardLayoutProps) {
  const session = await auth();

  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    redirect("/");
  }

  return (
    <DashboardShell adminEmail={session.user.email}>
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA]">
          <p className="text-sm text-[#64748B]">
            Loading workspace...
          </p>
        </div>
      }
    >
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}