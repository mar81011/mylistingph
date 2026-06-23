"use client";

const ADMIN_SESSION_KEY = "listingph-admin-session";

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function setAdminAuthenticated(): void {
  sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
