/*
  Warnings:

  - The primary key for the `invoices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `invoiceNumber` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `invoices` table. All the data in the column will be lost.
  - The primary key for the `lineitems` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `discount` on the `lineitems` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `lineitems` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceNumber` on the `lineitems` table. All the data in the column will be lost.
  - Added the required column `discountPrice` to the `Invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceId` to the `Invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceSubtotal` to the `Invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceId` to the `LineItems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `lineitems` DROP FOREIGN KEY `LineItems_invoiceNumber_fkey`;

-- DropIndex
DROP INDEX `LineItems_invoiceNumber_fkey` ON `lineitems`;

-- AlterTable
ALTER TABLE `invoices` DROP PRIMARY KEY,
    DROP COLUMN `invoiceNumber`,
    DROP COLUMN `subtotal`,
    ADD COLUMN `discountPrice` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `invoiceId` VARCHAR(191) NOT NULL,
    ADD COLUMN `invoiceSubtotal` DECIMAL(10, 2) NOT NULL,
    ADD PRIMARY KEY (`invoiceId`);

-- AlterTable
ALTER TABLE `lineitems` DROP PRIMARY KEY,
    DROP COLUMN `discount`,
    DROP COLUMN `id`,
    DROP COLUMN `invoiceNumber`,
    ADD COLUMN `invoiceId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`productCode`, `invoiceId`);

-- AddForeignKey
ALTER TABLE `LineItems` ADD CONSTRAINT `LineItems_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoices`(`invoiceId`) ON DELETE RESTRICT ON UPDATE CASCADE;
