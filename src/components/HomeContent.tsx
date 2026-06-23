"use client";

import { ListingCard } from "@/components/ListingCard";
import { ContactStrip } from "@/components/ContactStrip";
import type { Client, Listing } from "@/lib/listing-types";
import { SAMPLE_LISTING } from "@/lib/sample-listing";

type HomeContentProps = {
  listings: Listing[];
  defaultClient: Client | null;
};

export function HomeContent({ listings, defaultClient }: HomeContentProps) {
  const allListings = [SAMPLE_LISTING, ...listings];

  return (
    <div>
      <section className="bg-gradient-to-b from-emerald-50 to-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Property listings you can trust
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Browse available properties below. When you find one you like, get in
            touch — we&apos;re happy to help.
          </p>
          {defaultClient && (
            <div className="mt-6 flex justify-center">
              <ContactStrip client={defaultClient} />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 pb-16">
        <h2 className="mb-2 text-xl font-semibold">Available listings</h2>
        <p className="mb-6 text-sm text-slate-500">
          Tap a listing for photos, details, and contact info.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
