const express = require('express');
const prisma = require('../prisma/client');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/summary', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // 1. Total Sales: Sum of totalAmount from Invoices
    const totalSalesResult = await prisma.invoices.aggregate({
      where: { userId: userId },
      _sum: { totalAmount: true },
    });
    const totalSales = totalSalesResult._sum.totalAmount;

    // 2. Total Profit: Sum of (sellingPrice - unitCost) * quantitySold for all LineItems
    const lineItemsProfit = await prisma.lineItems.findMany({
      where: {
        invoice: {
          userId: userId,
        },
      },
      // 💡 FIX: Use ONLY 'select' at the top level
      select: { 
        quantitySold: true,
        sellingPrice: true,
        // 💡 FIX: To get the relation, we select the relation itself and then select its fields
        product: { 
          select: { 
            unitCost: true // This gets the cost from the related Products table
          },
        },
      },
    });

    let totalProfit = 0;
    lineItemsProfit.forEach(item => {
      // Use parseFloat() on Decimal types returned by Prisma before calculation
      // The structure is now item.product.unitCost
      const sellingPrice = parseFloat(item.sellingPrice) || 0;
      const unitCost = parseFloat(item.product.unitCost) || 0; 
      const quantity = item.quantitySold;

      const profitPerItem = (sellingPrice - unitCost) * quantity;
      totalProfit += profitPerItem;
    });

    const allProducts = await prisma.products.findMany({
      where: { userId: userId },
      select: {
        initialStock: true,
        thresholdStock: true
      }
    });
    
    // Calculate count by filtering in JavaScript
    const lowStockCount = allProducts.filter(item => {
        const initial = item.initialStock;
        const threshold = item.thresholdStock;
        return initial <= threshold && initial > 0;
    }).length;

    const uniqueCustomerSubjects = await prisma.invoices.findMany({
        where: { userId: userId },
        distinct: ['subject'], 
        select: { subject: true },
    });
    const totalCustomers = uniqueCustomerSubjects.length;

    res.json({
      totalSales: totalSales,
      totalProfit: totalProfit,
      lowStockItems: lowStockCount,
      totalCustomers: totalCustomers,
    });
  } catch (error) {
    console.error("CRASH DEBUG: Dashboard summary failed:", error);
    res.status(500).json({ error: "An internal database error occurred while calculating summary." });
  }
});

router.get('/top-selling-products', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { period } = req.query;

    let startDate = null;
    const now = new Date();

    const startOfDay = (date) => {
      date.setHours(0, 0, 0, 0);
      return date;
    };
    
    const endOfDay = (date) => {
      date.setHours(23, 59, 59, 999);
      return date;
    };

    let endDate = endOfDay(new Date(now));
    
    if(period =='last_30_days') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29);
      startDate = startOfDay(startDate);

    } else if(period == 'last_7_days') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate = startOfDay(startDate);
    }

    const invoiceWhere = {userId: userId};

    if(startDate) {
      invoiceWhere.invoiceDate = {
        gte: startDate,
        lte: endDate
      };
    }

    const relevantInvoices = await prisma.invoices.findMany({
      where: invoiceWhere,
      select: {
        invoiceId: true, // We only need the IDs
      },
    });
    const relevantInvoiceIds = relevantInvoices.map(inv => inv.invoiceId);

    if (relevantInvoiceIds.length === 0) {
      return res.json([]);
    }
    
    // Aggregate by productCode and sum quantity sold
    const topProducts = await prisma.lineItems.groupBy({
      by: ['productCode'],
      where: {
        invoiceId: { in: relevantInvoiceIds },
      },
      _sum: {
        quantitySold: true,
      },
      orderBy: {
        _sum: {
          quantitySold: 'desc', // Order by total quantity sold descending
        },
      },
      take: 5, // Get top 5
    });

    // To get product details (name, brand) for these top products,
    // we need to fetch them separately after the aggregation.
    const productCodes = topProducts.map(p => p.productCode);
    const productDetails = await prisma.products.findMany({
      where: {
        userId: userId,
        productCode: { in: productCodes },
      },
      select: {
        productCode: true,
        productName: true,
        productBrand: true,
      },
    });

    // Map the aggregated data with product details
    const result = topProducts.map(tp => {
      const detail = productDetails.find(pd => pd.productCode === tp.productCode);
      return {
        productCode: tp.productCode,
        productName: detail ? detail.productName : 'Unknown Product',
        productBrand: detail ? detail.productBrand : 'Unknown Brand',
        totalQuantitySold: tp._sum.quantitySold,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching top-selling products:", error);
    res.status(500).json({ error: "Failed to fetch top-selling products." });
  }
});

router.get("/recent-transactions", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const recentInvoices = await prisma.invoices.findMany({
      where: { userId: userId },
      orderBy: {
        invoiceDate: 'desc', // Assuming invoiceDate is stored as a sortable string or DateTime
      },
      take: 5, // Get top 5 most recent
      // Include line items to get product info, or simplify for dashboard view
      include: {
        lineItems: {
          include: {
            product: {
              select: { productName: true }, // Select only what's needed for dashboard
            },
          },
        },
      },
    });

    // Format for easier consumption on the frontend
    const formattedTransactions = recentInvoices.map(invoice => ({
      invoiceId: invoice.invoiceId,
      customerName: invoice.subject, // Assuming subject is customer name
      invoiceDate: invoice.invoiceDate,
      totalQuantity: invoice.lineItems.reduce((sum, item) => sum + item.quantitySold, 0),
      totalAmount: invoice.totalAmount,
      // You might want to show names of products if only one line item, or just quantity/total
      products: invoice.lineItems.map(li => li.product.productName).join(', ') // Or process differently
    }));


    res.json(formattedTransactions);
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    res.status(500).json({ error: "Failed to fetch recent transactions." });
  }
});


module.exports = router;