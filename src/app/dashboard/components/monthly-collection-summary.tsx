
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
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-[#102744]">
            Monthly Collection Summary
          </h2>

          <p className="mt-1 text-xs text-[#64748B]">
            Collection performance from January to December {currentYear}
          </p>
        </div>

        <div>
          <p className="text-xs text-[#64748B]">Total collected this year</p>
          <p className="mt-1 text-lg font-semibold text-[#102744]">
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
        <div className="mt-8">
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
                  <p className="mb-2 h-4 truncate text-[10px] font-medium text-[#64748B]">
                    {formatCompactCurrency(item.total)}
                  </p>

                  <div className="flex h-40 w-full items-end justify-center rounded-t-md bg-[#F5F7FA]">
                    <div
                      className="w-full max-w-9 rounded-t-md bg-[#17365D] transition-all duration-500"
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs font-medium text-[#64748B]">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          {annualTotal === 0 && (
            <p className="mt-4 text-center text-xs text-[#94A3B8]">
              No collections recorded for {currentYear} yet.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
