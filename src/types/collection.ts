
export type CollectionRecordStatus = "Active" | "Cancelled";
export type CollectionPaymentType = "Monthly" | "Yearly";

export interface Collection {
  collectionId: string;
  memberId: string;
  amount: number;
  donationDate: string;
  recordStatus: CollectionRecordStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
  paymentType: CollectionPaymentType;
  paymentGroupId: string;
  paymentReceivedDate: string;
}

export interface CreateCollectionInput {
  memberId: string;
  amount: number;
  donationDate: string;
  note?: string;
  isYearlyPayment?: boolean;
}

export interface UpdateCollectionInput {
  amount?: number;
  donationDate?: string;
  note?: string;
}
