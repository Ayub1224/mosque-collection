import Link from "next/link";
import type { Member } from "@/types/member";
import { useLanguage } from "../../components/admin-profile-context";

type MemberActionsProps = {
  member: Member;
  hasContributed: boolean;
  statusPending: boolean;
  onStatusClick: (member: Member) => void;
  compact?: boolean;
};

function getWhatsAppUrl(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");
  const internationalNumber = digits.length === 10 ? `91${digits}` : digits;

  return `https://wa.me/${internationalNumber}`;
}

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.52 0 .18 5.34.18 11.9c0 2.1.55 4.16 1.6 5.97L.08 24l6.27-1.64a11.9 11.9 0 0 0 5.72 1.46h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.46-8.44ZM12.08 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.97.99-3.63-.24-.37a9.87 9.87 0 0 1-1.52-5.28c0-5.46 4.44-9.9 9.9-9.9 2.65 0 5.14 1.03 7.01 2.9a9.84 9.84 0 0 1 2.89 7c0 5.46-4.44 9.9-9.91 9.9Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

export function MemberActions({
  member,
  hasContributed,
  statusPending,
  onStatusClick,
  compact = false,
}: MemberActionsProps) {
  const { t } = useLanguage();
  const messageLabel = t("members.messageOnWhatsApp").replace(
    "{name}",
    member.fullName,
  );

  return (
    <div className="flex flex-nowrap items-center justify-end gap-2">
      <span
        className={`block shrink-0 ${compact ? "h-11 w-11" : "h-9 w-9"}`}
        aria-hidden={hasContributed ? "true" : undefined}
      >
        {!hasContributed && (
          <a
            href={getWhatsAppUrl(member.phoneNumber)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={messageLabel}
            title={messageLabel}
            className={`inline-flex h-full w-full shrink-0 items-center justify-center rounded-lg text-[#14805E] transition-colors duration-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 ${compact ? "min-h-11 min-w-11" : "min-h-9 min-w-9"}`}
          >
            <WhatsAppMark />
          </a>
        )}
      </span>
      <Link
        href={`/dashboard/members/${encodeURIComponent(member.memberId)}/edit`}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-2 text-sm font-medium text-[#475569] transition-colors duration-200 hover:bg-slate-100 hover:text-[#172B4D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D] focus-visible:ring-offset-1 ${compact ? "min-h-11" : "min-h-9"}`}
      >
        {t("members.editAction")}
      </Link>
      <button
        type="button"
        disabled={statusPending}
        onClick={() => onStatusClick(member)}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${compact ? "min-h-11" : "min-h-9"} ${
          member.status === "Active"
            ? "text-[#A33131] hover:bg-red-50"
            : "text-emerald-800 hover:bg-emerald-50"
        }`}
      >
        {member.status === "Active"
          ? t("members.deactivate")
          : t("members.activate")}
      </button>
    </div>
  );
}
