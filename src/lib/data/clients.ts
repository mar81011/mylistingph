import { createServiceClient } from "@/lib/supabase/admin";
import { mapClient, type ClientRow } from "@/lib/mappers";
import type { Client } from "@/lib/listing-types";
import { generateId } from "@/lib/utils";

function db() {
  return createServiceClient();
}

function now() {
  return new Date().toISOString();
}

export async function getClientsFromDb(): Promise<Client[]> {
  const { data, error } = await db()
    .from("Client")
    .select("*")
    .order("createdAt", { ascending: true });

  if (error) throw error;
  return (data as ClientRow[]).map(mapClient);
}

export async function getDefaultClientFromDb(): Promise<Client | null> {
  const { data: defaultRows, error: defaultError } = await db()
    .from("Client")
    .select("*")
    .eq("isDefault", true)
    .limit(1);

  if (defaultError) throw defaultError;
  if (defaultRows?.[0]) return mapClient(defaultRows[0] as ClientRow);

  const { data, error } = await db()
    .from("Client")
    .select("*")
    .order("createdAt", { ascending: true })
    .limit(1);

  if (error) throw error;
  return data?.[0] ? mapClient(data[0] as ClientRow) : null;
}

export async function getClientByIdFromDb(id: string): Promise<Client | null> {
  const { data, error } = await db()
    .from("Client")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapClient(data as ClientRow) : null;
}

export async function createClientInDb(
  data: Omit<Client, "id" | "isDefault"> & { isDefault?: boolean }
): Promise<Client> {
  const supabase = db();

  if (data.isDefault) {
    await supabase.from("Client").update({ isDefault: false }).neq("id", "");
  }

  const { count } = await supabase
    .from("Client")
    .select("*", { count: "exact", head: true });

  const timestamp = now();
  const row = {
    id: generateId(),
    name: data.name,
    phone: data.phone,
    messengerUrl: data.messengerUrl,
    facebookUrl: data.facebookUrl,
    isDefault: data.isDefault ?? (count ?? 0) === 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const { data: created, error } = await supabase
    .from("Client")
    .insert(row)
    .select("*")
    .single();

  if (error) throw error;
  return mapClient(created as ClientRow);
}

export async function updateClientInDb(
  id: string,
  data: Partial<Omit<Client, "id">>
): Promise<Client> {
  const supabase = db();

  if (data.isDefault) {
    await supabase.from("Client").update({ isDefault: false }).neq("id", id);
  }

  const { data: updated, error } = await supabase
    .from("Client")
    .update({ ...data, updatedAt: now() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapClient(updated as ClientRow);
}

export async function deleteClientFromDb(id: string): Promise<void> {
  const supabase = db();
  const { count } = await supabase
    .from("Client")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) <= 1) {
    throw new Error("Cannot delete the only client.");
  }

  const { error } = await supabase.from("Client").delete().eq("id", id);
  if (error) throw error;

  const { data: remaining } = await supabase.from("Client").select("*");
  if (remaining?.length && !remaining.some((c) => c.isDefault)) {
    await supabase
      .from("Client")
      .update({ isDefault: true, updatedAt: now() })
      .eq("id", remaining[0].id);
  }
}

export async function setDefaultClientInDb(id: string): Promise<void> {
  const supabase = db();
  await supabase.from("Client").update({ isDefault: false }).neq("id", "");
  const { error } = await supabase
    .from("Client")
    .update({ isDefault: true, updatedAt: now() })
    .eq("id", id);
  if (error) throw error;
}

export async function ensureDefaultClient(): Promise<Client> {
  const existing = await getDefaultClientFromDb();
  if (existing) return existing;
  return createClientInDb({
    name: "Maria Santos",
    phone: "09171234567",
    messengerUrl: "",
    facebookUrl: "",
    isDefault: true,
  });
}
