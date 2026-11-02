
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCollection } from "@/services/collections.service";
import type { UpdateCollectionInput } from "@/types/collection";
import { COLLECTIONS_QUERY_KEY } from "./useCollections";

interface UpdateCollectionVariables {
  collectionId: string;
  input: UpdateCollectionInput;
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, input }: UpdateCollectionVariables) =>
      updateCollection(collectionId, input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEY,
      });
    },
  });
}
