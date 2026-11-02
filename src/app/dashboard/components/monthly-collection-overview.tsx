"use client";
import { useMemo } from "react";
import { useCollectionOverview } from "@/hooks/collections/useCollectionOverview";
import { flexRender } from "@tanstack/react-table";

import {
  getCoreRowModel,
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy";

import type { CollectionOverviewRow } from "@/types/collection-overview";

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

import type {
  MemberStatusFilter,
  ContributionFilter,
} from "../collections/components/collection-filters";

interface MonthlyCollectionOverviewProps {
  search?: string;
  memberStatus?: MemberStatusFilter;
  contribution?: ContributionFilter;
}

export default function MonthlyCollectionOverview({
  search = "",
  memberStatus = "All",
  contribution = "All",
}: MonthlyCollectionOverviewProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const financialYearStart = currentMonth >= 3 ? currentYear : currentYear - 1;

  const {
    data: overview,
    isLoading,
    isError,
    error,
  } = useCollectionOverview(financialYearStart);

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

  const columns = useMemo<LegacyColumnDef<CollectionOverviewRow>[]>(
    () => [
      {
        id: "member",
        header: "Member",
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

      ...MONTHS.map(
        ({ month, label }): LegacyColumnDef<CollectionOverviewRow> => ({
          id: `month-${month}`,
          header: label,
          cell: ({ row }) => {
            const monthData = row.original.months.find(
              (item) => item.month === month,
            );

            return (
              <span
                className={
                  monthData?.total
                    ? "font-medium text-[#17365D]"
                    : "text-[#94A3B8]"
                }
              >
                {monthData?.total ? formatCurrency(monthData.total) : "—"}
              </span>
            );
          },
        }),
      ),

      {
        id: "annualTotal",
        header: "Annual Total",
        cell: ({ row }) => (
          <span className="font-semibold text-[#102744]">
            {formatCurrency(row.original.annualTotal)}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useLegacyTable({
    data: filteredRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold text-[#102744]">
        Monthly Collection Ledger
      </h2>

      <p className="mt-1 text-xs text-[#64748B]">
        Showing {filteredRows.length} of {overview?.totalMembers ?? 0} members
      </p>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-[#64748B]">
          Loading collection data...
        </p>
      ) : isError ? (
        <p className="py-12 text-center text-sm text-red-600">
          {error instanceof Error
            ? error.message
            : "Unable to load collection data."}
        </p>
      ) : filteredRows.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm font-medium text-[#172B4D]">No members found</p>
          <p className="mt-1 text-xs text-[#64748B]">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="mt-5 hidden overflow-x-auto rounded-lg border border-[#E2E8F0] md:block">
          <table className="w-full min-w-[1500px] border-collapse text-left text-sm">
            <thead className="bg-[#F8FAFC]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    const isMember = index === 0;
                    const isAnnualTotal =
                      index === headerGroup.headers.length - 1;

                    return (
                      <th
                        key={header.id}
                        className={`border-b border-[#E2E8F0] px-4 py-4 text-xs font-semibold text-[#64748B] ${
                          isMember
                            ? "sticky left-0 z-20 min-w-[220px] bg-[#F8FAFC]"
                            : isAnnualTotal
                              ? "sticky right-0 z-20 min-w-[150px] bg-[#F8FAFC] text-right"
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
                  className="transition-colors hover:bg-[#F8FAFC]"
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
                              ? "sticky right-0 z-10 min-w-[150px] bg-white text-right"
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
      )}
    </section>
  );
}
