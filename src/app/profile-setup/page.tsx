import { redirect } from "next/navigation";
import { auth, isAdminEmail } from "@/auth";
import { getAdminProfileByEmail } from "@/lib/admin-profiles";
import ProfileSetupForm from "./components/profile-setup-form";

export default async function ProfileSetupPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !isAdminEmail(email)) {
    redirect("/");
  }

  const profile = await getAdminProfileByEmail(email);

  if (profile?.profileCompleted) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-4 py-10">
      <ProfileSetupForm
        adminEmail={email}
        initialValues={{
          name: profile?.name ?? "",
          designation: profile?.designation ?? "",
        }}
      />
    </main>
  );
}