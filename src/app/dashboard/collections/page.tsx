
import MonthlyCollectionOverview from "../components/monthly-collection-overview";

export default function CollectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#102744]">
          Collections
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Track and manage regular monthly donations.
        </p>
      </div>

      <MonthlyCollectionOverview />
    </div>
  );
}
