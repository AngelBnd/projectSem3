/*
  Warnings:

  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `primaryRoleId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `Users_primaryRoleId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `Users_storeId_fkey`;

-- DropIndex
DROP INDEX `Users_primaryRoleId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `createdAt`,
    DROP COLUMN `primaryRoleId`,
    ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedBy` INTEGER NULL,
    ADD COLUMN `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `requestedStoreTag` VARCHAR(191) NULL,
    ADD COLUMN `roleId` INTEGER NULL,
    ADD COLUMN `status` ENUM('PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING_APPROVAL',
    MODIFY `storeId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Users_status_idx` ON `Users`(`status`);

-- CreateIndex
CREATE INDEX `Users_requestedStoreTag_idx` ON `Users`(`requestedStoreTag`);

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Roles`(`roleId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `Users`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;
