-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN     "industry" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "logo_url" TEXT;

-- CreateTable
CREATE TABLE "recommendations" (
    "id" SERIAL NOT NULL,
    "company_user_id" INTEGER NOT NULL,
    "student_user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_company_user_id_fkey" FOREIGN KEY ("company_user_id") REFERENCES "company_profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_student_user_id_fkey" FOREIGN KEY ("student_user_id") REFERENCES "student_profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
