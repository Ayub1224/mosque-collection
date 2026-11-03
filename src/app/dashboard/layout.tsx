import { Suspense } from "react";
import { auth, isAdminEmail } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminProfileByEmail } from "@/lib/admin-profiles";
import DashboardShell from "./components/dashboard-shell";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

async function AuthenticatedDashboard({
  children,
}: DashboardLayoutProps) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !isAdminEmail(email)) {
    redirect("/");
  }

  const adminProfile = await getAdminProfileByEmail(email);

  if (!adminProfile?.profileCompleted) {
    redirect("/profile-setup");
  }

  return (
<DashboardShell
  adminEmail={email}
  adminName={adminProfile.name}
  adminDesignation={adminProfile.designation}
>
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