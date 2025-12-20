const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ----- USERS -----
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("admin123", salt);
  const userPassword = await bcrypt.hash("user123", salt);

  // Create admin user first without storeId (since it's nullable now)
  const adminUser = await prisma.users.create({
    data: {
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      phoneNumber: "081234567890",
      passwordHash: adminPassword,
      status: "ACTIVE",
    },
  });

  // ----- STORE ----- (Create store WITH ownerId)
  const store = await prisma.stores.create({
    data: {
      storeName: "Dev Store",
      storeTag: "DEV_STORE",
      ownerId: adminUser.userId,
    },
  });

  // ----- ROLES -----
  const adminRole = await prisma.roles.create({
    data: {
      roleName: "Admin",
    },
  });

  const userRole = await prisma.roles.create({
    data: {
      roleName: "User",
    },
  });

  // Now update admin user with storeId and roleId
  await prisma.users.update({
    where: { userId: adminUser.userId },
    data: {
      store: {
        connect: { storeId: store.storeId },
      },
    },
  });

  // ----- PERMISSIONS -----
  const permissions = [
    { module: "product", permission: "create" },
    { module: "product", permission: "approve" },
    { module: "product", permission: "update" },
    { module: "product", permission: "delete" },
    { module: "product", permission: "view" },
    { module: "invoice", permission: "create" },
    { module: "invoice", permission: "approve" },
    { module: "invoice", permission: "update" },
    { module: "invoice", permission: "delete" },
    { module: "invoice", permission: "view" },
    { module: "user", permission: "update" },
    { module: "user", permission: "delete" },
    { module: "user", permission: "view" },
    { module: "role", permission: "create" },
    { module: "role", permission: "update" },
    { module: "role", permission: "delete" },
    { module: "role", permission: "view" },
    { module: "audit", permission: "view" },
    { module: "audit", permission: "create" },
    { module: "audit", permission: "approve" },
    { module: "movement", permission: "view" },
  ];

  const permissionRecords = [];
  for (const perm of permissions) {
    const record = await prisma.permissions.create({
      data: perm,
    });
    permissionRecords.push(record);
  }

  // ----- ASSIGN PERMISSIONS TO ROLES -----
  // Admin gets all permissions
  for (const perm of permissionRecords) {
    await prisma.rolePermissions.create({
      data: {
        roleId: adminRole.roleId,
        permissionId: perm.permissionId,
      },
    });
  }

  // User gets only view permissions
  const viewPermissions = permissionRecords.filter(
    (p) => p.permission === "view"
  );
  for (const perm of viewPermissions) {
    await prisma.rolePermissions.create({
      data: {
        roleId: userRole.roleId,
        permissionId: perm.permissionId,
      },
    });
  }

  // Create user roles entry for admin (ONLY ONCE)
  await prisma.userRoles.create({
    data: {
      userId: adminUser.userId,
      roleId: adminRole.roleId,
      isPrimary: true,
    },
  });

  // Create regular user (will be in PENDING_APPROVAL status by default)
  const regularUser = await prisma.users.create({
    data: {
      email: "user@dev.com",
      firstName: "Regular",
      lastName: "User",
      phoneNumber: "081234567891",
      passwordHash: userPassword,
      requestedStoreTag: "DEV_STORE",
      status: "PENDING_APPROVAL",
      store: {
        connect: { storeId: store.storeId },
      },
    },
  });

  // Create user roles entry for regular user (ONLY ONCE)
  await prisma.userRoles.create({
    data: {
      userId: regularUser.userId,
      roleId: userRole.roleId,
      isPrimary: true,
    },
  });

  // REMOVED THE DUPLICATE USER ROLES CREATION HERE

  // ----- ATTRIBUTES -----
  const brandAttribute = await prisma.attributes.create({
    data: {
      storeId: store.storeId,
      name: "Brand",
    },
  });

  const sizeAttribute = await prisma.attributes.create({
    data: {
      storeId: store.storeId,
      name: "Size",
    },
  });

  // ----- ATTRIBUTE VALUES -----
  const pioneerValue = await prisma.attributeValues.create({
    data: {
      attributeId: brandAttribute.attributeId,
      storeId: store.storeId,
      valueName: "Pioneer",
    },
  });

  const jblValue = await prisma.attributeValues.create({
    data: {
      attributeId: brandAttribute.attributeId,
      storeId: store.storeId,
      valueName: "JBL",
    },
  });

  const sixInchValue = await prisma.attributeValues.create({
    data: {
      attributeId: sizeAttribute.attributeId,
      storeId: store.storeId,
      valueName: '6.5"',
    },
  });

  // ----- PRODUCTS -----
  const speakerProduct = await prisma.products.create({
    data: {
      storeId: store.storeId,
      productName: "Premium Car Speakers",
      productDescription: 'High-quality 6.5" component speakers',
      productStatus: "ACTIVE",
      approvalStatus: "APPROVED",
      category: "SPEAKERS",
      brand: "PIONEER",
      createdBy: adminUser.userId,
    },
  });

  const amplifierProduct = await prisma.products.create({
    data: {
      storeId: store.storeId,
      productName: "1000W Amplifier",
      productDescription: "Powerful mono block amplifier",
      productStatus: "ACTIVE",
      approvalStatus: "APPROVED",
      category: "AMPLIFIERS",
      brand: "JBL",
      createdBy: adminUser.userId,
    },
  });

  // ----- PRODUCT VARIANTS -----
  const speakerVariant = await prisma.productVariants.create({
    data: {
      storeId: store.storeId,
      productId: speakerProduct.productId,
      sku: "SPK-001",
      barcode: "1234567890123",
      sellingPrice: 149.99,
      isDefault: true,
      thresholdStock: 10,
      productStatus: "ACTIVE",
    },
  });

  const amplifierVariant = await prisma.productVariants.create({
    data: {
      storeId: store.storeId,
      productId: amplifierProduct.productId,
      sku: "AMP-001",
      barcode: "1234567890124",
      sellingPrice: 299.99,
      isDefault: true,
      thresholdStock: 5,
      productStatus: "ACTIVE",
    },
  });

  // ----- PRODUCT VARIANT ATTRIBUTES -----
  await prisma.productVariantAttributes.create({
    data: {
      storeId: store.storeId,
      attributeValuesId: pioneerValue.attributeValuesId,
      productVariantsId: speakerVariant.productVariantId,
    },
  });

  await prisma.productVariantAttributes.create({
    data: {
      storeId: store.storeId,

      attributeValuesId: sixInchValue.attributeValuesId,
      productVariantsId: speakerVariant.productVariantId,
    },
  });

  // ----- CHANNELS -----
  const retailChannel = await prisma.channels.create({
    data: {
      name: "Retail Store",
    },
  });

  const onlineChannel = await prisma.channels.create({
    data: {
      name: "Online Store",
    },
  });

  // ----- SUB CHANNELS -----
  await prisma.subChannels.create({
    data: {
      channelId: retailChannel.channelId,
      subChannelName: "Main Store Location",
    },
  });

  await prisma.subChannels.createMany({
    data: [
      {
        channelId: onlineChannel.channelId,
        subChannelName: "Website",
      },
      {
        channelId: onlineChannel.channelId,
        subChannelName: "Mobile App",
      },
      {
        channelId: onlineChannel.channelId,
        subChannelName: "WhatsApp Order",
      },
      {
        channelId: onlineChannel.channelId,
        subChannelName: "Instagram Shop",
      },
      {
        channelId: onlineChannel.channelId,
        subChannelName: "Tokopedia",
      },
      {
        channelId: onlineChannel.channelId,
        subChannelName: "Shopee",
      },
    ],
  });

  // ----- SALES ORDERS -----
  const salesOrder = await prisma.salesOrders.create({
    data: {
      storeId: store.storeId,
      customerName: "John Doe",
      orderDate: new Date(),
      creationStatus: "APPROVED",
      paymentStatus: "PAID",
      deliveryStatus: "DELIVERED",
      totalAmount: 449.98,
      discount: 0,
      createdBy: adminUser.userId,
      channelId: 1,
      subChannelId: 1,
    },
  });

  // ----- SALES ORDER ITEMS -----
  const salesOrderItem1 = await prisma.salesOrderItems.create({
    data: {
      salesOrderId: salesOrder.salesOrderId,
      productVariantId: speakerVariant.productVariantId,
      quantityOrdered: 2,
      unitPrice: 149.99,
    },
  });

  const salesOrderItem2 = await prisma.salesOrderItems.create({
    data: {
      salesOrderId: salesOrder.salesOrderId,
      productVariantId: amplifierVariant.productVariantId,
      quantityOrdered: 1,
      unitPrice: 149.99,
    },
  });

  // ----- SALE DELIVERI ITEMS -----
  const deliveryItem1 = await prisma.salesDeliveryItems.create({
    data: {
      salesOrderItemsId: salesOrderItem1.salesOrderItemsId,
      quantityDelivered: 2,
      deliveryDate: new Date(),
    },
  });
  // ----- INVOICES -----
  const invoice = await prisma.invoices.create({
    data: {
      storeId: store.storeId,
      salesOrderId: salesOrder.salesOrderId,
      invoiceNumber: "INV-2024-001",
      invoiceType: "SALE",
      invoiceSubject: "Car Audio System",
      invoiceDate: new Date(),
      discount: 0,
      subtotal: 449.98,
      totalAmount: 449.98,
      status: "PAID",
    },
  });

  // ----- INVOICE LINE ITEMS -----
  const invoiceLineItem = await prisma.invoiceLineItems.create({
    data: {
      storeId: store.storeId,
      invoiceId: invoice.invoiceId,
      productVariantsId: speakerVariant.productVariantId,
      desc: "Premium Car Speakers",
      quantitySold: 2,
      sellingPrice: 149.99,
    },
  });

  // ----- PURCHASE ORDERS -----
  const purchaseOrder = await prisma.purchaseOrders.create({
    data: {
      storeId: store.storeId,
      supplierName: "Audio Distributors Inc.",
      orderDate: new Date(),
      expectedArrivalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: "ORDERED",
      totalCost: 899.9,
    },
  });

  // ----- PURCHASE ORDER ITEMS -----
  await prisma.purchaseOrderItems.create({
    data: {
      storeId: store.storeId,
      purchaseOrderId: purchaseOrder.purchaseOrderId,
      productVariantId: speakerVariant.productVariantId,
      quantityOrdered: 10,
      costPrice: 89.99,
    },
  });

  // ----- RECEIVED GOODS NOTES -----
  await prisma.receivedGoodsNotes.create({
    data: {
      storeId: store.storeId,
      purchaseOrderId: purchaseOrder.purchaseOrderId,
      productVariantId: speakerVariant.productVariantId,
      qtyReceived: 10,
      dateReceived: new Date(),
    },
  });

  // ----- STOCK MOVEMENTS -----
  await prisma.stockMovements.create({
    data: {
      storeId: store.storeId,
      productVariantId: speakerVariant.productVariantId,
      referenceId: purchaseOrder.purchaseOrderId,
      referenceType: "PURCHASE_ORDER",
      change: 10,
      reason: "Purchase order received",
    },
  });

  // ----- STOCK AUDITS -----
  const stockAudit = await prisma.stockAudits.create({
    data: {
      storeId: store.storeId,
      doneBy: adminUser.userId,
      status: "COMPLETED",
      auditDate: new Date(),
      difference: 0,
      notes: "Monthly inventory count",
    },
  });

  // ----- STOCK ADJUSTMENT PER PRODUCT -----
  await prisma.stockAdjustmentPerProduct.create({
    data: {
      productVariantId: speakerVariant.productVariantId,
      auditId: stockAudit.auditId,
      physicalQuantity: 25,
      systemQuantity: 25,
      reason: "MISCOUNT",
    },
  });

  // ----- CREDIT NOTES -----
  const creditNote = await prisma.creditNotes.create({
    data: {
      storeId: store.storeId,
      invoiceId: invoice.invoiceId,
      creditNoteNumber: "CN-2024-001",
      dateIssued: new Date(),
      reason: "Returned item",
      totalAmount: 149.99,
      status: "ISSUED",
      createdBy: adminUser.userId,
    },
  });

  // ----- CREDIT NOTE ITEMS -----
  await prisma.creditNoteItems.create({
    data: {
      storeId: store.storeId,
      creditNoteId: creditNote.creditNoteId,
      invoiceLineItemsId: invoiceLineItem.invoiceLineItemsId,
      qtyCredited: 1,
      unitPrice: 149.99,
      amount: 149.99,
    },
  });

  // ----- PURCHASE RETURNS -----
  const purchaseReturn = await prisma.purchaseReturns.create({
    data: {
      storeId: store.storeId,
      purchaseOrderId: purchaseOrder.purchaseOrderId,
      dateReturned: new Date(),
      status: "PENDING_APPROVAL",
      reason: "Damaged goods",
    },
  });

  // ----- PURCHASE RETURN ITEMS -----
  await prisma.purchaseReturnItems.create({
    data: {
      storeId: store.storeId,
      purchaseReturnId: purchaseReturn.purchaseReturnId,
      productVariantId: speakerVariant.productVariantId,
      qtyReturned: 2,
      reason: "Damaged during shipping",
    },
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
