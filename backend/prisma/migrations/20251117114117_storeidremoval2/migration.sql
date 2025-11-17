/*
  Warnings:

  - You are about to drop the column `storeId` on the `channels` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `channels` DROP FOREIGN KEY `Channels_storeId_fkey`;

-- DropIndex
DROP INDEX `Channels_storeId_idx` ON `channels`;

-- AlterTable
ALTER TABLE `channels` DROP COLUMN `storeId`;
