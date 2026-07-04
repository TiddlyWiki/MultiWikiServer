/*
  Warnings:

  - A unique constraint covering the columns `[resetCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_resetCode_key" ON "users"("resetCode") WHERE "resetCode" IS NOT NULL;
