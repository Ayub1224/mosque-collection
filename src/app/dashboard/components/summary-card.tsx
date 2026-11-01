
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
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-[#64748B]">
        {title}
      </p>

      <p className="mt-3 text-2xl font-semibold text-[#102744]">
        {value}
      </p>

      <p className="mt-2 text-xs text-[#94A3B8]">
        {description}
      </p>
    </div>
  );
}
