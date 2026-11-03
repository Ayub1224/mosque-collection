
"use client";

import { useMemo } from "react";
import { useCollections } from "@/hooks/collections/useCollections";

const MONTHS = [
  { month: 4, label: "Apr" },
  { month: 5, label: "May" },
  { month: 6, label: "Jun" },
  { month: 7, label: "Jul" },
  { month: 8, label: "Aug" },
  { month: 9, label: "Sep" },
  { month: 10, label: "Oct" },
  { month: 11, label: "Nov" },
  { month: 12, label: "Dec" },
  { month: 1, label: "Jan" },
  { month: 2, label: "Feb" },
  { month: 3, label: "Mar" },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatCompactCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);

export default function MonthlyCollectionSummary() {
  const { data: collections = [], isLoading, isError } = useCollections();

  const currentYear = new Date().getFullYear();

  const monthlyData = useMemo(() => {
    return MONTHS.map(({ month, label }) => {
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
  }, [collections, currentYear]);

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
          <h2 className="text-base font-semibold tracking-tight text-[#102744]">
            Monthly Collection Summary
          </h2>

          <p className="mt-1 text-xs text-[#64748B]">
            Monthly collection performance
          </p>
        </div>

        <div className="rounded-lg bg-[#F5F7FA] px-4 py-3 sm:min-w-44">
          <p className="text-xs font-medium text-[#64748B]">
            Total collected this year
          </p>

          <p className="mt-1 text-xl font-bold tracking-tight text-[#102744]">
            {isLoading ? "Loading..." : formatCurrency(annualTotal)}
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-[#64748B]">
          Loading monthly collections...
        </p>
      ) : isError ? (
        <p className="py-16 text-center text-sm text-red-600">
          Unable to load monthly collection data.
        </p>
      ) : (
        <div className="mt-6">
          <div className="grid grid-cols-6 gap-3 sm:grid-cols-12 sm:gap-4">
            {monthlyData.map((item) => {
              const barHeight =
                maxAmount > 0 ? (item.total / maxAmount) * 100 : 0;

              return (
                <div
                  key={item.month}
                  className="flex min-w-0 flex-col items-center"
                  title={`${item.label}: ${formatCurrency(item.total)}`}
                >
                  <p className="mb-3 h-4 truncate text-[10px] font-medium tabular-nums text-[#64748B] sm:text-xs">
                    {formatCompactCurrency(item.total)}
                  </p>

                  <div className="flex h-40 w-full items-end justify-center overflow-hidden rounded-lg bg-[#F5F7FA] sm:h-44">
                    <div
                      className="w-full max-w-9 rounded-t-md bg-gradient-to-t from-[#102744] to-[#315783] transition-all duration-500"
                      style={{ height: `${barHeight}%` }}
                    />
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
              No collections recorded for {currentYear} yet.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
