-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "trainee_id" UUID NOT NULL,
    "previous_status" TEXT,
    "new_status" TEXT NOT NULL,
    "changed_by" TEXT,
    "change_type" TEXT NOT NULL,
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);
