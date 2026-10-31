-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Deposit', 'Purchase', 'Sale_Income', 'Commission', 'Withdraw', 'Withdraw_Refund', 'Salary');

-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('Wallet', 'Charge', 'Course', 'Podcast');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Pending', 'Processing', 'Success', 'Failed');

-- CreateEnum
CREATE TYPE "WithdrawStatus" AS ENUM ('Pending', 'Paid', 'Rejected');

-- CreateEnum
CREATE TYPE "BankAccountStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- AlterTable
ALTER TABLE "AdminProfile" ADD COLUMN     "isFinance" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "balanceAfter" BIGINT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawRequest" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "sheba" TEXT NOT NULL,
    "status" "WithdrawStatus" NOT NULL DEFAULT 'Pending',
    "trackingCode" TEXT,
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WithdrawRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nationalCode" TEXT NOT NULL,
    "shebaNumber" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "status" "BankAccountStatus" NOT NULL DEFAULT 'Pending',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "personId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "courseId" INTEGER,
    "podcastId" INTEGER,
    "price" BIGINT NOT NULL,
    "teacherShare" BIGINT NOT NULL,
    "platformShare" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "purpose" "PaymentPurpose" NOT NULL,
    "courseId" INTEGER,
    "podcastId" INTEGER,
    "authority" TEXT,
    "refId" TEXT,
    "cardPan" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WalletTransaction_walletId_createdAt_idx" ON "WalletTransaction"("walletId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_shebaNumber_key" ON "BankAccount"("shebaNumber");

-- CreateIndex
CREATE INDEX "BankAccount_personId_idx" ON "BankAccount"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_buyerId_courseId_key" ON "Purchase"("buyerId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_buyerId_podcastId_key" ON "Purchase"("buyerId", "podcastId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_authority_key" ON "Payment"("authority");

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawRequest" ADD CONSTRAINT "WithdrawRequest_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawRequest" ADD CONSTRAINT "WithdrawRequest_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
