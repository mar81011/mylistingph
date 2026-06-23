"use client";

import { Suspense } from "react";
import { ListingCard } from "@/components/ListingCard";
import { ContactStrip } from "@/components/ContactStrip";
import { ListingsPagination } from "@/components/ListingsPagination";
import { SearchFilters } from "@/components/SearchFilters";
import type { Client, Listing } from "@/lib/listing-types";

type HomeContentProps = {
  listings: Listing[];
  defaultClient: Client | null;
  page: number;
  totalPages: number;
  total: number;
};

export function HomeContent({
  listings,
  defaultClient,
  page,
  totalPages,
  total,
}: HomeContentProps) {
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

        <Suspense fallback={<div className="mb-8 h-14 animate-pulse rounded-xl bg-slate-100" />}>
          <div className="mb-8">
            <SearchFilters />
          </div>
        </Suspense>

        {listings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
            <p className="text-slate-600">No listings match your search.</p>
            <p className="mt-1 text-sm text-slate-500">
              Try different filters or clear your search.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        <Suspense>
          <ListingsPagination
            page={page}
            totalPages={totalPages}
            total={total}
          />
        </Suspense>
      </section>
    </div>
  );
}
