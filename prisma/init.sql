-- ListingPH database setup
-- Open: https://supabase.com/dashboard/project/bqtkuystuusvqenznqlu/sql/new
-- Paste this entire file → click Run

DO $$ BEGIN
  CREATE TYPE "ListingType" AS ENUM ('sale', 'rent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PropertyType" AS ENUM ('house_and_lot', 'condo', 'townhouse', 'apartment', 'vacant_lot', 'commercial');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ListingStatus" AS ENUM ('active', 'sold', 'rented');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "messengerUrl" TEXT NOT NULL DEFAULT '',
    "facebookUrl" TEXT NOT NULL DEFAULT '',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Listing" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Listing_slug_key" ON "Listing"("slug");
CREATE INDEX IF NOT EXISTS "Listing_city_idx" ON "Listing"("city");
CREATE INDEX IF NOT EXISTS "Listing_propertyType_idx" ON "Listing"("propertyType");
CREATE INDEX IF NOT EXISTS "Listing_listingType_idx" ON "Listing"("listingType");
CREATE INDEX IF NOT EXISTS "Listing_pricePhp_idx" ON "Listing"("pricePhp");
CREATE INDEX IF NOT EXISTS "Listing_status_idx" ON "Listing"("status");
CREATE INDEX IF NOT EXISTS "Listing_createdAt_idx" ON "Listing"("createdAt");

DO $$ BEGIN
  ALTER TABLE "Listing"
    ADD CONSTRAINT "Listing_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Client"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Optional starter client (safe to skip if you add your own in admin)
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
) ON CONFLICT ("id") DO NOTHING;
