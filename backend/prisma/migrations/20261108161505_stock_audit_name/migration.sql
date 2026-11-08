-- AlterTable
ALTER TABLE `stockadjustmentperproduct` MODIFY `reason` ENUM('DAMAGED', 'MISCOUNT', 'SUPPLIER_ERROR', 'UNRECORDED_SALE', 'UNRECORDED_RECEIPT', 'OTHER') NULL;

-- AlterTable
ALTER TABLE `stockaudits` ADD COLUMN `auditName` VARCHAR(191) NULL;
