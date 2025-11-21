const express = require('express');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.post('/', authenticateToken, async (req, res) => {
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
                orderDate : new Date(formData.generalInfo.orderDate + "T00:00:00Z"),
                discount: formData.totals.discount ?? null,
                createdByUser : { connect : {userId : currentUser.userId}}
            }
        });

        const productLineItems = products.map(item => ({
            salesOrderId: order.salesOrderId,
            productVariantId: item.productVariantId ?? null, 
            quantityOrdered: item.quantitySold,
            unitPrice: item.sellingPrice,
        }));

        const serviceLineItems = services.map(item => ({
            salesOrderId: order.salesOrderId,
            serviceDesc: item.serviceName,
            quantityOrdered: item.quantity,
            unitPrice: item.sellingPrice,
        }));

        const lineItemsToInsert = [...productLineItems, ...serviceLineItems];

        if (lineItemsToInsert.length > 0) {
            await prisma.salesOrderItems.createMany({
                data: lineItemsToInsert
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

router.get('/channels', authenticateToken, async(req, res)=>{
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
})

module.exports = router;
