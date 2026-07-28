-- Replace the legacy asset taxonomy and retain a deterministic tag mapping.
CREATE TEMP TABLE "AssetRenumber" AS
SELECT
  "id",
  "assetTag" AS "oldTag",
  CASE
    WHEN "category"::text IN ('TOOL', 'INSTRUMENT') THEN 'TLS'
    WHEN "category"::text = 'IT' THEN 'ELK'
    ELSE 'EQP'
  END AS "newCategory",
  ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS "sequence"
FROM "Asset";

ALTER TYPE "AssetCategory" RENAME TO "AssetCategory_old";
CREATE TYPE "AssetCategory" AS ENUM ('TLS', 'EQP', 'ELK');
ALTER TABLE "Asset"
  ALTER COLUMN "category" TYPE "AssetCategory"
  USING (
    CASE
      WHEN "category"::text IN ('TOOL', 'INSTRUMENT') THEN 'TLS'
      WHEN "category"::text = 'IT' THEN 'ELK'
      ELSE 'EQP'
    END
  )::"AssetCategory";
DROP TYPE "AssetCategory_old";

UPDATE "Asset" AS asset
SET
  "assetTag" = 'ENG/GAS/' || renumber."newCategory" || '/26-' || LPAD(renumber."sequence"::text, 4, '0'),
  "updatedAt" = CURRENT_TIMESTAMP
FROM "AssetRenumber" AS renumber
WHERE asset."id" = renumber."id";

INSERT INTO "Activity" ("id", "assetId", "type", "actorName", "summary", "metadata", "createdAt")
SELECT
  md5('asset-renumber-2026:' || renumber."id"::text)::uuid,
  renumber."id",
  'UPDATED',
  'System Migration',
  'Asset identifier changed from ' || renumber."oldTag" || ' to ENG/GAS/' || renumber."newCategory" || '/26-' || LPAD(renumber."sequence"::text, 4, '0'),
  jsonb_build_object(
    'oldAssetTag', renumber."oldTag",
    'newAssetTag', 'ENG/GAS/' || renumber."newCategory" || '/26-' || LPAD(renumber."sequence"::text, 4, '0')
  ),
  CURRENT_TIMESTAMP
FROM "AssetRenumber" AS renumber;

-- Cabinet and stock enums.
CREATE TYPE "StockItemStatus" AS ENUM ('UNCLASSIFIED', 'CONSUMABLE');
CREATE TYPE "StockMovementType" AS ENUM ('IMPORT', 'ISSUE', 'TRANSFER', 'ADJUSTMENT');

-- Cabinet storage and automatic asset numbering.
CREATE TABLE "Cabinet" (
  "id" UUID NOT NULL,
  "code" VARCHAR(20) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "isStaging" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Cabinet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssetCodeCounter" (
  "year" INTEGER NOT NULL,
  "nextNumber" INTEGER NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssetCodeCounter_pkey" PRIMARY KEY ("year"),
  CONSTRAINT "AssetCodeCounter_nextNumber_check" CHECK ("nextNumber" > 0)
);

INSERT INTO "AssetCodeCounter" ("year", "nextNumber", "updatedAt")
VALUES (2026, (SELECT COUNT(*)::integer + 1 FROM "AssetRenumber"), CURRENT_TIMESTAMP);

ALTER TABLE "Asset" ADD COLUMN "cabinetId" UUID;
ALTER TABLE "Loan" ALTER COLUMN "dueAt" DROP NOT NULL;
ALTER TABLE "Loan" ADD COLUMN "destinationLocation" VARCHAR(150);

-- Quantity-based stock catalogue and append-only movement ledger.
CREATE TABLE "StockItem" (
  "id" UUID NOT NULL,
  "sourceKey" VARCHAR(100) NOT NULL,
  "sourceRow" INTEGER NOT NULL,
  "sourceStock" INTEGER NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "supplier" VARCHAR(100),
  "specification" TEXT,
  "status" "StockItemStatus" NOT NULL DEFAULT 'UNCLASSIFIED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StockItem_sourceStock_check" CHECK ("sourceStock" >= 0)
);

CREATE TABLE "CabinetStock" (
  "cabinetId" UUID NOT NULL,
  "itemId" UUID NOT NULL,
  "goodQuantity" INTEGER NOT NULL DEFAULT 0,
  "badQuantity" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CabinetStock_pkey" PRIMARY KEY ("cabinetId", "itemId"),
  CONSTRAINT "CabinetStock_nonnegative_check" CHECK ("goodQuantity" >= 0 AND "badQuantity" >= 0)
);

CREATE TABLE "StockMovement" (
  "id" UUID NOT NULL,
  "type" "StockMovementType" NOT NULL,
  "itemId" UUID NOT NULL,
  "cabinetId" UUID NOT NULL,
  "goodDelta" INTEGER NOT NULL DEFAULT 0,
  "badDelta" INTEGER NOT NULL DEFAULT 0,
  "responsiblePerson" VARCHAR(150),
  "borrowerDepartmentId" UUID,
  "purpose" VARCHAR(250),
  "destinationLocation" VARCHAR(150),
  "actorName" VARCHAR(150) NOT NULL,
  "sourceKey" VARCHAR(120),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Cabinet_code_key" ON "Cabinet"("code");
CREATE INDEX "Cabinet_active_isStaging_idx" ON "Cabinet"("active", "isStaging");
CREATE INDEX "Asset_cabinetId_idx" ON "Asset"("cabinetId");
CREATE UNIQUE INDEX "StockItem_sourceKey_key" ON "StockItem"("sourceKey");
CREATE INDEX "StockItem_status_name_idx" ON "StockItem"("status", "name");
CREATE INDEX "CabinetStock_itemId_idx" ON "CabinetStock"("itemId");
CREATE UNIQUE INDEX "StockMovement_sourceKey_key" ON "StockMovement"("sourceKey");
CREATE INDEX "StockMovement_itemId_createdAt_idx" ON "StockMovement"("itemId", "createdAt");
CREATE INDEX "StockMovement_cabinetId_createdAt_idx" ON "StockMovement"("cabinetId", "createdAt");
CREATE INDEX "StockMovement_type_createdAt_idx" ON "StockMovement"("type", "createdAt");
CREATE INDEX "StockMovement_borrowerDepartmentId_idx" ON "StockMovement"("borrowerDepartmentId");

ALTER TABLE "Asset"
  ADD CONSTRAINT "Asset_cabinetId_fkey"
  FOREIGN KEY ("cabinetId") REFERENCES "Cabinet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CabinetStock"
  ADD CONSTRAINT "CabinetStock_cabinetId_fkey"
  FOREIGN KEY ("cabinetId") REFERENCES "Cabinet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CabinetStock"
  ADD CONSTRAINT "CabinetStock_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StockMovement"
  ADD CONSTRAINT "StockMovement_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockMovement"
  ADD CONSTRAINT "StockMovement_cabinetId_fkey"
  FOREIGN KEY ("cabinetId") REFERENCES "Cabinet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockMovement"
  ADD CONSTRAINT "StockMovement_borrowerDepartmentId_fkey"
  FOREIGN KEY ("borrowerDepartmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
