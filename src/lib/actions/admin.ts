"use server";

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const expected = process.env.ADMIN_PIN ?? "121022";
  return pin === expected;
}
