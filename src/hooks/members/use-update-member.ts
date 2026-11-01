import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMember } from "@/services/members.service";
import { MEMBERS_QUERY_KEY } from "./use-members";

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      input,
    }: {
      memberId: string;
      input: {
        fullName: string;
        phoneNumber: string;
        address?: string;
        joiningDate: string;
      };
    }) => updateMember(memberId, input),

    onSuccess: (updatedMember) => {
      queryClient.invalidateQueries({
        queryKey: MEMBERS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [...MEMBERS_QUERY_KEY, updatedMember.memberId],
      });
    },
  });
}