"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { LISTING_TYPES, PH_CITIES, PROPERTY_TYPES } from "@/lib/constants";

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    formData.forEach((value, key) => {
      if (value && value !== "all") {
        params.set(key, String(value));
      }
    });

    router.push(`/listings?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4"
    >
      <div className="md:col-span-2 lg:col-span-4">
        <Label htmlFor="q">Search</Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="q"
            name="q"
            placeholder="City, barangay, keywords..."
            defaultValue={searchParams.get("q") ?? ""}
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="city">City</Label>
        <Select
          id="city"
          name="city"
          defaultValue={searchParams.get("city") ?? "all"}
          className="mt-1"
        >
          <option value="all">All cities</option>
          {PH_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="listingType">Type</Label>
        <Select
          id="listingType"
          name="listingType"
          defaultValue={searchParams.get("listingType") ?? "all"}
          className="mt-1"
        >
          <option value="all">Sale or Rent</option>
          {LISTING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="propertyType">Property</Label>
        <Select
          id="propertyType"
          name="propertyType"
          defaultValue={searchParams.get("propertyType") ?? "all"}
          className="mt-1"
        >
          <option value="all">All types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="minPrice">Min price (₱)</Label>
        <Input
          id="minPrice"
          name="minPrice"
          type="number"
          min={0}
          placeholder="0"
          defaultValue={searchParams.get("minPrice") ?? ""}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="maxPrice">Max price (₱)</Label>
        <Input
          id="maxPrice"
          name="maxPrice"
          type="number"
          min={0}
          placeholder="Any"
          defaultValue={searchParams.get("maxPrice") ?? ""}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="minBedrooms">Min bedrooms</Label>
        <Select
          id="minBedrooms"
          name="minBedrooms"
          defaultValue={searchParams.get("minBedrooms") ?? "all"}
          className="mt-1"
        >
          <option value="all">Any</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="sort">Sort by</Label>
        <Select
          id="sort"
          name="sort"
          defaultValue={searchParams.get("sort") ?? "newest"}
          className="mt-1"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </Select>
      </div>

      <div className="flex items-end md:col-span-2 lg:col-span-4">
        <Button type="submit" className="w-full sm:w-auto">
          <Search className="h-4 w-4" />
          Search listings
        </Button>
      </div>
    </form>
  );
}
