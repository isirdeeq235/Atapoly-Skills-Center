/*
  Warnings:

  - A unique constraint covering the columns `[provider_reference]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "amount" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_provider_reference_key" ON "Payment"("provider_reference");
