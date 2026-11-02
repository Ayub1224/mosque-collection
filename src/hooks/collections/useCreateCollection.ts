
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCollection } from "@/services/collections.service";
import type { CreateCollectionInput } from "@/types/collection";
import { COLLECTIONS_QUERY_KEY } from "./useCollections";

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCollectionInput) =>
      createCollection(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEY,
      });
    },
  });
}
