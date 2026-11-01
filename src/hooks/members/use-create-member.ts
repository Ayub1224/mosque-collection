import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMember } from "@/services/members.service";
import { MEMBERS_QUERY_KEY } from "./use-members";

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMember,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MEMBERS_QUERY_KEY,
      });
    },
  });
}