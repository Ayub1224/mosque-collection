export type CollectionRecordStatus = "Active" | "Cancelled";

export interface Collection {
  collectionId: string;
  memberId: string;
  amount: number;
  donationDate: string;
  recordStatus: CollectionRecordStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionInput {
  memberId: string;
  amount: number;
  donationDate: string;
  note?: string;
}

export interface UpdateCollectionInput {
  amount?: number;
  donationDate?: string;
  note?: string;
}