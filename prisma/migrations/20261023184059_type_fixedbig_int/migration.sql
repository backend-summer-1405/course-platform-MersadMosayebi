/*
  Warnings:

  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `price` on the `Purchase` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `teacherShare` on the `Purchase` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `platformShare` on the `Purchase` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `amount` on the `WalletTransaction` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `balanceAfter` on the `WalletTransaction` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `amount` on the `WithdrawRequest` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Purchase" ALTER COLUMN "price" SET DATA TYPE INTEGER,
ALTER COLUMN "teacherShare" SET DATA TYPE INTEGER,
ALTER COLUMN "platformShare" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "WalletTransaction" ALTER COLUMN "amount" SET DATA TYPE INTEGER,
ALTER COLUMN "balanceAfter" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "WithdrawRequest" ALTER COLUMN "amount" SET DATA TYPE INTEGER;
