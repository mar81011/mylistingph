"use client";

import Link from "next/link";
import {
  Bed,
  Bath,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/ShareButtons";
import { ListingPhoto } from "@/components/ListingPhoto";
import type { Listing } from "@/lib/listing-types";
import {
  formatListingType,
  formatPrice,
  formatPropertyType,
} from "@/lib/utils";

type ListingDetailViewProps = {
  listing: Listing;
};

export function ListingDetailView({ listing }: ListingDetailViewProps) {
  const telHref = `tel:${listing.contactPhone.replace(/\s/g, "")}`;
  const postedDate = new Date(listing.createdAt).toLocaleDateString("en-PH");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {listing.isSample && (
        <p className="mb-4 rounded-lg bg-slate-100 px-4 py-2 text-center text-sm text-slate-600">
          Sample listing — this is how yours will look when shared on Facebook
        </p>
      )}

      {listing.status === "sold" && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-center">
          <p className="text-lg font-bold text-amber-900">SOLD</p>
          <p className="text-sm text-amber-800">This property is no longer available.</p>
        </div>
      )}

      {listing.status === "rented" && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-center">
          <p className="text-lg font-bold text-amber-900">RENTED</p>
          <p className="text-sm text-amber-800">This property is no longer available.</p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge>{formatListingType(listing.listingType)}</Badge>
        <Badge variant="secondary">
          {formatPropertyType(listing.propertyType)}
        </Badge>
        {listing.status !== "active" && (
          <Badge variant="warning">
            {listing.status === "sold" ? "Sold" : "Rented"}
          </Badge>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          {listing.photos.length > 0 ? (
            <div className="space-y-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                <ListingPhoto
                  src={listing.photos[0]}
                  alt={listing.title}
                  fill
                  priority
                />
              </div>
              {listing.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {listing.photos.slice(1).map((photo, i) => (
                    <div
                      key={photo}
                      className="relative aspect-square overflow-hidden rounded-lg"
                    >
                      <ListingPhoto
                        src={photo}
                        alt={`${listing.title} photo ${i + 2}`}
                        fill
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              No photos
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{listing.title}</h1>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {formatPrice(listing.pricePhp)}
            {listing.priceLabel && (
              <span className="ml-2 text-base font-normal text-slate-500">
                {listing.priceLabel}
              </span>
            )}
          </p>

          <p className="mt-3 flex items-center gap-2 text-slate-600">
            <MapPin className="h-4 w-4 shrink-0" />
            {[listing.barangay, listing.city].filter(Boolean).join(", ")}
          </p>

          {listing.addressNotes && (
            <p className="mt-1 text-sm text-slate-500">{listing.addressNotes}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-700">
            {listing.bedrooms != null && (
              <span className="flex items-center gap-1.5">
                <Bed className="h-4 w-4" />
                {listing.bedrooms} bed
              </span>
            )}
            {listing.bathrooms != null && (
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" />
                {listing.bathrooms} bath
              </span>
            )}
          </div>

          <p className="mt-4 flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            Posted {postedDate}
          </p>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-medium text-slate-900">Contact</h2>
            <p className="mt-1 text-sm text-slate-600">
              {listing.contactName} · {listing.contactPhone}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={telHref}>
                <Button size="sm">
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
              </a>
              {listing.messengerUrl && (
                <a
                  href={listing.messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4" />
                    Messenger
                  </Button>
                </a>
              )}
              {listing.facebookUrl && (
                <a
                  href={listing.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4" />
                    Facebook
                  </Button>
                </a>
              )}
            </div>
          </div>

          <div className="mt-4">
            <ShareButtons slug={listing.slug} title={listing.title} />
          </div>

          <div className="mt-8">
            <h2 className="font-semibold">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-600">
              {listing.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/">
          <Button variant="ghost">← Back to listings</Button>
        </Link>
      </div>
    </div>
  );
}
