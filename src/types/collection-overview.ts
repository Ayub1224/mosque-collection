import type { Member } from "@/types/member";
import type { Collection } from "@/types/collection";

export interface CollectionMonth {
  month: number;
  label: string;
  total: number;
  donations: Collection[];
}

export interface CollectionOverviewRow {
  member: Member;
  months: CollectionMonth[];
  annualTotal: number;
}

export interface CollectionOverviewData {
  financialYearStart: number;
  financialYearLabel: string;
  rows: CollectionOverviewRow[];
  totalCollection: number;
  totalContributors: number;
  totalMembers: number;
}