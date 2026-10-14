/*
  Warnings:

  - You are about to drop the column `accountId` on the `AdminProfile` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `AuthorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `TeacherProfile` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserProfile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[personId]` on the table `AdminProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[personId]` on the table `AuthorProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[personId]` on the table `TeacherProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[personId]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `personId` to the `AdminProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personId` to the `AuthorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personId` to the `TeacherProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personId` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_personId_fkey";

-- DropForeignKey
ALTER TABLE "AdminProfile" DROP CONSTRAINT "AdminProfile_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AuthorProfile" DROP CONSTRAINT "AuthorProfile_accountId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherProfile" DROP CONSTRAINT "TeacherProfile_accountId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_accountId_fkey";

-- DropIndex
DROP INDEX "AdminProfile_accountId_key";

-- DropIndex
DROP INDEX "AuthorProfile_accountId_key";

-- DropIndex
DROP INDEX "TeacherProfile_accountId_key";

-- DropIndex
DROP INDEX "Wallet_accountId_key";

-- AlterTable
ALTER TABLE "AdminProfile" DROP COLUMN "accountId",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "personId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AuthorProfile" DROP COLUMN "accountId",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "personId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "bio",
ADD COLUMN     "role" "AccountType" NOT NULL DEFAULT 'User';

-- AlterTable
ALTER TABLE "TeacherProfile" DROP COLUMN "accountId",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "personId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "accountId",
ADD COLUMN     "personId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "UserProfile";

-- CreateTable
CREATE TABLE "DeviceSession" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedAccount" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "linkedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkedAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedAccountToken" (
    "id" TEXT NOT NULL,
    "linkedAccountId" TEXT NOT NULL,
    "deviceSessionId" TEXT NOT NULL,
    "switchToken" TEXT,
    "switchTokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedAccountToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSession_deviceId_personId_key" ON "DeviceSession"("deviceId", "personId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedAccount_personId_linkedId_key" ON "LinkedAccount"("personId", "linkedId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedAccountToken_linkedAccountId_deviceSessionId_key" ON "LinkedAccountToken"("linkedAccountId", "deviceSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_personId_key" ON "AdminProfile"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthorProfile_personId_key" ON "AuthorProfile"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_personId_key" ON "TeacherProfile"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_personId_key" ON "Wallet"("personId");

-- AddForeignKey
ALTER TABLE "DeviceSession" ADD CONSTRAINT "DeviceSession_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedAccount" ADD CONSTRAINT "LinkedAccount_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedAccount" ADD CONSTRAINT "LinkedAccount_linkedId_fkey" FOREIGN KEY ("linkedId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedAccountToken" ADD CONSTRAINT "LinkedAccountToken_linkedAccountId_fkey" FOREIGN KEY ("linkedAccountId") REFERENCES "LinkedAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedAccountToken" ADD CONSTRAINT "LinkedAccountToken_deviceSessionId_fkey" FOREIGN KEY ("deviceSessionId") REFERENCES "DeviceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorProfile" ADD CONSTRAINT "AuthorProfile_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProfile" ADD CONSTRAINT "AdminProfile_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
