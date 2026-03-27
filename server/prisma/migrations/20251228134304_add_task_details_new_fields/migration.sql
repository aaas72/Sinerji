-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "detail_body" TEXT,
ADD COLUMN     "detail_title" TEXT,
ADD COLUMN     "reward_amount" TEXT;
