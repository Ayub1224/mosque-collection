
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelCollection } from "@/services/collections.service";
import { COLLECTIONS_QUERY_KEY } from "./useCollections";

export function useCancelCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collectionId: string) =>
      cancelCollection(collectionId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEY,
      });
    },
  });
}
