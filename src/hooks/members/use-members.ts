import { useQuery } from "@tanstack/react-query";
import { getMembers } from "@/services/members.service";

export const MEMBERS_QUERY_KEY = ["members"];

export function useMembers() {
  return useQuery({
    queryKey: MEMBERS_QUERY_KEY,
    queryFn: getMembers,
  });
}