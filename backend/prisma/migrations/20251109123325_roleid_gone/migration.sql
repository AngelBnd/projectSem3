/*
  Warnings:

  - You are about to drop the column `roleId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `Users_roleId_fkey`;

-- DropIndex
DROP INDEX `Users_roleId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `roleId`;
