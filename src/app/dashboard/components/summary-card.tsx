
import Link from "next/link";

type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
  href: string;
};

export default function SummaryCard({
  title,
  value,
  description,
  href,
}: SummaryCardProps) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17365D] sm:p-6"
    >
      <div className="absolute left-0 top-0 h-full w-1 bg-[#17365D] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="flex min-h-[112px] flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium tracking-tight text-[#64748B]">
              {title}
            </p>

            <span className="text-[#94A3B8] opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100">
              →
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-[#102744] sm:text-3xl">
            {value}
          </p>
        </div>

        <p className="mt-4 text-xs leading-5 text-[#94A3B8]">
          {description}
        </p>
      </div>
    </Link>
  );
}
