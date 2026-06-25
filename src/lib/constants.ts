export const PH_CITIES = [
  "Quezon City",
  "Manila",
  "Makati",
  "Taguig",
  "Pasig",
  "Mandaluyong",
  "Parañaque",
  "Las Piñas",
  "Muntinlupa",
  "Caloocan",
  "Pasay",
  "Marikina",
  "Valenzuela",
  "Cebu City",
  "Toledo",
  "Mandaue",
  "Lapu-Lapu",
  "Davao City",
  "Iloilo City",
  "Bacolod",
  "Cagayan de Oro",
  "Baguio",
  "Angeles City",
  "Antipolo",
  "Santa Rosa",
  "Bacoor",
  "Imus",
  "General Santos",
  "Zamboanga City",
  "Other",
] as const;

export const PROPERTY_TYPES = [
  { value: "house_and_lot", label: "House and Lot" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "apartment", label: "Apartment" },
  { value: "vacant_lot", label: "Vacant Lot" },
  { value: "commercial", label: "Commercial" },
] as const;

export const LISTING_TYPES = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
] as const;

export const LISTING_STATUSES = [
  { value: "active", label: "Active" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
] as const;
