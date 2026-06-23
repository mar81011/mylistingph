"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Shield, Users, Plus, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { ClientsManager } from "@/components/ClientsManager";
import { ListingForm } from "@/components/ListingForm";
import { AdminListingsManager } from "@/components/AdminListingsManager";
import {
  clearAdminSession,
  isAdminAuthenticated,
} from "@/lib/admin-auth";
import { fetchListingById } from "@/lib/actions/listings-db";
import type { Listing } from "@/lib/listing-types";

type AdminTab = "clients" | "create" | "listings";

export function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<AdminTab>("clients");
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  useEffect(() => {
    setAuthenticated(isAdminAuthenticated());
    setReady(true);
  }, []);

  function handleLogout() {
    clearAdminSession();
    setAuthenticated(false);
  }

  async function startEdit(id: string) {
    const listing = await fetchListingById(id);
    setEditingListing(listing);
    setTab("create");
  }

  function handleSaved(slug: string) {
    setEditingListing(null);
    setTab("listings");
    window.open(`/listings/${slug}`, "_blank");
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg animate-pulse px-4 py-16">
        <div className="h-64 rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <AdminLoginForm onSuccess={() => setAuthenticated(true)} />
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "clients", label: "Clients & links", icon: <Users className="h-4 w-4" /> },
    { id: "create", label: "Create listing", icon: <Plus className="h-4 w-4" /> },
    { id: "listings", label: "All listings", icon: <LayoutList className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">Admin panel</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold">Manage listings &amp; clients</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline" size="sm">
              View site
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {tabs.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setTab(t.id);
              if (t.id !== "create") setEditingListing(null);
            }}
          >
            {t.icon}
            {t.label}
          </Button>
        ))}
      </div>

      {tab === "clients" && <ClientsManager />}
      {tab === "create" && (
        <div>
          <h2 className="mb-6 text-lg font-semibold">
            {editingListing ? "Edit listing" : "Create new listing"}
          </h2>
          <ListingForm
            key={editingListing?.id ?? "new"}
            listing={editingListing ?? undefined}
            onSaved={handleSaved}
            onCancel={
              editingListing
                ? () => {
                    setEditingListing(null);
                    setTab("listings");
                  }
                : undefined
            }
          />
        </div>
      )}
      {tab === "listings" && (
        <div>
          <div className="mb-6 flex justify-between gap-3">
            <h2 className="text-lg font-semibold">All listings</h2>
            <Button
              size="sm"
              onClick={() => {
                setEditingListing(null);
                setTab("create");
              }}
            >
              <Plus className="h-4 w-4" />
              New listing
            </Button>
          </div>
          <AdminListingsManager onEdit={startEdit} />
        </div>
      )}
    </div>
  );
}
