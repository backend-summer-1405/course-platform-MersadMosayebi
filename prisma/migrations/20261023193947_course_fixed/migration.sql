-- DropForeignKey
ALTER TABLE "courseRating" DROP CONSTRAINT "courseRating_courseId_fkey";

-- DropForeignKey
ALTER TABLE "courseRating" DROP CONSTRAINT "courseRating_personId_fkey";

-- AddForeignKey
ALTER TABLE "courseRating" ADD CONSTRAINT "courseRating_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseRating" ADD CONSTRAINT "courseRating_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
