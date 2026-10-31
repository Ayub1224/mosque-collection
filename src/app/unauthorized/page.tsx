
"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";

export default function UnauthorizedPage() {
  async function handleAccountSwitch() {
    await signIn(
      "google",
      { redirectTo: "/dashboard" },
      { prompt: "select_account" }
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#172B4D]">
      <div className="flex min-h-screen flex-col overflow-hidden bg-white shadow-xl lg:flex-row">

        {/* LEFT: BRANDING PANEL */}
        <section className="relative flex min-h-[340px] flex-col justify-between overflow-hidden bg-[#102744] px-6 py-8 text-white sm:px-12 sm:py-12 lg:min-h-screen lg:w-1/2 lg:p-16">

          {/* Mosque background */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/mosque-background.png')",
            }}
          />

          {/* Strong overlay for text readability */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#102744]/85"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#102744]/70 via-[#102744]/40 to-[#07182D]/80"
          />

          {/* Top branding */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-xl">
              ☾
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
                Institutional Ledger
              </p>
              <p className="text-sm font-medium text-white">
                Awqaf & Treasury
              </p>
            </div>
          </div>

          {/* Main branding content */}
          <div className="relative z-10 my-12 max-w-xl lg:my-auto lg:py-16">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-blue-100 backdrop-blur-sm">
              <span>✓</span>
              Verified Administrative Access
            </div>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[42px]">
              Mosque Collection Management
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-blue-100 sm:text-base sm:leading-8">
              A secure, auditable workspace dedicated to managing endowment
              funds, Friday collections, donor contributions, and sacred
              financial trusts.
            </p>

            {/* Trust indicators */}
            <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-widest text-blue-200">
                  Standard
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Fiduciary Trust
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-widest text-blue-200">
                  Auditing
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Full Traceability
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="relative z-10 hidden items-center gap-2 text-xs tracking-wide text-blue-200 lg:flex">
            <span>🔒</span>
            Authorized access only · Secure administrative workspace
          </p>
        </section>

        {/* RIGHT: ACCESS RESTRICTED PANEL */}
        <section className="relative z-10 -mt-5 flex flex-1 flex-col justify-center rounded-t-3xl bg-[#F7F9FC] px-6 py-9 sm:px-12 lg:mt-0 lg:min-h-screen lg:w-1/2 lg:rounded-none lg:px-16 lg:py-12">

          <div className="mx-auto w-full max-w-[460px]">

            {/* Status icon */}
            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-xl bg-[#E8EEF8] text-2xl text-[#17365D] shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <path d="M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z" />
                <path d="M9 12h6M12 9v6" />
              </svg>
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-semibold tracking-tight text-[#172B4D] sm:text-3xl">
              Access Restricted
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#475569]">
              This Google account is not recognized in the approved
              administrative registry for the Mosque Collection Management
              workspace.
            </p>

            <p className="mt-3 text-sm leading-6 text-[#64748B]">
              If you believe this is an error, please coordinate with the
              mosque executive committee or the head treasury administrator
              for system enrollment.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleAccountSwitch}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#17365D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#102744] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17365D]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="10" cy="7" r="4" />
                  <path d="M19 8v6M16 11h6" />
                </svg>
                Try another account
              </button>

              <Link
                href="/"
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#17365D] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17365D]"
              >
                <span aria-hidden="true">←</span>
                Return to Login
              </Link>
            </div>

            {/* Quranic Dua */}
            <div className="mt-9 flex flex-col items-center rounded-xl bg-[#EEF2F7] px-5 py-7 text-center sm:px-7">

              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#475569]">
                <span aria-hidden="true">۞</span>
              </div>

              <p
                dir="rtl"
                lang="ar"
                className="font-serif text-xl font-medium leading-[2.2] tracking-wide text-[#17365D] sm:text-2xl"
              >
                رَبِّ اشْرَحْ لِي صَدْرِي ۝ وَيَسِّرْ لِي أَمْرِي
              </p>

              <p className="mt-3 max-w-xs text-sm italic leading-6 text-[#64748B]">
                "My Lord, expand for me my chest and make easy for me my task."
              </p>

              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
                Surah Taha · 20:25–26
              </p>
            </div>

            {/* Security footer */}
            <div className="mt-8 flex flex-col items-center gap-2 text-center text-xs text-[#64748B]">
              <p>
                Authorized access only · Secure administrative workspace
              </p>
              <p className="text-[11px] text-[#94A3B8]">
                Endowment Trust & Treasury Operations
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
