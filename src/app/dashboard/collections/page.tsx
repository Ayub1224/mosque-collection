"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import MonthlyCollectionOverview from "../components/monthly-collection-overview";
import CollectionSummaryCards from "./components/collection-summary-cards";
import CollectionFilters, {
  type MemberStatusFilter,
  type ContributionFilter,
} from "./components/collection-filters";
import { Plus } from "lucide-react";
import AddCollectionDialog from "../components/add-collection-dialog";
import type { Member } from "@/types/member";

export default function CollectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const memberIdFromUrl = searchParams.get("memberId");
  const [search, setSearch] = useState("");
  const [memberStatus, setMemberStatus] = useState<MemberStatusFilter>("All");
  const [contribution, setContribution] = useState<ContributionFilter>("All");
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    if (memberIdFromUrl) {
      setIsAddCollectionOpen(true);
    }
  }, [memberIdFromUrl]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#102744]">Collections</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Track and manage regular monthly donations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddCollectionOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#102744] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#17365D]"
        >
          <Plus size={18} />
          Add Collection
        </button>
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

      <MonthlyCollectionOverview
        search={search}
        memberStatus={memberStatus}
        contribution={contribution}
      />
      <AddCollectionDialog
        open={isAddCollectionOpen}
        onOpenChange={setIsAddCollectionOpen}
        onSelectMember={(member) => {
          setSelectedMember(member);

          router.replace("/dashboard/collections", {
            scroll: false,
          });
        }}
        initialMemberId={memberIdFromUrl}
      />
    </div>
  );
}
