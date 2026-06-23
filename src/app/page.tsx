import { HomeContent } from "@/components/HomeContent";
import { fetchActiveListings } from "@/lib/actions/listings-db";
import { fetchDefaultClient } from "@/lib/actions/clients";

export default async function HomePage() {
  const [listings, defaultClient] = await Promise.all([
    fetchActiveListings(),
    fetchDefaultClient(),
  ]);

  return <HomeContent listings={listings} defaultClient={defaultClient} />;
}
