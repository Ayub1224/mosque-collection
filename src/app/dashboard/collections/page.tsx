"use client";

import { useState } from "react";

import MonthlyCollectionOverview from "../components/monthly-collection-overview";
import CollectionSummaryCards from "./components/collection-summary-cards";
import CollectionFilters, {
  type MemberStatusFilter,
  type ContributionFilter,
} from "./components/collection-filters";

export default function CollectionsPage() {
  const [search, setSearch] = useState("");
  const [memberStatus, setMemberStatus] = useState<MemberStatusFilter>("All");
  const [contribution, setContribution] = useState<ContributionFilter>("All");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#102744]">Collections</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Track and manage regular monthly donations.
        </p>
      </div>

      <CollectionSummaryCards />

      <CollectionFilters
        search={search}
        onSearchChange={setSearch}
        memberStatus={memberStatus}
        onMemberStatusChange={setMemberStatus}
        contribution={contribution}
        onContributionChange={setContribution}
      />

      <MonthlyCollectionOverview />
    </div>
  );
}
