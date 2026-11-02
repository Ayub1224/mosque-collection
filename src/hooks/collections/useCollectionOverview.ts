
import { useMemo } from "react";
import { useMembers } from "@/hooks/members/use-members";
import { useCollections } from "./useCollections";
import { getCollectionOverview } from "@/lib/collections/collection-overview";

export function useCollectionOverview(financialYearStart: number) {
  const membersQuery = useMembers();
  const collectionsQuery = useCollections();

  const overview = useMemo(() => {
    if (!membersQuery.data || !collectionsQuery.data) {
      return undefined;
    }

    return getCollectionOverview(
      membersQuery.data,
      collectionsQuery.data,
      financialYearStart,
    );
  }, [
    membersQuery.data,
    collectionsQuery.data,
    financialYearStart,
  ]);

  return {
    data: overview,
    isLoading: membersQuery.isLoading || collectionsQuery.isLoading,
    isError: membersQuery.isError || collectionsQuery.isError,
    error: membersQuery.error || collectionsQuery.error,
    refetch: () => {
      membersQuery.refetch();
      collectionsQuery.refetch();
    },
  };
}
