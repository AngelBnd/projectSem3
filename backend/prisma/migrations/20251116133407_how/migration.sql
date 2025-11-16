/*
  Warnings:

  - You are about to drop the column `createdBy` on the `invoices` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `invoices` DROP FOREIGN KEY `Invoices_createdBy_fkey`;

-- DropIndex
DROP INDEX `Invoices_createdBy_idx` ON `invoices`;

-- AlterTable
ALTER TABLE `invoices` DROP COLUMN `createdBy`;
