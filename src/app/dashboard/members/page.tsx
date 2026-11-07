"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { useMembers } from "@/hooks/members/use-members";
import { useUpdateMemberStatus } from "@/hooks/members/use-update-member-status";
import type { Member } from "@/types/member";
import { useLanguage } from "../components/admin-profile-context";
import { useCollections } from "@/hooks/collections/useCollections";
import {
  type ContributionFilter,
  type StatusFilter,
} from "./components/members-toolbar";
import { MembersSummary } from "./components/members-summary";
import { MembersList } from "./components/members-list";

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
  const [contributionFilter, setContributionFilter] =
    useState<ContributionFilter>("All");

  const {
    data: collections = [],
    isLoading: isCollectionsLoading,
    isError: isCollectionsError,
    error: collectionsError,
  } = useCollections();

  const statusFromUrl = searchParams.get("status");

  const initialStatus =
    statusFromUrl === "Active" || statusFromUrl === "Inactive"
      ? statusFromUrl
      : "All";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);

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
      tone: "navy" as const,
    },
    {
      title: t("dashboard.activeMembers"),
      value: members.filter((member) => member.status === "Active").length,
      description: t("members.currentlyActive"),
      tone: "green" as const,
    },
    {
      title: t("members.inactive"),
      value: members.filter((member) => member.status === "Inactive").length,
      description: t("members.currentlyInactive"),
      tone: "slate" as const,
    },
  ];
  const isListingLoading =
    isLoading ||
    (contributionFilter !== "All" && isCollectionsLoading);
  const isListingError =
    isError || (contributionFilter !== "All" && isCollectionsError);
  const listingErrorMessage =
    isError && error instanceof Error
      ? error.message
      : isCollectionsError && collectionsError instanceof Error
        ? collectionsError.message
        : undefined;

  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#64748B]">
            {t("members.directory")}
          </p>
          <h1 className="text-3xl font-semibold leading-9 tracking-tight text-[#102744]">
            {t("members.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
            {t("members.manageDescription")}
          </p>
        </div>
        <Link
          href="/dashboard/members/new"
          className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#102744] px-4 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#17365D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D] focus-visible:ring-offset-2 active:scale-[0.98] sm:w-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("members.add")}
        </Link>
      </header>

      <MembersSummary metrics={summaryCards} locale={locale} />

      <MembersList
        members={filteredMembers}
        totalMembers={members.length}
        contributingMemberIds={contributingMemberIds}
        isLoading={isListingLoading}
        isError={isListingError}
        errorMessage={listingErrorMessage}
        statusPending={updateStatusMutation.isPending}
        onStatusClick={openStatusDialog}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        contributionFilter={contributionFilter}
        onContributionChange={setContributionFilter}
      />
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
                className="h-9 rounded-md px-4 font-sans text-sm font-medium"
              >
                {t("members.done")}
              </AlertDialogCancel>
            ) : (
              <>
                <AlertDialogCancel
                  disabled={updateStatusMutation.isPending}
                  className="h-9 rounded-md border border-slate-200 bg-white px-4 font-sans text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  {t("members.cancel")}
                </AlertDialogCancel>

                <button
                  type="button"
                  disabled={updateStatusMutation.isPending}
                  onClick={handleStatusChange}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-[#102744] px-4 font-sans text-sm font-medium text-white shadow-sm transition-all hover:bg-[#17365D] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
