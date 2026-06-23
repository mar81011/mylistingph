"use server";

import { revalidatePath } from "next/cache";
import type { Client } from "@/lib/listing-types";
import {
  createClientInDb,
  deleteClientFromDb,
  ensureDefaultClient,
  getClientsFromDb,
  getDefaultClientFromDb,
  setDefaultClientInDb,
  updateClientInDb,
} from "@/lib/data/clients";

export async function fetchClients(): Promise<{
  clients: Client[];
  error?: string;
}> {
  try {
    const clients = await getClientsFromDb();
    if (clients.length === 0) {
      const defaultClient = await ensureDefaultClient();
      return { clients: [defaultClient] };
    }
    return { clients };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not connect to the database.";
    return {
      clients: [],
      error: `Could not load clients: ${message}`,
    };
  }
}

export async function fetchDefaultClient(): Promise<Client | null> {
  try {
    return (await getDefaultClientFromDb()) ?? (await ensureDefaultClient());
  } catch {
    return null;
  }
}

export async function addClientAction(data: {
  name: string;
  phone: string;
  messengerUrl: string;
  facebookUrl: string;
}): Promise<{ error?: string }> {
  try {
    const clients = await getClientsFromDb();
    await createClientInDb({ ...data, isDefault: clients.length === 0 });
    revalidatePath("/");
    revalidatePath("/admin");
    return {};
  } catch (e) {
    const message = e instanceof Error ? e.message : "Save failed";
    return { error: `Could not save client: ${message}` };
  }
}

export async function updateClientAction(
  id: string,
  data: {
    name: string;
    phone: string;
    messengerUrl: string;
    facebookUrl: string;
  }
) {
  await updateClientInDb(id, data);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteClientAction(id: string) {
  await deleteClientFromDb(id);
  revalidatePath("/admin");
}

export async function setDefaultClientAction(id: string) {
  await setDefaultClientInDb(id);
  revalidatePath("/");
  revalidatePath("/admin");
}
