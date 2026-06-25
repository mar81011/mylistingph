"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Star, Trash2, Pencil, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Client } from "@/lib/listing-types";
import {
  addClientAction,
  deleteClientAction,
  fetchClients,
  setDefaultClientAction,
  updateClientAction,
} from "@/lib/actions/clients";
import { useRouter } from "next/navigation";

const MESSENGER_PLACEHOLDER = "https://m.me/yourname";
const FACEBOOK_PLACEHOLDER = "https://facebook.com/yourprofile";

function UrlFields({
  prefix,
  messengerDefault = "",
  facebookDefault = "",
}: {
  prefix: string;
  messengerDefault?: string;
  facebookDefault?: string;
}) {
  return (
    <>
      <div className="sm:col-span-2">
        <Label htmlFor={`${prefix}-messenger`}>Messenger link</Label>
        <Input
          id={`${prefix}-messenger`}
          name="messengerUrl"
          type="url"
          placeholder={MESSENGER_PLACEHOLDER}
          defaultValue={messengerDefault}
          className="mt-1"
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${prefix}-facebook`}>Facebook profile link</Label>
        <Input
          id={`${prefix}-facebook`}
          name="facebookUrl"
          type="url"
          placeholder={FACEBOOK_PLACEHOLDER}
          defaultValue={facebookDefault}
          className="mt-1"
        />
      </div>
    </>
  );
}

export function ClientsManager() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();

  function refresh() {
    fetchClients().then(({ clients: next, error }) => {
      setClients(next);
      setDbError(error ?? null);
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      setSaveError(null);
      const result = await addClientAction({
        name: String(form.get("name")),
        phone: String(form.get("phone")),
        messengerUrl: String(form.get("messengerUrl") || ""),
        facebookUrl: String(form.get("facebookUrl") || ""),
      });
      if (result.error) {
        setSaveError(result.error);
        return;
      }
      setShowAdd(false);
      refresh();
      router.refresh();
    });
  }

  function handleUpdate(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateClientAction(id, {
        name: String(form.get("name")),
        phone: String(form.get("phone")),
        messengerUrl: String(form.get("messengerUrl") || ""),
        facebookUrl: String(form.get("facebookUrl") || ""),
      });
      setEditingId(null);
      refresh();
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {dbError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">
            {dbError.includes("SUPABASE_SERVICE_ROLE_KEY")
              ? "Supabase service role key missing"
              : "Could not connect to the database"}
          </p>
          <p className="mt-1">{dbError}</p>
          {dbError.includes("SUPABASE_SERVICE_ROLE_KEY") ||
          dbError.includes("supabaseKey is required") ? (
            <p className="mt-2">
              <a
                href="https://supabase.com/dashboard/project/bqtkuystuusvqenznqlu/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-700 underline"
              >
                Open Supabase → Settings → API
              </a>
              {" — reveal "}
              <code className="rounded bg-amber-100 px-1">service_role</code>
              {", add as "}
              <code className="rounded bg-amber-100 px-1">
                SUPABASE_SERVICE_ROLE_KEY
              </code>
              {" in Vercel env vars, then redeploy."}
            </p>
          ) : (
            <p className="mt-2">
              <a
                href="https://supabase.com/dashboard/project/bqtkuystuusvqenznqlu/sql/new"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-700 underline"
              >
                Open Supabase SQL Editor
              </a>
              {" — copy all of "}
              <code className="rounded bg-amber-100 px-1">prisma/init.sql</code>
              {" from the project, paste, and click Run."}
            </p>
          )}
        </div>
      )}
      {saveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {saveError}
        </div>
      )}
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="pt-6 text-sm text-slate-700">
          <p className="font-medium text-emerald-900">Messenger &amp; Facebook links</p>
          <p className="mt-1">
            Add links per client. They appear on listings and the homepage contact line.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Clients</h2>
        <Button onClick={() => setShowAdd(true)} disabled={showAdd || isPending}>
          <Plus className="h-4 w-4" />
          Add client
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle>New client</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="new-name">Name *</Label>
                <Input id="new-name" name="name" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="new-phone">Phone *</Label>
                <Input id="new-phone" name="phone" type="tel" required className="mt-1" />
              </div>
              <UrlFields prefix="new" />
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={isPending}>
                  Save client
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardContent className="pt-6">
              {editingId === client.id ? (
                <form
                  onSubmit={(e) => handleUpdate(e, client.id)}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <div>
                    <Label>Name *</Label>
                    <Input name="name" defaultValue={client.name} required className="mt-1" />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input name="phone" defaultValue={client.phone} required className="mt-1" />
                  </div>
                  <UrlFields
                    prefix={`edit-${client.id}`}
                    messengerDefault={client.messengerUrl}
                    facebookDefault={client.facebookUrl}
                  />
                  <div className="flex gap-2 sm:col-span-2">
                    <Button type="submit" size="sm" disabled={isPending}>
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{client.name}</p>
                        {client.isDefault && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                            <Star className="h-3 w-3" />
                            Homepage
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{client.phone}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!client.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              await setDefaultClientAction(client.id);
                              refresh();
                              router.refresh();
                            })
                          }
                        >
                          Set as homepage
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(client.id)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit links
                      </Button>
                      {clients.length > 1 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isPending}
                          onClick={() => {
                            if (!confirm(`Remove ${client.name}?`)) return;
                            startTransition(async () => {
                              await deleteClientAction(client.id);
                              refresh();
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <dl className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-slate-500">Messenger</dt>
                      <dd className="mt-0.5 break-all">
                        {client.messengerUrl ? (
                          <a
                            href={client.messengerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                          >
                            {client.messengerUrl}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-amber-700">Not set</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Facebook</dt>
                      <dd className="mt-0.5 break-all">
                        {client.facebookUrl ? (
                          <a
                            href={client.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                          >
                            {client.facebookUrl}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-amber-700">Not set</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
