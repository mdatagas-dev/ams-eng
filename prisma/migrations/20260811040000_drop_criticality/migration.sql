-- DropCriticality

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "criticality";

-- DropEnum
DROP TYPE "Criticality";
