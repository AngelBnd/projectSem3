/*
  Warnings:

  - You are about to alter the column `userId` on the `invoices` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `userId` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Made the column `status` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `invoices` DROP FOREIGN KEY `Invoices_userId_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `Products_userId_fkey`;

-- DropIndex
DROP INDEX `Invoices_userId_fkey` ON `invoices`;

-- DropIndex
DROP INDEX `Products_userId_fkey` ON `products`;

-- AlterTable
ALTER TABLE `invoices` MODIFY `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `products` MODIFY `status` VARCHAR(191) NOT NULL,
    MODIFY `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoices` ADD CONSTRAINT `Invoices_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
