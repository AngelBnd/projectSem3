const express = require('express');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { period, category, search } = req.query;

    const whereClause = {
      userId: req.user.id,
    };

    const lineItemConditions = [];

    let startDate, endDate;
    const now = new Date();

    if (period && period.startsWith('last_') && period.endsWith('_days')) {
        const parts = period.split('_'); 
        const days = parseInt(parts[1], 10);

        if (!isNaN(days) && days > 0) {
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);

            startDate = new Date(now);
            startDate.setDate(now.getDate() - (days - 1));
            startDate.setHours(0, 0, 0, 0);
        }
    } else {
    switch (period) {
        case 'today':
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
    }
  }

    if (startDate && endDate) {
      whereClause.invoiceDate = {
        gte: startDate,
        lte: endDate,
      };
    }
    
    if (category) {
      lineItemConditions.push({
        product: {
          productCategory: {
            equals: category,
          },
        },
      });
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { subject: { contains: search } },
        {
          lineItems: {
            some: {
              product: {
                OR: [
                  { productName: { contains: search } },
                  { productCode: { contains: search } },
                ],
              },
            },
          },
        },
      ];
    }


    if (lineItemConditions.length > 0) {
      whereClause.lineItems = {
        some: {
          AND: lineItemConditions,
        },
      };
    }

    const filteredInvoices = await prisma.invoices.findMany({
      where: whereClause, 
      include: {
        lineItems: {
          include: {
            product: true 
          }
        }
      },
      orderBy: {
        invoiceDate: 'desc'
      }
    });
    
    res.json(filteredInvoices);

  } catch (error) {
    console.error("Error fetching invoices:", error); // Log the actual error
    res.status(500).json({ error: "Failed to fetch invoices." });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { products: productsSold, discount, invoiceDate, paymentMethod, invoiceId, subject, name } = req.body;
  const userId = req.user.id;

  if(!productsSold || productsSold.length === 0) {
    return res.status(400).json({ error: "Transaction must contain at least one product "});
  }

  try {
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Creates new Record (row) to model transaction
    const newTransaction = await prisma.$transaction(async (tx) => {
      let invoiceSubtotal = 0;
      let totalAmount = 0;
      const LineItemsCreate = [];

      // Go through each product
      for(const p of productsSold) {

        const inventoryItem = await tx.products.findUnique({ where: { productCode : p.productCode }});
        if(!inventoryItem) throw new Error(`Product with ID ${p.productCode} not found`);

        // Check if it has enough stock   
        try {
          await tx.products.update({
            where: { productCode: p.productCode, initialStock: { gte: p.quantitySold} },
            data: { initialStock: { decrement: p.quantitySold } },
          });
        } catch (error) {
          throw new Error(`Not enough stock : ${inventoryItem.initialStock}`);
        }

        // Calculate subtotal (selling price with amount sold)
        const lineSubtotal = inventoryItem.sellingPrice * p.quantitySold;

        // The full total Amount for transaction
        invoiceSubtotal += lineSubtotal;

        // Push the entry of records to data
        LineItemsCreate.push({
          quantitySold: p.quantitySold,
          sellingPrice: inventoryItem.sellingPrice,
          lineSubtotal: lineSubtotal,
          product: {
            connect: {productCode: p.productCode}
          }
        });
      }

      // Update amount with discount
      totalAmount = invoiceSubtotal - (invoiceSubtotal * (discount / 100));

      const createdTransaction = await tx.invoices.create({
        data: {
          invoiceId: invoiceId,
          subject, subject,
          name: name,
          invoiceDate: new Date(invoiceDate),
          discountPrice: discount,
          invoiceSubtotal: invoiceSubtotal,
          totalAmount: totalAmount,
          paymentMethod: paymentMethod,
          userId: userIdInt,
          lineItems: {
            create: LineItemsCreate, // Create and connect all line items
          },
        },
        include: {
          lineItems: true, // Include the newly created line items in the response
        },
      });

      return createdTransaction;
    });

    res.status(201).json({ success: true, invoice: newTransaction });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/categories', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const categories = await prisma.products.findMany({
      where: {
        userId: userId,
        productCategory: {
          not: null,
          not: ''
        }
      },
      distinct: ['productCategory'],
      select: {
        productCategory: true
      },
      orderBy: {
        productCategory: 'asc'
      }
    });

    const categoryList = categories.map(c => c.productCategory);

    res.json(categoryList);
  } catch (error) {
    console.error("Error fetching distinct categories: ", error);
    res.status(500).json({error: "Failed to retrieve product categories"});
  }
});

router.get('/search', authenticateToken, async (req, res) => {
    try {
        const { q } = req.query;
        const userId = req.user.id; 

        const sales = await prisma.invoices.findMany({
            where: {
                userId: userId,
                OR: [
                    { invoiceId: { contains: q } },
                    { name: { contains: q } },
                ],
            },
            take: 10,
        });

        res.json(sales);
    } catch (error) {
        console.error("Search API Error:", error);
        res.status(500).json({ error: 'Failed to search for sales' });
    }
});

router.delete('/:invoiceId', authenticateToken, async (req, res) => {
  const invoiceId = req.params.invoiceId;
  const userId = req.user.id;

  try {

    const invoiceToDelete = await prisma.invoices.findUnique({
      where: {
        invoiceId: invoiceId,
        userId: userId
      },
      include: {
        lineItems: true
      },
    });

    if(!invoiceToDelete) {
      return res.status(404).json({ error: "Invoice not found or does not belong to user" });
    }

    await prisma.$transaction(async (tx) => {
      const restockProducts = [];

      for(const item of invoiceToDelete.lineItems) {
        restockProducts.push(
          tx.products.update({
            where: {productCode: item.productCode, userId: item.userId},
            data: {
              initialStock: {increment: item.quantitySold},
            },
          })
        );
      }

      await Promise.all(restockProducts);

      await tx.lineItems.deleteMany({
        where: {invoiceId: invoiceId},
      });

      await tx.invoices.delete({
        where: {invoiceId: invoiceId, userId: userId}
      });

    });
    res.json({ success: true, message: "Invoice deleted successfully"});
  } catch (error) {
    if(error.code === 'P2025') {
      return res.status(404).json({ error: "Invoice not found or does not belong to user" });
    }
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete invoice from database" });
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