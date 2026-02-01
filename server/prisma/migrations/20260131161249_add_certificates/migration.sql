-- CreateTable
CREATE TABLE "Certificate" (
    "id" UUID NOT NULL,
    "certificate_number" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "application_id" UUID NOT NULL,
    "program_id" UUID,
    "batch_id" UUID,
    "trainee_id" UUID NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);
