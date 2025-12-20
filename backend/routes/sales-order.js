const express = require("express");
const prisma = require("../prisma/client");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
router.use(authenticateToken);

router.get("/channels", authenticateToken, async (req, res) => {
  console.log("Hit /channels endpoint!");
  try {
    console.log("Fetching channels for user:", req.user.userId);
    const channels = await prisma.channels.findMany({
      include: {
        subChannels: true,
      },
    });
    console.log("Fetched channels:", channels);
    return res.status(200).json(channels);
  } catch (err) {
    console.error("Prisma fetch error:", err);
    res.status(500).json({ error: "Failed to load channels" });
  }
});

router.get("/", authenticateToken, async (req, res) => {
  const { search = "", status = "all" } = req.query;

  try {
    const currentUser = req.user;

    if (!currentUser.storeId) {
      return res.status(400).json({ error: "User does not belong to a store" });
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

    const formatted = orders.map((order) => ({
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

    // console.log(` INI BISA G SIH ${formatted}`);

    res.json(formatted);
  } catch (error) {
    console.error("Fetch sales orders error:", error);
    res.status(500).json({ error: "Failed to fetch sales orders" });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const storeId = req.user.store.storeId;

  if (!storeId)
    return res.status(400).json({ error: "User does not belong to a store" });

  const salesOrderId = Number(id);
  if (isNaN(salesOrderId))
    return res.status(400).json({ error: "Invalid salesOrderId" });
  try {
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

    // console.log(order);

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

    if (!order) return res.status(404).json({ error: "Sales order not found" });

    console.log(formatted);
    res.json(formatted);
  } catch (error) {
    console.error("Fetch sales order error:", error);
    res.status(500).json({ error: "Failed to fetch sales order" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    const { formData, products = [], services = [] } = req.body;

    if (!currentUser.storeId) {
      return res.status(400).json({ error: "User does not belong to a store" });
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

    return res.status(200).json({
      success: true,
      message: "Sales order created successfully",
      salesOrderId: order.salesOrderId,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create sales order." });
  }
});

router.post("/populate", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const storeId = req.user.store.storeId;

    if (!storeId) {
      return res.status(400).json({ error: "User does not belong to a store" });
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
      return res.status(400).json({ error: "NO_PRODUCTS" });
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

    return res.json({
      success: true,
      message: "Demo sales order created",
      salesOrderId: order.salesOrderId,
    });
  } catch (error) {
    console.error("Populate sales order failed:", error);
    res.status(500).json({ error: "Failed to populate sales order" });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const storeId = req.user.store.storeId;

  if (!storeId)
    return res.status(400).json({ error: "User does not belong to a store" });

  const salesOrderId = Number(id);
  if (isNaN(salesOrderId))
    return res.status(400).json({ error: "Invalid salesOrderId" });

  const { formData, products = [], services = [] } = req.body;
  if (!formData)
    return res.status(400).json({ error: "No form data provided" });

  try {
    const existingOrder = await prisma.salesOrders.findFirst({
      where: { salesOrderId, storeId },
      include: { items: true },
    });

    if (!existingOrder)
      return res.status(404).json({ error: "Sales order not found" });

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

    res.json({
      message: "Sales order updated successfully",
      salesOrderId,
    });
  } catch (error) {
    console.error("Update sales order error:", error);
    res.status(500).json({ error: "Failed to update sales order" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const salesOrderId = Number(req.params.id);
  const storeId = req.user.storeId;

  if (isNaN(salesOrderId)) {
    return res.status(400).json({ message: "Invalid sales order ID" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const salesOrder = await tx.salesOrders.findFirst({
        where: { salesOrderId, storeId },
      });

      if (!salesOrder) throw new Error("NOT_FOUND");

      const isDeletable =
        salesOrder.paymentStatus === "UNPAID" &&
        salesOrder.deliveryStatus === "UNDELIVERED";

      if (!isDeletable) throw new Error("ORDER_NOT_DELETABLE");

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

    res.json({ message: "Sales order deleted successfully" });
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Sales order not found" });
    }
    if (error.message === "ORDER_NOT_DELETABLE") {
      return res.status(400).json({ message: "ORDER_NOT_DELETABLE" });
    }

    console.error(error);
    res.status(500).json({ message: "Failed to delete sales order" });
  }
});

module.exports = router;
