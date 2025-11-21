/*
  Warnings:

  - You are about to drop the column `costPrice` on the `productvariants` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `salesorderitems` DROP FOREIGN KEY `SalesOrderItems_productVariantId_fkey`;

-- DropIndex
DROP INDEX `SalesOrderItems_productVariantId_idx` ON `salesorderitems`;

-- AlterTable
ALTER TABLE `productvariants` DROP COLUMN `costPrice`,
    ADD COLUMN `sellingPrice` DECIMAL(65, 30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `salesorderitems` MODIFY `productVariantId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `SalesOrderItems` ADD CONSTRAINT `SalesOrderItems_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariants`(`productVariantId`) ON DELETE SET NULL ON UPDATE CASCADE;
