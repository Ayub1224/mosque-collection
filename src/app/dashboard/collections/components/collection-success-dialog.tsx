
"use client";

import { Check, Plus } from "lucide-react";
import type { Collection } from "@/types/collection";
import type { Member } from "@/types/member";

interface CollectionSuccessDialogProps {
  collection: Collection;
  member: Member;
  onAddAnother: () => void;
  onDone: () => void;
}

export default function CollectionSuccessDialog({
  collection,
  member,
  onAddAnother,
  onDone,
}: CollectionSuccessDialogProps) {
  const formattedDate = new Date(
    `${collection.donationDate}T00:00:00`,
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#102744]/45 p-3 backdrop-blur-sm sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-success-title"
        className="flex max-h-[90vh] w-full max-w-[540px] flex-col overflow-y-auto rounded-xl bg-white shadow-2xl"
      >
        {/* Success heading */}
        <div className="flex flex-col items-center px-6 pb-5 pt-7 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
              <Check size={26} className="text-green-700" strokeWidth={3} />
            </div>
          </div>

          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-green-700">
            Collection Confirmed
          </p>

          <h2
            id="collection-success-title"
            className="text-xl font-semibold tracking-tight text-[#102744]"
          >
            Collection Recorded Successfully
          </h2>

          <p className="mt-2 max-w-sm text-sm text-[#64748B]">
            The contribution has been saved successfully.
          </p>
        </div>

        {/* Collection receipt details */}
        <div className="mx-5 mb-5 rounded-xl bg-[#F5F7FA] p-4 sm:mx-6 sm:p-5">
          {/* Reference */}
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
                Receipt Reference
              </p>

              <p className="mt-1 break-all font-mono text-sm font-semibold text-[#102744]">
                {collection.collectionId}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-medium text-green-700">
              Recorded
            </span>
          </div>

          {/* Amount */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-sm text-[#64748B]">
              Contribution Amount
            </span>

            <span className="text-2xl font-bold tracking-tight text-[#102744]">
              ₹{collection.amount.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Member and collection information */}
          <div className="space-y-3 rounded-lg bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm text-[#64748B]">Member</span>

              <div className="text-right">
                <p className="text-sm font-semibold text-[#172B4D]">
                  {member.fullName}
                </p>
                <p className="mt-0.5 text-xs text-[#64748B]">
                  {member.phoneNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-[#64748B]">Category</span>
              <span className="rounded-full bg-[#F5F7FA] px-2.5 py-1 text-xs font-medium text-[#17365D]">
                Regular Donation
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-[#64748B]">Date Received</span>
              <span className="text-sm font-medium text-[#172B4D]">
                {formattedDate}
              </span>
            </div>

            {collection.note && (
              <div className="flex items-start justify-between gap-3 border-t border-[#E2E8F0] pt-3">
                <span className="text-sm text-[#64748B]">Note</span>
                <span className="max-w-[65%] text-right text-sm italic text-[#172B4D]">
                  {collection.note}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-[#E2E8F0] px-5 py-4 sm:flex-row sm:px-6">
          <button
            type="button"
            onClick={onAddAnother}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#102744] px-4 text-sm font-semibold text-white transition hover:bg-[#17365D]"
          >
            <Plus size={17} />
            Add Another Collection
          </button>

          <button
            type="button"
            onClick={onDone}
            className="h-11 rounded-lg border border-[#E2E8F0] bg-white px-6 text-sm font-medium text-[#17365D] transition hover:bg-[#F5F7FA]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
