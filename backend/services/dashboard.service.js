const prisma = require("../prisma/client");
const puppeteer = require("puppeteer");

const getSummary = async (storeId) => {
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

  return {
    totalSales,
    totalRevenue,
    lowStockItems,
    totalCustomers,
  };
};

const getTopSellingProducts = async (storeId, period) => {
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

  if (variantIds.length === 0) return [];

  const stockMovements = await prisma.stockMovements.groupBy({
    by: ["productVariantId"],
    where: {
      productVariantId: { in: variantIds },
      referenceType: "SALES_ORDER",
      ...(startDate && { createdAt: { gte: startDate, lte: now } }),
    },
    _sum: { change: true },
  });

  if (stockMovements.length === 0) return [];
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

  return Object.values(productMap)
    .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
    .slice(0, 5);
};

const getRecentTransactions = async (storeId) => {
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
  return recentOrders.map((order) => {
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
};

// Renders the frontend dashboard page to a PDF buffer.
const exportPdf = async (token) => {
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

  return pdfBuffer;
};

module.exports = {
  getSummary,
  getTopSellingProducts,
  getRecentTransactions,
  exportPdf,
};
