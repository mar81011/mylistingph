"use server";

import { revalidatePath } from "next/cache";
import type { ListingStatus } from "@prisma/client";
import type { Listing } from "@/lib/listing-types";
import {
  createListingInDb,
  deleteListingFromDb,
  getActiveListingsFromDb,
  getAllListingsFromDb,
  getListingByIdFromDb,
  getListingBySlugFromDb,
  incrementListingViews,
  updateListingInDb,
  updateListingStatusInDb,
  type ListingInput,
} from "@/lib/data/listings";

export async function fetchActiveListings(): Promise<Listing[]> {
  try {
    return await getActiveListingsFromDb();
  } catch {
    return [];
  }
}

export async function fetchAllListings(): Promise<Listing[]> {
  try {
    return await getAllListingsFromDb();
  } catch {
    return [];
  }
}

export async function fetchListingBySlug(slug: string): Promise<Listing | null> {
  try {
    return await getListingBySlugFromDb(slug);
  } catch {
    return null;
  }
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  try {
    return await getListingByIdFromDb(id);
  } catch {
    return null;
  }
}

export async function createListingAction(input: ListingInput): Promise<Listing> {
  const listing = await createListingInDb(input);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/listings/${listing.slug}`);
  return listing;
}

export async function updateListingAction(
  id: string,
  input: ListingInput
): Promise<Listing> {
  const listing = await updateListingInDb(id, input);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/listings/${listing.slug}`);
  return listing;
}

export async function updateListingStatusAction(id: string, status: ListingStatus) {
  await updateListingStatusInDb(id, status);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteListingAction(id: string) {
  await deleteListingFromDb(id);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function trackListingView(slug: string) {
  try {
    await incrementListingViews(slug);
  } catch {
    // ignore
  }
}
