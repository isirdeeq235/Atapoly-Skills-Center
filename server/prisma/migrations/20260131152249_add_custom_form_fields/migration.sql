-- CreateTable
CREATE TABLE "CustomFormField" (
    "id" UUID NOT NULL,
    "form_type" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_label" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "field_options" JSONB,
    "placeholder" TEXT,
    "help_text" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "validation_rules" JSONB,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "program_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "CustomFormField_pkey" PRIMARY KEY ("id")
);
