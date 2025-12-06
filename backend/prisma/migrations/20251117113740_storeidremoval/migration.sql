/*
  Warnings:

  - You are about to drop the column `storeId` on the `subchannels` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `subchannels` DROP FOREIGN KEY `SubChannels_storeId_fkey`;

-- DropIndex
DROP INDEX `SubChannels_storeId_idx` ON `subchannels`;

-- AlterTable
ALTER TABLE `subchannels` DROP COLUMN `storeId`;
