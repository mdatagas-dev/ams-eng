CREATE TABLE "CheckoutRequest" (
  "id" UUID NOT NULL,
  "result" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CheckoutRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CheckoutRequest_createdAt_idx" ON "CheckoutRequest"("createdAt");
