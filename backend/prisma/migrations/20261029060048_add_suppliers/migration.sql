/*
  Warnings:

  - You are about to drop the column `supplierName` on the `purchaseorders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `purchaseorders` DROP COLUMN `supplierName`,
    ADD COLUMN `supplierId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Suppliers` (
    `supplierId` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Suppliers_storeId_idx`(`storeId`),
    UNIQUE INDEX `Suppliers_storeId_name_key`(`storeId`, `name`),
    PRIMARY KEY (`supplierId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariantSuppliers` (
    `productVariantSupplierId` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `productVariantId` INTEGER NOT NULL,
    `supplierId` INTEGER NOT NULL,
    `cost` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductVariantSuppliers_storeId_idx`(`storeId`),
    INDEX `ProductVariantSuppliers_supplierId_idx`(`supplierId`),
    UNIQUE INDEX `ProductVariantSuppliers_productVariantId_supplierId_key`(`productVariantId`, `supplierId`),
    PRIMARY KEY (`productVariantSupplierId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `PurchaseOrders_supplierId_idx` ON `PurchaseOrders`(`supplierId`);

-- AddForeignKey
ALTER TABLE `PurchaseOrders` ADD CONSTRAINT `PurchaseOrders_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Suppliers`(`supplierId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Suppliers` ADD CONSTRAINT `Suppliers_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantSuppliers` ADD CONSTRAINT `ProductVariantSuppliers_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantSuppliers` ADD CONSTRAINT `ProductVariantSuppliers_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariants`(`productVariantId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantSuppliers` ADD CONSTRAINT `ProductVariantSuppliers_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Suppliers`(`supplierId`) ON DELETE RESTRICT ON UPDATE CASCADE;
