
import Link from "next/link";
import MonthlyCollectionOverview from "./monthly-collection-overview";
import SummaryCard from "./summary-card";

const summaryCards = [
  {
    title: "Total Members",
    value: "—",
    description: "Registered members",
  },
  {
    title: "Active Members",
    value: "—",
    description: "Currently active members",
  },
  {
    title: "Collections This Month",
    value: "—",
    description: "Current month's collections",
  },
  {
    title: "Collections This Year",
    value: "—",
    description: "Current calendar year's collections",
  },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Welcome section and quick actions */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#102744]">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
            Welcome back! Here's an overview of your mosque collections.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/members/new"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#17365D] transition hover:bg-[#F5F7FA]"
          >
            + Add Member
          </Link>

          <Link
            href="/dashboard/collections/new"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#102744] px-4 text-sm font-medium text-white transition hover:bg-[#17365D]"
          >
            + Add Collection
          </Link>
        </div>
      </section>

      {/* Summary cards */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <SummaryCard
              key={card.title}
              title={card.title}
              value={card.value}
              description={card.description}
            />
          ))}
        </div>
      </section>
      <MonthlyCollectionOverview />
    </div>
  );
}
