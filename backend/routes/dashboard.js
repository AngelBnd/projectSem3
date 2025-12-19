const express = require("express");
const prisma = require("../prisma/client");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
router.use(authenticateToken);

router.get("/summary", authenticateToken, async (req, res) => {
  const storeId = req.user.store.storeId;

  try {
    const totalSales = await prisma.salesOrders.count({
      where: { storeId },
    });

    const totalRevenueResult = await prisma.salesOrders.aggregate({
      where: { storeId },
      _sum: { totalAmount: true },
    });

    const totalRevenue = totalRevenueResult._sum.totalAmount ?? 0;

    const products = await prisma.products.findMany({
      where: { storeId },
      select: {
        variants: {
          select: {
            productVariantId: true,
            thresholdStock: true,
          },
        },
      },
    });

    const variants = products.flatMap((p) => p.variants);
    const variantIds = variants.map((v) => v.productVariantId);

    const stockMovements = await prisma.stockMovements.groupBy({
      by: ["productVariantId"],
      where: { productVariantId: { in: variantIds } },
      _sum: { change: true },
    });

    const stockByVariant = Object.fromEntries(
      stockMovements.map((sm) => [sm.productVariantId, sm._sum.change])
    );

    const lowStockItems = variants.filter((v) => {
      const currentStock = stockByVariant[v.productVariantId] || 0;
      return currentStock <= v.thresholdStock && currentStock > 0;
    }).length;

    const uniqueCustomers = await prisma.salesOrders.findMany({
      where: { storeId },
      distinct: ["customerName"],
      select: { customerName: true },
    });

    const totalCustomers = uniqueCustomers.length;

    res.json({
      totalSales,
      totalRevenue,
      lowStockItems,
      totalCustomers,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({
      error: "Failed to calculate sales dashboard summary",
    });
  }
});

router.get("/top-selling-products", authenticateToken, async (req, res) => {
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

    if (period == "last_30_days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29);
      startDate = startOfDay(startDate);
    } else if (period == "last_7_days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate = startOfDay(startDate);
    }

    const invoiceWhere = { userId: userId };

    if (startDate) {
      invoiceWhere.invoiceDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const relevantInvoices = await prisma.invoices.findMany({
      where: invoiceWhere,
      select: {
        invoiceId: true, // We only need the IDs
      },
    });
    const relevantInvoiceIds = relevantInvoices.map((inv) => inv.invoiceId);

    if (relevantInvoiceIds.length === 0) {
      return res.json([]);
    }

    // Aggregate by productCode and sum quantity sold
    const topProducts = await prisma.lineItems.groupBy({
      by: ["productCode"],
      where: {
        invoiceId: { in: relevantInvoiceIds },
      },
      _sum: {
        quantitySold: true,
      },
      orderBy: {
        _sum: {
          quantitySold: "desc", // Order by total quantity sold descending
        },
      },
      take: 5, // Get top 5
    });

    // To get product details (name, brand) for these top products,
    // we need to fetch them separately after the aggregation.
    const productCodes = topProducts.map((p) => p.productCode);
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
    const result = topProducts.map((tp) => {
      const detail = productDetails.find(
        (pd) => pd.productCode === tp.productCode
      );
      return {
        productCode: tp.productCode,
        productName: detail ? detail.productName : "Unknown Product",
        productBrand: detail ? detail.productBrand : "Unknown Brand",
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
        invoiceDate: "desc", // Assuming invoiceDate is stored as a sortable string or DateTime
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
    const formattedTransactions = recentInvoices.map((invoice) => ({
      invoiceId: invoice.invoiceId,
      customerName: invoice.subject, // Assuming subject is customer name
      invoiceDate: invoice.invoiceDate,
      totalQuantity: invoice.lineItems.reduce(
        (sum, item) => sum + item.quantitySold,
        0
      ),
      totalAmount: invoice.totalAmount,
      // You might want to show names of products if only one line item, or just quantity/total
      products: invoice.lineItems
        .map((li) => li.product.productName)
        .join(", "), // Or process differently
    }));

    res.json(formattedTransactions);
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    res.status(500).json({ error: "Failed to fetch recent transactions." });
  }
});

module.exports = router;
