/*
  Warnings:

  - The primary key for the `invoices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `lineitems` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `productCode` on the `lineitems` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `invoiceId` on the `lineitems` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[invoiceId]` on the table `Invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productCode,invoiceId]` on the table `LineItems` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productCode]` on the table `Products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `Invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `LineItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `lineitems` DROP FOREIGN KEY `LineItems_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `lineitems` DROP FOREIGN KEY `LineItems_productCode_fkey`;

-- DropIndex
DROP INDEX `LineItems_invoiceId_fkey` ON `lineitems`;

-- AlterTable
ALTER TABLE `invoices` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `lineitems` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `productCode` INTEGER NOT NULL,
    MODIFY `invoiceId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `products` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `Invoices_invoiceId_key` ON `Invoices`(`invoiceId`);

-- CreateIndex
CREATE UNIQUE INDEX `LineItems_productCode_invoiceId_key` ON `LineItems`(`productCode`, `invoiceId`);

-- CreateIndex
CREATE UNIQUE INDEX `Products_productCode_key` ON `Products`(`productCode`);

-- AddForeignKey
ALTER TABLE `LineItems` ADD CONSTRAINT `LineItems_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LineItems` ADD CONSTRAINT `LineItems_productCode_fkey` FOREIGN KEY (`productCode`) REFERENCES `Products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
