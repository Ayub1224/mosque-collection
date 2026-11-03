"use client";

import { useEffect, useState } from "react";
import { Search, X, UserRound, Loader2, AlertCircle, Plus } from "lucide-react";

import { useMembers } from "@/hooks/members/use-members";
import type { Member } from "@/types/member";
import { useRouter } from "next/navigation";

interface AddCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMember: (member: Member) => void;
  initialMemberId?: string | null;
}

export default function AddCollectionDialog({
  open,
  onOpenChange,
  onSelectMember,
  initialMemberId,
}: AddCollectionDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const router = useRouter();

  const {
    data: members = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useMembers();

  useEffect(() => {
    if (!open) return;

    setSearch("");
    setSelectedMember(null);
  }, [open]);

  useEffect(() => {
    if (!open || !initialMemberId || isLoading) return;

    const member = members.find((item) => item.memberId === initialMemberId);

    if (member) {
      setSelectedMember(member);
    }
  }, [open, initialMemberId, members, isLoading]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onOpenChange]);

  const filteredMembers = members.filter((member) => {
    const query = search.trim().toLowerCase();

    return (
      member.fullName.toLowerCase().includes(query) ||
      member.phoneNumber.includes(query)
    );
  });

  const handleContinue = () => {
    if (!selectedMember) return;

    onSelectMember(selectedMember);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#102744]/40 p-3 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-collection-title"
        className="flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E2E8F0] px-5 py-5 sm:px-6">
          <div>
            <h2
              id="add-collection-title"
              className="text-lg font-semibold text-[#102744]"
            >
              Add Collection
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Search and select a member to record a donation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-[#64748B] transition hover:bg-[#F5F7FA] hover:text-[#102744]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-[#E2E8F0] px-5 py-4 sm:px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelectedMember(null);
              }}
              placeholder="Search by member name or phone number..."
              aria-label="Search members"
              autoFocus
              className="h-11 w-full rounded-lg border border-[#E2E8F0] bg-white pl-10 pr-4 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10"
            />
          </div>

          <p className="mt-2 text-xs text-[#94A3B8]">
            {members.length} registered members
          </p>
        </div>

        {/* Member list */}
        <div className="min-h-[220px] flex-1 overflow-y-auto p-3 sm:p-4">
          {isLoading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-[#17365D]" />
              <p className="text-sm text-[#64748B]">Loading members...</p>
            </div>
          ) : isError ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
              <AlertCircle className="h-8 w-8 text-red-500" />

              <p className="mt-3 text-sm font-medium text-[#172B4D]">
                Unable to load members
              </p>

              <p className="mt-1 text-xs text-[#64748B]">
                {error instanceof Error
                  ? error.message
                  : "Something went wrong."}
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 text-sm font-medium text-[#17365D] hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F7FA]">
                <UserRound className="h-6 w-6 text-[#94A3B8]" />
              </div>

              <p className="mt-3 text-sm font-medium text-[#172B4D]">
                {search ? "No members found" : "No registered members"}
              </p>

              <p className="mt-1 text-xs text-[#64748B]">
                {search
                  ? "Try searching with a different name or phone number."
                  : "Register a member before recording a collection."}
              </p>

              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  router.push("/dashboard/members/new?returnTo=collection");
                }}
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#102744] px-4 text-sm font-medium text-white transition hover:bg-[#17365D]"
              >
                <Plus size={16} />
                Add New Member
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembers.map((member) => {
                const isSelected = selectedMember?.memberId === member.memberId;

                return (
                  <button
                    key={member.memberId}
                    type="button"
                    onClick={() => setSelectedMember(member)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? "border-[#17365D] bg-[#F0F4F9] ring-1 ring-[#17365D]/10"
                        : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8EEF5] text-sm font-semibold text-[#17365D]">
                      {member.fullName
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#172B4D]">
                        {member.fullName}
                      </p>

                      <p className="mt-1 text-xs text-[#64748B]">
                        {member.phoneNumber}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                          member.status === "Active"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {member.status}
                      </span>

                      {isSelected && (
                        <span className="text-[10px] font-semibold text-[#17365D]">
                          Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-lg border border-[#E2E8F0] bg-white px-5 text-sm font-medium text-[#17365D] transition hover:bg-[#F5F7FA]"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!selectedMember}
            onClick={handleContinue}
            className="h-10 rounded-lg bg-[#102744] px-5 text-sm font-medium text-white transition hover:bg-[#17365D] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
