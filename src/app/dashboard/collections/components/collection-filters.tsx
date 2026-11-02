
"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

export type MemberStatusFilter = "All" | "Active" | "Inactive";
export type ContributionFilter = "All" | "Contributors" | "No Contribution";

interface CollectionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  memberStatus: MemberStatusFilter;
  onMemberStatusChange: (value: MemberStatusFilter) => void;
  contribution: ContributionFilter;
  onContributionChange: (value: ContributionFilter) => void;
}

export default function CollectionFilters({
  search,
  onSearchChange,
  memberStatus,
  onMemberStatusChange,
  contribution,
  onContributionChange,
}: CollectionFiltersProps) {
  const hasActiveFilters =
    search !== "" ||
    memberStatus !== "All" ||
    contribution !== "All";

  const clearFilters = () => {
    onSearchChange("");
    onMemberStatusChange("All");
    onContributionChange("All");
  };

  return (
    <section className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#102744]">
              Collection Records
            </h2>
            <p className="mt-1 text-xs text-[#64748B]">
              Search and filter members by their contribution activity.
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="hidden items-center gap-1 text-sm font-medium text-[#17365D] hover:underline sm:inline-flex"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          )}
        </div>

        {/* Desktop toolbar */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search member name or phone number..."
              aria-label="Search members"
              className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white pl-9 pr-3 text-sm text-[#172B4D] outline-none placeholder:text-[#94A3B8] focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10"
            />
          </div>

          <select
            value={memberStatus}
            onChange={(event) =>
              onMemberStatusChange(event.target.value as MemberStatusFilter)
            }
            aria-label="Filter by member status"
            className="h-10 w-40 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none focus:border-[#17365D]"
          >
            <option value="All">All Members</option>
            <option value="Active">Active Members</option>
            <option value="Inactive">Inactive Members</option>
          </select>

          <select
            value={contribution}
            onChange={(event) =>
              onContributionChange(event.target.value as ContributionFilter)
            }
            aria-label="Filter by contribution activity"
            className="h-10 w-44 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none focus:border-[#17365D]"
          >
            <option value="All">All Contributions</option>
            <option value="Contributors">Contributors</option>
            <option value="No Contribution">No Contribution</option>
          </select>
        </div>

        {/* Mobile toolbar */}
        <div className="space-y-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search name or phone..."
              aria-label="Search members"
              className="h-11 w-full rounded-lg border border-[#E2E8F0] bg-white pl-9 pr-3 text-sm text-[#172B4D] outline-none placeholder:text-[#94A3B8] focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">
                Member Status
              </label>
              <select
                value={memberStatus}
                onChange={(event) =>
                  onMemberStatusChange(event.target.value as MemberStatusFilter)
                }
                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-2 text-sm text-[#172B4D] outline-none focus:border-[#17365D]"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">
                Contribution
              </label>
              <select
                value={contribution}
                onChange={(event) =>
                  onContributionChange(event.target.value as ContributionFilter)
                }
                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-2 text-sm text-[#172B4D] outline-none focus:border-[#17365D]"
              >
                <option value="All">All</option>
                <option value="Contributors">Contributors</option>
                <option value="No Contribution">No Contribution</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#17365D]"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
