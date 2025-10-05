/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `EncodedData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EncodedData" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
