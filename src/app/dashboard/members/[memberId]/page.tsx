"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useMember } from "@/hooks/members/use-member";
import { useMemo, useState } from "react";
import { SiWhatsapp } from "react-icons/si";

import WhatsAppReminderDialog from "../../collections/components/whatsapp-reminder-dialog";
import { useCollections } from "@/hooks/collections/useCollections";

const MONTHS = [
  { month: 4, label: "Apr" },
  { month: 5, label: "May" },
  { month: 6, label: "Jun" },
  { month: 7, label: "Jul" },
  { month: 8, label: "Aug" },
  { month: 9, label: "Sep" },
  { month: 10, label: "Oct" },
  { month: 11, label: "Nov" },
  { month: 12, label: "Dec" },
  { month: 1, label: "Jan" },
  { month: 2, label: "Feb" },
  { month: 3, label: "Mar" },
];

function isCurrentOrPreviousMonth(month: number, year: number): boolean {
  const now = new Date();

  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const targetMonth = new Date(year, month - 1, 1);

  return (
    targetMonth.getTime() === currentMonth.getTime() ||
    targetMonth.getTime() === previousMonth.getTime()
  );
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function MemberDetailsPage() {
  const params = useParams<{ memberId: string }>();
  const memberId = decodeURIComponent(params.memberId);
  const [selectedReminder, setSelectedReminder] = useState<{
    month: number;
    year: number;
  } | null>(null);

  const { data: member, isLoading, isError, error } = useMember(memberId);

  const {
    data: collections = [],
    isLoading: collectionsLoading,
    isError: collectionsError,
  } = useCollections();

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const financialYearStart = currentMonth >= 4 ? currentYear : currentYear - 1;

  const monthlyData = useMemo(() => {
    return MONTHS.map(({ month, label }) => {
      const year = month >= 4 ? financialYearStart : financialYearStart + 1;

      const total = collections
        .filter((collection) => {
          const [donationYear, donationMonth] = collection.donationDate
            .split("-")
            .map(Number);

          return (
            collection.memberId === memberId &&
            donationYear === year &&
            donationMonth === month &&
            collection.recordStatus === "Active"
          );
        })
        .reduce((sum, collection) => sum + collection.amount, 0);

      return { month, label, total, year };
    });
  }, [collections, memberId, financialYearStart]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
        Loading member details...
      </div>
    );
  }

  if (isError || !member) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center">
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : "Member not found."}
        </p>

        <Link
          href="/dashboard/members"
          className="mt-4 inline-block text-sm font-medium text-[#17365D] hover:underline"
        >
          Back to Members
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        <Link href="/dashboard/members" className="hover:text-[#102744]">
          Members
        </Link>
        <span>/</span>
        <span className="font-medium text-[#172B4D]">Member Details</span>
      </div>

      {/* Member Header */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EAF0F7] text-lg font-semibold text-[#17365D]">
              {member.fullName
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            <div>
              <h1 className="text-xl font-semibold text-[#102744]">
                {member.fullName}
              </h1>

              <p className="mt-1 text-xs text-[#64748B]">
                Serial No.: {member.serialNo}
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  member.status === "Active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {member.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/dashboard/members/${encodeURIComponent(member.memberId)}/edit`}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#17365D] hover:bg-[#F5F7FA]"
            >
              Edit Member
            </Link>

            <Link
              href={`/dashboard/collections?memberId=${encodeURIComponent(member.memberId)}`}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#102744] px-4 text-sm font-medium text-white transition hover:bg-[#17365D]"
            >
              + Add Collection
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-[#102744]">
          Contact Information
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <p className="text-xs text-[#64748B]">Phone Number</p>
            <p className="mt-1 text-sm font-medium text-[#172B4D]">
              {member.phoneNumber}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#64748B]">Address</p>
            <p className="mt-1 text-sm font-medium text-[#172B4D]">
              {member.address || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#64748B]">Joining Date</p>
            <p className="mt-1 text-sm font-medium text-[#172B4D]">
              {member.joiningDate}
            </p>
          </div>
        </div>
      </div>
      {/* Monthly Collection */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-[#102744]">
            Monthly Collection
          </h2>

          <p className="mt-1 text-xs text-[#64748B]">
            Financial Year {financialYearStart}–{financialYearStart + 1}
          </p>
        </div>

        {collectionsLoading ? (
          <p className="py-8 text-center text-sm text-[#64748B]">
            Loading monthly collections...
          </p>
        ) : collectionsError ? (
          <p className="py-8 text-center text-sm text-red-600">
            Unable to load monthly collections.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {monthlyData.map((item) => {
              const canSendReminder =
                member.status === "Active" &&
                item.total <= 0 &&
                isCurrentOrPreviousMonth(item.month, item.year);

              return (
                <div
                  key={item.month}
                  className="group rounded-xl border border-[#E2E8F0] bg-white p-3 transition-colors hover:border-[#CBD5E1]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-[#64748B]">{item.label}</p>

                      <p className="mt-1 text-sm font-semibold text-[#172B4D]">
                        {item.total > 0 ? formatCurrency(item.total) : "—"}
                      </p>
                    </div>

                    {canSendReminder && (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedReminder({
                            month: item.month,
                            year: item.year,
                          })
                        }
                        title={`Prepare ${item.label} chanda reminder`}
                        aria-label={`Prepare WhatsApp reminder for ${item.label}`}
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#16834A] opacity-100 transition hover:bg-[#EAF7EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16834A] md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                      >
                        <SiWhatsapp size={17} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedReminder && (
        <WhatsAppReminderDialog
          open={true}
          onClose={() => setSelectedReminder(null)}
          member={member}
          month={selectedReminder.month}
          year={selectedReminder.year}
        />
      )}
    </section>
  );
}
