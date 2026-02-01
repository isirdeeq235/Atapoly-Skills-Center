-- CreateTable
CREATE TABLE "RolePermission" (
    "id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "permission_key" TEXT NOT NULL,
    "permission_label" TEXT NOT NULL,
    "permission_category" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_permission_key_key" ON "RolePermission"("permission_key");
