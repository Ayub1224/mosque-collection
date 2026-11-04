"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import SummaryCard from "./summary-card";
import { useMembers } from "@/hooks/members/use-members";
import { useCollections } from "@/hooks/collections/useCollections";
import MonthlyCollectionOverview from "./monthly-collection-overview";
import MonthlyCollectionSummary from "./monthly-collection-summary";
import { useAdminName } from "./admin-profile-context";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function DashboardOverview() {
  const membersQuery = useMembers();
  const collectionsQuery = useCollections();
  const adminName = useAdminName();

  const summary = useMemo(() => {
    const members = membersQuery.data ?? [];
    const collections = collectionsQuery.data ?? [];

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const financialYearStart =
      currentMonth >= 4 ? currentYear : currentYear - 1;
    const activeCollections = collections.filter(
      (collection) => collection.recordStatus === "Active",
    );

    const collectionsThisMonth = activeCollections
      .filter((collection) => {
        const [year, month] = collection.donationDate.split("-").map(Number);

     return year === currentYear && month === currentMonth;
      })
      .reduce((total, collection) => total + collection.amount, 0);

    const collectionsThisYear = activeCollections
      .filter((collection) => {
        const [year, month] = collection.donationDate.split("-").map(Number);

        return (
          (year === financialYearStart && month >= 4) ||
          (year === financialYearStart + 1 && month <= 3)
        );
      })
      .reduce((total, collection) => total + collection.amount, 0);

    return [
      {
        title: "Total Members",
        value: members.length.toLocaleString("en-IN"),
        description: "Registered members",
        href: "/dashboard/members",
      },
      {
        title: "Active Members",
        value: members
          .filter((member) => member.status === "Active")
          .length.toLocaleString("en-IN"),
        description: "Currently active members",
        href: "/dashboard/members?status=Active",
      },
      {
        title: "Collections This Month",
        value: formatCurrency(collectionsThisMonth),
        description: "Current month's collections",
        href: "/dashboard/collections?period=month",
      },
      {
        title: "Collections This Year",
        value: formatCurrency(collectionsThisYear),
        description: "Current financial year's collections",
        href: "/dashboard/collections?period=year",
      },
    ];
  }, [membersQuery.data, collectionsQuery.data]);

  const isLoading = membersQuery.isLoading || collectionsQuery.isLoading;
  const isError = membersQuery.isError || collectionsQuery.isError;

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Mosque Administration
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#102744] sm:text-3xl">
            Assalamu Alaikum, {adminName}
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            Here's what's happening with your mosque today.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/members/new"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#17365D] transition hover:border-[#17365D] hover:bg-[#F8FAFC]"
          >
            + Add Member
          </Link>

          <Link
            href="/dashboard/collections"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#102744] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#17365D]"
          >
            + Add Collection
          </Link>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map((card) => (
            <SummaryCard
              key={card.title}
              title={card.title}
              value={isLoading ? "Loading..." : isError ? "—" : card.value}
              description={card.description}
              href={card.href}
            />
          ))}
        </div>

        {isError && (
          <p className="mt-3 text-sm text-red-600">
            Unable to load dashboard data. Please refresh and try again.
          </p>
        )}
      </section>
      <MonthlyCollectionOverview />
      <MonthlyCollectionSummary />
    </div>
  );
}
