"use client";

import Link from "next/link";
import { useCallback, useMemo } from "react";
import { CalendarDays, CircleAlert, Wallet } from "lucide-react";

import SummaryCard from "./summary-card";
import { useMembers } from "@/hooks/members/use-members";
import { useCollections } from "@/hooks/collections/useCollections";
import MonthlyCollectionOverview from "./monthly-collection-overview";
import MonthlyCollectionSummary from "./monthly-collection-summary";
import { useLanguage } from "./admin-profile-context";

export default function DashboardOverview() {
  const membersQuery = useMembers();
  const collectionsQuery = useCollections();
  const { adminName, language, t } = useLanguage();
  const formatCurrency = useCallback(
    (amount: number) =>
      new Intl.NumberFormat(language === "hi" ? "hi-IN" : "en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount),
    [language],
  );

  const summary = useMemo(() => {
    const members = membersQuery.data ?? [];
    const collections = collectionsQuery.data ?? [];

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const financialYearStart =
      currentMonth >= 4 ? currentYear : currentYear - 1;
    const locale = language === "hi" ? "hi-IN" : "en-IN";
    const yearFormatter = new Intl.NumberFormat(locale, {
      useGrouping: false,
    });
    const financialYearLabel = t("dashboard.financialYearPeriod").replace(
      "{years}",
      `${yearFormatter.format(financialYearStart)}–${yearFormatter.format(financialYearStart + 1)}`,
    );
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

    return {
      financialYearLabel,
      financialCards: [
        {
          title: t("dashboard.collectionsThisMonth"),
          value: formatCurrency(collectionsThisMonth),
          description: t("dashboard.currentMonth"),
          href: "/dashboard/collections?period=month",
          icon: CalendarDays,
        },
        {
          title: t("dashboard.collectionsThisYear"),
          value: formatCurrency(collectionsThisYear),
          description: financialYearLabel,
          href: "/dashboard/collections?period=year",
          icon: Wallet,
        },
      ],
      memberCards: [
        {
          title: t("dashboard.totalMembers"),
          value: members.length.toLocaleString(locale),
          description: t("dashboard.registeredMembers"),
          href: "/dashboard/members",
        },
        {
          title: t("dashboard.activeMembers"),
          value: members
            .filter((member) => member.status === "Active")
            .length.toLocaleString(locale),
          description: t("dashboard.currentlyActive"),
          href: "/dashboard/members?status=Active",
        },
      ],
    };
  }, [membersQuery.data, collectionsQuery.data, language, t, formatCurrency]);

  const isLoading = membersQuery.isLoading || collectionsQuery.isLoading;
  const isError = membersQuery.isError || collectionsQuery.isError;
  const getSummaryValue = (value: string) =>
    isLoading ? t("common.loading") : isError ? "—" : value;

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            {t("dashboard.mosqueAdministration")}
          </p>

          <h1 className="mt-2 text-3xl font-semibold leading-9 tracking-tight text-[#102744] sm:text-4xl sm:leading-10">
            {t("dashboard.title")}
          </h1>

          <p className="mt-2 text-sm font-medium text-[#475569]">
            {t("dashboard.greeting")}, {adminName}
          </p>

          <p className="mt-1 text-sm leading-5 text-[#64748B]">
            {t("dashboard.dailySummary")}
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:gap-3">
          <Link
            href="/dashboard/collections?action=add"
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg bg-[#102744] px-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#17365D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D] focus-visible:ring-offset-2 sm:px-4"
          >
            {t("dashboard.addCollection")}
          </Link>

          <Link
            href="/dashboard/members/new"
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm font-semibold text-[#17365D] transition duration-200 hover:border-[#94A3B8] hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D] focus-visible:ring-offset-2 sm:px-4"
          >
            {t("dashboard.addMember")}
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold tracking-tight text-[#102744]">
            {t("dashboard.financialOverview")}
          </h2>
          <span className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-medium text-[#475569]">
            {summary.financialYearLabel}
          </span>
        </div>

        <div className="grid gap-3 xl:grid-cols-12 xl:gap-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:col-span-8 xl:gap-4">
            {summary.financialCards.map((card) => (
              <SummaryCard
                key={card.title}
                {...card}
                value={getSummaryValue(card.value)}
                variant="financial"
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:col-span-4 xl:grid-cols-1">
            {summary.memberCards.map((card) => (
              <SummaryCard
                key={card.title}
                {...card}
                value={getSummaryValue(card.value)}
                variant="supporting"
              />
            ))}
          </div>
        </div>

        {isError && (
          <p
            className="mt-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t("dashboard.loadDashboardError")}
          </p>
        )}
      </section>

      <MonthlyCollectionSummary />
      <MonthlyCollectionOverview />
    </div>
  );
}
