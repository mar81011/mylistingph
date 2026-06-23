import { prisma } from "@/lib/db";
import { mapClient } from "@/lib/mappers";
import type { Client } from "@/lib/listing-types";

export async function getClientsFromDb(): Promise<Client[]> {
  const rows = await prisma.client.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(mapClient);
}

export async function getDefaultClientFromDb(): Promise<Client | null> {
  const row =
    (await prisma.client.findFirst({ where: { isDefault: true } })) ??
    (await prisma.client.findFirst({ orderBy: { createdAt: "asc" } }));
  return row ? mapClient(row) : null;
}

export async function getClientByIdFromDb(id: string): Promise<Client | null> {
  const row = await prisma.client.findUnique({ where: { id } });
  return row ? mapClient(row) : null;
}

export async function createClientInDb(
  data: Omit<Client, "id" | "isDefault"> & { isDefault?: boolean }
): Promise<Client> {
  if (data.isDefault) {
    await prisma.client.updateMany({ data: { isDefault: false } });
  }
  const count = await prisma.client.count();
  const row = await prisma.client.create({
    data: {
      name: data.name,
      phone: data.phone,
      messengerUrl: data.messengerUrl,
      facebookUrl: data.facebookUrl,
      isDefault: data.isDefault ?? count === 0,
    },
  });
  return mapClient(row);
}

export async function updateClientInDb(
  id: string,
  data: Partial<Omit<Client, "id">>
): Promise<Client> {
  if (data.isDefault) {
    await prisma.client.updateMany({ data: { isDefault: false } });
  }
  const row = await prisma.client.update({ where: { id }, data });
  return mapClient(row);
}

export async function deleteClientFromDb(id: string): Promise<void> {
  const count = await prisma.client.count();
  if (count <= 1) {
    throw new Error("Cannot delete the only client.");
  }
  await prisma.client.delete({ where: { id } });
  const remaining = await prisma.client.findMany();
  if (remaining.length && !remaining.some((c) => c.isDefault)) {
    await prisma.client.update({
      where: { id: remaining[0].id },
      data: { isDefault: true },
    });
  }
}

export async function setDefaultClientInDb(id: string): Promise<void> {
  await prisma.client.updateMany({ data: { isDefault: false } });
  await prisma.client.update({ where: { id }, data: { isDefault: true } });
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
