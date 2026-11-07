import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null) {
  return !!email && adminEmails.includes(email.trim().toLowerCase());
}

if (adminEmails.length === 0 || adminEmails.length > 5) {
  throw new Error(
    "ADMIN_EMAILS must contain between 1 and 5 administrator email addresses.",
  );
}
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],

  session: {
    strategy: "jwt",
    // Auth.js refreshes the JWT cookie expiry when a valid session is read,
    // giving active users a rolling 10-day session window.
    maxAge: 10 * 24 * 60 * 60,
  },

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return false;
      }

      const email = profile?.email?.trim().toLowerCase();
      const emailVerified = profile?.email_verified;

      return (
        typeof email === "string" &&
        emailVerified === true &&
        isAdminEmail(email)
      );
    },

    async session({ session, token }) {
      if (session.user && typeof token.email === "string") {
        session.user.email = token.email;
      }

      return session;
    },
  },
  pages: {
    error: "/unauthorized",
  },
});
