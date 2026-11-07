import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
  href: string;
  icon?: LucideIcon;
  variant: "financial" | "supporting";
};

export default function SummaryCard({
  title,
  value,
  description,
  href,
  icon: Icon,
  variant,
}: SummaryCardProps) {
  const isFinancial = variant === "financial";

  return (
    <Link
      href={href}
      className={`group flex h-full flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D] focus-visible:ring-offset-2 ${
        isFinancial
          ? "min-h-36 p-5 sm:p-6 xl:min-h-[236px]"
          : "min-h-28 p-4 sm:p-5 xl:min-h-[112px]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`font-medium leading-5 text-[#64748B] ${
            isFinancial ? "text-sm" : "text-xs sm:text-sm"
          }`}
        >
          {title}
        </p>
        {isFinancial && Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF0F7] text-[#17365D]">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="mt-4">
        <p
          className={`font-semibold tracking-tight text-[#102744] tabular-nums ${
            isFinancial
              ? "text-2xl leading-8 sm:text-3xl sm:leading-9 xl:text-4xl xl:leading-10"
              : "text-2xl leading-8"
          }`}
          title={value}
        >
          {value}
        </p>
        <p className="mt-2 text-xs leading-5 text-[#64748B]">{description}</p>
      </div>

      <ArrowUpRight
        className="ml-auto mt-3 h-4 w-4 text-[#94A3B8] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}
