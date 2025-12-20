/*
  Warnings:

  - You are about to drop the column `storeId` on the `roles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `roles` DROP FOREIGN KEY `Roles_storeId_fkey`;

-- DropIndex
DROP INDEX `Roles_storeId_idx` ON `roles`;

-- AlterTable
ALTER TABLE `roles` DROP COLUMN `storeId`;

-- AlterTable
ALTER TABLE `stockmovements` MODIFY `referenceId` INTEGER NULL;
