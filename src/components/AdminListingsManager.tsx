"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/ListingCard";
import { ShareButtons } from "@/components/ShareButtons";
import type { Listing, ListingStatus } from "@/lib/listing-types";
import {
  deleteListingAction,
  fetchAllListings,
  updateListingStatusAction,
} from "@/lib/actions/listings-db";
import { fetchClients } from "@/lib/actions/clients";
import type { Client } from "@/lib/listing-types";

type AdminListingsManagerProps = {
  onEdit: (id: string) => void;
};

export function AdminListingsManager({ onEdit }: AdminListingsManagerProps) {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isPending, startTransition] = useTransition();

  function refresh() {
    Promise.all([fetchAllListings(), fetchClients()]).then(([l, c]) => {
      setListings(l);
      setClients(c);
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  function setStatus(id: string, status: ListingStatus) {
    startTransition(async () => {
      await updateListingStatusAction(id, status);
      refresh();
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this listing?")) return;
    startTransition(async () => {
      await deleteListingAction(id);
      refresh();
      router.refresh();
    });
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-slate-500">No listings yet. Create one in the Create tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-500">
        Sold or rented listings are hidden from the homepage.
      </p>

      {listings.map((listing) => {
        const client = clients.find((c) => c.id === listing.clientId);
        const isActive = listing.status === "active";

        return (
          <div
            key={listing.id}
            className={`space-y-3 rounded-xl border p-4 ${
              isActive ? "border-slate-200 bg-white" : "border-amber-200 bg-amber-50/30"
            }`}
          >
            {!isActive && (
              <p className="flex items-center gap-2 text-sm font-medium text-amber-800">
                <CheckCircle className="h-4 w-4" />
                {listing.status === "sold" ? "Sold" : "Rented"}
              </p>
            )}
            <ListingCard listing={listing} />
            {client && (
              <p className="text-sm text-slate-500">
                Client: {client.name} · {client.phone}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <ShareButtons slug={listing.slug} title={listing.title} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/listings/${listing.slug}`)}
              >
                View page
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(listing.id)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              {listing.status !== "sold" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setStatus(listing.id, "sold")}
                >
                  Mark as Sold
                </Button>
              )}
              {listing.listingType === "rent" && listing.status !== "rented" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setStatus(listing.id, "rented")}
                >
                  Mark as Rented
                </Button>
              )}
              {!isActive && (
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => setStatus(listing.id, "active")}
                >
                  Mark as Active
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={() => handleDelete(listing.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
