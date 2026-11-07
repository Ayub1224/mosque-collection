"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useMembers } from "@/hooks/members/use-members";
import { useUpdateMemberStatus } from "@/hooks/members/use-update-member-status";
import type { Member } from "@/types/member";
import { useLanguage } from "../components/admin-profile-context";

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
  const { t, language } = useLanguage();
  const locale = language === "hi" ? "hi-IN" : "en-IN";
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
      await updateStatusMutation.mutateAsync({
        memberId: selectedMember.memberId,
        status: nextStatus,
      });

      setStatusFeedback({
        type: "success",
        message: t("members.statusSuccess"),
      });
    } catch (error) {
      setStatusFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : t("notifications.updateError"),
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
      title: t("dashboard.totalMembers"),
      value: members.length,
      description: t("members.allRegistered"),
    },
    {
      title: t("dashboard.activeMembers"),
      value: members.filter((member) => member.status === "Active").length,
      description: t("members.currentlyActive"),
    },
    {
      title: t("members.inactive"),
      value: members.filter((member) => member.status === "Inactive").length,
      description: t("members.currentlyInactive"),
    },
  ];
  return (
    <section className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#102744]">{t("members.title")}</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            {t("members.manageDescription")}
          </p>
        </div>

        <Link
          href="/dashboard/members/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#102744] px-4 text-sm font-medium text-white transition hover:bg-[#17365D]"
        >
          {t("members.add")}
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
                {t("members.allMembers")}
              </h2>
              <p className="mt-1 text-xs text-[#64748B]">
                {t("members.viewManage")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("members.search")}
                aria-label={t("members.search")}
                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm outline-none placeholder:text-[#94A3B8] focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 sm:w-64"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label={t("members.allStatusFilter")}
                className="h-10 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none focus:border-[#17365D] sm:w-36"
              >
                <option value="All">{t("members.allStatusFilter")}</option>
                <option value="Active">{t("members.active")}</option>
                <option value="Inactive">{t("members.inactive")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-xs text-[#64748B]">
              <tr>
                <th className="px-5 py-4 font-medium">Serial No.</th>
                <th className="px-5 py-4 font-medium">{t("members.name")}</th>
                <th className="px-5 py-4 font-medium">{t("members.phone")}</th>
                <th className="px-5 py-4 font-medium">{t("members.address")}</th>
                <th className="px-5 py-4 font-medium">{t("members.joinedDate")}</th>
                <th className="px-5 py-4 font-medium">{t("members.status")}</th>
                <th className="px-5 py-4 text-right font-medium">{t("members.actions")}</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-[#64748B]"
                  >
                    {t("members.loadingMembers")}
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-red-600"
                  >
                    {error instanceof Error
                      ? error.message
                      : t("members.loadError")}
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <p className="text-sm font-medium text-[#172B4D]">
                      {t("members.noResults")}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {t("members.tryAgain")}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.memberId}
                    className="border-t border-[#E2E8F0]"
                  >
                    <td className="px-5 py-4">{member.serialNo}</td>
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
                        {member.status === "Active" ? t("members.active") : t("members.inactive")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/dashboard/members/${encodeURIComponent(member.memberId)}/edit`}
                          className="text-sm font-medium text-[#17365D] hover:underline"
                        >
                          {t("members.editAction")}
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
                            ? t("members.deactivate")
                            : t("members.activate")}
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
              {t("members.loadingMembers")}
            </p>
          ) : isError ? (
            <p className="px-5 py-14 text-center text-sm text-red-600">
              {t("members.loadError")}
            </p>
          ) : filteredMembers.length === 0 ? (
            <p className="px-5 py-14 text-center text-sm text-[#64748B]">
              {t("members.noResults")}
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
                    <span className="text-sm font-medium text-[#64748B]">Serial No. {member.serialNo}</span>

                    <span className="text-xs text-[#64748B]">
                      {member.status === "Active" ? t("members.active") : t("members.inactive")}
                    </span>
                  </div>

                  <p className="text-sm text-[#64748B]">{member.phoneNumber}</p>

                  <p className="text-sm text-[#64748B]">
                    {member.address || t("members.noAddress")}
                  </p>

                </div>

                {/* Independent actions */}
                <div className="relative z-10 flex items-center justify-end gap-4 pt-2">
                  <Link
                    href={`/dashboard/members/${encodeURIComponent(member.memberId)}/edit`}
                    className="text-sm font-medium text-[#17365D] hover:underline"
                  >
                    {t("members.editAction")}
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
                    {member.status === "Active" ? t("members.deactivate") : t("members.activate")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination placeholder */}
        <div className="flex items-center justify-between border-t border-[#E2E8F0] px-4 py-3 sm:px-5">
          <p className="text-xs text-[#64748B]">
            {t("members.showing").replace("{count}", filteredMembers.length.toLocaleString(locale))}
          </p>
          <p className="text-xs text-[#94A3B8]">
            {t("members.paginationPlaceholder")}
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
                  ? t("members.updated")
                  : t("members.unableUpdate")
                : selectedMember?.status === "Active"
                  ? t("members.deactivateQuestion")
                  : t("members.activateQuestion")}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {statusFeedback
                ? statusFeedback.message
                : (selectedMember?.status === "Active" ? t("members.askDeactivate") : t("members.askActivate")).replace("{name}", selectedMember?.fullName ?? "")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            {statusFeedback?.type === "success" ? (
              <AlertDialogCancel
                onClick={closeStatusDialog}
                className="h-9 rounded-md px-5 font-sans text-sm font-medium"
              >
                {t("members.done")}
              </AlertDialogCancel>
            ) : (
              <>
                <AlertDialogCancel
                  disabled={updateStatusMutation.isPending}
                  className="h-9 rounded-md border border-slate-200 bg-white px-5 font-sans text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  {t("members.cancel")}
                </AlertDialogCancel>

                <button
                  type="button"
                  disabled={updateStatusMutation.isPending}
                  onClick={handleStatusChange}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-[#102744] px-5 font-sans text-sm font-medium text-white shadow-sm transition-all hover:bg-[#17365D] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updateStatusMutation.isPending
                    ? t("members.updating")
                    : statusFeedback?.type === "error"
                      ? t("members.retryAction")
                      : selectedMember?.status === "Active"
                        ? t("members.deactivate")
                        : t("members.activate")}
                </button>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
