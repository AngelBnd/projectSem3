const prisma = require("../prisma/client");
const { HttpError } = require("../utils/httpError");

const listChannels = async (user) => {
  console.log("Hit /channels endpoint!");
  console.log("Fetching channels for user:", user.userId);
  const channels = await prisma.channels.findMany({
    include: {
      subChannels: true,
    },
  });
  console.log("Fetched channels:", channels);
  return channels;
};

const list = async (currentUser, { search = "", status = "all" }) => {
  if (!currentUser.storeId) {
    throw new HttpError(400, { error: "User does not belong to a store" });
  }

  const where = { storeId: currentUser.storeId };

  if (search) {
    const orConditions = [
      { customerName: { contains: search, mode: "insensitive" } },
    ];
    if (!isNaN(Number(search)))
      orConditions.push({ salesOrderId: Number(search) });
    where.OR = orConditions;
  }

  if (status === "delivered") where.deliveryStatus = "DELIVERED";
  else if (status === "cancelled") where.deliveryStatus = "CANCELLED";
  else if (status === "paid") where.paymentStatus = "CANCELLED";
  else if (status === "completed") {
    where.deliveryStatus = "DELIVERED";
    where.paymentStatus = "PAID";
  }

  const orders = await prisma.salesOrders.findMany({
    where,
    orderBy: {
      orderDate: "desc",
    },
    select: {
      salesOrderId: true,
      customerName: true,
      orderDate: true,
      totalAmount: true,
      orderDate: true,
      paymentStatus: true,
      deliveryStatus: true,

      channel: {
        select: {
          channelId: true,
          name: true,
        },
      },

      subChannel: {
        select: {
          subChannelId: true,
          subChannelName: true,
        },
      },
    },
  });

  return orders.map((order) => ({
    id: order.salesOrderId,
    customer: order.customerName || "Walk-in",
    date: order.orderDate
      ? order.orderDate.toISOString().split("T")[0]
      : order.createdAt.toISOString().split("T")[0],
    totalAmount: Number(order.totalAmount),
    channel: order.channel.name,
    subChannel: order.subChannel.subChannelName,
    paymentStatus: order.paymentStatus,
    deliveryStatus: order.deliveryStatus,
  }));
};

const getById = async (storeId, id) => {
  if (!storeId)
    throw new HttpError(400, { error: "User does not belong to a store" });

  const salesOrderId = Number(id);
  if (isNaN(salesOrderId))
    throw new HttpError(400, { error: "Invalid salesOrderId" });

  const order = await prisma.salesOrders.findFirst({
    where: { salesOrderId, storeId },
    select: {
      salesOrderId: true,
      storeId: true,
      customerName: true,
      orderDate: true,
      paymentTerms: true,
      totalAmount: true,
      paymentStatus: true,
      deliveryStatus: true,
      channel: { select: { channelId: true, name: true } },
      subChannel: { select: { subChannelId: true, subChannelName: true } },
      discount: true,
      items: {
        select: {
          salesOrderItemsId: true,
          productVariantId: true,
          quantityOrdered: true,
          unitPrice: true,
          serviceDesc: true,
          productVariant: {
            select: {
              sku: true,
              productId: true,
              product: {
                select: { productName: true },
              },
              productVariantAttributes: {
                select: {
                  attributeValue: {
                    select: {
                      valueName: true,
                      attribute: { select: { name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const formatted = {
    id: order.salesOrderId,
    customerName: order.customerName || "Walk-in",
    date: order.orderDate
      ? order.orderDate.toISOString().split("T")[0]
      : order.createdAt.toISOString().split("T")[0],
    paymentTerms: order.paymentTerms,
    totalAmount: Number(order.totalAmount),
    channelId: order.channel.channelId,
    subChannelId: order.subChannel.subChannelId,
    paymentStatus: order.paymentStatus,
    deliveryStatus: order.deliveryStatus,
    orderDate: new Date(order.orderDate).toISOString().split("T")[0],
    discount: order.discount,
    items: order.items.map((item) => {
      const pv = item.productVariant;

      let variantName = null;
      if (pv) {
        const sortedAttributes = pv.productVariantAttributes
          .sort((a, b) =>
            a.attributeValue.attribute.name.localeCompare(
              b.attributeValue.attribute.name
            )
          )
          .map((pva) => pva.attributeValue.valueName);

        variantName = [pv.product?.productName, ...sortedAttributes]
          .join(" ")
          .trim();
      }

      return {
        tempId: (item.productVariantId ?? "service") + "_" + Date.now(),
        productVariantId: item.productVariantId,
        quantityOrdered: item.quantityOrdered,
        unitPrice: item.unitPrice,
        sku: pv?.sku || null,
        productName: pv?.product?.productName || null,
        variantName: variantName,
        serviceDesc: item.serviceDesc || null,
      };
    }),
  };

  if (!order) throw new HttpError(404, { error: "Sales order not found" });

  console.log(formatted);
  return formatted;
};

const create = async (currentUser, body) => {
  const { formData, products = [], services = [] } = body;

  if (!currentUser.storeId) {
    throw new HttpError(400, { error: "User does not belong to a store" });
  }

  const order = await prisma.salesOrders.create({
    data: {
      store: { connect: { storeId: currentUser.storeId } },
      customerName: formData.generalInfo.customerName || null,
      paymentTerms: formData.generalInfo.paymentTerm || null,
      totalAmount: formData.totals.totalAmount || 0,
      orderDate: new Date(formData.generalInfo.orderDate + "T00:00:00Z"),
      discount: formData.totals.discount ?? null,
      createdByUser: { connect: { userId: currentUser.userId } },
      channel: formData.generalInfo.channelId
        ? { connect: { channelId: formData.generalInfo.channelId } }
        : undefined,
      subChannel: formData.generalInfo.subChannelId
        ? { connect: { subChannelId: formData.generalInfo.subChannelId } }
        : undefined,
    },
  });

  const productLineItems = products.map((item) => ({
    salesOrderId: order.salesOrderId,
    productVariantId: item.productVariantId ?? null,
    quantityOrdered: item.quantitySold,
    unitPrice: Number(item.unitPrice) || 0,
  }));

  const serviceLineItems = services.map((item) => ({
    salesOrderId: order.salesOrderId,
    serviceDesc: item.serviceName,
    quantityOrdered: item.quantity,
    unitPrice: Number(item.unitPrice) || 0,
  }));

  const lineItemsToInsert = [...productLineItems, ...serviceLineItems];

  if (lineItemsToInsert.length > 0) {
    await prisma.salesOrderItems.createMany({ data: lineItemsToInsert });
  }

  const stockMovementsToInsert = products.map((item) => ({
    storeId: currentUser.storeId,
    productVariantId: item.productVariantId,
    referenceId: order.salesOrderId,
    referenceType: "SALES_ORDER",
    change: -Math.abs(item.quantitySold),
    reason: "Product sold via sales order",
  }));

  if (stockMovementsToInsert.length > 0) {
    await prisma.stockMovements.createMany({
      data: stockMovementsToInsert,
    });
  }

  return {
    success: true,
    message: "Sales order created successfully",
    salesOrderId: order.salesOrderId,
  };
};

const populateDemo = async (user) => {
  const storeId = user.store.storeId;

  if (!storeId) {
    throw new HttpError(400, { error: "User does not belong to a store" });
  }

  const deliveryOptions = ["UNDELIVERED", "PARTIALLY_DELIVERED", "DELIVERED"];
  const paymentOptions = ["UNPAID", "PARTIALLY_PAID", "PAID"];

  const randomDelivery =
    deliveryOptions[Math.floor(Math.random() * deliveryOptions.length)];
  const randomPayment =
    paymentOptions[Math.floor(Math.random() * paymentOptions.length)];

  const variants = await prisma.productVariants.findMany({
    where: {
      storeId: storeId,
      productStatus: "ACTIVE",
    },
    take: 2,
  });

  if (variants.length === 0) {
    throw new HttpError(400, { error: "NO_PRODUCTS" });
  }

  // build items
  const items = variants.map((v) => ({
    productVariantId: v.productVariantId,
    quantity: 2,
    unitPrice: Number(v.sellingPrice),
    total: Number(v.sellingPrice) * 2,
  }));

  const totalAmount = items.reduce((sum, i) => sum + i.total, 0);

  const demoChannel = await prisma.channels.findFirst({
    orderBy: { channelId: "asc" },
  });

  const demoSubChannel = demoChannel
    ? await prisma.subChannels.findFirst({
        where: { channelId: demoChannel.channelId },
        orderBy: { subChannelId: "asc" },
      })
    : null;

  const order = await prisma.salesOrders.create({
    data: {
      store: { connect: { storeId: storeId } },
      customerName: "Demo Customer",
      paymentTerms: "Immediate",
      totalAmount,
      orderDate: new Date(),
      discount: 0,
      deliveryStatus: randomDelivery,
      paymentStatus: randomPayment,
      createdByUser: { connect: { userId: user.userId } },

      channel: demoChannel
        ? { connect: { channelId: demoChannel.channelId } }
        : undefined,

      subChannel: demoSubChannel
        ? { connect: { subChannelId: demoSubChannel.subChannelId } }
        : undefined,
    },
  });

  // create line items
  await prisma.salesOrderItems.createMany({
    data: items.map((i) => ({
      salesOrderId: order.salesOrderId,
      productVariantId: i.productVariantId,
      quantityOrdered: i.quantity,
      unitPrice: i.unitPrice,
    })),
  });

  // stock movements
  await prisma.stockMovements.createMany({
    data: items.map((i) => ({
      storeId: storeId,
      productVariantId: i.productVariantId,
      referenceId: order.salesOrderId,
      referenceType: "SALES_ORDER",
      change: -i.quantity,
      reason: "Demo sales order (paid & delivered)",
    })),
  });

  return {
    success: true,
    message: "Demo sales order created",
    salesOrderId: order.salesOrderId,
  };
};

const update = async (storeId, id, body) => {
  if (!storeId)
    throw new HttpError(400, { error: "User does not belong to a store" });

  const salesOrderId = Number(id);
  if (isNaN(salesOrderId))
    throw new HttpError(400, { error: "Invalid salesOrderId" });

  const { formData, products = [], services = [] } = body;
  if (!formData) throw new HttpError(400, { error: "No form data provided" });

  const existingOrder = await prisma.salesOrders.findFirst({
    where: { salesOrderId, storeId },
    include: { items: true },
  });

  if (!existingOrder)
    throw new HttpError(404, { error: "Sales order not found" });

  await prisma.$transaction(async (tx) => {
    await tx.salesOrders.update({
      where: { salesOrderId },
      data: {
        customerName: formData.generalInfo.customerName || "Walk-in",
        orderDate: formData.generalInfo.orderDate
          ? new Date(formData.generalInfo.orderDate)
          : undefined,
        paymentTerms: formData.generalInfo.paymentTerm,
        discount: formData.generalInfo.discountAmount || 0,
        totalAmount: formData.totals?.totalAmount || 0,
        channelId: formData.generalInfo.channelId,
        subChannelId: formData.generalInfo.subChannelId,
      },
    });

    const revertMovements = existingOrder.items
      .filter((i) => i.productVariantId)
      .map((i) => ({
        storeId,
        productVariantId: i.productVariantId,
        referenceId: salesOrderId,
        referenceType: "SALES_ORDER",
        change: i.quantityOrdered,
        reason: "Sales order update - revert previous quantity",
        createdAt: new Date(),
      }));

    if (revertMovements.length > 0) {
      await tx.stockMovements.createMany({ data: revertMovements });
    }

    await tx.salesOrderItems.deleteMany({ where: { salesOrderId } });

    const itemsToCreate = [
      ...products.map((p) => ({
        salesOrderId,
        productVariantId: p.productVariantId,
        quantityOrdered: p.quantitySold,
        unitPrice: p.unitPrice,
        serviceDesc: null,
      })),
      ...services.map((s) => ({
        salesOrderId,
        productVariantId: null,
        quantityOrdered: s.quantity,
        unitPrice: s.unitPrice,
        serviceDesc: s.serviceName,
      })),
    ];

    if (itemsToCreate.length > 0) {
      await tx.salesOrderItems.createMany({ data: itemsToCreate });
    }

    const newMovements = products.map((p) => ({
      storeId,
      productVariantId: p.productVariantId,
      referenceId: salesOrderId,
      referenceType: "SALES_ORDER",
      change: -p.quantitySold,
      reason: "Sales order update - new quantity",
      createdAt: new Date(),
    }));

    if (newMovements.length > 0) {
      await tx.stockMovements.createMany({ data: newMovements });
    }
  });

  return {
    message: "Sales order updated successfully",
    salesOrderId,
  };
};

const remove = async (storeId, id) => {
  const salesOrderId = Number(id);

  if (isNaN(salesOrderId)) {
    throw new HttpError(400, { message: "Invalid sales order ID" });
  }

  await prisma.$transaction(async (tx) => {
    const salesOrder = await tx.salesOrders.findFirst({
      where: { salesOrderId, storeId },
    });

    if (!salesOrder) throw new HttpError(404, { message: "Sales order not found" });

    const isDeletable =
      salesOrder.paymentStatus === "UNPAID" &&
      salesOrder.deliveryStatus === "UNDELIVERED";

    if (!isDeletable) throw new HttpError(400, { message: "ORDER_NOT_DELETABLE" });

    const stockMovements = await tx.stockMovements.findMany({
      where: {
        referenceId: salesOrderId,
        referenceType: "SALES_ORDER",
        storeId,
      },
    });

    for (const movement of stockMovements) {
      await tx.stockMovements.create({
        data: {
          storeId,
          productVariantId: movement.productVariantId,
          referenceId: salesOrderId,
          referenceType: "ADJUSTMENT",
          change: -movement.change,
          reason: `Reverted stock from deleted Sales Order #${salesOrderId}`,
        },
      });
    }

    await tx.stockMovements.deleteMany({
      where: {
        referenceId: salesOrderId,
        referenceType: "SALES_ORDER",
        storeId,
      },
    });

    await tx.salesOrderItems.deleteMany({
      where: { salesOrderId },
    });

    await tx.salesOrders.deleteMany({
      where: { salesOrderId, storeId },
    });
  });

  return { message: "Sales order deleted successfully" };
};

module.exports = {
  listChannels,
  list,
  getById,
  create,
  populateDemo,
  update,
  remove,
};
