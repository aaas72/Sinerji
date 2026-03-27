-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "employment_type" TEXT,
ADD COLUMN     "is_easy_apply" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT;
