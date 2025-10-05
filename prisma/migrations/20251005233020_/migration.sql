/*
  Warnings:

  - The required column `id` was added to the `EncodedData` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "public"."EncodedData" DROP CONSTRAINT "EncodedData_userId_fkey";

-- AlterTable
ALTER TABLE "EncodedData" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "EncodedData_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "EncodedData_randomName_idx" ON "EncodedData"("randomName");

-- CreateIndex
CREATE INDEX "EncodedData_apiKey_idx" ON "EncodedData"("apiKey");

-- AddForeignKey
ALTER TABLE "EncodedData" ADD CONSTRAINT "EncodedData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
