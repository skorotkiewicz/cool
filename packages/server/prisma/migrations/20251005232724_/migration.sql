/*
  Warnings:

  - The primary key for the `EncodedData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `EncodedData` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."EncodedData_apiKey_idx";

-- DropIndex
DROP INDEX "public"."EncodedData_randomName_idx";

-- AlterTable
ALTER TABLE "EncodedData" DROP CONSTRAINT "EncodedData_pkey",
DROP COLUMN "id";
