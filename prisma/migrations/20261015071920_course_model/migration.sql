-- AlterTable
ALTER TABLE "TeacherProfile" ADD COLUMN     "linkdinLink" TEXT;

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "teacherName" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teacherId" TEXT,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courseTopic" (
    "id" SERIAL NOT NULL,
    "courseId" TEXT NOT NULL,
    "topicName" TEXT NOT NULL,

    CONSTRAINT "courseTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courseLesson" (
    "id" TEXT NOT NULL,
    "courseTopicId" INTEGER NOT NULL,
    "lessonName" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,

    CONSTRAINT "courseLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courseImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "courseImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoryCourse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categoryCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoriteCourse" (
    "id" SERIAL NOT NULL,
    "personId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "favoriteCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_categoryCourseTocourse" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_categoryCourseTocourse_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoryCourse_name_key" ON "categoryCourse"("name");

-- CreateIndex
CREATE UNIQUE INDEX "favoriteCourse_personId_courseId_key" ON "favoriteCourse"("personId", "courseId");

-- CreateIndex
CREATE INDEX "_categoryCourseTocourse_B_index" ON "_categoryCourseTocourse"("B");

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseTopic" ADD CONSTRAINT "courseTopic_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseLesson" ADD CONSTRAINT "courseLesson_courseTopicId_fkey" FOREIGN KEY ("courseTopicId") REFERENCES "courseTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseImage" ADD CONSTRAINT "courseImage_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoriteCourse" ADD CONSTRAINT "favoriteCourse_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoriteCourse" ADD CONSTRAINT "favoriteCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_categoryCourseTocourse" ADD CONSTRAINT "_categoryCourseTocourse_A_fkey" FOREIGN KEY ("A") REFERENCES "categoryCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_categoryCourseTocourse" ADD CONSTRAINT "_categoryCourseTocourse_B_fkey" FOREIGN KEY ("B") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
