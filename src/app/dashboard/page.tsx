import { auth, isAdminEmail } from "@/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/sign-out-button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    redirect("/");
  }

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mosque Collection Dashboard</h1>

          <p className="mt-2 text-gray-600">Welcome, {session.user.email}</p>
        </div>

        <SignOutButton />
      </div>
    </main>
  );
}
