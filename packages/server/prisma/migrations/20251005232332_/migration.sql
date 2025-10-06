/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."EncodedData" DROP CONSTRAINT "EncodedData_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id";

-- AddForeignKey
ALTER TABLE "EncodedData" ADD CONSTRAINT "EncodedData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("apiKey") ON DELETE SET NULL ON UPDATE CASCADE;
