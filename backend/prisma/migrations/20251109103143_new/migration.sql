/*
  Warnings:

  - You are about to drop the `brand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lineitem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productvariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rolepermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `store` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_createdBy_fkey`;

-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `lineitem` DROP FOREIGN KEY `LineItem_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `lineitem` DROP FOREIGN KEY `LineItem_sku_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `productvariant` DROP FOREIGN KEY `ProductVariant_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `productvariant` DROP FOREIGN KEY `ProductVariant_productId_fkey`;

-- DropForeignKey
ALTER TABLE `rolepermission` DROP FOREIGN KEY `RolePermission_permissionId_fkey`;

-- DropForeignKey
ALTER TABLE `rolepermission` DROP FOREIGN KEY `RolePermission_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `store` DROP FOREIGN KEY `Store_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_storeId_fkey`;

-- DropTable
DROP TABLE `brand`;

-- DropTable
DROP TABLE `category`;

-- DropTable
DROP TABLE `invoice`;

-- DropTable
DROP TABLE `lineitem`;

-- DropTable
DROP TABLE `permission`;

-- DropTable
DROP TABLE `product`;

-- DropTable
DROP TABLE `productvariant`;

-- DropTable
DROP TABLE `role`;

-- DropTable
DROP TABLE `rolepermission`;

-- DropTable
DROP TABLE `store`;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `Stores` (
    `storeId` INTEGER NOT NULL AUTO_INCREMENT,
    `storeTag` VARCHAR(191) NOT NULL,
    `storeName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ownerId` INTEGER NOT NULL,

    UNIQUE INDEX `Stores_storeTag_key`(`storeTag`),
    UNIQUE INDEX `Stores_ownerId_key`(`ownerId`),
    PRIMARY KEY (`storeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Users` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `primaryRoleId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Users_email_key`(`email`),
    INDEX `Users_storeId_idx`(`storeId`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Roles` (
    `roleId` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `roleName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Roles_storeId_idx`(`storeId`),
    PRIMARY KEY (`roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permissions` (
    `permissionId` INTEGER NOT NULL AUTO_INCREMENT,
    `module` VARCHAR(191) NOT NULL,
    `permission` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Permissions_module_permission_key`(`module`, `permission`),
    PRIMARY KEY (`permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolePermissions` (
    `rolePermissionId` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,

    INDEX `RolePermissions_roleId_idx`(`roleId`),
    INDEX `RolePermissions_permissionId_idx`(`permissionId`),
    UNIQUE INDEX `RolePermissions_roleId_permissionId_key`(`roleId`, `permissionId`),
    PRIMARY KEY (`rolePermissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRoles` (
    `userRoleId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `roleId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,

    INDEX `UserRoles_userId_idx`(`userId`),
    INDEX `UserRoles_roleId_idx`(`roleId`),
    UNIQUE INDEX `UserRoles_userId_roleId_key`(`userId`, `roleId`),
    PRIMARY KEY (`userRoleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Products` (
    `productId` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `productDescription` VARCHAR(191) NULL,
    `productStatus` ENUM('ACTIVE', 'INACTIVE', 'DISCONTINUED') NOT NULL,
    `approvalStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL,
    `category` ENUM('HEAD_UNITS', 'SPEAKERS', 'AMPLIFIERS', 'SUBWOOFERS', 'WIRING_ACCESSORIES', 'SIGNAL_PROCESSORS', 'BLUETOOTH_MODULES', 'BACKUP_CAMERAS', 'CARPLAY_ANDROIDAUTO', 'DASH_KITS', 'INSTALLATION_ACCESSORIES', 'SOUND_DEADENING', 'BATTERIES_POWER', 'LIGHTING_ACCESSORIES', 'SECURITY_SYSTEMS', 'RADAR_DETECTORS') NOT NULL,
    `brand` ENUM('PIONEER', 'ALPINE', 'KENWOOD', 'JVC', 'SONY', 'JBL', 'KICKER', 'ROCKFORD_FOSGATE', 'AUDIOCONTROL', 'MTX', 'INFINITY', 'JL_AUDIO', 'BOSS_AUDIOSYSTEMS', 'DS18', 'NVX', 'STINGER', 'CRUCHFIELD', 'METRA', 'SCOSCHE', 'PAC') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` INTEGER NOT NULL,

    INDEX `Products_storeId_idx`(`storeId`),
    INDEX `Products_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariants` (
    `productVariantId` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `barcode` VARCHAR(191) NULL,
    `sellingPrice` DECIMAL(65, 30) NOT NULL,
    `costPrice` DECIMAL(65, 30) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `thresholdStock` INTEGER NOT NULL DEFAULT 0,
    `productStatus` ENUM('ACTIVE', 'INACTIVE', 'DISCONTINUED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductVariants_storeId_idx`(`storeId`),
    INDEX `ProductVariants_productId_idx`(`productId`),
    UNIQUE INDEX `ProductVariants_storeId_sku_key`(`storeId`, `sku`),
    PRIMARY KEY (`productVariantId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attributes` (
    `attributeId` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    INDEX `Attributes_storeId_idx`(`storeId`),
    PRIMARY KEY (`attributeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttributeValues` (
    `attributeValuesId` INTEGER NOT NULL AUTO_INCREMENT,
    `attributeId` INTEGER NOT NULL,
    `valueName` VARCHAR(191) NOT NULL,
    `storeId` INTEGER NOT NULL,

    INDEX `AttributeValues_attributeId_idx`(`attributeId`),
    INDEX `AttributeValues_storeId_idx`(`storeId`),
    PRIMARY KEY (`attributeValuesId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariantAttributes` (
    `productVariantAttributeId` INTEGER NOT NULL AUTO_INCREMENT,
    `attributeId` INTEGER NOT NULL,
    `attributeValuesId` INTEGER NOT NULL,
    `productVariantsId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,

    INDEX `ProductVariantAttributes_storeId_idx`(`storeId`),
    INDEX `ProductVariantAttributes_attributeId_idx`(`attributeId`),
    INDEX `ProductVariantAttributes_attributeValuesId_idx`(`attributeValuesId`),
    INDEX `ProductVariantAttributes_productVariantsId_idx`(`productVariantsId`),
    UNIQUE INDEX `ProductVariantAttributes_attributeId_attributeValuesId_produ_key`(`attributeId`, `attributeValuesId`, `productVariantsId`),
    PRIMARY KEY (`productVariantAttributeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceHistory` (
    `priceHistoryId` INTEGER NOT NULL AUTO_INCREMENT,
    `productVariantsId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `dateChanged` DATETIME(3) NOT NULL,
    `sellingPrice` DECIMAL(65, 30) NOT NULL,
    `newPrice` DECIMAL(65, 30) NOT NULL,

    INDEX `PriceHistory_productVariantsId_idx`(`productVariantsId`),
    INDEX `PriceHistory_storeId_idx`(`storeId`),
    INDEX `PriceHistory_dateChanged_idx`(`dateChanged`),
    PRIMARY KEY (`priceHistoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockMovements` (
    `stockMovementId` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `productVariantId` INTEGER NOT NULL,
    `referenceId` INTEGER NOT NULL,
    `referenceType` ENUM('INVOICE', 'PURCHASE_ORDER', 'PURCHASE_RETURN', 'ADJUSTMENT', 'SALES_ORDER', 'SALES_RETURN') NOT NULL,
    `change` INTEGER NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StockMovements_storeId_idx`(`storeId`),
    INDEX `StockMovements_productVariantId_idx`(`productVariantId`),
    INDEX `StockMovements_referenceType_idx`(`referenceType`),
    INDEX `StockMovements_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`stockMovementId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockAudits` (
    `auditId` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `doneBy` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'APPROVED', 'REJECTED') NOT NULL,
    `auditDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `difference` INTEGER NOT NULL,
    `notes` VARCHAR(191) NOT NULL,

    INDEX `StockAudits_storeId_idx`(`storeId`),
    INDEX `StockAudits_doneBy_idx`(`doneBy`),
    INDEX `StockAudits_auditDate_idx`(`auditDate`),
    INDEX `StockAudits_status_idx`(`status`),
    PRIMARY KEY (`auditId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockAdjustmentPerProduct` (
    `stockAdjustmentPerProductId` INTEGER NOT NULL AUTO_INCREMENT,
    `productVariantId` INTEGER NOT NULL,
    `auditId` INTEGER NOT NULL,
    `physicalQuantity` INTEGER NOT NULL,
    `systemQuantity` INTEGER NOT NULL,
    `reason` ENUM('DAMAGED', 'MISCOUNT', 'SUPPLIER_ERROR', 'UNRECORDED_SALE', 'UNRECORDED_RECEIPT', 'OTHER') NOT NULL,

    INDEX `StockAdjustmentPerProduct_productVariantId_idx`(`productVariantId`),
    INDEX `StockAdjustmentPerProduct_auditId_idx`(`auditId`),
    INDEX `StockAdjustmentPerProduct_reason_idx`(`reason`),
    PRIMARY KEY (`stockAdjustmentPerProductId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoices` (
    `invoiceId` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `channelId` INTEGER NOT NULL,
    `salesOrderId` INTEGER NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `invoiceType` VARCHAR(191) NOT NULL,
    `invoiceSubject` VARCHAR(191) NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `discount` DECIMAL(65, 30) NULL,
    `subtotal` DECIMAL(65, 30) NOT NULL,
    `totalAmount` DECIMAL(65, 30) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdBy` INTEGER NOT NULL,

    UNIQUE INDEX `Invoices_invoiceNumber_key`(`invoiceNumber`),
    INDEX `Invoices_storeId_idx`(`storeId`),
    INDEX `Invoices_channelId_idx`(`channelId`),
    INDEX `Invoices_salesOrderId_idx`(`salesOrderId`),
    INDEX `Invoices_invoiceDate_idx`(`invoiceDate`),
    INDEX `Invoices_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`invoiceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceLineItems` (
    `invoiceLineItemsId` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `productVariantsId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `desc` VARCHAR(191) NULL,
    `servicePrice` DECIMAL(65, 30) NULL,
    `serviceDesc` VARCHAR(191) NULL,
    `quantitySold` INTEGER NOT NULL,
    `sellingPrice` DECIMAL(65, 30) NOT NULL,

    INDEX `InvoiceLineItems_invoiceId_idx`(`invoiceId`),
    INDEX `InvoiceLineItems_productVariantsId_idx`(`productVariantsId`),
    INDEX `InvoiceLineItems_storeId_idx`(`storeId`),
    PRIMARY KEY (`invoiceLineItemsId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoicePayments` (
    `paymentId` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `amountPaid` DECIMAL(65, 30) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,

    INDEX `InvoicePayments_invoiceId_idx`(`invoiceId`),
    INDEX `InvoicePayments_storeId_idx`(`storeId`),
    INDEX `InvoicePayments_paymentDate_idx`(`paymentDate`),
    PRIMARY KEY (`paymentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Channels` (
    `channelId` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    INDEX `Channels_storeId_idx`(`storeId`),
    PRIMARY KEY (`channelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubChannels` (
    `subChannelId` INTEGER NOT NULL AUTO_INCREMENT,
    `channelId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `subChannelName` VARCHAR(191) NOT NULL,

    INDEX `SubChannels_channelId_idx`(`channelId`),
    INDEX `SubChannels_storeId_idx`(`storeId`),
    PRIMARY KEY (`subChannelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseOrders` (
    `purchaseOrderId` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `supplierName` VARCHAR(191) NOT NULL,
    `orderDate` DATETIME(3) NOT NULL,
    `expectedArrivalDate` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ORDERED', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED', 'ON_HOLD') NOT NULL DEFAULT 'DRAFT',
    `totalCost` DECIMAL(65, 30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PurchaseOrders_storeId_idx`(`storeId`),
    INDEX `PurchaseOrders_orderDate_idx`(`orderDate`),
    PRIMARY KEY (`purchaseOrderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseOrderItems` (
    `purchaseOrderItemId` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseOrderId` INTEGER NOT NULL,
    `productVariantId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `quantityOrdered` INTEGER NOT NULL,
    `costPrice` DECIMAL(65, 30) NOT NULL,
    `discount` DECIMAL(65, 30) NULL,
    `tax` DECIMAL(65, 30) NULL,

    INDEX `PurchaseOrderItems_purchaseOrderId_idx`(`purchaseOrderId`),
    INDEX `PurchaseOrderItems_productVariantId_idx`(`productVariantId`),
    INDEX `PurchaseOrderItems_storeId_idx`(`storeId`),
    PRIMARY KEY (`purchaseOrderItemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReceivedGoodsNotes` (
    `receivedGoodsNoteId` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseOrderId` INTEGER NOT NULL,
    `productVariantId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `qtyReceived` INTEGER NOT NULL,
    `dateReceived` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ReceivedGoodsNotes_purchaseOrderId_idx`(`purchaseOrderId`),
    INDEX `ReceivedGoodsNotes_productVariantId_idx`(`productVariantId`),
    INDEX `ReceivedGoodsNotes_storeId_idx`(`storeId`),
    PRIMARY KEY (`receivedGoodsNoteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseReturns` (
    `purchaseReturnId` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseOrderId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `dateReturned` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL,
    `reason` VARCHAR(191) NULL,

    INDEX `PurchaseReturns_purchaseOrderId_idx`(`purchaseOrderId`),
    INDEX `PurchaseReturns_storeId_idx`(`storeId`),
    PRIMARY KEY (`purchaseReturnId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseReturnItems` (
    `purchaseReturnItemId` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseReturnId` INTEGER NOT NULL,
    `productVariantId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `qtyReturned` INTEGER NOT NULL,
    `reason` VARCHAR(191) NULL,

    INDEX `PurchaseReturnItems_purchaseReturnId_idx`(`purchaseReturnId`),
    INDEX `PurchaseReturnItems_productVariantId_idx`(`productVariantId`),
    INDEX `PurchaseReturnItems_storeId_idx`(`storeId`),
    PRIMARY KEY (`purchaseReturnItemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesOrders` (
    `salesOrderId` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `customerName` VARCHAR(191) NULL,
    `orderDate` DATETIME(3) NOT NULL,
    `orderStatus` ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED', 'ON_HOLD') NOT NULL DEFAULT 'DRAFT',
    `totalAmount` DECIMAL(65, 30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `discount` DECIMAL(65, 30) NULL,

    INDEX `SalesOrders_storeId_idx`(`storeId`),
    INDEX `SalesOrders_orderDate_idx`(`orderDate`),
    PRIMARY KEY (`salesOrderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesOrderItems` (
    `salesOrderItemId` INTEGER NOT NULL AUTO_INCREMENT,
    `salesOrderId` INTEGER NOT NULL,
    `productVariantId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `quantityOrdered` INTEGER NOT NULL,
    `unitPrice` DECIMAL(65, 30) NOT NULL,
    `discount` DECIMAL(65, 30) NULL,

    INDEX `SalesOrderItems_salesOrderId_idx`(`salesOrderId`),
    INDEX `SalesOrderItems_productVariantId_idx`(`productVariantId`),
    INDEX `SalesOrderItems_storeId_idx`(`storeId`),
    PRIMARY KEY (`salesOrderItemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SaleFulfillments` (
    `saleFulfillmentId` INTEGER NOT NULL AUTO_INCREMENT,
    `salesOrderId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `fulfillmentDate` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED') NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SaleFulfillments_salesOrderId_idx`(`salesOrderId`),
    INDEX `SaleFulfillments_storeId_idx`(`storeId`),
    INDEX `SaleFulfillments_fulfillmentDate_idx`(`fulfillmentDate`),
    PRIMARY KEY (`saleFulfillmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SaleFulfillmentItems` (
    `saleFulfillmentItemId` INTEGER NOT NULL AUTO_INCREMENT,
    `saleFulfillmentId` INTEGER NOT NULL,
    `productVariantId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `quantityFulfilled` INTEGER NOT NULL,

    INDEX `SaleFulfillmentItems_saleFulfillmentId_idx`(`saleFulfillmentId`),
    INDEX `SaleFulfillmentItems_productVariantId_idx`(`productVariantId`),
    INDEX `SaleFulfillmentItems_storeId_idx`(`storeId`),
    PRIMARY KEY (`saleFulfillmentItemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesReturns` (
    `returnId` INTEGER NOT NULL AUTO_INCREMENT,
    `salesOrderId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `returnDate` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING_APPROVAL',
    `reason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SalesReturns_salesOrderId_idx`(`salesOrderId`),
    INDEX `SalesReturns_storeId_idx`(`storeId`),
    INDEX `SalesReturns_returnDate_idx`(`returnDate`),
    PRIMARY KEY (`returnId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesReturnItems` (
    `returnItemId` INTEGER NOT NULL AUTO_INCREMENT,
    `returnId` INTEGER NOT NULL,
    `productVariantId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `quantityReturned` INTEGER NOT NULL,
    `reason` VARCHAR(191) NULL,

    INDEX `SalesReturnItems_returnId_idx`(`returnId`),
    INDEX `SalesReturnItems_productVariantId_idx`(`productVariantId`),
    INDEX `SalesReturnItems_storeId_idx`(`storeId`),
    PRIMARY KEY (`returnItemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditNotes` (
    `creditNoteId` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `creditNoteNumber` VARCHAR(191) NOT NULL,
    `dateIssued` DATETIME(3) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `totalAmount` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ISSUED', 'APPLIED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `createdBy` INTEGER NOT NULL,

    UNIQUE INDEX `CreditNotes_creditNoteNumber_key`(`creditNoteNumber`),
    INDEX `CreditNotes_invoiceId_idx`(`invoiceId`),
    INDEX `CreditNotes_storeId_idx`(`storeId`),
    INDEX `CreditNotes_dateIssued_idx`(`dateIssued`),
    INDEX `CreditNotes_status_idx`(`status`),
    INDEX `CreditNotes_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`creditNoteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditNoteItems` (
    `creditNoteItemsId` INTEGER NOT NULL AUTO_INCREMENT,
    `creditNoteId` INTEGER NOT NULL,
    `invoiceLineItemsId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `qtyCredited` INTEGER NOT NULL,
    `unitPrice` DECIMAL(65, 30) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,

    INDEX `CreditNoteItems_creditNoteId_idx`(`creditNoteId`),
    INDEX `CreditNoteItems_invoiceLineItemsId_idx`(`invoiceLineItemsId`),
    INDEX `CreditNoteItems_storeId_idx`(`storeId`),
    PRIMARY KEY (`creditNoteItemsId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventoryReservation` (
    `inventoryReservationId` INTEGER NOT NULL AUTO_INCREMENT,
    `salesOrderItemsId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `qtyAllocated` INTEGER NOT NULL,
    `allocationDate` DATETIME(3) NOT NULL,

    INDEX `InventoryReservation_salesOrderItemsId_idx`(`salesOrderItemsId`),
    INDEX `InventoryReservation_storeId_idx`(`storeId`),
    INDEX `InventoryReservation_allocationDate_idx`(`allocationDate`),
    PRIMARY KEY (`inventoryReservationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Stores` ADD CONSTRAINT `Stores_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_primaryRoleId_fkey` FOREIGN KEY (`primaryRoleId`) REFERENCES `Roles`(`roleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Roles` ADD CONSTRAINT `Roles_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermissions` ADD CONSTRAINT `RolePermissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Roles`(`roleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermissions` ADD CONSTRAINT `RolePermissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permissions`(`permissionId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoles` ADD CONSTRAINT `UserRoles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoles` ADD CONSTRAINT `UserRoles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Roles`(`roleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariants` ADD CONSTRAINT `ProductVariants_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariants` ADD CONSTRAINT `ProductVariants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Products`(`productId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attributes` ADD CONSTRAINT `Attributes_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttributeValues` ADD CONSTRAINT `AttributeValues_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttributeValues` ADD CONSTRAINT `AttributeValues_attributeId_fkey` FOREIGN KEY (`attributeId`) REFERENCES `Attributes`(`attributeId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantAttributes` ADD CONSTRAINT `ProductVariantAttributes_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantAttributes` ADD CONSTRAINT `ProductVariantAttributes_attributeId_fkey` FOREIGN KEY (`attributeId`) REFERENCES `Attributes`(`attributeId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantAttributes` ADD CONSTRAINT `ProductVariantAttributes_attributeValuesId_fkey` FOREIGN KEY (`attributeValuesId`) REFERENCES `AttributeValues`(`attributeValuesId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantAttributes` ADD CONSTRAINT `ProductVariantAttributes_productVariantsId_fkey` FOREIGN KEY (`productVariantsId`) REFERENCES `ProductVariants`(`productVariantId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceHistory` ADD CONSTRAINT `PriceHistory_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceHistory` ADD CONSTRAINT `PriceHistory_productVariantsId_fkey` FOREIGN KEY (`productVariantsId`) REFERENCES `ProductVariants`(`productVariantId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovements` ADD CONSTRAINT `StockMovements_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovements` ADD CONSTRAINT `StockMovements_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariants`(`productVariantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockAudits` ADD CONSTRAINT `StockAudits_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockAudits` ADD CONSTRAINT `StockAudits_doneBy_fkey` FOREIGN KEY (`doneBy`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockAdjustmentPerProduct` ADD CONSTRAINT `StockAdjustmentPerProduct_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariants`(`productVariantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockAdjustmentPerProduct` ADD CONSTRAINT `StockAdjustmentPerProduct_auditId_fkey` FOREIGN KEY (`auditId`) REFERENCES `StockAudits`(`auditId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoices` ADD CONSTRAINT `Invoices_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoices` ADD CONSTRAINT `Invoices_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `Channels`(`channelId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoices` ADD CONSTRAINT `Invoices_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoices` ADD CONSTRAINT `Invoices_salesOrderId_fkey` FOREIGN KEY (`salesOrderId`) REFERENCES `SalesOrders`(`salesOrderId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceLineItems` ADD CONSTRAINT `InvoiceLineItems_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoices`(`invoiceId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceLineItems` ADD CONSTRAINT `InvoiceLineItems_productVariantsId_fkey` FOREIGN KEY (`productVariantsId`) REFERENCES `ProductVariants`(`productVariantId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceLineItems` ADD CONSTRAINT `InvoiceLineItems_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoicePayments` ADD CONSTRAINT `InvoicePayments_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoicePayments` ADD CONSTRAINT `InvoicePayments_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoices`(`invoiceId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Channels` ADD CONSTRAINT `Channels_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubChannels` ADD CONSTRAINT `SubChannels_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubChannels` ADD CONSTRAINT `SubChannels_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `Channels`(`channelId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrders` ADD CONSTRAINT `PurchaseOrders_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrderItems` ADD CONSTRAINT `PurchaseOrderItems_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrderItems` ADD CONSTRAINT `PurchaseOrderItems_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `PurchaseOrders`(`purchaseOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrderItems` ADD CONSTRAINT `PurchaseOrderItems_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariants`(`productVariantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReceivedGoodsNotes` ADD CONSTRAINT `ReceivedGoodsNotes_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReceivedGoodsNotes` ADD CONSTRAINT `ReceivedGoodsNotes_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `PurchaseOrders`(`purchaseOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReceivedGoodsNotes` ADD CONSTRAINT `ReceivedGoodsNotes_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariants`(`productVariantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturns` ADD CONSTRAINT `PurchaseReturns_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturns` ADD CONSTRAINT `PurchaseReturns_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `PurchaseOrders`(`purchaseOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_purchaseReturnId_fkey` FOREIGN KEY (`purchaseReturnId`) REFERENCES `PurchaseReturns`(`purchaseReturnId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariants`(`productVariantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrders` ADD CONSTRAINT `SalesOrders_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrderItems` ADD CONSTRAINT `SalesOrderItems_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrderItems` ADD CONSTRAINT `SalesOrderItems_salesOrderId_fkey` FOREIGN KEY (`salesOrderId`) REFERENCES `SalesOrders`(`salesOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrderItems` ADD CONSTRAINT `SalesOrderItems_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariants`(`productVariantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleFulfillments` ADD CONSTRAINT `SaleFulfillments_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleFulfillments` ADD CONSTRAINT `SaleFulfillments_salesOrderId_fkey` FOREIGN KEY (`salesOrderId`) REFERENCES `SalesOrders`(`salesOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleFulfillmentItems` ADD CONSTRAINT `SaleFulfillmentItems_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleFulfillmentItems` ADD CONSTRAINT `SaleFulfillmentItems_saleFulfillmentId_fkey` FOREIGN KEY (`saleFulfillmentId`) REFERENCES `SaleFulfillments`(`saleFulfillmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleFulfillmentItems` ADD CONSTRAINT `SaleFulfillmentItems_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariants`(`productVariantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturns` ADD CONSTRAINT `SalesReturns_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturns` ADD CONSTRAINT `SalesReturns_salesOrderId_fkey` FOREIGN KEY (`salesOrderId`) REFERENCES `SalesOrders`(`salesOrderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_returnId_fkey` FOREIGN KEY (`returnId`) REFERENCES `SalesReturns`(`returnId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariants`(`productVariantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditNotes` ADD CONSTRAINT `CreditNotes_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoices`(`invoiceId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditNotes` ADD CONSTRAINT `CreditNotes_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditNotes` ADD CONSTRAINT `CreditNotes_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditNoteItems` ADD CONSTRAINT `CreditNoteItems_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditNoteItems` ADD CONSTRAINT `CreditNoteItems_creditNoteId_fkey` FOREIGN KEY (`creditNoteId`) REFERENCES `CreditNotes`(`creditNoteId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditNoteItems` ADD CONSTRAINT `CreditNoteItems_invoiceLineItemsId_fkey` FOREIGN KEY (`invoiceLineItemsId`) REFERENCES `InvoiceLineItems`(`invoiceLineItemsId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryReservation` ADD CONSTRAINT `InventoryReservation_salesOrderItemsId_fkey` FOREIGN KEY (`salesOrderItemsId`) REFERENCES `SalesOrderItems`(`salesOrderItemId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryReservation` ADD CONSTRAINT `InventoryReservation_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`storeId`) ON DELETE RESTRICT ON UPDATE CASCADE;
