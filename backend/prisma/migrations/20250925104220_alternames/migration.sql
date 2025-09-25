/*
  Warnings:

  - You are about to drop the column `category` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `products` table. All the data in the column will be lost.
  - Added the required column `productBrand` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prooductCategory` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products` DROP COLUMN `category`,
    DROP COLUMN `description`,
    DROP COLUMN `name`,
    DROP COLUMN `quantity`,
    ADD COLUMN `initialStock` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `productBrand` VARCHAR(191) NOT NULL,
    ADD COLUMN `productName` VARCHAR(191) NOT NULL,
    ADD COLUMN `prooductCategory` VARCHAR(191) NOT NULL,
    ADD COLUMN `thresholdStock` INTEGER NOT NULL DEFAULT 0;
