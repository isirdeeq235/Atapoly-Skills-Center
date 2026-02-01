-- CreateTable
CREATE TABLE "Batch" (
    "id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "batch_name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "max_capacity" INTEGER,
    "status" TEXT,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);
