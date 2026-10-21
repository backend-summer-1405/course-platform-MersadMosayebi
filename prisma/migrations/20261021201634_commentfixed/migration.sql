/*
  Warnings:

  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommentLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reply` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReplyLike` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_personId_fkey";

-- DropForeignKey
ALTER TABLE "CommentLike" DROP CONSTRAINT "CommentLike_commentId_fkey";

-- DropForeignKey
ALTER TABLE "CommentLike" DROP CONSTRAINT "CommentLike_personId_fkey";

-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_personId_fkey";

-- DropForeignKey
ALTER TABLE "ReplyLike" DROP CONSTRAINT "ReplyLike_personId_fkey";

-- DropForeignKey
ALTER TABLE "ReplyLike" DROP CONSTRAINT "ReplyLike_replyId_fkey";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "CommentLike";

-- DropTable
DROP TABLE "Reply";

-- DropTable
DROP TABLE "ReplyLike";

-- CreateTable
CREATE TABLE "CommentCourse" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "like" INTEGER NOT NULL,
    "disLike" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommentCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplyCourseComment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "commentId" INTEGER NOT NULL,
    "personId" TEXT NOT NULL,
    "like" INTEGER NOT NULL,
    "disLike" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReplyCourseComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikeCommentCourse" (
    "id" SERIAL NOT NULL,
    "type" "LikeType" NOT NULL,
    "commentId" INTEGER NOT NULL,
    "personId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikeCommentCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikeReplyCommentCourse" (
    "id" SERIAL NOT NULL,
    "type" "LikeType" NOT NULL,
    "replyId" INTEGER NOT NULL,
    "personId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikeReplyCommentCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LikeCommentCourse_commentId_personId_key" ON "LikeCommentCourse"("commentId", "personId");

-- CreateIndex
CREATE UNIQUE INDEX "LikeReplyCommentCourse_replyId_personId_key" ON "LikeReplyCommentCourse"("replyId", "personId");

-- AddForeignKey
ALTER TABLE "CommentCourse" ADD CONSTRAINT "CommentCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentCourse" ADD CONSTRAINT "CommentCourse_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplyCourseComment" ADD CONSTRAINT "ReplyCourseComment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "CommentCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplyCourseComment" ADD CONSTRAINT "ReplyCourseComment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeCommentCourse" ADD CONSTRAINT "LikeCommentCourse_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "CommentCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeCommentCourse" ADD CONSTRAINT "LikeCommentCourse_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeReplyCommentCourse" ADD CONSTRAINT "LikeReplyCommentCourse_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "ReplyCourseComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeReplyCommentCourse" ADD CONSTRAINT "LikeReplyCommentCourse_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
