-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastResend" TIMESTAMP(3),
ADD COLUMN     "resendCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "verificationAttempts" INTEGER NOT NULL DEFAULT 0;
