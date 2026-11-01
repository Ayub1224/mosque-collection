import type { CreateMemberInput, Member } from "@/types/member";

type CreateMemberResponse =
  | {
      success: true;
      message: string;
      member: Member;
    }
  | {
      success: false;
      message: string;
      errors?: unknown;
    };

export async function createMember(
  input: CreateMemberInput,
): Promise<Member> {
  const response = await fetch("/api/members", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data: CreateMemberResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Unable to create member.");
  }

  return data.member;
}


type GetMembersResponse =
  | {
      success: true;
      members: Member[];
    }
  | {
      success: false;
      message: string;
    };

export async function getMembers(): Promise<Member[]> {
  const response = await fetch("/api/members");

  const data: GetMembersResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      !data.success ? data.message : "Unable to fetch members.",
    );
  }

  return data.members;
}


type GetMemberResponse =
  | {
      success: true;
      member: Member;
    }
  | {
      success: false;
      message: string;
    };

export async function getMember(memberId: string): Promise<Member> {
  const response = await fetch(
    `/api/members/${encodeURIComponent(memberId)}`,
  );

  const data: GetMemberResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      !data.success ? data.message : "Unable to fetch member.",
    );
  }

  return data.member;
}

type UpdateMemberResponse =
  | {
      success: true;
      message: string;
      member: Member;
    }
  | {
      success: false;
      message: string;
      errors?: unknown;
    };

export async function updateMember(
  memberId: string,
  input: CreateMemberInput,
): Promise<Member> {
  const response = await fetch(
    `/api/members/${encodeURIComponent(memberId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const data: UpdateMemberResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Unable to update member.");
  }

  return data.member;
}