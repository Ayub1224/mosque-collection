"use client";

import { useCollectionOverview } from "@/hooks/collections/useCollectionOverview";

function getCurrentFinancialYearStart() {
  const now = new Date();
  return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CollectionSummaryCards() {
  const financialYearStart = getCurrentFinancialYearStart();
  const { data, isLoading, isError, error } =
    useCollectionOverview(financialYearStart);

  const currentMonth = new Date().getMonth() + 1;

  const thisMonthTotal =
    data?.rows.reduce((total, row) => {
      const month = row.months.find((item) => item.month === currentMonth);

      return total + (month?.total ?? 0);
    }, 0) ?? 0;

  const noContribution =
    (data?.totalMembers ?? 0) - (data?.totalContributors ?? 0);

  const cards = [
    {
      label: "Total Collection",
      value: formatCurrency(data?.totalCollection ?? 0),
      description: `Financial Year ${financialYearStart}–${financialYearStart + 1}`,
    },
    {
      label: "This Month",
      value: formatCurrency(thisMonthTotal),
      description: "Collections received this month",
    },
    {
      label: "Contributors",
      value: data?.totalContributors.toString() ?? "0",
      description: "Members with contributions",
    },
    {
      label: "No Contribution",
      value: noContribution.toString(),
      description: "No active contribution this FY",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="h-32 animate-pulse rounded-xl border border-[#E2E8F0] bg-white"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">
          Unable to load collection summary.
        </p>
        <p className="mt-1 text-sm text-red-600">
          {error instanceof Error ? error.message : "Please try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
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
