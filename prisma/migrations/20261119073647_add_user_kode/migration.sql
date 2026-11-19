/*
  Warnings:

  - A unique constraint covering the columns `[kode]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `kode` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_kode_key` ON `users`(`kode`);
