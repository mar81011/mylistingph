"use server";

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const expected = process.env.ADMIN_PIN ?? "1234";
  return pin === expected;
}
