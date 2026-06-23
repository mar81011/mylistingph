-- Run this in Supabase → SQL Editor → New query → Run
-- Creates tables for ListingPH (matches prisma/schema.prisma)

CREATE TYPE "ListingType" AS ENUM ('sale', 'rent');
CREATE TYPE "PropertyType" AS ENUM ('house_and_lot', 'condo', 'townhouse', 'apartment', 'vacant_lot', 'commercial');
CREATE TYPE "ListingStatus" AS ENUM ('active', 'sold', 'rented');

CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "messengerUrl" TEXT NOT NULL DEFAULT '',
    "facebookUrl" TEXT NOT NULL DEFAULT '',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "listingType" "ListingType" NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "pricePhp" INTEGER NOT NULL,
    "priceLabel" TEXT,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "floorAreaSqm" DOUBLE PRECISION,
    "lotAreaSqm" DOUBLE PRECISION,
    "region" TEXT,
    "province" TEXT,
    "city" TEXT NOT NULL,
    "barangay" TEXT,
    "addressNotes" TEXT,
    "photos" TEXT[],
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "messengerUrl" TEXT,
    "facebookUrl" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'active',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");
CREATE INDEX "Listing_city_idx" ON "Listing"("city");
CREATE INDEX "Listing_propertyType_idx" ON "Listing"("propertyType");
CREATE INDEX "Listing_listingType_idx" ON "Listing"("listingType");
CREATE INDEX "Listing_pricePhp_idx" ON "Listing"("pricePhp");
CREATE INDEX "Listing_status_idx" ON "Listing"("status");
CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt");

ALTER TABLE "Listing" ADD CONSTRAINT "Listing_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Default client (optional)
INSERT INTO "Client" ("id", "name", "phone", "messengerUrl", "facebookUrl", "isDefault", "createdAt", "updatedAt")
VALUES (
  'clseed0001',
  'Maria Santos',
  '09171234567',
  '',
  '',
  true,
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;
