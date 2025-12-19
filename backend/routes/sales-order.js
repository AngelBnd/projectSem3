const express = require("express");
const prisma = require("../prisma/client");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
router.use(authenticateToken);

router.get("/", authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser.storeId) {
      return res.status(400).json({ error: "User does not belong to a store" });
    }

    const orders = await prisma.salesOrders.findMany({
      where: {
        storeId: currentUser.storeId,
      },
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

    console.log(formatted);

    res.json(formatted);
  } catch (error) {
    console.error("Fetch sales orders error:", error);
    res.status(500).json({ error: "Failed to fetch sales orders" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    console.log(currentUser);
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
      unitPrice: item.sellingPrice,
    }));

    const serviceLineItems = services.map((item) => ({
      salesOrderId: order.salesOrderId,
      serviceDesc: item.serviceName,
      quantityOrdered: item.quantity,
      unitPrice: item.unitPrice,
    }));

    const lineItemsToInsert = [...productLineItems, ...serviceLineItems];

    if (lineItemsToInsert.length > 0) {
      await prisma.salesOrderItems.createMany({
        data: lineItemsToInsert,
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

router.get("/channels", authenticateToken, async (req, res) => {
  try {
    const channels = await prisma.channels.findMany({
      include: {
        subChannels: true,
      },
    });

    return res.status(200).json(channels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load channels" });
  }
});

module.exports = router;
