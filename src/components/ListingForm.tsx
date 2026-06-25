"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
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
  generateFacebookCaptionAction,
  improveDescriptionAction,
} from "@/lib/actions/ai-listing";
import type { ListingCopyInput } from "@/lib/ai/listing-copy";
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

type FormState = {
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  pricePhp: number;
  priceLabel?: string;
  bedrooms: number | null;
  bathrooms: number | null;
  floorAreaSqm: number | null;
  lotAreaSqm: number | null;
  city: string;
  barangay?: string;
  addressNotes?: string;
};

function fromListing(listing: Listing): FormState {
  return {
    title: listing.title,
    description: listing.description,
    listingType: listing.listingType,
    propertyType: listing.propertyType,
    pricePhp: listing.pricePhp,
    priceLabel: listing.priceLabel,
    bedrooms: listing.bedrooms ?? null,
    bathrooms: listing.bathrooms ?? null,
    floorAreaSqm: listing.floorAreaSqm ?? null,
    lotAreaSqm: listing.lotAreaSqm ?? null,
    city: listing.city,
    barangay: listing.barangay,
    addressNotes: listing.addressNotes,
  };
}

const emptyForm = (): FormState => ({
  title: "",
  description: "",
  listingType: "sale",
  propertyType: "house_and_lot",
  pricePhp: 0,
  city: "",
  bedrooms: null,
  bathrooms: null,
  floorAreaSqm: null,
  lotAreaSqm: null,
});

function listingPublicUrl(slug?: string): string {
  if (!slug) return "";
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/listings/${slug}`;
}

export function ListingForm({ listing, onSaved, onCancel }: ListingFormProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>(listing?.photos ?? []);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(listing?.clientId ?? "");
  const [draft, setDraft] = useState<FormState>(
    listing ? fromListing(listing) : emptyForm(),
  );
  const [fbCaption, setFbCaption] = useState("");
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAiPending, startAiTransition] = useTransition();

  useEffect(() => {
    fetchClients().then(({ clients: c }) => {
      setClients(c);
      if (!listing && c.length) setClientId(c.find((x) => x.isDefault)?.id ?? c[0].id);
      if (listing) setClientId(listing.clientId);
    });
  }, [listing]);

  useEffect(() => {
    if (listing) {
      setDraft(fromListing(listing));
      setPhotos(listing.photos);
    }
  }, [listing]);

  const selectedClient = clients.find((c) => c.id === clientId);

  function copyInput(): ListingCopyInput {
    return {
      ...draft,
      listingUrl: listingPublicUrl(listing?.slug),
      contactName: selectedClient?.name,
      contactPhone: selectedClient?.phone,
    };
  }

  function handleImproveDescription() {
    setAiError(null);
    setAiNote(null);
    startAiTransition(async () => {
      const { text, usedAi, error: err } = await improveDescriptionAction(copyInput());
      if (err || !text) {
        setAiError(err ?? "Could not improve description.");
        return;
      }
      setDraft({ ...draft, description: text });
      setAiNote(
        usedAi
          ? "Description updated with AI."
          : "Description updated (template — add GEMINI_API_KEY for AI wording).",
      );
    });
  }

  function handleGenerateCaption() {
    setAiError(null);
    setAiNote(null);
    startAiTransition(async () => {
      const { text, usedAi, error: err } = await generateFacebookCaptionAction(
        copyInput(),
      );
      if (err || !text) {
        setAiError(err ?? "Could not generate caption.");
        return;
      }
      setFbCaption(text);
      setAiNote(
        usedAi
          ? "Facebook caption ready — copy and paste to Facebook."
          : "Caption ready (template). Publish first for the listing link, or add GEMINI_API_KEY for AI copy.",
      );
    });
  }

  async function handleCopyCaption() {
    if (!fbCaption.trim()) return;
    await navigator.clipboard.writeText(fbCaption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const input = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      listingType: draft.listingType,
      propertyType: draft.propertyType,
      pricePhp: draft.pricePhp,
      priceLabel: draft.priceLabel?.trim() || undefined,
      bedrooms: draft.bedrooms ?? null,
      bathrooms: draft.bathrooms ?? null,
      floorAreaSqm: draft.floorAreaSqm ?? null,
      lotAreaSqm: draft.lotAreaSqm ?? null,
      city: draft.city,
      barangay: draft.barangay?.trim() || undefined,
      addressNotes: draft.addressNotes?.trim() || undefined,
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
              required
              placeholder="2-Storey Townhouse in Richwood Homes Toledo"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="listingType">For sale or rent *</Label>
            <Select
              id="listingType"
              required
              value={draft.listingType}
              onChange={(e) =>
                setDraft({ ...draft, listingType: e.target.value as ListingType })
              }
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
              required
              value={draft.propertyType}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  propertyType: e.target.value as PropertyType,
                })
              }
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
              type="number"
              required
              min={1}
              value={draft.pricePhp || ""}
              onChange={(e) =>
                setDraft({ ...draft, pricePhp: Number(e.target.value) || 0 })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="priceLabel">Price note</Label>
            <Input
              id="priceLabel"
              placeholder="₱4,967/month equity"
              value={draft.priceLabel ?? ""}
              onChange={(e) => setDraft({ ...draft, priceLabel: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              type="number"
              min={0}
              value={draft.bedrooms ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  bedrooms: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              type="number"
              min={0}
              value={draft.bathrooms ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  bathrooms: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="floorAreaSqm">Floor area (sq.m.)</Label>
            <Input
              id="floorAreaSqm"
              type="number"
              min={0}
              step="0.1"
              value={draft.floorAreaSqm ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  floorAreaSqm: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="lotAreaSqm">Lot area (sq.m.)</Label>
            <Input
              id="lotAreaSqm"
              type="number"
              min={0}
              step="0.1"
              value={draft.lotAreaSqm ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  lotAreaSqm: e.target.value ? Number(e.target.value) : null,
                })
              }
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
              required
              value={draft.city}
              onChange={(e) => setDraft({ ...draft, city: e.target.value })}
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
              value={draft.barangay ?? ""}
              onChange={(e) => setDraft({ ...draft, barangay: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="addressNotes">Landmark (optional)</Label>
            <Input
              id="addressNotes"
              value={draft.addressNotes ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, addressNotes: e.target.value })
              }
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Description</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Shown on your listing page. Fill in details above, then use AI to
              write professional copy.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border-violet-300 text-violet-800 hover:bg-violet-50"
            disabled={isAiPending}
            onClick={handleImproveDescription}
          >
            {isAiPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Improve with AI
          </Button>
        </CardHeader>
        <CardContent>
          <Textarea
            id="description"
            required
            rows={8}
            placeholder="Write a short description, or click Improve with AI after filling price and location."
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card className="border-violet-200 bg-gradient-to-b from-violet-50/80 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-violet-900">
            <Sparkles className="h-5 w-5 text-violet-600" />
            Facebook post caption
          </CardTitle>
          <p className="text-sm text-slate-600">
            After publishing, generate a caption to copy and paste on Facebook
            {listing ? " (includes your listing link)." : "."}
            {!listing && " Publish first, then edit to regenerate with the link."}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={10}
            readOnly
            placeholder="Click Generate caption — uses your form details and client contact info."
            value={fbCaption}
            className="font-mono text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-violet-300 text-violet-800 hover:bg-violet-50"
              disabled={isAiPending}
              onClick={handleGenerateCaption}
            >
              {isAiPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate caption
                </>
              )}
            </Button>
            {fbCaption && (
              <Button type="button" variant="secondary" onClick={handleCopyCaption}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy caption
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {aiNote && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{aiNote}</p>
      )}
      {aiError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{aiError}</p>
      )}
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
