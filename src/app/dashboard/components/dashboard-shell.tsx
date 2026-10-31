"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SignOutButton from "@/components/sign-out-button";

type DashboardShellProps = {
  children: React.ReactNode;
  adminEmail: string;
};

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Members", href: "/dashboard/members", icon: "members" },
  { label: "Collection", href: "/dashboard/collections", icon: "collection" },
] as const;

export default function DashboardShell({
  children,
  adminEmail,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = (
    <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Main navigation">
      {navigation.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setDrawerOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
              active
                ? "bg-[#EAF0F7] text-[#102744]"
                : "text-[#64748B] hover:bg-[#F5F7FA] hover:text-[#172B4D]"
            }`}
          >
            <NavIcon name={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172B4D]">
      {drawerOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-[#102744]/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#E2E8F0] bg-white transition-transform duration-200 lg:translate-x-0 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-[#E2E8F0] px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102744] text-white">
            <MosqueIcon />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#102744]">
              Mosque Collection
            </p>
            <p className="mt-0.5 text-xs text-[#64748B]">Administration</p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="ml-auto rounded-lg p-2 text-[#64748B] hover:bg-[#F5F7FA] lg:hidden"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1">
          <p className="px-6 pb-1 pt-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
            Workspace
          </p>
          {navLinks}
        </div>

        <div className="border-t border-[#E2E8F0] p-4">
          <div className="mb-3 flex min-w-0 items-center gap-3 px-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF0F7] text-sm font-semibold text-[#17365D]">
              {adminEmail.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#172B4D]">Administrator</p>
              <p className="truncate text-[11px] text-[#64748B]">{adminEmail}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg p-2 text-[#17365D] hover:bg-[#F5F7FA] lg:hidden"
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </button>
            <div>
              <p className="text-sm font-semibold text-[#102744]">
                Mosque Collection
              </p>
              <p className="hidden text-xs text-[#64748B] sm:block">
                Management workspace
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="hidden sm:inline">Signed in as</span>
            <span className="max-w-40 truncate font-medium text-[#172B4D]">
              {adminEmail}
            </span>
          </div>
        </header>

        <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-[#E2E8F0] bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
      >
        {navigation.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium ${
                active ? "text-[#102744]" : "text-[#94A3B8]"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function NavIcon({ name }: { name: string }) {
  if (name === "members") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true">
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 19v-1.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V19M16 5.2a3.2 3.2 0 0 1 0 6.1M17 14h.7a3.8 3.8 0 0 1 3.8 3.8V19" />
      </svg>
    );
  }

  if (name === "collection") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18M7 15h3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function MosqueIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6" aria-hidden="true">
      <path d="M3 20h18M5 20v-8h14v8M8 12V9a4 4 0 0 1 8 0v3M12 3v2M10.5 3h3M8 20v-4h3v4M15 20v-4h1v4M3 12l9-5 9 5" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
