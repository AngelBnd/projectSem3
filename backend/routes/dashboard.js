const express = require("express");
const prisma = require("../prisma/client");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
const puppeteer = require("puppeteer");
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
  const storeId = req.user.storeId;
  try {
    const { period } = req.query;
    const now = new Date();

    let startDate;
    if (period === "last_7_days") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "last_30_days") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    }

    const products = await prisma.products.findMany({
      where: { storeId },
      select: {
        productId: true,
        productName: true,
        brand: true,
        variants: {
          select: { productVariantId: true },
        },
      },
    });

    const variantMap = {};
    const variantIds = [];
    products.forEach((p) => {
      p.variants.forEach((v) => {
        variantIds.push(v.productVariantId);
        variantMap[v.productVariantId] = p.productId;
      });
    });

    if (variantIds.length === 0) return res.json([]);

    const stockWhere = {
      productVariantId: { in: variantIds },
      referenceType: "SALES_ORDER",
    };
    if (startDate) stockWhere.createdAt = { gte: startDate, lte: now };

    const stockMovements = await prisma.stockMovements.groupBy({
      by: ["productVariantId"],
      where: {
        productVariantId: { in: variantIds },
        referenceType: "SALES_ORDER",
        ...(startDate && { createdAt: { gte: startDate, lte: now } }),
      },
      _sum: { change: true },
    });

    if (stockMovements.length === 0) return res.json([]);
    const productMap = {};
    stockMovements.forEach((sm) => {
      const productId = variantMap[sm.productVariantId];
      if (!productMap[productId]) {
        const p = products.find((pr) => pr.productId === productId);
        productMap[productId] = {
          productId,
          productName: p.productName,
          productBrand: p.brand,
          totalQuantitySold: 0,
        };
      }
      productMap[productId].totalQuantitySold += sm._sum.change || 0;
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, 5);

    res.json(topProducts);
  } catch (error) {
    console.error("Error fetching top-selling products:", error);
    res.status(500).json({ error: "Failed to fetch top-selling products." });
  }
});

router.get("/recent-transactions", authenticateToken, async (req, res) => {
  const storeId = req.user.storeId;
  try {
    // Fetch latest 5 sales orders for this store
    const recentOrders = await prisma.salesOrders.findMany({
      where: { storeId },
      orderBy: { orderDate: "desc" },
      take: 5,
      include: {
        items: {
          select: {
            productVariantId: true,
            quantityOrdered: true,
            productVariant: {
              select: {
                product: {
                  select: { productName: true },
                },
              },
            },
          },
        },
      },
    });

    // Format data for frontend
    const formattedTransactions = recentOrders.map((order) => {
      const totalQuantity = order.items.reduce(
        (sum, item) => sum + item.quantityOrdered,
        0
      );

      const products = order.items
        .map((item) => item.productVariant.product.productName)
        .join(", ");

      return {
        salesOrderId: order.salesOrderId,
        customerName: order.customerName || "Walk-in",
        orderDate: order.orderDate.toISOString().split("T")[0],
        totalQuantity,
        totalAmount: order.totalAmount,
        products,
      };
    });

    res.json(formattedTransactions);
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    res.status(500).json({ error: "Failed to fetch recent transactions." });
  }
});

router.get("/export", authenticateToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.evaluateOnNewDocument((token) => {
      localStorage.setItem("token", token);
    }, token);

    await page.goto("http://localhost:5173/dashboard", {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="dashboard.pdf"',
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to export dashboard" });
  }
});

module.exports = router;
