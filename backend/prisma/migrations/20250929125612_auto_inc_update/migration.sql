-- DropForeignKey
ALTER TABLE `lineitems` DROP FOREIGN KEY `LineItems_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `lineitems` DROP FOREIGN KEY `LineItems_productCode_fkey`;

-- DropIndex
DROP INDEX `LineItems_invoiceId_fkey` ON `lineitems`;

-- AlterTable
ALTER TABLE `lineitems` MODIFY `productCode` VARCHAR(191) NOT NULL,
    MODIFY `invoiceId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `LineItems` ADD CONSTRAINT `LineItems_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoices`(`invoiceId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LineItems` ADD CONSTRAINT `LineItems_productCode_fkey` FOREIGN KEY (`productCode`) REFERENCES `Products`(`productCode`) ON DELETE RESTRICT ON UPDATE CASCADE;
