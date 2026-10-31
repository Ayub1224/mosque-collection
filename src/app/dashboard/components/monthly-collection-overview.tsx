
const months = [
  "Jan", "Feb", "Mar", "Apr",
  "May", "Jun", "Jul", "Aug",
  "Sep", "Oct", "Nov", "Dec",
];

export default function MonthlyCollectionOverview() {
  const currentYear = new Date().getFullYear();

  return (
    <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
      {/* Chart heading */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-[#102744]">
            Monthly Collection Overview
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Collection trends throughout the year
          </p>
        </div>

        <span className="w-fit rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] px-3 py-2 text-sm font-medium text-[#17365D]">
          {currentYear}
        </span>
      </div>

      {/* Chart area */}
      <div className="mt-8">
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] bg-[#FAFBFC]">
          <div className="max-w-sm px-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF0F7] text-[#17365D]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M3 3v18h18" />
                <path d="m7 14 4-4 3 3 6-7" />
              </svg>
            </div>

            <p className="mt-3 text-sm font-medium text-[#172B4D]">
              No collection data available yet
            </p>

            <p className="mt-1 text-xs leading-5 text-[#64748B]">
              Monthly collection figures will appear here once donation
              records are connected.
            </p>
          </div>
        </div>

        {/* Month labels */}
        <div className="mt-4 grid grid-cols-6 gap-2 text-center sm:grid-cols-12">
          {months.map((month) => (
            <span
              key={month}
              className="text-xs font-medium text-[#64748B]"
            >
              {month}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
