-- AlterTable
ALTER TABLE "course" ADD COLUMN     "rateAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "rateCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "courseRating" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courseRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courseRating_courseId_personId_key" ON "courseRating"("courseId", "personId");

-- AddForeignKey
ALTER TABLE "courseRating" ADD CONSTRAINT "courseRating_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseRating" ADD CONSTRAINT "courseRating_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
