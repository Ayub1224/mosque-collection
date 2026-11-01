import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMemberStatus } from "@/services/members.service";
import { MEMBERS_QUERY_KEY } from "./use-members";

export function useUpdateMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      status,
    }: {
      memberId: string;
      status: "Active" | "Inactive";
    }) => updateMemberStatus(memberId, status),

    onSuccess: (_, variables) => {
      // Refresh members table and summary cards
      queryClient.invalidateQueries({
        queryKey: MEMBERS_QUERY_KEY,
      });

      // Refresh individual member details
      queryClient.invalidateQueries({
        queryKey: [...MEMBERS_QUERY_KEY, variables.memberId],
      });
    },
  });
}