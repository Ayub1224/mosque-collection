"use client";
import { useMemo } from "react";
import { useCollectionOverview } from "@/hooks/collections/useCollectionOverview";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

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
  search: string;
  memberStatus: MemberStatusFilter;
  contribution: ContributionFilter;
}

export default function MonthlyCollectionOverview({
  search,
  memberStatus,
  contribution,
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

  const columns = useMemo<ColumnDef<CollectionOverviewRow>[]>(
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

    ...MONTHS.map(({ month, label }) => ({
      id: `month-${month}`,
      header: label,
      cell: ({ row }: { row: { original: CollectionOverviewRow } }) => {
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
    })),

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

const table = useReactTable({
  data: filteredRows,
  columns,
  getCoreRowModel: getCoreRowModel(),
});

  return (
    <section className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <h2 className="text-base font-semibold text-[#102744]">
        Monthly Collection Ledger
      </h2>

      {isLoading ? (
        <p className="mt-4 text-sm text-[#64748B]">
          Loading collection data...
        </p>
      ) : isError ? (
        <p className="mt-4 text-sm text-red-600">
          {error instanceof Error
            ? error.message
            : "Unable to load collection data."}
        </p>
      ) : (
        <p className="mt-4 text-sm text-[#64748B]">
          Showing {filteredRows.length} of {overview?.totalMembers ?? 0}{" "}
          members.
        </p>
      )}
    </section>
  );
}
