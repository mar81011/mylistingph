import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.client.findFirst();
  if (existing) {
    console.log("Database already seeded.");
    return;
  }

  await prisma.client.create({
    data: {
      name: "Maria Santos",
      phone: "09171234567",
      messengerUrl: "",
      facebookUrl: "",
      isDefault: true,
    },
  });

  console.log("Seeded default client.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
