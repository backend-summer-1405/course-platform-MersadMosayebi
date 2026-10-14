/*
  Warnings:

  - You are about to drop the column `expertise` on the `TeacherProfile` table. All the data in the column will be lost.
  - Added the required column `degree` to the `TeacherProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fieldOfwork` to the `TeacherProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FormRequestStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- AlterTable
ALTER TABLE "TeacherProfile" DROP COLUMN "expertise",
ADD COLUMN     "degree" TEXT NOT NULL,
ADD COLUMN     "fieldOfwork" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TeacherFormRequest" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "ID_Card" TEXT NOT NULL,
    "resumeUrl" TEXT NOT NULL,
    "fieldOfwork" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "AcceptRulesOfWebSite" BOOLEAN NOT NULL,
    "degree" TEXT NOT NULL,
    "birthDate" DATE NOT NULL,
    "status" "FormRequestStatus" NOT NULL DEFAULT 'Pending',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherFormRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TeacherFormRequest" ADD CONSTRAINT "TeacherFormRequest_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
