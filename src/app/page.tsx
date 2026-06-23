import { Suspense } from "react";
import { HomeContent } from "@/components/HomeContent";
import { fetchActiveListingsPaginated } from "@/lib/actions/listings-db";
import { fetchDefaultClient } from "@/lib/actions/clients";
import { parseListingFilters } from "@/lib/listing-filters";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const filters = parseListingFilters(params);

  const [result, defaultClient] = await Promise.all([
    fetchActiveListingsPaginated(filters),
    fetchDefaultClient(),
  ]);

  return (
    <HomeContent
      listings={result.listings}
      defaultClient={defaultClient}
      page={result.page}
      totalPages={result.totalPages}
      total={result.total}
    />
  );
}
