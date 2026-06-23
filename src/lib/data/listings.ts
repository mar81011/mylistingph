import type { ListingStatus, ListingType, PropertyType } from "@/lib/listing-types";
import { createServiceClient } from "@/lib/supabase/admin";
import { mapListing, type ListingRow } from "@/lib/mappers";
import { generateId, generateSlug } from "@/lib/utils";
import type { Listing } from "@/lib/listing-types";
import { getClientByIdFromDb } from "@/lib/data/clients";
import {
  LISTINGS_PAGE_SIZE,
  type ListingFilters,
  type ListingSort,
  type PaginatedListings,
} from "@/lib/listing-filters";
import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";

export type ListingInput = {
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  pricePhp: number;
  priceLabel?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  floorAreaSqm?: number | null;
  lotAreaSqm?: number | null;
  city: string;
  barangay?: string;
  addressNotes?: string;
  photos: string[];
  clientId: string;
};

function db() {
  return createServiceClient();
}

function now() {
  return new Date().toISOString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ListingQuery = PostgrestFilterBuilder<any, any, any, any[], "Listing", unknown, "GET">;

function applyFilters(
  query: ListingQuery,
  filters: ListingFilters
): ListingQuery {
  let q = query.eq("status", "active");

  if (filters.q) {
    const term = `%${filters.q}%`;
    q = q.or(
      `title.ilike.${term},description.ilike.${term},city.ilike.${term},barangay.ilike.${term}`
    );
  }
  if (filters.city) q = q.eq("city", filters.city);
  if (filters.propertyType) q = q.eq("propertyType", filters.propertyType);
  if (filters.listingType) q = q.eq("listingType", filters.listingType);
  if (filters.minBedrooms) q = q.gte("bedrooms", filters.minBedrooms);
  if (filters.minPrice !== undefined) q = q.gte("pricePhp", filters.minPrice);
  if (filters.maxPrice !== undefined) q = q.lte("pricePhp", filters.maxPrice);

  return q;
}

function applySort(query: ListingQuery, sort?: ListingSort): ListingQuery {
  switch (sort) {
    case "price_asc":
      return query.order("pricePhp", { ascending: true });
    case "price_desc":
      return query.order("pricePhp", { ascending: false });
    default:
      return query.order("createdAt", { ascending: false });
  }
}

export async function getAllListingsFromDb(): Promise<Listing[]> {
  const { data, error } = await db()
    .from("Listing")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) throw error;
  return (data as ListingRow[]).map(mapListing);
}

export async function searchActiveListingsFromDb(
  filters: ListingFilters,
  options: { includeSampleSlot?: boolean } = {}
): Promise<PaginatedListings> {
  const page = filters.page ?? 1;
  const pageSize = LISTINGS_PAGE_SIZE;
  const sampleSlot = options.includeSampleSlot ? 1 : 0;

  const countQuery = applyFilters(
    db().from("Listing").select("*", { count: "exact", head: true }),
    filters
  );
  const { count: totalDb, error: countError } = await countQuery;
  if (countError) throw countError;

  const total = (totalDb ?? 0) + sampleSlot;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  let dbSkip: number;
  let dbTake: number;

  if (page === 1 && sampleSlot) {
    dbSkip = 0;
    dbTake = pageSize - 1;
  } else if (sampleSlot) {
    dbSkip = (page - 1) * pageSize - 1;
    dbTake = pageSize;
  } else {
    dbSkip = (page - 1) * pageSize;
    dbTake = pageSize;
  }

  const dataQuery = applySort(
    applyFilters(db().from("Listing").select("*"), filters),
    filters.sort
  ).range(Math.max(0, dbSkip), Math.max(0, dbSkip) + dbTake - 1);

  const { data, error } = await dataQuery;
  if (error) throw error;

  return {
    listings: (data as ListingRow[]).map(mapListing),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getListingBySlugFromDb(slug: string): Promise<Listing | null> {
  const { data, error } = await db()
    .from("Listing")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapListing(data as ListingRow) : null;
}

export async function getListingByIdFromDb(id: string): Promise<Listing | null> {
  const { data, error } = await db()
    .from("Listing")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapListing(data as ListingRow) : null;
}

export async function createListingInDb(input: ListingInput): Promise<Listing> {
  const client = await getClientByIdFromDb(input.clientId);
  if (!client) throw new Error("Client not found");

  const timestamp = now();
  const row = {
    id: generateId(),
    slug: generateSlug(input.title),
    title: input.title,
    description: input.description,
    listingType: input.listingType,
    propertyType: input.propertyType,
    pricePhp: input.pricePhp,
    priceLabel: input.priceLabel ?? null,
    bedrooms: input.bedrooms ?? null,
    bathrooms: input.bathrooms ?? null,
    floorAreaSqm: input.floorAreaSqm ?? null,
    lotAreaSqm: input.lotAreaSqm ?? null,
    region: null,
    province: null,
    city: input.city,
    barangay: input.barangay ?? null,
    addressNotes: input.addressNotes ?? null,
    photos: input.photos,
    contactName: client.name,
    contactPhone: client.phone,
    messengerUrl: client.messengerUrl || null,
    facebookUrl: client.facebookUrl || null,
    status: "active" as const,
    viewCount: 0,
    clientId: input.clientId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const { data, error } = await db()
    .from("Listing")
    .insert(row)
    .select("*")
    .single();

  if (error) throw error;
  return mapListing(data as ListingRow);
}

export async function updateListingInDb(
  id: string,
  input: ListingInput
): Promise<Listing> {
  const client = await getClientByIdFromDb(input.clientId);
  if (!client) throw new Error("Client not found");

  const { data, error } = await db()
    .from("Listing")
    .update({
      title: input.title,
      description: input.description,
      listingType: input.listingType,
      propertyType: input.propertyType,
      pricePhp: input.pricePhp,
      priceLabel: input.priceLabel ?? null,
      bedrooms: input.bedrooms ?? null,
      bathrooms: input.bathrooms ?? null,
      floorAreaSqm: input.floorAreaSqm ?? null,
      lotAreaSqm: input.lotAreaSqm ?? null,
      city: input.city,
      barangay: input.barangay ?? null,
      addressNotes: input.addressNotes ?? null,
      photos: input.photos,
      contactName: client.name,
      contactPhone: client.phone,
      messengerUrl: client.messengerUrl || null,
      facebookUrl: client.facebookUrl || null,
      clientId: input.clientId,
      updatedAt: now(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapListing(data as ListingRow);
}

export async function updateListingStatusInDb(
  id: string,
  status: ListingStatus
): Promise<void> {
  const { error } = await db()
    .from("Listing")
    .update({ status, updatedAt: now() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteListingFromDb(id: string): Promise<void> {
  const { error } = await db().from("Listing").delete().eq("id", id);
  if (error) throw error;
}

export async function incrementListingViews(slug: string): Promise<void> {
  const { data, error: readError } = await db()
    .from("Listing")
    .select("viewCount")
    .eq("slug", slug)
    .maybeSingle();

  if (readError) throw readError;
  if (!data) return;

  const { error } = await db()
    .from("Listing")
    .update({ viewCount: (data.viewCount ?? 0) + 1, updatedAt: now() })
    .eq("slug", slug);

  if (error) throw error;
}
