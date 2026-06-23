"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildFilterSearchParams } from "@/lib/listing-filters";

type ListingsPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
};

export function ListingsPagination({
  page,
  totalPages,
  total,
}: ListingsPaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const filters = Object.fromEntries(searchParams.entries());

  function hrefForPage(targetPage: number) {
    const params = buildFilterSearchParams(
      {
        q: filters.q,
        city: filters.city,
        propertyType: filters.propertyType as never,
        listingType: filters.listingType as never,
        minPrice: filters.minPrice ? parseInt(filters.minPrice, 10) : undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice, 10) : undefined,
        minBedrooms: filters.minBedrooms
          ? parseInt(filters.minBedrooms, 10)
          : undefined,
        sort: (filters.sort as "newest" | "price_asc" | "price_desc") || "newest",
      },
      targetPage
    );
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  const from = (page - 1) * 12 + 1;
  const to = Math.min(page * 12, total);

  return (
    <div className="mt-10 flex flex-col items-center gap-4 border-t border-slate-200 pt-8">
      <p className="text-sm text-slate-500">
        Showing {from}–{to} of {total} listings
      </p>
      <nav className="flex flex-wrap items-center justify-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          asChild={page > 1}
        >
          {page > 1 ? (
            <Link href={hrefForPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
          ) : (
            <span>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </span>
          )}
        </Button>

        {start > 1 && (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={hrefForPage(1)}>1</Link>
            </Button>
            {start > 2 && <span className="px-1 text-slate-400">…</span>}
          </>
        )}

        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="sm"
            asChild={p !== page}
          >
            {p === page ? (
              <span>{p}</span>
            ) : (
              <Link href={hrefForPage(p)}>{p}</Link>
            )}
          </Button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <span className="px-1 text-slate-400">…</span>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={hrefForPage(totalPages)}>{totalPages}</Link>
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          asChild={page < totalPages}
        >
          {page < totalPages ? (
            <Link href={hrefForPage(page + 1)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span>
              Next
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </nav>
    </div>
  );
}
