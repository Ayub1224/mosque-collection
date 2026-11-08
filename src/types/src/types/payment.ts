
export type PaymentType = "Monthly" | "Yearly";

export interface Payment {
  paymentId: string;
  memberId: string;
  memberName: string;
  totalAmount: number;
  paymentType: PaymentType;
  paymentReceivedDate: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  memberId: string;
  totalAmount: number;
  paymentType: PaymentType;
  paymentReceivedDate: string;
  note?: string;
}

export interface MonthlyAllocation {
  allocationId: string;
  paymentId: string;
  memberId: string;
  memberName: string;
  amount: number;
  allocationDate: string;
  recordStatus: "Active" | "Cancelled";
  note: string;
  createdAt: string;
  updatedAt: string;
}
