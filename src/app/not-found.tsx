import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Listing not found</h1>
      <p className="mt-2 text-slate-600">
        This property may have been removed or the link is incorrect.
      </p>
      <Link href="/listings" className="mt-6">
        <Button>Browse listings</Button>
      </Link>
    </div>
  );
}
