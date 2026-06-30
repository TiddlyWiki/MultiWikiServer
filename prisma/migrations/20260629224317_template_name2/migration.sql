/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `template` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "template_name_key" ON "template"("name");
