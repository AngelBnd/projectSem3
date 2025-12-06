/*
  Warnings:

  - You are about to drop the column `price` on the `salesorderitems` table. All the data in the column will be lost.
  - Added the required column `unitPrice` to the `SalesOrderItems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `salesorderitems` DROP COLUMN `price`,
    ADD COLUMN `unitPrice` DECIMAL(65, 30) NOT NULL;
