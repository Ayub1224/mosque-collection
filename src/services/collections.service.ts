
import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/types/collection";

type CollectionResponse =
  | {
      success: true;
      message: string;
      collection: Collection;
    }
  | {
      success: false;
      message: string;
      errors?: unknown;
    };

type GetCollectionsResponse =
  | {
      success: true;
      collections: Collection[];
    }
  | {
      success: false;
      message: string;
    };

export async function getCollections(): Promise<Collection[]> {
  const response = await fetch("/api/collections");

  const data: GetCollectionsResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      !data.success ? data.message : "Unable to fetch collections.",
    );
  }

  return data.collections;
}

export async function createCollection(
  input: CreateCollectionInput,
): Promise<Collection> {
  const response = await fetch("/api/collections", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data: CollectionResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Unable to record collection.");
  }

  return data.collection;
}

export async function updateCollection(
  collectionId: string,
  input: UpdateCollectionInput,
): Promise<Collection> {
  const response = await fetch(
    `/api/collections/${encodeURIComponent(collectionId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const data: CollectionResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Unable to update collection.");
  }

  return data.collection;
}

export async function cancelCollection(
  collectionId: string,
): Promise<Collection> {
  const response = await fetch(
    `/api/collections/${encodeURIComponent(collectionId)}`,
    {
      method: "DELETE",
    },
  );

  const data: CollectionResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Unable to cancel collection.");
  }

  return data.collection;
}
