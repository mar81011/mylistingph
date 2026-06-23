import type { ListingStatus, ListingType, PropertyType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { mapListing } from "@/lib/mappers";
import { generateSlug } from "@/lib/utils";
import type { Listing } from "@/lib/listing-types";
import { getClientByIdFromDb } from "@/lib/data/clients";

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

export async function getAllListingsFromDb(): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(mapListing);
}

export async function getActiveListingsFromDb(): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapListing);
}

export async function getListingBySlugFromDb(slug: string): Promise<Listing | null> {
  const row = await prisma.listing.findUnique({ where: { slug } });
  return row ? mapListing(row) : null;
}

export async function getListingByIdFromDb(id: string): Promise<Listing | null> {
  const row = await prisma.listing.findUnique({ where: { id } });
  return row ? mapListing(row) : null;
}

export async function createListingInDb(input: ListingInput): Promise<Listing> {
  const client = await getClientByIdFromDb(input.clientId);
  if (!client) throw new Error("Client not found");

  const row = await prisma.listing.create({
    data: {
      ...input,
      slug: generateSlug(input.title),
      contactName: client.name,
      contactPhone: client.phone,
      messengerUrl: client.messengerUrl || null,
      facebookUrl: client.facebookUrl || null,
      region: null,
      province: null,
      barangay: input.barangay ?? null,
      addressNotes: input.addressNotes ?? null,
      priceLabel: input.priceLabel ?? null,
    },
  });
  return mapListing(row);
}

export async function updateListingInDb(
  id: string,
  input: ListingInput
): Promise<Listing> {
  const client = await getClientByIdFromDb(input.clientId);
  if (!client) throw new Error("Client not found");

  const row = await prisma.listing.update({
    where: { id },
    data: {
      ...input,
      contactName: client.name,
      contactPhone: client.phone,
      messengerUrl: client.messengerUrl || null,
      facebookUrl: client.facebookUrl || null,
      barangay: input.barangay ?? null,
      addressNotes: input.addressNotes ?? null,
      priceLabel: input.priceLabel ?? null,
    },
  });
  return mapListing(row);
}

export async function updateListingStatusInDb(
  id: string,
  status: ListingStatus
): Promise<void> {
  await prisma.listing.update({ where: { id }, data: { status } });
}

export async function deleteListingFromDb(id: string): Promise<void> {
  await prisma.listing.delete({ where: { id } });
}

export async function incrementListingViews(slug: string): Promise<void> {
  await prisma.listing.updateMany({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  });
}
