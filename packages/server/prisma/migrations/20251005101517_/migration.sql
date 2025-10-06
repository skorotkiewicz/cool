-- CreateTable
CREATE TABLE "EncodedData" (
    "id" TEXT NOT NULL,
    "randomName" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EncodedData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EncodedData_randomName_key" ON "EncodedData"("randomName");

-- CreateIndex
CREATE INDEX "EncodedData_randomName_idx" ON "EncodedData"("randomName");

-- CreateIndex
CREATE INDEX "EncodedData_apiKey_idx" ON "EncodedData"("apiKey");
