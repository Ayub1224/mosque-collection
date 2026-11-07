export type MemberStatus = "Active" | "Inactive";

export interface Member {
  memberId: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  joiningDate: string;
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
  serialNo: string;
}

export interface CreateMemberInput {
  fullName: string;
  phoneNumber: string;
  address?: string;
  joiningDate: string;
}
