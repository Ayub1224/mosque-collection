import { CalendarDays, ChevronDown, Search, UsersRound } from "lucide-react";
import { useLanguage } from "../../components/admin-profile-context";

export type ContributionFilter = "All" | "Contributors" | "NonContributors";
export type StatusFilter = "All" | "Active" | "Inactive";

type MembersToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  contributionFilter: ContributionFilter;
  onContributionChange: (value: ContributionFilter) => void;
};

const fieldClassName =
  "h-11 w-full min-w-0 rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#172B4D] outline-none transition-colors duration-200 placeholder:text-[#94A3B8] hover:border-[#94A3B8] focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/15";

export function MembersToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  contributionFilter,
  onContributionChange,
}: MembersToolbarProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.25fr)_minmax(150px,.75fr)_minmax(240px,1.2fr)]">
      <label className="min-w-0">
        <span className="mb-2 block text-xs font-medium text-[#475569]">
          {t("members.searchByMember")}
        </span>
        <span className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("members.search")}
            className={`${fieldClassName} pl-10`}
          />
        </span>
      </label>

      <label className="min-w-0">
        <span className="mb-2 block text-xs font-medium text-[#475569]">
          {t("members.filterStatusLabel")}
        </span>
        <span className="relative block">
          <UsersRound
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
            aria-hidden="true"
          />
          <select
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
            className={`${fieldClassName} cursor-pointer appearance-none pl-10 pr-10 font-medium`}
          >
            <option value="All">{t("members.allStatusFilter")}</option>
            <option value="Active">{t("members.active")}</option>
            <option value="Inactive">{t("members.inactive")}</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
            aria-hidden="true"
          />
        </span>
      </label>

      <label className="min-w-0 sm:col-span-2 lg:col-span-1">
        <span className="mb-2 block text-xs font-medium text-[#475569]">
          {t("members.monthlyContributionLabel")}
        </span>
        <span className="relative block">
          <CalendarDays
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
            aria-hidden="true"
          />
          <select
            value={contributionFilter}
            onChange={(event) =>
              onContributionChange(event.target.value as ContributionFilter)
            }
            className={`${fieldClassName} cursor-pointer appearance-none pl-10 pr-10 font-medium`}
          >
            <option value="All">{t("members.allContributionFilter")}</option>
            <option value="Contributors">{t("members.contributorsThisMonth")}</option>
            <option value="NonContributors">
              {t("members.nonContributorsThisMonth")}
            </option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
            aria-hidden="true"
          />
        </span>
      </label>
    </div>
  );
}
