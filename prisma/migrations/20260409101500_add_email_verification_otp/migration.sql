-- Add user verification state
ALTER TABLE "User" ADD COLUMN "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" DATETIME;

-- Existing accounts are trusted to avoid locking active users after rollout
UPDATE "User"
SET "isEmailVerified" = true,
    "emailVerifiedAt" = COALESCE("emailVerifiedAt", CURRENT_TIMESTAMP);

-- OTP table for first-time email verification
CREATE TABLE "EmailVerificationOtp" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "otpHash" TEXT NOT NULL,
  "expiresAt" DATETIME NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "usedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailVerificationOtp_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "EmailVerificationOtp_userId_createdAt_idx"
  ON "EmailVerificationOtp"("userId", "createdAt");
