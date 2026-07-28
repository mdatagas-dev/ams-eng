ALTER TABLE "User" ADD COLUMN "username" VARCHAR(32);

UPDATE "User"
SET "username" = lower(split_part("email", '@', 1));

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
DROP INDEX "User_email_key";
ALTER TABLE "User" DROP COLUMN "email";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
