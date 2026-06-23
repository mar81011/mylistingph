import type { ListingType, PropertyType } from "@prisma/client";
import type { Listing } from "@/lib/listing-types";

export const LISTINGS_PAGE_SIZE = 12;

export type ListingSort = "newest" | "price_asc" | "price_desc";

export type ListingFilters = {
  q?: string;
  city?: string;
  propertyType?: PropertyType;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  sort?: ListingSort;
  page?: number;
};

export type PaginatedListings = {
  listings: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function parseListingFilters(
  params: Record<string, string | string[] | undefined>
): ListingFilters {
  const get = (key: string) => {
    const v = params[key];
    return typeof v === "string" ? v : undefined;
  };

  const page = Math.max(1, parseInt(get("page") ?? "1", 10) || 1);
  const minPrice = get("minPrice");
  const maxPrice = get("maxPrice");
  const minBedrooms = get("minBedrooms");

  return {
    q: get("q")?.trim() || undefined,
    city: get("city") && get("city") !== "all" ? get("city") : undefined,
    propertyType: get("propertyType") as PropertyType | undefined,
    listingType: get("listingType") as ListingType | undefined,
    minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
    minBedrooms:
      minBedrooms && minBedrooms !== "all"
        ? parseInt(minBedrooms, 10)
        : undefined,
    sort: (get("sort") as ListingSort) || "newest",
    page,
  };
}

export function hasActiveFilters(filters: ListingFilters): boolean {
  return Boolean(
    filters.q ||
      filters.city ||
      filters.propertyType ||
      filters.listingType ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.minBedrooms
  );
}

export function sampleMatchesFilters(
  listing: Listing,
  filters: ListingFilters
): boolean {
  if (filters.q) {
    const q = filters.q.toLowerCase();
    const hay = `${listing.title} ${listing.description} ${listing.city} ${listing.barangay ?? ""}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (filters.city && listing.city !== filters.city) return false;
  if (filters.propertyType && listing.propertyType !== filters.propertyType)
    return false;
  if (filters.listingType && listing.listingType !== filters.listingType)
    return false;
  if (filters.minPrice && listing.pricePhp < filters.minPrice) return false;
  if (filters.maxPrice && listing.pricePhp > filters.maxPrice) return false;
  if (
    filters.minBedrooms &&
    (listing.bedrooms ?? 0) < filters.minBedrooms
  )
    return false;
  return true;
}

export function buildFilterSearchParams(
  filters: ListingFilters,
  page?: number
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.city) params.set("city", filters.city);
  if (filters.propertyType) params.set("propertyType", filters.propertyType);
  if (filters.listingType) params.set("listingType", filters.listingType);
  if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  if (filters.minBedrooms)
    params.set("minBedrooms", String(filters.minBedrooms));
  if (filters.sort && filters.sort !== "newest")
    params.set("sort", filters.sort);
  if (page && page > 1) params.set("page", String(page));
  return params;
}
