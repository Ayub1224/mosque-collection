
import type { Member } from "@/types/member";
import type { Collection } from "@/types/collection";
import type {
  CollectionMonth,
  CollectionOverviewData,
  CollectionOverviewRow,
} from "@/types/collection-overview";

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

function getDonationDate(dateString: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  // Reject invalid calendar dates such as February 30.
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return date;
}

function isWithinFinancialYear(
  date: Date,
  financialYearStart: number,
): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const financialYearEnd = financialYearStart + 1;

  return (
    (year === financialYearStart && month >= 4) ||
    (year === financialYearEnd && month <= 3)
  );
}

function createEmptyMonths(): CollectionMonth[] {
  return MONTHS.map(({ month, label }) => ({
    month,
    label,
    total: 0,
    donations: [],
  }));
}

export function getCollectionOverview(
  members: Member[],
  collections: Collection[],
  financialYearStart: number,
): CollectionOverviewData {
  const collectionsByMember = new Map<string, Collection[]>();

  // Keep all records within the financial year,
  // including cancelled records for future history views.
  for (const collection of collections) {
    const date = getDonationDate(collection.donationDate);

    if (!date || !isWithinFinancialYear(date, financialYearStart)) {
      continue;
    }

    const existing = collectionsByMember.get(collection.memberId) ?? [];
    existing.push(collection);

    collectionsByMember.set(collection.memberId, existing);
  }

  const rows: CollectionOverviewRow[] = members.map((member) => {
    const memberCollections =
      collectionsByMember.get(member.memberId) ?? [];

    const months = createEmptyMonths();

    for (const collection of memberCollections) {
      const date = getDonationDate(collection.donationDate);

      if (!date) continue;

      const month = date.getMonth() + 1;
      const monthData = months.find((item) => item.month === month);

      if (!monthData) continue;

      // Keep active and cancelled records for the breakdown history.
      monthData.donations.push(collection);

      // Only active records contribute to collection totals.
      if (collection.recordStatus === "Active") {
        monthData.total += collection.amount;
      }
    }

    // Keep donation records in chronological order.
    months.forEach((month) => {
      month.donations.sort(
        (a, b) =>
          a.donationDate.localeCompare(b.donationDate) ||
          a.createdAt.localeCompare(b.createdAt),
      );
    });

    const annualTotal = months.reduce(
      (total, month) => total + month.total,
      0,
    );

    return {
      member,
      months,
      annualTotal,
    };
  });

  const totalCollection = rows.reduce(
    (total, row) => total + row.annualTotal,
    0,
  );

  const totalContributors = rows.filter(
    (row) => row.annualTotal > 0,
  ).length;

  return {
    financialYearStart,
    financialYearLabel: `${financialYearStart}–${financialYearStart + 1}`,
    rows,
    totalCollection,
    totalContributors,
    totalMembers: members.length,
  };
}
