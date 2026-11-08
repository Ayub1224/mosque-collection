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
import AddCollectionForm from "../components/add-collection-form";
import { useLanguage } from "../components/admin-profile-context";

export default function CollectionsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const memberIdFromUrl = searchParams.get("memberId");
  const periodFromUrl = searchParams.get("period");
  const shouldOpenAddCollection = searchParams.get("action") === "add";

  const collectionPeriod = periodFromUrl === "month" ? "month" : "year";
  const [search, setSearch] = useState("");
  const [memberStatus, setMemberStatus] = useState<MemberStatusFilter>("All");
  const [contribution, setContribution] = useState<ContributionFilter>("All");
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    if (memberIdFromUrl || shouldOpenAddCollection) {
      setIsAddCollectionOpen(true);
    }
  }, [memberIdFromUrl, shouldOpenAddCollection]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#102744]">{t("common.collection")}</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            {t("collection.trackDescription")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddCollectionOpen(true)}
          className="inline-flex h-11 self-start items-center justify-center gap-2 rounded-xl bg-[#102744] px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#17365D] hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D] focus-visible:ring-offset-2 sm:self-auto"
        >
          <Plus size={18} />
          {t("collection.add")}
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
        period={collectionPeriod}
      />
      {selectedMember ? (
        <AddCollectionForm
          member={selectedMember}
          onChangeMember={() => {
            setSelectedMember(null);
            setIsAddCollectionOpen(true);
          }}
          onClose={() => {
            setSelectedMember(null);
          }}
        />
      ) : (
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
      )}
    </div>
  );
}
