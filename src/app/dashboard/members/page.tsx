"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useMembers } from "@/hooks/members/use-members";
import { useUpdateMemberStatus } from "@/hooks/members/use-update-member-status";
import type { Member } from "@/types/member";
import { useLanguage } from "../components/admin-profile-context";
import { useCollections } from "@/hooks/collections/useCollections";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ContributionFilter = "All" | "Contributors" | "NonContributors";

function getWhatsAppUrl(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");
  const internationalNumber = digits.length === 10 ? `91${digits}` : digits;

  return `https://wa.me/${internationalNumber}`;
}

export default function MembersPage() {
  const { t, language } = useLanguage();
  const locale = language === "hi" ? "hi-IN" : "en-IN";
  const searchParams = useSearchParams();
  const [contributionFilter, setContributionFilter] =
    useState<ContributionFilter>("All");

  const {
    data: collections = [],
    isLoading: isCollectionsLoading,
    isError: isCollectionsError,
  } = useCollections();

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

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const contributingMemberIds = useMemo(() => {
    return new Set(
      collections
        .filter((collection) => {
          const [year, month] = collection.donationDate.split("-").map(Number);

          return (
            year === currentYear &&
            month === currentMonth &&
            collection.recordStatus === "Active" &&
            collection.amount > 0
          );
        })
        .map((collection) => collection.memberId),
    );
  }, [collections, currentMonth, currentYear]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.fullName.toLowerCase().includes(search.toLowerCase()) ||
        member.phoneNumber.includes(search);

      const matchesStatus =
        statusFilter === "All" || member.status === statusFilter;

      const hasContributed = contributingMemberIds.has(member.memberId);

      const matchesContribution =
        contributionFilter === "All" ||
        (contributionFilter === "Contributors" && hasContributed) ||
        (contributionFilter === "NonContributors" && !hasContributed);

      return matchesSearch && matchesStatus && matchesContribution;
    });
  }, [
    members,
    search,
    statusFilter,
    contributionFilter,
    contributingMemberIds,
  ]);

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
    <section className="space-y-6 md:space-y-7">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-[#102744]">
            {t("members.title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#64748B]">
            {t("members.manageDescription")}
          </p>
        </div>

        <Link
          href="/dashboard/members/new"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#102744] px-4 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#17365D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D] focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          {t("members.add")}
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-5"
          >
            <p className="text-sm font-medium text-[#64748B]">{card.title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[#102744]">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-[#94A3B8]">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Members listing */}
      <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="border-b border-[#E2E8F0] p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#102744]">
                {t("members.allMembers")}
              </h2>
              <p className="mt-1 text-xs text-[#64748B]">
                {t("members.viewManage")}
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(180px,1fr)_minmax(140px,auto)] md:grid-cols-[minmax(220px,1fr)_minmax(150px,auto)_minmax(220px,auto)] xl:w-auto xl:flex-1 xl:justify-end">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("members.search")}
                aria-label={t("members.search")}
                className="h-10 min-w-0 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none placeholder:text-[#94A3B8] focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label={t("members.allStatusFilter")}
                className="h-10 min-w-0 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10"
              >
                <option value="All">{t("members.allStatusFilter")}</option>
                <option value="Active">{t("members.active")}</option>
                <option value="Inactive">{t("members.inactive")}</option>
              </select>
              <select
                value={contributionFilter}
                onChange={(event) =>
                  setContributionFilter(
                    event.target.value as ContributionFilter,
                  )
                }
                aria-label={t("members.filterContribution")}
                className="h-10 min-w-0 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10"
              >
                <option value="All">
                  {t("members.allContributionFilter")}
                </option>
                <option value="Contributors">
                  {t("members.contributorsThisMonth")}
                </option>
                <option value="NonContributors">
                  {t("members.nonContributorsThisMonth")}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wide text-[#64748B]">
              <tr>
                <th className="px-5 py-4 font-medium">
                  {t("members.serialNumber")}
                </th>
                <th className="px-5 py-4 font-medium">{t("members.name")}</th>
                <th className="px-5 py-4 font-medium">{t("members.phone")}</th>
                <th className="px-5 py-4 font-medium">
                  {t("members.address")}
                </th>
                <th className="px-5 py-4 font-medium">
                  {t("members.joinedDate")}
                </th>
                <th className="px-5 py-4 font-medium">{t("members.status")}</th>
                <th className="px-5 py-4 text-right font-medium">
                  {t("members.actions")}
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ||
              (contributionFilter !== "All" && isCollectionsLoading) ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-[#64748B]"
                  >
                    {t("members.loadingMembers")}
                  </td>
                </tr>
              ) : isError ||
                (contributionFilter !== "All" && isCollectionsError) ? (
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
                    className="border-t border-[#E2E8F0] transition-colors duration-200 hover:bg-[#F8FAFC]"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-[#64748B]">
                      {member.serialNo}
                    </td>
                    <td className="min-w-44 px-5 py-4">
                      <Link
                        href={`/dashboard/members/${encodeURIComponent(member.memberId)}`}
                        className="font-medium text-[#172B4D] hover:text-[#17365D] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D]"
                      >
                        {member.fullName}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-[#475569]">
                      {member.phoneNumber}
                    </td>
                    <td className="max-w-56 px-5 py-4 text-[#475569]">
                      {member.address || "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-[#475569]">
                      {member.joiningDate}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          member.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15"
                            : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/15"
                        }`}
                      >
                        {member.status === "Active"
                          ? t("members.active")
                          : t("members.inactive")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        {!contributingMemberIds.has(member.memberId) && (
                          <a
                            href={getWhatsAppUrl(member.phoneNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t("members.messageOnWhatsApp").replace(
                              "{name}",
                              member.fullName,
                            )}
                            title={t("members.messageOnWhatsApp").replace(
                              "{name}",
                              member.fullName,
                            )}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-emerald-700 transition-colors duration-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-5 w-5"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.52 0 .18 5.34.18 11.9c0 2.1.55 4.16 1.6 5.97L.08 24l6.27-1.64a11.9 11.9 0 0 0 5.72 1.46h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.46-8.44ZM12.08 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.97.99-3.63-.24-.37a9.87 9.87 0 0 1-1.52-5.28c0-5.46 4.44-9.9 9.9-9.9 2.65 0 5.14 1.03 7.01 2.9a9.84 9.84 0 0 1 2.89 7c0 5.46-4.44 9.9-9.91 9.9Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z" />
                            </svg>
                            WhatsApp
                          </a>
                        )}
                        <Link
                          href={`/dashboard/members/${encodeURIComponent(member.memberId)}/edit`}
                          className="inline-flex h-8 items-center rounded-md px-2 text-sm font-medium text-[#17365D] transition-colors duration-200 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D]"
                        >
                          {t("members.editAction")}
                        </Link>

                        <button
                          type="button"
                          disabled={updateStatusMutation.isPending}
                          onClick={() => openStatusDialog(member)}
                          className={`inline-flex h-8 items-center rounded-md px-2 text-sm font-medium transition-colors duration-200 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D] disabled:opacity-50 ${
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
          {isLoading ||
          (contributionFilter !== "All" && isCollectionsLoading) ? (
            <p className="px-5 py-14 text-center text-sm text-[#64748B]">
              {t("members.loadingMembers")}
            </p>
          ) : isError ||
            (contributionFilter !== "All" && isCollectionsError) ? (
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
                className="relative isolate border-b border-[#E2E8F0] p-4 last:border-b-0 sm:p-5"
              >
                {/* Full card navigation */}
                <Link
                  href={`/dashboard/members/${encodeURIComponent(member.memberId)}`}
                  aria-label={t("members.viewDetails").replace(
                    "{name}",
                    member.fullName,
                  )}
                  className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#17365D]"
                />

                {/* Member information */}
                <div className="pointer-events-none relative z-0 space-y-3">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-base font-semibold leading-6 text-[#172B4D]">
                        {member.fullName}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-[#64748B]">
                        {t("members.serialNumber")} {member.serialNo}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        member.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15"
                          : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/15"
                      }`}
                    >
                      {member.status === "Active"
                        ? t("members.active")
                        : t("members.inactive")}
                    </span>
                  </div>

                  <p className="break-words text-sm text-[#475569]">
                    {member.phoneNumber}
                  </p>

                  <p className="break-words text-sm leading-5 text-[#64748B]">
                    {member.address || t("members.noAddress")}
                  </p>
                </div>

                {/* Independent actions */}
                <div className="relative z-10 flex flex-wrap items-center justify-end gap-2 border-t border-[#E2E8F0] pt-3">
                  {!contributingMemberIds.has(member.memberId) && (
                    <a
                      href={getWhatsAppUrl(member.phoneNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("members.messageOnWhatsApp").replace(
                        "{name}",
                        member.fullName,
                      )}
                      title={t("members.messageOnWhatsApp").replace(
                        "{name}",
                        member.fullName,
                      )}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-emerald-700 transition-colors duration-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.52 0 .18 5.34.18 11.9c0 2.1.55 4.16 1.6 5.97L.08 24l6.27-1.64a11.9 11.9 0 0 0 5.72 1.46h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.46-8.44ZM12.08 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.97.99-3.63-.24-.37a9.87 9.87 0 0 1-1.52-5.28c0-5.46 4.44-9.9 9.9-9.9 2.65 0 5.14 1.03 7.01 2.9a9.84 9.84 0 0 1 2.89 7c0 5.46-4.44 9.9-9.91 9.9Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z" />
                      </svg>
                    </a>
                  )}
                  <Link
                    href={`/dashboard/members/${encodeURIComponent(member.memberId)}/edit`}
                    className="inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium text-[#17365D] transition-colors duration-200 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D]"
                  >
                    {t("members.editAction")}
                  </Link>

                  <button
                    type="button"
                    disabled={updateStatusMutation.isPending}
                    onClick={() => openStatusDialog(member)}
                    className={`inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium transition-colors duration-200 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D] disabled:opacity-50 ${
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
              </div>
            ))
          )}
        </div>

        {/* Pagination placeholder */}
        <div className="flex flex-col items-start gap-1 border-t border-[#E2E8F0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-[#64748B]">
            {t("members.showing").replace(
              "{count}",
              filteredMembers.length.toLocaleString(locale),
            )}
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
                : (selectedMember?.status === "Active"
                    ? t("members.askDeactivate")
                    : t("members.askActivate")
                  ).replace("{name}", selectedMember?.fullName ?? "")}
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
