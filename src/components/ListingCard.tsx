import type { Listing } from "@/lib/listing-types";
import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  formatListingType,
  formatPrice,
  formatPropertyType,
} from "@/lib/utils";

type ListingCardProps = {
  listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  const photo = listing.photos[0];
  const isInactive = listing.status !== "active";

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        {photo ? (
          <Image
            src={photo}
            alt={listing.title}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            No photo
          </div>
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          {listing.isSample && <Badge variant="secondary">Sample</Badge>}
          <Badge>{formatListingType(listing.listingType)}</Badge>
          {isInactive && (
            <Badge variant="warning">
              {listing.status === "sold" ? "Sold" : "Rented"}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="text-lg font-bold text-emerald-700">
          {formatPrice(listing.pricePhp)}
          {listing.priceLabel && (
            <span className="ml-1 text-sm font-normal text-slate-500">
              {listing.priceLabel}
            </span>
          )}
        </p>
        <h3 className="mt-1 line-clamp-2 font-semibold text-slate-900">
          {listing.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          {listing.city}
          {listing.barangay ? `, ${listing.barangay}` : ""}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span>{formatPropertyType(listing.propertyType)}</span>
          {listing.bedrooms != null && (
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {listing.bedrooms}
            </span>
          )}
          {listing.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {listing.bathrooms}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
