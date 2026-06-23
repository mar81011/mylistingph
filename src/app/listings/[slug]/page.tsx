import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ListingDetailView } from "@/components/ListingDetailView";
import { getSampleListing, isSampleSlug } from "@/lib/sample-listing";
import { fetchListingBySlug, trackListingView } from "@/lib/actions/listings-db";
import { formatListingType, formatPrice, getSiteUrl } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (isSampleSlug(slug)) {
    const listing = getSampleListing();
    const ogImage = listing.photos[0];
    return {
      title: listing.title,
      description: `${formatPrice(listing.pricePhp)} · ${listing.city}`,
      openGraph: {
        title: `${listing.title} | ${formatPrice(listing.pricePhp)}`,
        description: `${formatListingType(listing.listingType)} · ${listing.city}`,
        url: `${getSiteUrl()}/listings/${listing.slug}`,
        images: ogImage ? [{ url: ogImage }] : [],
      },
    };
  }

  const listing = await fetchListingBySlug(slug);
  if (!listing) return { title: "Listing not found" };

  const ogImage = listing.photos[0];
  return {
    title: listing.title,
    description: `${formatPrice(listing.pricePhp)} · ${listing.city}`,
    openGraph: {
      title: `${listing.title} | ${formatPrice(listing.pricePhp)}`,
      description: `${formatListingType(listing.listingType)} · ${listing.city}`,
      url: `${getSiteUrl()}/listings/${listing.slug}`,
      images: ogImage ? [{ url: ogImage }] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params;

  if (isSampleSlug(slug)) {
    return <ListingDetailView listing={getSampleListing()} />;
  }

  const listing = await fetchListingBySlug(slug);
  if (!listing) notFound();

  await trackListingView(slug);

  return <ListingDetailView listing={listing} />;
}
