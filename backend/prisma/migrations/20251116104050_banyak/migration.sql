/*
  Warnings:

  - You are about to alter the column `status` on the `invoices` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(9))`.
  - The primary key for the `salesorderitems` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `salesOrderItemId` on the `salesorderitems` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `salesorderitems` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `salesorders` table. All the data in the column will be lost.
  - You are about to drop the column `orderStatus` on the `salesorders` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `salesorders` table. All the data in the column will be lost.
  - The primary key for the `salesreturnitems` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `productVariantId` on the `salesreturnitems` table. All the data in the column will be lost.
  - You are about to drop the column `quantityReturned` on the `salesreturnitems` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `salesreturnitems` table. All the data in the column will be lost.
  - You are about to drop the column `returnId` on the `salesreturnitems` table. All the data in the column will be lost.
  - You are about to drop the column `returnItemId` on the `salesreturnitems` table. All the data in the column will be lost.
  - You are about to drop the `inventoryreservation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pricehistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `salefulfillmentitems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `salefulfillments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `salesreturns` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[salesOrderId]` on the table `Invoices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `price` to the `SalesOrderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salesOrderItemsId` to the `SalesOrderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `SalesOrders` table without a default value. This is not possible if the table is not empty.
  - Made the column `totalAmount` on table `salesorders` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `qtyReturned` to the `SalesReturnItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `returnDate` to the `SalesReturnItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salesDeliveryItemsId` to the `SalesReturnItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salesReturnItemsId` to the `SalesReturnItems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `inventoryreservation` DROP FOREIGN KEY `InventoryReservation_salesOrderItemsId_fkey`;

-- DropForeignKey
ALTER TABLE `inventoryreservation` DROP FOREIGN KEY `InventoryReservation_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `pricehistory` DROP FOREIGN KEY `PriceHistory_productVariantsId_fkey`;

-- DropForeignKey
ALTER TABLE `pricehistory` DROP FOREIGN KEY `PriceHistory_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `salefulfillmentitems` DROP FOREIGN KEY `SaleFulfillmentItems_productVariantId_fkey`;

-- DropForeignKey
ALTER TABLE `salefulfillmentitems` DROP FOREIGN KEY `SaleFulfillmentItems_saleFulfillmentId_fkey`;

-- DropForeignKey
ALTER TABLE `salefulfillmentitems` DROP FOREIGN KEY `SaleFulfillmentItems_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `salefulfillments` DROP FOREIGN KEY `SaleFulfillments_salesOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `salefulfillments` DROP FOREIGN KEY `SaleFulfillments_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `salesreturnitems` DROP FOREIGN KEY `SalesReturnItems_productVariantId_fkey`;

-- DropForeignKey
ALTER TABLE `salesreturnitems` DROP FOREIGN KEY `SalesReturnItems_returnId_fkey`;

-- DropForeignKey
ALTER TABLE `salesreturns` DROP FOREIGN KEY `SalesReturns_salesOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `salesreturns` DROP FOREIGN KEY `SalesReturns_storeId_fkey`;

-- DropIndex
DROP INDEX `SalesOrders_orderDate_idx` ON `salesorders`;

-- DropIndex
DROP INDEX `SalesReturnItems_productVariantId_idx` ON `salesreturnitems`;

-- DropIndex
DROP INDEX `SalesReturnItems_returnId_idx` ON `salesreturnitems`;

-- AlterTable
ALTER TABLE `invoicelineitems` ADD COLUMN `discount` DECIMAL(65, 30) NULL;

-- AlterTable
ALTER TABLE `invoices` MODIFY `status` ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'VOIDED') NOT NULL;

-- AlterTable
ALTER TABLE `salesorderitems` DROP PRIMARY KEY,
    DROP COLUMN `salesOrderItemId`,
    DROP COLUMN `unitPrice`,
    ADD COLUMN `price` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `salesOrderItemsId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`salesOrderItemsId`);

-- AlterTable
ALTER TABLE `salesorders` DROP COLUMN `createdAt`,
    DROP COLUMN `orderStatus`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `createdBy` INTEGER NOT NULL,
    ADD COLUMN `paymentTerms` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED', 'ON_HOLD') NOT NULL DEFAULT 'PENDING_APPROVAL',
    MODIFY `totalAmount` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `salesreturnitems` DROP PRIMARY KEY,
    DROP COLUMN `productVariantId`,
    DROP COLUMN `quantityReturned`,
    DROP COLUMN `reason`,
    DROP COLUMN `returnId`,
    DROP COLUMN `returnItemId`,
    ADD COLUMN `qtyReturned` INTEGER NOT NULL,
    ADD COLUMN `returnDate` DATETIME(3) NOT NULL,
    ADD COLUMN `salesDeliveryItemsId` INTEGER NOT NULL,
    ADD COLUMN `salesReturnItemsId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    ADD PRIMARY KEY (`salesReturnItemsId`);

-- AlterTable
ALTER TABLE `stockaudits` MODIFY `status` ENUM('PENDING', 'PENDING_APPROVAL', 'COMPLETED', 'APPROVED', 'REJECTED') NOT NULL;

-- DropTable
DROP TABLE `inventoryreservation`;

-- DropTable
DROP TABLE `pricehistory`;

-- DropTable
DROP TABLE `salefulfillmentitems`;

-- DropTable
DROP TABLE `salefulfillments`;

-- DropTable
DROP TABLE `salesreturns`;

-- CreateTable
CREATE TABLE `SalesDeliveryItems` (
    `salesDeliveryItemsId` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `salesOrderItemsId` INTEGER NOT NULL,
    `quantityDelivered` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `deliveryDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`salesDeliveryItemsId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLogs` (
    `auditLogId` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NULL,
    `userId` INTEGER NULL,
    `tableName` VARCHAR(191) NOT NULL,
    `recordId` INTEGER NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `oldValue` JSON NULL,
    `newValue` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLogs_storeId_idx`(`storeId`),
    INDEX `AuditLogs_userId_idx`(`userId`),
    INDEX `AuditLogs_tableName_idx`(`tableName`),
    INDEX `AuditLogs_action_idx`(`action`),
    PRIMARY KEY (`auditLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Invoices_salesOrderId_key` ON `Invoices`(`salesOrderId`);

-- AddForeignKey
ALTER TABLE `SalesOrders` ADD CONSTRAINT `SalesOrders_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesDeliveryItems` ADD CONSTRAINT `SalesDeliveryItems_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesDeliveryItems` ADD CONSTRAINT `SalesDeliveryItems_salesOrderItemsId_fkey` FOREIGN KEY (`salesOrderItemsId`) REFERENCES `SalesOrderItems`(`salesOrderItemsId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_salesDeliveryItemsId_fkey` FOREIGN KEY (`salesDeliveryItemsId`) REFERENCES `SalesDeliveryItems`(`salesDeliveryItemsId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLogs` ADD CONSTRAINT `AuditLogs_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLogs` ADD CONSTRAINT `AuditLogs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;
