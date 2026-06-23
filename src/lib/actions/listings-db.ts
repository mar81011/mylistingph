"use server";

import { revalidatePath } from "next/cache";
import type { ListingStatus } from "@prisma/client";
import type { Listing } from "@/lib/listing-types";
import {
  createListingInDb,
  deleteListingFromDb,
  getAllListingsFromDb,
  getListingByIdFromDb,
  getListingBySlugFromDb,
  incrementListingViews,
  searchActiveListingsFromDb,
  updateListingInDb,
  updateListingStatusInDb,
  type ListingInput,
} from "@/lib/data/listings";
import {
  sampleMatchesFilters,
  type ListingFilters,
  type PaginatedListings,
} from "@/lib/listing-filters";
import { SAMPLE_LISTING } from "@/lib/sample-listing";

export async function fetchActiveListingsPaginated(
  filters: ListingFilters
): Promise<PaginatedListings> {
  try {
    const includeSample = sampleMatchesFilters(SAMPLE_LISTING, filters);
    const result = await searchActiveListingsFromDb(filters, {
      includeSampleSlot: includeSample,
    });

    const listings =
      includeSample && (filters.page ?? 1) === 1
        ? [SAMPLE_LISTING, ...result.listings]
        : result.listings;

    return { ...result, listings };
  } catch {
    const includeSample = sampleMatchesFilters(SAMPLE_LISTING, filters);
    const listings =
      includeSample && (filters.page ?? 1) === 1 ? [SAMPLE_LISTING] : [];
    return {
      listings,
      total: listings.length,
      page: filters.page ?? 1,
      pageSize: 12,
      totalPages: 1,
    };
  }
}

export async function fetchActiveListings(): Promise<Listing[]> {
  try {
    const result = await searchActiveListingsFromDb(
      { page: 1 },
      { includeSampleSlot: true }
    );
    return [SAMPLE_LISTING, ...result.listings];
  } catch {
    return [SAMPLE_LISTING];
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
