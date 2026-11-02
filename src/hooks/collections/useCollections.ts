
import { useQuery } from "@tanstack/react-query";
import { getCollections } from "@/services/collections.service";

export const COLLECTIONS_QUERY_KEY = ["collections"];

export function useCollections() {
  return useQuery({
    queryKey: COLLECTIONS_QUERY_KEY,
    queryFn: getCollections,
  });
}
