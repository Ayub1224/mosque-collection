import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import type { Member } from "@/types/member";
import { useLanguage } from "../../components/admin-profile-context";
import { MemberActions } from "./member-actions";

type MemberMobileCardProps = {
  member: Member;
  hasContributed: boolean;
  statusPending: boolean;
  onStatusClick: (member: Member) => void;
};

export function MemberMobileCard({
  member,
  hasContributed,
  statusPending,
  onStatusClick,
}: MemberMobileCardProps) {
  const { t } = useLanguage();
  const active = member.status === "Active";

  return (
    <article className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
      <Link
        href={`/dashboard/members/${encodeURIComponent(member.memberId)}`}
        aria-label={t("members.viewDetails").replace("{name}", member.fullName)}
        className="group block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D] focus-visible:ring-offset-2"
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="break-words text-base font-semibold leading-6 text-[#172B4D] group-hover:text-[#17365D]">
              {member.fullName}
            </h3>
            <p className="mt-1 text-xs font-medium text-[#64748B]">
              {t("members.serialNumber")} {member.serialNo}
            </p>
          </div>
          <span
            className={`mt-0.5 shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
              active
                ? "bg-emerald-50 text-emerald-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {active ? t("members.active") : t("members.inactive")}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <p className="flex min-w-0 items-start gap-2 text-sm text-[#475569]">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden="true" />
            <span className="break-all">{member.phoneNumber}</span>
          </p>
          <p className="flex min-w-0 items-start gap-2 text-sm leading-5 text-[#64748B]">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden="true" />
            <span className="break-words">{member.address || t("members.noAddress")}</span>
          </p>
        </div>
      </Link>

      <div className="mt-3 pt-1">
        <MemberActions
          member={member}
          hasContributed={hasContributed}
          statusPending={statusPending}
          onStatusClick={onStatusClick}
          compact
        />
      </div>
    </article>
  );
}
