"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function HomeLogin() {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;

    setIsSigningIn(true);

    try {
      await signIn("google", {
        redirectTo: "/dashboard",
      });
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setIsSigningIn(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-white md:flex-row">
      {/* Branding: image header on mobile, full panel on desktop */}
      <section className="relative flex min-h-[34svh] flex-col justify-end overflow-hidden bg-[#102744] px-6 pb-6 pt-10 text-white sm:px-12 md:min-h-screen md:w-1/2 md:justify-between md:p-12 lg:p-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/mosque-background.png')",
          }}
        />

        <div aria-hidden="true" className="absolute inset-0 bg-[#102744]/75" />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#102744] via-[#102744]/50 to-[#102744]/10 md:from-[#102744]/90 md:via-[#102744]/60 md:to-[#17365D]/60"
        />

        <div className="relative z-10 md:my-auto">
          <div
            aria-hidden="true"
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-lg md:mb-8 md:h-12 md:w-12"
          >
            ☾
          </div>

          <h1 className="max-w-lg text-xl font-semibold leading-tight tracking-tight sm:text-2xl md:mb-4 md:text-3xl lg:text-[34px]">
            Mosque Collection Management
          </h1>

          <p className="mt-2 max-w-md text-xs leading-5 text-white/85 sm:text-sm md:mt-0 md:text-base md:leading-relaxed">
            <span className="md:hidden">
              Secure financial workspace for authorized administrators.
            </span>
            <span className="hidden md:inline">
              A secure workspace for managing mosque collections, member
              contributions, and financial records.
            </span>
          </p>
        </div>

        <p className="relative z-10 mt-8 hidden text-xs leading-5 text-white/70 md:block">
          Authorized access only · Secure administrative workspace
        </p>
      </section>

      {/* Login panel */}
      <section
        aria-labelledby="login-heading"
        className="relative z-10 -mt-4 flex flex-1 flex-col rounded-t-3xl bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 shadow-sm sm:px-12 md:mt-0 md:min-h-screen md:w-1/2 md:justify-center md:rounded-none md:px-12 md:py-12 lg:px-16"
      >
        {/* Small handle shown only on mobile */}
        <div
          aria-hidden="true"
          className="mb-8 h-1 w-12 self-center rounded-full bg-slate-200 md:hidden"
        />

        <div className="my-auto w-full max-w-[380px] md:mx-auto">
          <h2
            id="login-heading"
            className="text-2xl font-semibold tracking-tight text-[#172B4D] sm:text-[28px]"
          >
            Welcome back
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in with your authorized Google account to continue.
          </p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            aria-describedby="access-notice"
            aria-live="polite"
            className="mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-medium text-[#172B4D] shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17365D] disabled:cursor-not-allowed disabled:opacity-70 md:mt-8"
          >
            {isSigningIn ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>

                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <p
            id="access-notice"
            className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs leading-5 text-slate-500"
          >
            <LockIcon />
            <span>Access restricted to authorized administrators.</span>
          </p>
        </div>

        <p className="mt-10 pt-6 text-center text-[10px] uppercase leading-4 tracking-wide text-slate-500 md:hidden">
          Authorized access only · Secure administrative workspace
        </p>
      </section>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.26 21.31 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.2.005 10.04.005 12c0 1.95.46 3.79 1.275 5.42l4-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.69 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4 shrink-0"
    >
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
