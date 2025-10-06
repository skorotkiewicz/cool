/*
  Warnings:

  - The primary key for the `EncodedData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `EncodedData` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `EncodedData` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."EncodedData" DROP CONSTRAINT "EncodedData_userId_fkey";

-- AlterTable
ALTER TABLE "EncodedData" DROP CONSTRAINT "EncodedData_pkey",
DROP COLUMN "id",
DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id";

-- AddForeignKey
ALTER TABLE "EncodedData" ADD CONSTRAINT "EncodedData_apiKey_fkey" FOREIGN KEY ("apiKey") REFERENCES "User"("apiKey") ON DELETE RESTRICT ON UPDATE CASCADE;
