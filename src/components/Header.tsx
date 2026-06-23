import Link from "next/link";
import { Home } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-emerald-700"
        >
          <Home className="h-5 w-5" />
          <span>ListingPH</span>
        </Link>
      </div>
    </header>
  );
}
