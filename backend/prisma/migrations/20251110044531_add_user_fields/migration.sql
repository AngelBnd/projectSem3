/*
  Warnings:

  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Users_username_key` ON `users`;

-- AlterTable
ALTER TABLE `productvariants` ADD COLUMN `image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `username`,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `phoneNumber` VARCHAR(191) NULL;
