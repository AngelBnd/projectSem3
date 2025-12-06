/*
  Warnings:

  - You are about to drop the column `status` on the `salesdeliveryitems` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `salesorders` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `salesreturnitems` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(7))` to `Enum(EnumId(15))`.

*/
-- AlterTable
ALTER TABLE `salesdeliveryitems` DROP COLUMN `status`;

-- AlterTable
ALTER TABLE `salesorders` DROP COLUMN `status`,
    ADD COLUMN `creationStatus` ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN `deliveryStatus` ENUM('UNDELIVERED', 'PARTIALLY_DELIVERED', 'DELIVERED') NOT NULL DEFAULT 'UNDELIVERED',
    ADD COLUMN `paymentStatus` ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID') NOT NULL DEFAULT 'UNPAID';

-- AlterTable
ALTER TABLE `salesreturnitems` MODIFY `status` ENUM('PROCESSING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PROCESSING';
