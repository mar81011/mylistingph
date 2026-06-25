import type { Listing } from "@/lib/listing-types";

export const SAMPLE_LISTING_SLUG = "sample-3br-house-quezon-city";

export const SAMPLE_LISTING: Listing = {
  id: "sample",
  slug: SAMPLE_LISTING_SLUG,
  title: "3BR House and Lot in Quezon City",
  description:
    "Spacious 3-bedroom house and lot near schools and malls. Clean title, ready for occupancy. Quiet subdivision with 24/7 security. Perfect for growing families.",
  listingType: "sale",
  propertyType: "house_and_lot",
  pricePhp: 4500000,
  priceLabel: "Negotiable",
  bedrooms: 3,
  bathrooms: 2,
  floorAreaSqm: 120,
  lotAreaSqm: 150,
  city: "Quezon City",
  barangay: "Fairview",
  addressNotes: "Near SM Fairview",
  photos: [
    "https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
  ],
  clientId: "sample-client",
  contactName: "Maria Santos",
  contactPhone: "09171234567",
  messengerUrl: "https://m.me/example",
  facebookUrl: "https://facebook.com/example",
  status: "active",
  createdAt: new Date().toISOString(),
  isSample: true,
};

export function getSampleListing(): Listing {
  return SAMPLE_LISTING;
}

export function isSampleSlug(slug: string): boolean {
  return slug === SAMPLE_LISTING_SLUG;
}
