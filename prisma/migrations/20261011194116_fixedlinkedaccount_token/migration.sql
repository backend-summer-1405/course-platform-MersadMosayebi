/*
  Warnings:

  - A unique constraint covering the columns `[linkedAccountId]` on the table `LinkedAccountToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LinkedAccountToken_linkedAccountId_key" ON "LinkedAccountToken"("linkedAccountId");
