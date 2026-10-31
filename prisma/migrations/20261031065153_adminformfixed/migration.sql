-- AddForeignKey
ALTER TABLE "adminFormRequest" ADD CONSTRAINT "adminFormRequest_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
