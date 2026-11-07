
"use client";

import { useMemo } from "react";
import { useCollections } from "@/hooks/collections/useCollections";
import { useLanguage } from "./admin-profile-context";

const MONTHS = [
  { month: 1, label: "Jan" },
  { month: 2, label: "Feb" },
  { month: 3, label: "Mar" },
  { month: 4, label: "Apr" },
  { month: 5, label: "May" },
  { month: 6, label: "Jun" },
  { month: 7, label: "Jul" },
  { month: 8, label: "Aug" },
  { month: 9, label: "Sep" },
  { month: 10, label: "Oct" },
  { month: 11, label: "Nov" },
  { month: 12, label: "Dec" },
];

const formatCompactCurrency = (amount: number, locale: string) =>
  amount === 0
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount)
    : new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "INR",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(amount);

export default function MonthlyCollectionSummary() {
  const { language, t } = useLanguage();
  const locale = language === "hi" ? "hi-IN" : "en-IN";
  const { data: collections = [], isLoading, isError } = useCollections();

  const currentYear = new Date().getFullYear();

  const monthlyData = useMemo(() => {
    return MONTHS.map(({ month }) => {
      const label = new Intl.DateTimeFormat(language === "hi" ? "hi-IN" : "en-IN", { month: "short" }).format(new Date(2024, month - 1, 1));
      const total = collections
        .filter((collection) => {
          const [year, collectionMonth] = collection.donationDate
            .split("-")
            .map(Number);

          return (
            year === currentYear &&
            collectionMonth === month &&
            collection.recordStatus === "Active"
          );
        })
        .reduce((sum, collection) => sum + collection.amount, 0);

      return { month, label, total };
    });
  }, [collections, currentYear, language]);

  const maxAmount = Math.max(
    ...monthlyData.map((item) => item.total),
    0,
  );

  const annualTotal = monthlyData.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  return (
    <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
      {/* Chart heading */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#F1F5F9] pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-[#102744]">
              {t("dashboard.monthlySummary")}
            </h2>
            <span className="rounded-full bg-[#EAF0F7] px-2.5 py-1 text-xs font-medium text-[#17365D]">
              {t("dashboard.calendarYear").replace(
                "{year}",
                currentYear.toLocaleString(locale, { useGrouping: false }),
              )}
            </span>
          </div>

          <p className="mt-1 text-xs text-[#64748B]">
            {t("dashboard.monthlyPerformance")}
          </p>
        </div>

        <div className="rounded-lg bg-[#F5F7FA] px-4 py-3 sm:min-w-44">
          <p className="text-xs font-medium text-[#64748B]">
            {t("dashboard.totalYear")}
          </p>

          <p className="mt-1 text-2xl font-semibold leading-8 tracking-tight text-[#102744]">
            {isLoading
              ? t("common.loading")
              : isError
                ? "—"
                : new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(annualTotal)}
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-[#64748B]">
          {t("dashboard.loadingMonthly")}
        </p>
      ) : isError ? (
        <p className="py-16 text-center text-sm text-red-600">
          {t("dashboard.loadMonthlyError")}
        </p>
      ) : (
        <div className="mt-6">
          <div className="grid grid-cols-6 gap-x-2 gap-y-4 sm:grid-cols-12 sm:gap-4">
            {monthlyData.map((item) => {
              const barHeight =
                maxAmount > 0 ? (item.total / maxAmount) * 100 : 0;

              return (
                <div
                  key={item.month}
                  className="flex min-w-0 flex-col items-center"
                  title={`${item.label}: ${new Intl.NumberFormat(locale, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(item.total)}`}
                >
                  <p className="mb-2 h-4 max-w-full truncate text-[10px] font-medium tabular-nums text-[#64748B] sm:mb-3 sm:text-xs">
                    {formatCompactCurrency(item.total, locale)}
                  </p>

                  <div className="relative flex h-20 w-full items-end justify-center overflow-hidden rounded-lg bg-[#F5F7FA] sm:h-40">
                    <div
                      className={`w-full max-w-8 rounded-t-md transition-colors duration-200 ${
                        item.total > 0 && item.total === maxAmount
                          ? "bg-[#17365D]"
                          : "bg-[#AFC0D3]"
                      }`}
                      style={{ height: `${barHeight}%` }}
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-[#CBD5E1]" />
                  </div>

                  <p className="mt-3 text-xs font-medium text-[#64748B]">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          {annualTotal === 0 && (
            <p className="mt-5 text-center text-xs text-[#94A3B8]">
              {t("dashboard.noCollectionsYear").replace("{year}", currentYear.toLocaleString(language === "hi" ? "hi-IN" : "en-IN"))}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
