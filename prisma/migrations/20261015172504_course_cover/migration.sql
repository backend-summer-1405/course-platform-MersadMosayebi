/*
  Warnings:

  - Added the required column `courseCoverUrl` to the `course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "course" ADD COLUMN     "courseCoverUrl" TEXT NOT NULL;
