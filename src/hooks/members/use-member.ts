import { useQuery } from "@tanstack/react-query";
import { getMember } from "@/services/members.service";

export function useMember(memberId: string) {
  return useQuery({
    queryKey: ["members", memberId],
    queryFn: () => getMember(memberId),
    enabled: Boolean(memberId),
  });
}