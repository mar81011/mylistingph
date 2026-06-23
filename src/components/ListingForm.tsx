"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Listing, ListingType, PropertyType } from "@/lib/listing-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoUpload } from "@/components/PhotoUpload";
import { LISTING_TYPES, PH_CITIES, PROPERTY_TYPES } from "@/lib/constants";
import { fetchClients } from "@/lib/actions/clients";
import {
  createListingAction,
  updateListingAction,
} from "@/lib/actions/listings-db";
import type { Client } from "@/lib/listing-types";

type ListingFormProps = {
  listing?: Listing;
  onSaved?: (slug: string) => void;
  onCancel?: () => void;
};

export function ListingForm({ listing, onSaved, onCancel }: ListingFormProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>(listing?.photos ?? []);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(listing?.clientId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchClients().then(({ clients: c }) => {
      setClients(c);
      if (!listing && c.length) setClientId(c.find((x) => x.isDefault)?.id ?? c[0].id);
      if (listing) setClientId(listing.clientId);
    });
  }, [listing]);

  const selectedClient = clients.find((c) => c.id === clientId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);

    const input = {
      title: String(form.get("title")),
      description: String(form.get("description")),
      listingType: String(form.get("listingType")) as ListingType,
      propertyType: String(form.get("propertyType")) as PropertyType,
      pricePhp: Number(form.get("pricePhp")),
      priceLabel: String(form.get("priceLabel") || "") || undefined,
      bedrooms: form.get("bedrooms") ? Number(form.get("bedrooms")) : null,
      bathrooms: form.get("bathrooms") ? Number(form.get("bathrooms")) : null,
      city: String(form.get("city")),
      barangay: String(form.get("barangay") || "") || undefined,
      addressNotes: String(form.get("addressNotes") || "") || undefined,
      photos,
      clientId,
    };

    if (!input.title || !input.city || !input.pricePhp || !clientId) {
      setError("Title, city, price, and client are required.");
      return;
    }

    if (photos.length === 0) {
      setError("Please add at least one photo.");
      return;
    }

    startTransition(async () => {
      try {
        const saved = listing
          ? await updateListingAction(listing.id, input)
          : await createListingAction(input);
        if (onSaved) {
          onSaved(saved.slug);
        } else {
          router.push(`/listings/${saved.slug}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save listing.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="clientId">Who is this listing for? *</Label>
            <Select
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1"
              required
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.phone}
                </option>
              ))}
            </Select>
          </div>
          {selectedClient && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Contact on listing: <strong>{selectedClient.name}</strong>,{" "}
              <strong>{selectedClient.phone}</strong>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUpload photos={photos} onChange={setPhotos} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Property details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="3BR House and Lot in Quezon City"
              defaultValue={listing?.title}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="listingType">For sale or rent *</Label>
            <Select
              id="listingType"
              name="listingType"
              required
              defaultValue={listing?.listingType ?? "sale"}
              className="mt-1"
            >
              {LISTING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="propertyType">Property type *</Label>
            <Select
              id="propertyType"
              name="propertyType"
              required
              defaultValue={listing?.propertyType ?? "house_and_lot"}
              className="mt-1"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="pricePhp">Price (₱) *</Label>
            <Input
              id="pricePhp"
              name="pricePhp"
              type="number"
              required
              min={0}
              defaultValue={listing?.pricePhp}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="priceLabel">Price note</Label>
            <Input
              id="priceLabel"
              name="priceLabel"
              placeholder="Negotiable"
              defaultValue={listing?.priceLabel ?? ""}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min={0}
              defaultValue={listing?.bedrooms ?? ""}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              defaultValue={listing?.bathrooms ?? ""}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Select
              id="city"
              name="city"
              required
              defaultValue={listing?.city ?? ""}
              className="mt-1"
            >
              <option value="" disabled>
                Select city
              </option>
              {PH_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="barangay">Barangay / area</Label>
            <Input
              id="barangay"
              name="barangay"
              defaultValue={listing?.barangay ?? ""}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="addressNotes">Landmark (optional)</Label>
            <Input
              id="addressNotes"
              name="addressNotes"
              defaultValue={listing?.addressNotes ?? ""}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={listing?.description}
          />
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Saving..." : listing ? "Update listing" : "Publish listing"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" size="lg" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
