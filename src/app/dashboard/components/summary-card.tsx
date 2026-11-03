
type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
};

export default function SummaryCard({
  title,
  value,
  description,
}: SummaryCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-md sm:p-6">
      <div className="absolute left-0 top-0 h-full w-1 bg-[#17365D] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="flex min-h-[112px] flex-col justify-between">
        <div>
          <p className="text-sm font-medium tracking-tight text-[#64748B]">
            {title}
          </p>

          <p className="mt-4 text-2xl font-bold tracking-tight text-[#102744] sm:text-3xl">
            {value}
          </p>
        </div>

        <p className="mt-4 text-xs leading-5 text-[#94A3B8]">
          {description}
        </p>
      </div>
    </div>
  );
}
