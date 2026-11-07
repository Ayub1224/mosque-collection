"use client";

import { useEffect, useState } from "react";

import type { Collection } from "@/types/collection";
import { useUpdateCollection } from "@/hooks/collections/useUpdateCollection";
import { useCancelCollection } from "@/hooks/collections/useCancelCollection";
import { useLanguage } from "./admin-profile-context";

interface DonationDetailsDrawerProps {
  memberName: string;
  monthLabel: string;
  donations: Collection[];
  onClose: () => void;
}

export default function DonationDetailsDrawer({
  memberName,
  monthLabel,
  donations: initialDonations,
  onClose,
}: DonationDetailsDrawerProps) {
  const { language } = useLanguage();

  const [donations, setDonations] = useState(initialDonations);
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

  useEffect(() => {
    setDonations(initialDonations);
  }, [initialDonations]);

  const formatLocalizedCurrency = (amount: number) =>
    new Intl.NumberFormat(language === "hi" ? "hi-IN" : "en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const closeDrawer = () => {
    setEditingDonationId(null);
    setEditForm(null);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close donation details"
        onClick={closeDrawer}
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

              <p className="mt-1 text-sm text-[#64748B]">{memberName}</p>

              <p className="text-xs text-[#64748B]">{monthLabel}</p>
            </div>

            <button
              type="button"
              onClick={closeDrawer}
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
            <p className="text-xs text-[#64748B]">Active collection total</p>

            <p className="mt-1 text-2xl font-semibold text-[#102744]">
              {formatLocalizedCurrency(
                donations
                  .filter((donation) => donation.recordStatus === "Active")
                  .reduce((total, donation) => total + donation.amount, 0),
              )}
            </p>

            <p className="mt-1 text-xs text-[#64748B]">
              {
                donations.filter(
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

            {cancelCollectionMutation.isError && (
              <p className="mt-2 text-right text-xs text-red-600">
                {cancelCollectionMutation.error.message}
              </p>
            )}

            {donations.length === 0 ? (
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
                {donations.map((donation) => {
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
                            {formatLocalizedCurrency(donation.amount)}
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
                                    setDonations((current) =>
                                      current.map((item) =>
                                        item.collectionId ===
                                        cancelledDonation.collectionId
                                          ? cancelledDonation
                                          : item,
                                      ),
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
                                    closeDrawer();
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
  );
}