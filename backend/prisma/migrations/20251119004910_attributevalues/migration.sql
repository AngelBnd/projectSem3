/*
  Warnings:

  - You are about to drop the column `attributeId` on the `productvariantattributes` table. All the data in the column will be lost.
  - You are about to drop the column `sellingPrice` on the `productvariants` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[attributeValuesId,productVariantsId]` on the table `ProductVariantAttributes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `productvariantattributes` DROP FOREIGN KEY `ProductVariantAttributes_attributeId_fkey`;

-- DropIndex
DROP INDEX `ProductVariantAttributes_attributeId_attributeValuesId_produ_key` ON `productvariantattributes`;

-- DropIndex
DROP INDEX `ProductVariantAttributes_attributeId_idx` ON `productvariantattributes`;

-- AlterTable
ALTER TABLE `productvariantattributes` DROP COLUMN `attributeId`;

-- AlterTable
ALTER TABLE `productvariants` DROP COLUMN `sellingPrice`;

-- CreateIndex
CREATE UNIQUE INDEX `ProductVariantAttributes_attributeValuesId_productVariantsId_key` ON `ProductVariantAttributes`(`attributeValuesId`, `productVariantsId`);
