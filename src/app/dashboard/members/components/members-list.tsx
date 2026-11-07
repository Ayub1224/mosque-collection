import Link from "next/link";
import { CircleAlert, MapPin, UsersRound } from "lucide-react";
import type { Member } from "@/types/member";
import { useLanguage } from "../../components/admin-profile-context";
import { MemberActions } from "./member-actions";
import { MemberMobileCard } from "./member-mobile-card";
import { MembersToolbar, type ContributionFilter, type StatusFilter } from "./members-toolbar";

type MembersListProps = {
  members: Member[];
  contributingMemberIds: Set<string>;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  statusPending: boolean;
  onStatusClick: (member: Member) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  contributionFilter: ContributionFilter;
  onContributionChange: (value: ContributionFilter) => void;
};

function StatusNotice({
  title,
  description,
  isError = false,
}: {
  title: string;
  description?: string;
  isError?: boolean;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-6 py-12 text-center">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${isError ? "bg-red-50 text-red-700" : "bg-[#EAF0F7] text-[#17365D]"}`}>
        {isError ? <CircleAlert className="h-5 w-5" aria-hidden="true" /> : <UsersRound className="h-5 w-5" aria-hidden="true" />}
      </div>
      <p className={`text-sm font-medium ${isError ? "text-red-700" : "text-[#172B4D]"}`}>
        {title}
      </p>
      {description && <p className="mt-1 max-w-md text-sm text-[#64748B]">{description}</p>}
    </div>
  );
}

function MembersLoadingState({ label }: { label: string }) {
  return (
    <div className="p-4 sm:p-6" role="status" aria-label={label}>
      <div className="hidden space-y-0 md:block">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex h-16 items-center gap-4 border-b border-[#E2E8F0] last:border-0">
            <div className="h-3 w-8 rounded bg-slate-100" />
            <div className="h-9 w-9 rounded-full bg-slate-100" />
            <div className="h-3 w-36 rounded bg-slate-100" />
            <div className="ml-auto h-3 w-24 rounded bg-slate-100" />
            <div className="h-8 w-28 rounded-lg bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-4 rounded-xl border border-[#E2E8F0] p-4">
            <div className="h-4 w-2/3 rounded bg-slate-100" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-9 w-2/3 rounded-lg bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MembersList({
  members,
  contributingMemberIds,
  isLoading,
  isError,
  errorMessage,
  statusPending,
  onStatusClick,
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  contributionFilter,
  onContributionChange,
}: MembersListProps) {
  const { t, language } = useLanguage();
  const locale = language === "hi" ? "hi-IN" : "en-IN";

  return (
    <section className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm" aria-labelledby="members-list-title">
      <div className="space-y-4 border-b border-[#E2E8F0] p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="members-list-title" className="text-lg font-semibold tracking-tight text-[#102744]">
              {t("members.allMembers")}
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">{t("members.viewManage")}</p>
          </div>
          <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-medium text-[#475569]">
            {t("members.showing").replace("{count}", members.length.toLocaleString(locale))}
          </span>
        </div>
        <MembersToolbar
          search={search}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          onStatusChange={onStatusChange}
          contributionFilter={contributionFilter}
          onContributionChange={onContributionChange}
        />
      </div>

      {isLoading ? (
        <MembersLoadingState label={t("members.loadingMembers")} />
      ) : isError ? (
        <StatusNotice title={errorMessage || t("members.loadError")} isError />
      ) : members.length === 0 ? (
        <StatusNotice title={t("members.noResults")} description={t("members.tryAgain")} />
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[60rem] table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[4.5rem]" />
                <col className="w-[13rem]" />
                <col className="w-[9rem]" />
                <col />
                <col className="w-[8.5rem]" />
                <col className="w-[7rem]" />
                <col className="w-[15rem]" />
              </colgroup>
              <thead className="bg-[#F8FAFC] text-xs font-medium text-[#64748B]">
                <tr>
                  <th scope="col" className="px-3 py-3 pl-4">{t("members.serialNumber")}</th>
                  <th scope="col" className="px-3 py-3">{t("members.name")}</th>
                  <th scope="col" className="px-3 py-3">{t("members.phone")}</th>
                  <th scope="col" className="px-3 py-3">{t("members.address")}</th>
                  <th scope="col" className="px-3 py-3">{t("members.joinedDate")}</th>
                  <th scope="col" className="px-3 py-3">{t("members.status")}</th>
                  <th scope="col" className="px-3 py-3 pr-4 text-right">{t("members.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {members.map((member) => (
                  <tr key={member.memberId} className="transition-colors duration-200 hover:bg-[#F8FAFC]">
                    <td className="whitespace-nowrap px-3 py-4 pl-4 text-xs text-[#64748B]">{member.serialNo}</td>
                    <td className="px-3 py-4">
                      <Link
                        href={`/dashboard/members/${encodeURIComponent(member.memberId)}`}
                        className="flex min-w-0 items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D]"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF0F7] text-sm font-semibold text-[#17365D]">
                          {member.fullName.trim().slice(0, 1).toLocaleUpperCase(locale)}
                        </span>
                        <span className="truncate font-medium text-[#172B4D]">{member.fullName}</span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-[#475569]">{member.phoneNumber}</td>
                    <td className="px-3 py-4">
                      <div className="flex min-w-0 items-start gap-2 text-[#64748B]">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#94A3B8]" aria-hidden="true" />
                        <span className="line-clamp-2 break-words">{member.address || t("members.noAddress")}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-[#64748B]">{member.joiningDate}</td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${member.status === "Active" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                        {member.status === "Active" ? t("members.active") : t("members.inactive")}
                      </span>
                    </td>
                    <td className="px-3 py-3 pr-4">
                      <MemberActions
                        member={member}
                        hasContributed={contributingMemberIds.has(member.memberId)}
                        statusPending={statusPending}
                        onStatusClick={onStatusClick}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-3 md:hidden sm:p-4">
            {members.map((member) => (
              <MemberMobileCard
                key={member.memberId}
                member={member}
                hasContributed={contributingMemberIds.has(member.memberId)}
                statusPending={statusPending}
                onStatusClick={onStatusClick}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
