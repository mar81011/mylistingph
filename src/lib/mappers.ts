import type { Client, Listing } from "@/lib/listing-types";

export type ClientRow = {
  id: string;
  name: string;
  phone: string;
  messengerUrl: string;
  facebookUrl: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ListingRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  listingType: Listing["listingType"];
  propertyType: Listing["propertyType"];
  pricePhp: number;
  priceLabel: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floorAreaSqm: number | null;
  lotAreaSqm: number | null;
  region: string | null;
  province: string | null;
  city: string;
  barangay: string | null;
  addressNotes: string | null;
  photos: string[];
  contactName: string;
  contactPhone: string;
  messengerUrl: string | null;
  facebookUrl: string | null;
  status: Listing["status"];
  viewCount: number;
  clientId: string;
  createdAt: string;
  updatedAt?: string;
};

export function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    messengerUrl: row.messengerUrl,
    facebookUrl: row.facebookUrl,
    isDefault: row.isDefault,
  };
}

export function mapListing(row: ListingRow): Listing {
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
    photos: row.photos ?? [],
    clientId: row.clientId,
    contactName: row.contactName,
    contactPhone: row.contactPhone,
    messengerUrl: row.messengerUrl ?? undefined,
    facebookUrl: row.facebookUrl ?? undefined,
    status: row.status,
    createdAt: row.createdAt,
  };
}
