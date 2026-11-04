"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useMembers } from "@/hooks/members/use-members";
import { useUpdateMemberStatus } from "@/hooks/members/use-update-member-status";
import type { Member } from "@/types/member";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MembersPage() {
  const searchParams = useSearchParams();

  const statusFromUrl = searchParams.get("status");

  const initialStatus =
    statusFromUrl === "Active" || statusFromUrl === "Inactive"
      ? statusFromUrl
      : "All";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [statusFeedback, setStatusFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { data: members = [], isLoading, isError, error } = useMembers();

  const updateStatusMutation = useUpdateMemberStatus();

  const openStatusDialog = (member: Member) => {
    setSelectedMember(member);
    setStatusFeedback(null);
  };

  const closeStatusDialog = () => {
    if (updateStatusMutation.isPending) return;

    setSelectedMember(null);
    setStatusFeedback(null);
  };

  const handleStatusChange = async () => {
    if (!selectedMember) return;

    const nextStatus =
      selectedMember.status === "Active" ? "Inactive" : "Active";

    try {
      const message = await updateStatusMutation.mutateAsync({
        memberId: selectedMember.memberId,
        status: nextStatus,
      });

      setStatusFeedback({
        type: "success",
        message,
      });
    } catch (error) {
      setStatusFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update member status.",
      });
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.fullName.toLowerCase().includes(search.toLowerCase()) ||
        member.phoneNumber.includes(search);

      const matchesStatus =
        statusFilter === "All" || member.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [members, search, statusFilter]);

  const summaryCards = [
    {
      title: "Total Members",
      value: members.length,
      description: "All registered members",
    },
    {
      title: "Active Members",
      value: members.filter((member) => member.status === "Active").length,
      description: "Currently active",
    },
    {
      title: "Inactive Members",
      value: members.filter((member) => member.status === "Inactive").length,
      description: "Currently inactive",
    },
  ];
  return (
    <section className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#102744]">Members</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage mosque members and their information.
          </p>
        </div>

        <Link
          href="/dashboard/members/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#102744] px-4 text-sm font-medium text-white transition hover:bg-[#17365D]"
        >
          + Add Member
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-[#64748B]">{card.title}</p>
            <p className="mt-3 text-2xl font-semibold text-[#102744]">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-[#94A3B8]">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Members listing */}
      <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="border-b border-[#E2E8F0] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#102744]">
                All Members
              </h2>
              <p className="mt-1 text-xs text-[#64748B]">
                View and manage registered members.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or phone..."
                aria-label="Search members by name or phone"
                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm outline-none placeholder:text-[#94A3B8] focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 sm:w-64"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter members by status"
                className="h-10 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none focus:border-[#17365D] sm:w-36"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-xs text-[#64748B]">
              <tr>
                <th className="px-5 py-4 font-medium">Member ID</th>
                <th className="px-5 py-4 font-medium">Name</th>
                <th className="px-5 py-4 font-medium">Phone</th>
                <th className="px-5 py-4 font-medium">Address</th>
                <th className="px-5 py-4 font-medium">Joined Date</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-[#64748B]"
                  >
                    Loading members...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-red-600"
                  >
                    {error instanceof Error
                      ? error.message
                      : "Unable to load members."}
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <p className="text-sm font-medium text-[#172B4D]">
                      No members found
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Try changing your search or register a new member.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.memberId}
                    className="border-t border-[#E2E8F0]"
                  >
                    <td className="px-5 py-4">{member.memberId}</td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/members/${encodeURIComponent(member.memberId)}`}
                        className="font-medium text-[#172B4D] hover:text-[#17365D] hover:underline"
                      >
                        {member.fullName}
                      </Link>
                    </td>
                    <td className="px-5 py-4">{member.phoneNumber}</td>
                    <td className="px-5 py-4">{member.address || "—"}</td>
                    <td className="px-5 py-4">{member.joiningDate}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          member.status === "Active"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/dashboard/members/${encodeURIComponent(member.memberId)}/edit`}
                          className="text-sm font-medium text-[#17365D] hover:underline"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          disabled={updateStatusMutation.isPending}
                          onClick={() => openStatusDialog(member)}
                          className={`text-sm font-medium hover:underline disabled:opacity-50 ${
                            member.status === "Active"
                              ? "text-red-600"
                              : "text-green-700"
                          }`}
                        >
                          {member.status === "Active"
                            ? "Deactivate"
                            : "Make Active"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

    
        {/* Mobile cards */}
        <div className="divide-y divide-[#E2E8F0] md:hidden">
          {isLoading ? (
            <p className="px-5 py-14 text-center text-sm text-[#64748B]">
              Loading members...
            </p>
          ) : isError ? (
            <p className="px-5 py-14 text-center text-sm text-red-600">
              Unable to load members.
            </p>
          ) : filteredMembers.length === 0 ? (
            <p className="px-5 py-14 text-center text-sm text-[#64748B]">
              No members found.
            </p>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.memberId}
                className="relative isolate space-y-2 p-5"
              >
                {/* Full card navigation */}
                <Link
                  href={`/dashboard/members/${encodeURIComponent(member.memberId)}`}
                  aria-label={`View details for ${member.fullName}`}
                  className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#17365D]"
                />

                {/* Member information */}
                <div className="pointer-events-none relative z-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#172B4D]">
                      {member.fullName}
                    </p>

                    <span className="text-xs text-[#64748B]">
                      {member.status}
                    </span>
                  </div>

                  <p className="text-sm text-[#64748B]">{member.phoneNumber}</p>

                  <p className="text-sm text-[#64748B]">
                    {member.address || "No address"}
                  </p>

                  <p className="text-xs text-[#94A3B8]">
                    ID: {member.memberId}
                  </p>
                </div>

                {/* Independent actions */}
                <div className="relative z-10 flex items-center justify-end gap-4 pt-2">
                  <Link
                    href={`/dashboard/members/${encodeURIComponent(member.memberId)}/edit`}
                    className="text-sm font-medium text-[#17365D] hover:underline"
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    disabled={updateStatusMutation.isPending}
                    onClick={() => openStatusDialog(member)}
                    className={`text-sm font-medium hover:underline disabled:opacity-50 ${
                      member.status === "Active"
                        ? "text-red-600"
                        : "text-green-700"
                    }`}
                  >
                    {member.status === "Active" ? "Deactivate" : "Make Active"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination placeholder */}
        <div className="flex items-center justify-between border-t border-[#E2E8F0] px-4 py-3 sm:px-5">
          <p className="text-xs text-[#64748B]">
            Showing {filteredMembers.length} members
          </p>
          <p className="text-xs text-[#94A3B8]">
            Pagination will be enabled when member data is connected.
          </p>
        </div>
      </div>
      <AlertDialog
        open={Boolean(selectedMember)}
        onOpenChange={(open) => {
          if (!open) closeStatusDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusFeedback
                ? statusFeedback.type === "success"
                  ? "Status updated"
                  : "Unable to update status"
                : selectedMember?.status === "Active"
                  ? "Deactivate member?"
                  : "Activate member?"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {statusFeedback
                ? statusFeedback.message
                : `Are you sure you want to ${
                    selectedMember?.status === "Active"
                      ? "deactivate"
                      : "activate"
                  } ${selectedMember?.fullName}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            {statusFeedback?.type === "success" ? (
              <AlertDialogCancel
                onClick={closeStatusDialog}
                className="h-9 rounded-md px-5 font-sans text-sm font-medium"
              >
                Done
              </AlertDialogCancel>
            ) : (
              <>
                <AlertDialogCancel
                  disabled={updateStatusMutation.isPending}
                  className="h-9 rounded-md border border-slate-200 bg-white px-5 font-sans text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </AlertDialogCancel>

                <button
                  type="button"
                  disabled={updateStatusMutation.isPending}
                  onClick={handleStatusChange}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-[#102744] px-5 font-sans text-sm font-medium text-white shadow-sm transition-all hover:bg-[#17365D] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updateStatusMutation.isPending
                    ? "Updating..."
                    : statusFeedback?.type === "error"
                      ? "Try again"
                      : selectedMember?.status === "Active"
                        ? "Deactivate"
                        : "Make Active"}
                </button>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
