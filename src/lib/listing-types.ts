export type ListingType = "sale" | "rent";

export type PropertyType =
  | "house_and_lot"
  | "condo"
  | "townhouse"
  | "apartment"
  | "vacant_lot"
  | "commercial";

export type ListingStatus = "active" | "sold" | "rented";

/** A client/seller whose contact info appears on listings */
export type Client = {
  id: string;
  name: string;
  phone: string;
  messengerUrl: string;
  facebookUrl: string;
  isDefault: boolean;
};

export type Listing = {
  id: string;
  slug: string;
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
  contactName: string;
  contactPhone: string;
  messengerUrl?: string;
  facebookUrl?: string;
  status: ListingStatus;
  createdAt: string;
  isSample?: boolean;
};

/** @deprecated use Client */
export type SellerProfile = Pick<
  Client,
  "name" | "phone" | "messengerUrl" | "facebookUrl"
>;
