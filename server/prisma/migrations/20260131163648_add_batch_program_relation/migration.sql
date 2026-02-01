-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
