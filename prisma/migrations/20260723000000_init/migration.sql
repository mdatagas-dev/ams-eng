-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('GOOD', 'UNDER_REPAIR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('MACHINE', 'UTILITY', 'VEHICLE', 'TOOL', 'INSTRUMENT', 'FACILITY', 'IT');

-- CreateEnum
CREATE TYPE "Criticality" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('REGISTERED', 'UPDATED', 'CONDITION_CHANGED', 'BORROWED', 'RETURNED');

-- CreateTable
CREATE TABLE "Department" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" UUID NOT NULL,
    "assetTag" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "category" "AssetCategory" NOT NULL,
    "manufacturer" VARCHAR(100),
    "model" VARCHAR(100),
    "serialNumber" VARCHAR(100),
    "ownerDepartmentId" UUID NOT NULL,
    "location" VARCHAR(150) NOT NULL,
    "acquiredAt" DATE,
    "criticality" "Criticality" NOT NULL DEFAULT 'MEDIUM',
    "condition" "AssetCondition" NOT NULL DEFAULT 'GOOD',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" UUID NOT NULL,
    "assetId" UUID NOT NULL,
    "borrowerDepartmentId" UUID NOT NULL,
    "responsiblePerson" VARCHAR(150) NOT NULL,
    "purpose" VARCHAR(250) NOT NULL,
    "checkedOutAt" DATE NOT NULL,
    "dueAt" DATE NOT NULL,
    "returnedAt" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Loan_dueAt_check" CHECK ("dueAt" >= "checkedOutAt"),
    CONSTRAINT "Loan_returnedAt_check" CHECK ("returnedAt" IS NULL OR "returnedAt" >= "checkedOutAt")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" UUID NOT NULL,
    "assetId" UUID NOT NULL,
    "type" "ActivityType" NOT NULL,
    "actorName" VARCHAR(150) NOT NULL DEFAULT 'Current Operator',
    "summary" VARCHAR(300) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");
CREATE UNIQUE INDEX "Asset_assetTag_key" ON "Asset"("assetTag");
CREATE INDEX "Asset_condition_idx" ON "Asset"("condition");
CREATE INDEX "Asset_category_idx" ON "Asset"("category");
CREATE INDEX "Asset_ownerDepartmentId_idx" ON "Asset"("ownerDepartmentId");
CREATE INDEX "Asset_location_idx" ON "Asset"("location");
CREATE INDEX "Asset_updatedAt_idx" ON "Asset"("updatedAt");
CREATE INDEX "Loan_assetId_returnedAt_idx" ON "Loan"("assetId", "returnedAt");
CREATE UNIQUE INDEX "Loan_one_active_per_asset_key" ON "Loan"("assetId") WHERE "returnedAt" IS NULL;
CREATE INDEX "Loan_borrowerDepartmentId_idx" ON "Loan"("borrowerDepartmentId");
CREATE INDEX "Loan_dueAt_idx" ON "Loan"("dueAt");
CREATE INDEX "Activity_assetId_createdAt_idx" ON "Activity"("assetId", "createdAt");
CREATE INDEX "Activity_type_idx" ON "Activity"("type");
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_ownerDepartmentId_fkey" FOREIGN KEY ("ownerDepartmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_borrowerDepartmentId_fkey" FOREIGN KEY ("borrowerDepartmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
