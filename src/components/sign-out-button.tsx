
"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectTo: "/" })}
      className="rounded-lg bg-[#102744] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#17365D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17365D]"
    >
      Sign out
    </button>
  );
}
