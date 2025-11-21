/*
  Warnings:

  - You are about to drop the column `storeId` on the `salesorderitems` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `salesorderitems` DROP FOREIGN KEY `SalesOrderItems_storeId_fkey`;

-- DropIndex
DROP INDEX `SalesOrderItems_storeId_idx` ON `salesorderitems`;

-- AlterTable
ALTER TABLE `salesorderitems` DROP COLUMN `storeId`;
