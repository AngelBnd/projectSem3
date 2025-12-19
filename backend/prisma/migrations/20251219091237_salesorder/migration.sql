/*
  Warnings:

  - You are about to drop the column `channelId` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `salesdeliveryitems` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `salesreturnitems` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `invoices` DROP FOREIGN KEY `Invoices_channelId_fkey`;

-- DropForeignKey
ALTER TABLE `salesdeliveryitems` DROP FOREIGN KEY `SalesDeliveryItems_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `salesreturnitems` DROP FOREIGN KEY `SalesReturnItems_storeId_fkey`;

-- DropIndex
DROP INDEX `Invoices_channelId_idx` ON `invoices`;

-- DropIndex
DROP INDEX `SalesDeliveryItems_storeId_fkey` ON `salesdeliveryitems`;

-- DropIndex
DROP INDEX `SalesReturnItems_storeId_idx` ON `salesreturnitems`;

-- AlterTable
ALTER TABLE `invoices` DROP COLUMN `channelId`;

-- AlterTable
ALTER TABLE `salesdeliveryitems` DROP COLUMN `storeId`;

-- AlterTable
ALTER TABLE `salesorders` ADD COLUMN `channelId` INTEGER NULL,
    ADD COLUMN `subChannelId` INTEGER NULL;

-- AlterTable
ALTER TABLE `salesreturnitems` DROP COLUMN `storeId`;

-- CreateIndex
CREATE INDEX `SalesOrders_channelId_idx` ON `SalesOrders`(`channelId`);

-- CreateIndex
CREATE INDEX `SalesOrders_subChannelId_idx` ON `SalesOrders`(`subChannelId`);

-- AddForeignKey
ALTER TABLE `SalesOrders` ADD CONSTRAINT `SalesOrders_subChannelId_fkey` FOREIGN KEY (`subChannelId`) REFERENCES `SubChannels`(`subChannelId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrders` ADD CONSTRAINT `SalesOrders_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `Channels`(`channelId`) ON DELETE SET NULL ON UPDATE CASCADE;
