import { UserCheck, UserRoundX, UsersRound } from "lucide-react";

export type SummaryMetric = {
  title: string;
  value: number;
  description: string;
  tone: "navy" | "green" | "slate";
};

const metricStyles = {
  navy: "bg-[#EAF0F7] text-[#17365D]",
  green: "bg-emerald-50 text-emerald-700",
  slate: "bg-slate-100 text-slate-600",
} as const;

const MetricIcon = ({ tone }: { tone: SummaryMetric["tone"] }) => {
  const iconClassName = "h-5 w-5";

  if (tone === "green") return <UserCheck className={iconClassName} aria-hidden="true" />;
  if (tone === "slate") return <UserRoundX className={iconClassName} aria-hidden="true" />;
  return <UsersRound className={iconClassName} aria-hidden="true" />;
};

export function MembersSummary({
  metrics,
  locale,
}: {
  metrics: SummaryMetric[];
  locale: string;
}) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {metrics.map((metric) => (
        <article
          key={metric.title}
          className="flex min-h-36 items-start justify-between rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#64748B]">{metric.title}</p>
            <p className="mt-4 text-3xl font-semibold leading-9 tracking-tight text-[#102744] sm:text-4xl sm:leading-10">
              {metric.value.toLocaleString(locale)}
            </p>
            <p className="mt-2 text-xs text-[#94A3B8]">{metric.description}</p>
          </div>
          <div className={`ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${metricStyles[metric.tone]}`}>
            <MetricIcon tone={metric.tone} />
          </div>
        </article>
      ))}
    </section>
  );
}
