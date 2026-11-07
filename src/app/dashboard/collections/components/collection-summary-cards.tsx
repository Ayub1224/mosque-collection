
"use client";

import { useCollectionOverview } from "@/hooks/collections/useCollectionOverview";
import { useLanguage } from "../../components/admin-profile-context";

function getCurrentFinancialYearStart() {
  const now = new Date();
  return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
}

export default function CollectionSummaryCards() {
  const { language, t } = useLanguage();
  const locale = language === "hi" ? "hi-IN" : "en-IN";
  const financialYearStart = getCurrentFinancialYearStart();
  const { data, isLoading, isError, error } =
    useCollectionOverview(financialYearStart);

  const currentMonth = new Date().getMonth() + 1;

  const thisMonthTotal =
    data?.rows.reduce((total, row) => {
      const month = row.months.find((item) => item.month === currentMonth);
      return total + (month?.total ?? 0);
    }, 0) ?? 0;

  const currentMonthContributors =
    data?.rows.filter((row) => {
      const month = row.months.find((item) => item.month === currentMonth);
      return (month?.total ?? 0) > 0;
    }).length ?? 0;

  const noContribution =
    (data?.totalMembers ?? 0) - currentMonthContributors;

  const cards = [
    {
      label: t("collection.total"),
      value: new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(data?.totalCollection ?? 0),
      description: `${t("collection.financialYear")} ${financialYearStart.toLocaleString(locale)}–${(financialYearStart + 1).toLocaleString(locale)}`,
    },
    {
      label: t("collection.thisMonth"),
      value: new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(thisMonthTotal),
      description: t("collection.contributionsReceived"),
    },
    {
      label: t("collection.contributor"),
      value: currentMonthContributors.toLocaleString(locale),
      description: t("collection.membersContributions"),
    },
    {
      label: t("collection.nonContributors"),
      value: noContribution.toLocaleString(locale),
      description: t("collection.noContributionMonth"),
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="h-28 animate-pulse rounded-xl border border-[#E2E8F0] bg-white sm:h-32"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">
          {t("collection.unableSummary")}
        </p>
        <p className="mt-1 text-sm text-red-600">
          {error instanceof Error
            ? error.message
            : t("collection.pleaseTryAgain")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-[#E2E8F0] bg-white p-3.5 shadow-sm sm:p-5"
        >
          <p className="text-sm font-medium text-[#64748B]">{card.label}</p>

          <p className="mt-2 text-xl font-semibold tracking-tight text-[#102744] sm:mt-3 sm:text-2xl">
            {card.value}
          </p>

          <p className="mt-1.5 text-[11px] text-[#64748B] sm:mt-2 sm:text-xs">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}
