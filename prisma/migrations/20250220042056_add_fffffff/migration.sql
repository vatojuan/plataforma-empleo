/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Job` table. All the data in the column will be lost.
  - Added the required column `fileKey` to the `LegalDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "createdAt",
ADD COLUMN     "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "requirements" TEXT;

-- AlterTable
ALTER TABLE "LegalDocument" ADD COLUMN     "fileKey" TEXT NOT NULL;
