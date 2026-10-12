-- CreateTable
CREATE TABLE "adminFormRequest" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adminFormRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "adminFormRequest_personId_key" ON "adminFormRequest"("personId");
