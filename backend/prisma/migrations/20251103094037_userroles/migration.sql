-- DropForeignKey
ALTER TABLE `store` DROP FOREIGN KEY `Store_ownerId_fkey`;

-- AlterTable
ALTER TABLE `store` MODIFY `ownerId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Store` ADD CONSTRAINT `Store_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
