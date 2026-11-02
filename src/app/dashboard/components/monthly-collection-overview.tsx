"use client";

import { useMemo, useState } from "react";
import { flexRender } from "@tanstack/react-table";
import type { Collection } from "@/types/collection";
import {
  getCoreRowModel,
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import { useUpdateCollection } from "@/hooks/collections/useUpdateCollection";
import { useCancelCollection } from "@/hooks/collections/useCancelCollection";

import { useCollectionOverview } from "@/hooks/collections/useCollectionOverview";
import type { CollectionOverviewRow } from "@/types/collection-overview";

import type {
  MemberStatusFilter,
  ContributionFilter,
} from "../collections/components/collection-filters";

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
}

export default function MonthlyCollectionOverview({
  search = "",
  memberStatus = "All",
  contribution = "All",
}: MonthlyCollectionOverviewProps) {
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth | null>(
    null,
  );
  const [editingDonationId, setEditingDonationId] = useState<string | null>(
    null,
  );

  const [editForm, setEditForm] = useState<{
    amount: string;
    donationDate: string;
    note: string;
  } | null>(null);

  const updateCollectionMutation = useUpdateCollection();
  const cancelCollectionMutation = useCancelCollection();

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
              <button
                type="button"
                onClick={() =>
                  setSelectedMonth({
                    memberName: row.original.member.fullName,
                    memberId: row.original.member.memberId,
                    monthLabel: label,
                    donations: monthData?.donations ?? [],
                  })
                }
                className={`rounded-md px-2 py-1 transition-colors hover:bg-[#EAF0F7] hover:text-[#102744] ${
                  monthData?.total
                    ? "font-medium text-[#17365D]"
                    : "text-[#94A3B8]"
                }`}
                aria-label={`View ${label} donations for ${row.original.member.fullName}`}
              >
                {monthData?.total ? formatCurrency(monthData.total) : "—"}
              </button>
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
      {/* Section heading */}
      <h2 className="text-base font-semibold text-[#102744]">
        Monthly Collection Ledger
      </h2>

      <p className="mt-1 text-xs text-[#64748B]">
        Showing {filteredRows.length} of {overview?.totalMembers ?? 0} members
      </p>

      {/* Loading state */}
      {isLoading && (
        <p className="py-12 text-center text-sm text-[#64748B]">
          Loading collection data...
        </p>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <p className="py-12 text-center text-sm text-red-600">
          {error instanceof Error
            ? error.message
            : "Unable to load collection data."}
        </p>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filteredRows.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm font-medium text-[#172B4D]">No members found</p>
          <p className="mt-1 text-xs text-[#64748B]">
            Try changing your search or filters.
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
                          ? "Contributor"
                          : "No Contribution"}
                      </span>
                    </div>

                    {/* Annual total and expand button */}
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#64748B]">Annual Total</p>

                        <p className="mt-1 text-lg font-semibold text-[#102744]">
                          {formatCurrency(row.annualTotal)}
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
                        {isExpanded ? "Hide details" : "Monthly details"}

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
                        {MONTHS.map(({ month, label }) => {
                          const monthData = row.months.find(
                            (item) => item.month === month,
                          );

                          return (
                            <button
                              key={month}
                              type="button"
                              onClick={() =>
                                setSelectedMonth({
                                  memberName: row.member.fullName,
                                  memberId: row.member.memberId,
                                  monthLabel: label,
                                  donations: monthData?.donations ?? [],
                                })
                              }
                              className="w-full rounded-lg border border-[#E2E8F0] bg-white p-2.5 text-left transition-colors hover:border-[#17365D] hover:bg-[#F8FAFC]"
                            >
                              <p className="text-xs text-[#64748B]">{label}</p>

                              <p className="mt-1 text-sm font-semibold text-[#172B4D]">
                                {monthData?.total
                                  ? formatCurrency(monthData.total)
                                  : "—"}
                              </p>
                            </button>
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
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close donation details"
            onClick={() => setSelectedMonth(null)}
            className="fixed inset-0 z-40 bg-[#102744]/40"
          />

          {/* Responsive donation panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="donation-panel-title"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl md:inset-y-0 md:left-auto md:right-0 md:w-[440px] md:max-h-none md:rounded-none"
          >
            {/* Panel header */}
            <div className="sticky top-0 z-10 border-b border-[#E2E8F0] bg-white px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="donation-panel-title"
                    className="text-lg font-semibold text-[#102744]"
                  >
                    Donation Details
                  </h2>
                  <p className="mt-1 text-sm text-[#64748B]">
                    {selectedMonth.memberName}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {selectedMonth.monthLabel}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMonth(null)}
                  className="rounded-lg p-2 text-[#64748B] hover:bg-[#F5F7FA]"
                  aria-label="Close panel"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Donation summary */}
            <div className="p-5">
              <div className="rounded-xl bg-[#F5F7FA] p-4">
                <p className="text-xs text-[#64748B]">
                  Active collection total
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#102744]">
                  {formatCurrency(
                    selectedMonth.donations
                      .filter((donation) => donation.recordStatus === "Active")
                      .reduce((total, donation) => total + donation.amount, 0),
                  )}
                </p>
                <p className="mt-1 text-xs text-[#64748B]">
                  {
                    selectedMonth.donations.filter(
                      (donation) => donation.recordStatus === "Active",
                    ).length
                  }{" "}
                  active donation(s)
                </p>
              </div>

              {/* Donation history */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[#172B4D]">
                  Donation History
                </h3>

                {selectedMonth.donations.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm font-medium text-[#172B4D]">
                      No donation records
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      No donations were recorded for this month.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    {selectedMonth.donations.map((donation) => {
                      const isCancelled = donation.recordStatus === "Cancelled";

                      return (
                        <div
                          key={donation.collectionId}
                          className={`rounded-xl border p-4 ${
                            isCancelled
                              ? "border-[#E2E8F0] bg-[#F8FAFC] opacity-75"
                              : "border-[#E2E8F0] bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-[#102744]">
                                {formatCurrency(donation.amount)}
                              </p>
                              <p className="mt-1 text-xs text-[#64748B]">
                                {donation.donationDate}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                                isCancelled
                                  ? "bg-[#FEE2E2] text-[#991B1B]"
                                  : "bg-[#DCFCE7] text-[#166534]"
                              }`}
                            >
                              {donation.recordStatus}
                            </span>
                          </div>
                          {!isCancelled && (
                            <div className="mt-3 flex justify-end">
                              <button
                                type="button"
                                disabled={
                                  updateCollectionMutation.isPending ||
                                  cancelCollectionMutation.isPending
                                }
                                onClick={() => {
                                  setEditingDonationId(donation.collectionId);
                                  setEditForm({
                                    amount: String(donation.amount),
                                    donationDate: donation.donationDate,
                                    note: donation.note ?? "",
                                  });
                                }}
                                className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#17365D] hover:bg-[#F5F7FA]"
                              >
                                Edit
                              </button>
                            </div>
                          )}

                          {!isCancelled && (
                            <div className="mt-2 flex justify-end">
                              <button
                                type="button"
                                disabled={
                                  cancelCollectionMutation.isPending ||
                                  updateCollectionMutation.isPending
                                }
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    "Are you sure you want to cancel this donation? This action cannot be undone.",
                                  );

                                  if (!confirmed) return;

                                  cancelCollectionMutation.mutate(
                                    donation.collectionId,
                                    {
                                      onSuccess: (cancelledDonation) => {
                                        setSelectedMonth((current) =>
                                          current
                                            ? {
                                                ...current,
                                                donations:
                                                  current.donations.map(
                                                    (item) =>
                                                      item.collectionId ===
                                                      cancelledDonation.collectionId
                                                        ? cancelledDonation
                                                        : item,
                                                  ),
                                              }
                                            : current,
                                        );

                                        setEditingDonationId(null);
                                        setEditForm(null);
                                      },
                                    },
                                  );
                                }}
                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                Cancel Donation
                              </button>
                            </div>
                          )}

                          {cancelCollectionMutation.isError && (
                            <p className="mt-2 text-right text-xs text-red-600">
                              {cancelCollectionMutation.error.message}
                            </p>
                          )}

                          {editingDonationId === donation.collectionId &&
                            editForm && (
                              <form
                                onSubmit={(event) => {
                                  event.preventDefault();

                                  updateCollectionMutation.mutate(
                                    {
                                      collectionId: donation.collectionId,
                                      input: {
                                        amount: Number(editForm.amount),
                                        donationDate: editForm.donationDate,
                                        note: editForm.note,
                                      },
                                    },
                                    {
                                      onSuccess: () => {
                                        setSelectedMonth(null);
                                        setEditingDonationId(null);
                                        setEditForm(null);
                                        updateCollectionMutation.reset();
                                      },
                                    },
                                  );
                                }}
                                className="mt-4 space-y-3 rounded-lg bg-[#F8FAFC] p-3"
                              >
                                <div>
                                  <label className="text-xs font-medium text-[#64748B]">
                                    Amount (₹)
                                  </label>
                                  <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    required
                                    value={editForm.amount}
                                    onChange={(event) =>
                                      setEditForm({
                                        ...editForm,
                                        amount: event.target.value,
                                      })
                                    }
                                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm outline-none focus:border-[#17365D]"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-[#64748B]">
                                    Donation Date
                                  </label>
                                  <input
                                    type="date"
                                    required
                                    value={editForm.donationDate}
                                    onChange={(event) =>
                                      setEditForm({
                                        ...editForm,
                                        donationDate: event.target.value,
                                      })
                                    }
                                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm outline-none focus:border-[#17365D]"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-[#64748B]">
                                    Note
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={editForm.note}
                                    onChange={(event) =>
                                      setEditForm({
                                        ...editForm,
                                        note: event.target.value,
                                      })
                                    }
                                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm outline-none focus:border-[#17365D]"
                                  />
                                </div>

                                {updateCollectionMutation.isError && (
                                  <p className="text-xs text-red-600">
                                    {updateCollectionMutation.error.message}
                                  </p>
                                )}

                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    disabled={
                                      cancelCollectionMutation.isPending ||
                                      updateCollectionMutation.isPending
                                    }
                                    onClick={() => {
                                      setEditingDonationId(null);
                                      setEditForm(null);
                                      updateCollectionMutation.reset();
                                    }}
                                    className="rounded-lg px-3 py-2 text-xs font-medium text-[#64748B] hover:bg-[#E2E8F0]"
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    type="submit"
                                    disabled={
                                      updateCollectionMutation.isPending ||
                                      !editForm.amount ||
                                      Number(editForm.amount) <= 0 ||
                                      !editForm.donationDate
                                    }
                                    className="rounded-lg bg-[#102744] px-4 py-2 text-xs font-medium text-white hover:bg-[#17365D] disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {updateCollectionMutation.isPending
                                      ? "Saving..."
                                      : "Save Changes"}
                                  </button>
                                </div>
                              </form>
                            )}
                          {donation.note &&
                            editingDonationId !== donation.collectionId && (
                              <p className="mt-3 border-t border-[#E2E8F0] pt-3 text-xs text-[#64748B]">
                                {donation.note}
                              </p>
                            )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
