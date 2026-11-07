import { auth, isAdminEmail } from "@/auth";
import { redirect } from "next/navigation";
import HomeLogin from "./home-login";

export default async function Home() {
  const session = await auth();
  const email = session?.user?.email;

  if (email && isAdminEmail(email)) {
    redirect("/dashboard");
  }

  return <HomeLogin />;
}
