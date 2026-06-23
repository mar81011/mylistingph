import type { Client as PrismaClient, Listing as PrismaListing } from "@prisma/client";
import type { Client, Listing } from "@/lib/listing-types";

export function mapClient(row: PrismaClient): Client {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    messengerUrl: row.messengerUrl,
    facebookUrl: row.facebookUrl,
    isDefault: row.isDefault,
  };
}

export function mapListing(row: PrismaListing): Listing {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    listingType: row.listingType,
    propertyType: row.propertyType,
    pricePhp: row.pricePhp,
    priceLabel: row.priceLabel ?? undefined,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    floorAreaSqm: row.floorAreaSqm,
    lotAreaSqm: row.lotAreaSqm,
    city: row.city,
    barangay: row.barangay ?? undefined,
    addressNotes: row.addressNotes ?? undefined,
    photos: row.photos,
    clientId: row.clientId,
    contactName: row.contactName,
    contactPhone: row.contactPhone,
    messengerUrl: row.messengerUrl ?? undefined,
    facebookUrl: row.facebookUrl ?? undefined,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}
