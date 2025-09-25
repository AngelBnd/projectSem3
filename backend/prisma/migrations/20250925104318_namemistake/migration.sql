/*
  Warnings:

  - You are about to drop the column `prooductCategory` on the `products` table. All the data in the column will be lost.
  - Added the required column `productCategory` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products` DROP COLUMN `prooductCategory`,
    ADD COLUMN `productCategory` VARCHAR(191) NOT NULL;
