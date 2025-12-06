/*
  Warnings:

  - You are about to drop the column `discount` on the `invoicelineitems` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `salesorderitems` table. All the data in the column will be lost.
  - You are about to drop the `invoicepayments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `invoicepayments` DROP FOREIGN KEY `InvoicePayments_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `invoicepayments` DROP FOREIGN KEY `InvoicePayments_storeId_fkey`;

-- AlterTable
ALTER TABLE `invoicelineitems` DROP COLUMN `discount`;

-- AlterTable
ALTER TABLE `salesorderitems` DROP COLUMN `discount`;

-- DropTable
DROP TABLE `invoicepayments`;
