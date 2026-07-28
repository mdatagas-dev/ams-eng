ALTER TABLE "CheckoutRequest" ADD COLUMN "fingerprint" CHAR(64);
UPDATE "CheckoutRequest" SET "fingerprint" = repeat('0', 64);
ALTER TABLE "CheckoutRequest" ALTER COLUMN "fingerprint" SET NOT NULL;
