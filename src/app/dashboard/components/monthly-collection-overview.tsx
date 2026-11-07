"use client";
import DonationDetailsDrawer from "./donation-details-drawer";
import { useCallback, useMemo, useState } from "react";
import { flexRender } from "@tanstack/react-table";
import type { Collection } from "@/types/collection";
import {
  getCoreRowModel,
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy";

import { useCollectionOverview } from "@/hooks/collections/useCollectionOverview";
import type { CollectionOverviewRow } from "@/types/collection-overview";
import { SiWhatsapp } from "react-icons/si";
import type { Member } from "@/types/member";
import WhatsAppReminderDialog from "../collections/components/whatsapp-reminder-dialog";
import type {
  MemberStatusFilter,
  ContributionFilter,
} from "../collections/components/collection-filters";
import { useLanguage } from "./admin-profile-context";

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

interface SelectedReminder {
  member: Member;
  month: number;
  year: number;
}

function getFinancialYearMonthYear(
  month: number,
  financialYearStart: number,
): number {
  return month >= 4 ? financialYearStart : financialYearStart + 1;
}

function isCurrentOrPreviousMonth(month: number, year: number): boolean {
  const now = new Date();

  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const targetMonth = new Date(year, month - 1, 1);

  return (
    targetMonth.getTime() === currentMonth.getTime() ||
    targetMonth.getTime() === previousMonth.getTime()
  );
}

interface SelectedMonth {
  memberName: string;
  memberId: string;
  monthLabel: string;
  donations: Collection[];
}

interface MonthlyCollectionOverviewProps {
  search?: string;
  memberStatus?: MemberStatusFilter;
  contribution?: ContributionFilter;
  period?: "month" | "year";
}

export default function MonthlyCollectionOverview({
  search = "",
  memberStatus = "All",
  contribution = "All",
  period = "year",
}: MonthlyCollectionOverviewProps) {
  const { language, t } = useLanguage();
  const formatLocalizedCurrency = useCallback(
    (amount: number) =>
      new Intl.NumberFormat(language === "hi" ? "hi-IN" : "en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount),
    [language],
  );
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth | null>(
    null,
  );

  const [selectedReminder, setSelectedReminder] =
    useState<SelectedReminder | null>(null);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const financialYearStart = currentMonth >= 3 ? currentYear : currentYear - 1;
  const locale = language === "hi" ? "hi-IN" : "en-IN";
  const localizedMonths = MONTHS.map(({ month }) => ({
    month,
    label: new Intl.DateTimeFormat(locale, { month: "short" }).format(
      new Date(2024, month - 1, 1),
    ),
  }));
  const visibleMonths =
    period === "month"
      ? localizedMonths.filter((item) => item.month === currentMonth + 1)
      : localizedMonths;

  const {
    data: overview,
    isLoading,
    isError,
    error,
  } = useCollectionOverview(financialYearStart);

  // Search and filter members
  const filteredRows = useMemo(() => {
    if (!overview) return [];

    const normalizedSearch = search.trim().toLowerCase();

    return overview.rows.filter((row) => {
      const matchesSearch =
        row.member.fullName.toLowerCase().includes(normalizedSearch) ||
        row.member.phoneNumber.includes(normalizedSearch);

      const matchesStatus =
        memberStatus === "All" || row.member.status === memberStatus;

      const isContributor = row.annualTotal > 0;

      const matchesContribution =
        contribution === "All" ||
        (contribution === "Contributors" && isContributor) ||
        (contribution === "No Contribution" && !isContributor);

      return matchesSearch && matchesStatus && matchesContribution;
    });
  }, [overview, search, memberStatus, contribution]);

  // Desktop table columns
  const columns = useMemo<LegacyColumnDef<CollectionOverviewRow>[]>(
    () => [
      {
        id: "member",
        header: t("collection.member"),
        cell: ({ row }) => (
          <div className="min-w-40">
            <p className="font-medium text-[#172B4D]">
              {row.original.member.fullName}
            </p>
            <p className="mt-1 text-xs text-[#64748B]">
              {row.original.member.phoneNumber}
            </p>
          </div>
        ),
      },

      ...visibleMonths.map(
        ({ month, label }): LegacyColumnDef<CollectionOverviewRow> => ({
          id: `month-${month}`,
          header: label,

          cell: ({ row }) => {
            const member = row.original.member;

            const monthData = row.original.months.find(
              (item) => item.month === month,
            );

            const monthYear = getFinancialYearMonthYear(
              month,
              financialYearStart,
            );

            const canSendReminder =
              member.status === "Active" &&
              (monthData?.total ?? 0) <= 0 &&
              isCurrentOrPreviousMonth(month, monthYear);

            return (
              <div className="group flex items-center justify-center gap-1">
                {/* Existing donation details button */}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedMonth({
                      memberName: member.fullName,
                      memberId: member.memberId,
                      monthLabel: label,
                      donations: monthData?.donations ?? [],
                    })
                  }
                  className={`inline-flex min-w-16 items-center justify-center rounded-lg px-2.5 py-1.5 text-xs tabular-nums transition-colors ${
                    monthData?.total
                      ? "bg-[#F1F5F9] font-semibold text-[#17365D] hover:bg-[#E2EAF3]"
                      : "font-normal text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#64748B]"
                  }`}
                  aria-label={`View ${label} donations for ${member.fullName}`}
                >
                  {monthData?.total
                    ? formatLocalizedCurrency(monthData.total)
                    : "—"}
                </button>

                {/* WhatsApp reminder action */}
                {canSendReminder && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedReminder({
                        member,
                        month,
                        year: monthYear,
                      })
                    }
                    title={`Prepare ${label} reminder for ${member.fullName}`}
                    aria-label={`Prepare WhatsApp reminder for ${member.fullName} for ${label}`}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#16834A] opacity-100 transition hover:bg-[#EAF7EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16834A] md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                  >
                    <SiWhatsapp size={17} className="text-[#25D366]" />
                  </button>
                )}
              </div>
            );
          },
        }),
      ),

      {
        id: "annualTotal",
        header:
          period === "month"
            ? t("collection.monthTotal")
            : t("collection.annualTotal"),
        cell: ({ row }) => {
          const total =
            period === "month"
              ? (row.original.months.find(
                  (item) => item.month === currentMonth + 1,
                )?.total ?? 0)
              : row.original.annualTotal;

          return (
            <span className="font-semibold text-[#102744]">
              {formatLocalizedCurrency(total)}
            </span>
          );
        },
      },
    ],
    [
      financialYearStart,
      visibleMonths,
      period,
      currentMonth,
      language,
      t,
      formatLocalizedCurrency,
    ],
  );

  const table = useLegacyTable({
    data: filteredRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
      {/* Section heading */}
      <h2 className="text-base font-semibold text-[#102744]">
        {t("dashboard.ledger")}
      </h2>

      <p className="mt-1 text-xs text-[#64748B]">
        {t("dashboard.showingMembers")
          .replace("{shown}", filteredRows.length.toLocaleString(locale))
          .replace(
            "{total}",
            (overview?.totalMembers ?? 0).toLocaleString(locale),
          )}
      </p>

      {/* Loading state */}
      {isLoading && (
        <p className="py-12 text-center text-sm text-[#64748B]">
          {t("dashboard.loadingData")}
        </p>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <p className="py-12 text-center text-sm text-red-600">
          {error instanceof Error
            ? error.message
            : t("dashboard.loadDataError")}
        </p>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filteredRows.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm font-medium text-[#172B4D]">
            {t("members.noResults")}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            {t("dashboard.changeSearch")}
          </p>
        </div>
      )}

      {/* Collection records */}
      {!isLoading && !isError && filteredRows.length > 0 && (
        <>
          {/* ================================== */}
          {/* DESKTOP LEDGER */}
          {/* ================================== */}

          <div className="mt-5 hidden overflow-x-auto rounded-lg border border-[#E2E8F0] md:block">
            <table className="w-full min-w-[1500px] border-collapse text-left text-sm">
              <thead className="bg-[#F1F5F9]">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, index) => {
                      const isMember = index === 0;
                      const isAnnualTotal =
                        index === headerGroup.headers.length - 1;

                      return (
                        <th
                          key={header.id}
                          className={`border-b border-[#E2E8F0] px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-[#64748B] ${
                            isMember
                              ? "sticky left-0 z-20 min-w-[220px] bg-[#F1F5F9]"
                              : isAnnualTotal
                                ? "sticky right-0 z-20 min-w-[150px] border-l border-[#E2E8F0] bg-[#E8EEF6] text-right"
                                : "min-w-[110px] text-center"
                          }`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors duration-150 hover:bg-[#F8FAFC]"
                  >
                    {row.getVisibleCells().map((cell, index) => {
                      const isMember = index === 0;
                      const isAnnualTotal =
                        index === row.getVisibleCells().length - 1;

                      return (
                        <td
                          key={cell.id}
                          className={`border-b border-[#E2E8F0] px-4 py-4 ${
                            isMember
                              ? "sticky left-0 z-10 min-w-[220px] bg-white"
                              : isAnnualTotal
                                ? "sticky right-0 z-10 min-w-[150px] border-l border-[#E2E8F0] bg-[#F8FAFC] text-right"
                                : "min-w-[110px] text-center"
                          }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================================== */}
          {/* MOBILE MEMBER CARDS */}
          {/* ================================== */}

          <div className="mt-4 space-y-3 md:hidden">
            {filteredRows.map((row) => {
              const isExpanded = expandedMemberId === row.member.memberId;

              return (
                <div
                  key={row.member.memberId}
                  className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white"
                >
                  {/* Member information */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#172B4D]">
                          {row.member.fullName}
                        </p>

                        <p className="mt-1 text-xs text-[#64748B]">
                          {row.member.phoneNumber}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${
                          row.annualTotal > 0
                            ? "bg-[#EAF0F7] text-[#17365D]"
                            : "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        {row.annualTotal > 0
                          ? t("collection.contributor")
                          : t("collection.noContribution")}
                      </span>
                    </div>

                    {/* Annual total and expand button */}
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#64748B]">
                          {t("collection.annualTotal")}
                        </p>

                        <p className="mt-1 text-lg font-semibold text-[#102744]">
                          {formatLocalizedCurrency(row.annualTotal)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMemberId(
                            isExpanded ? null : row.member.memberId,
                          )
                        }
                        aria-expanded={isExpanded}
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-[#17365D] hover:bg-[#F5F7FA]"
                      >
                        {isExpanded
                          ? t("dashboard.hideDetails")
                          : t("dashboard.monthlyDetails")}

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={`h-4 w-4 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Expandable monthly breakdown */}
                  {isExpanded && (
                    <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-4">
                      <p className="mb-3 text-xs font-semibold text-[#64748B]">
                        Monthly Collection
                      </p>

                      <div className="grid grid-cols-3 gap-2">
                        {visibleMonths.map(({ month, label }) => {
                          const monthData = row.months.find(
                            (item) => item.month === month,
                          );

                          const monthYear = getFinancialYearMonthYear(
                            month,
                            financialYearStart,
                          );

                          const canSendReminder =
                            row.member.status === "Active" &&
                            (monthData?.total ?? 0) <= 0 &&
                            isCurrentOrPreviousMonth(month, monthYear);

                          return (
                            <div
                              key={month}
                              className="rounded-lg border border-[#E2E8F0] bg-white p-2.5"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedMonth({
                                      memberName: row.member.fullName,
                                      memberId: row.member.memberId,
                                      monthLabel: label,
                                      donations: monthData?.donations ?? [],
                                    })
                                  }
                                  className="min-w-0 flex-1 text-left"
                                >
                                  <p className="text-xs text-[#64748B]">
                                    {label}
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-[#172B4D]">
                                    {monthData?.total
                                      ? formatLocalizedCurrency(monthData.total)
                                      : "—"}
                                  </p>
                                </button>

                                {canSendReminder && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedReminder({
                                        member: row.member,
                                        month,
                                        year: monthYear,
                                      })
                                    }
                                    aria-label={`WhatsApp reminder for ${row.member.fullName}, ${label}`}
                                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#16834A] hover:bg-[#EAF7EF]"
                                  >
                                    <SiWhatsapp
                                      size={17}
                                      className="text-[#25D366]"
                                    />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {selectedMonth && (
        <DonationDetailsDrawer
          key={`${selectedMonth.memberId}-${selectedMonth.monthLabel}`}
          memberName={selectedMonth.memberName}
          monthLabel={selectedMonth.monthLabel}
          donations={selectedMonth.donations}
          onClose={() => setSelectedMonth(null)}
        />
      )}
      {selectedReminder && (
        <WhatsAppReminderDialog
          open={true}
          onClose={() => setSelectedReminder(null)}
          member={selectedReminder.member}
          month={selectedReminder.month}
          year={selectedReminder.year}
        />
      )}
    </section>
  );
}
