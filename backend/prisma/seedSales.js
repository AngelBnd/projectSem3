// Adds dummy sales orders on top of whatever products already exist (nothing is deleted).
// Mix of paid/unpaid/partially paid and delivered/partially delivered/undelivered orders.
// Usage: node prisma/seedSales.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const CUSTOMERS = [
  "Michael Torres", "Sarah Chen", "David Okafor", "Emily Johnson", "Carlos Rivera",
  "Priya Nair", "James Whitfield", "Hannah Müller", "Daniel Kim", "Olivia Brooks",
  "Marcus Reed", "Sofia Alvarez", "Ethan Walker", "Grace Lee", "Tyler Bennett",
];

// payment/delivery/creation combos; `days` is how long ago the order was placed
const SCENARIOS = [
  { payment: "PAID", delivery: "DELIVERED", creation: "APPROVED", days: 28 },
  { payment: "PAID", delivery: "DELIVERED", creation: "APPROVED", days: 24 },
  { payment: "PAID", delivery: "DELIVERED", creation: "APPROVED", days: 19 },
  { payment: "PAID", delivery: "DELIVERED", creation: "APPROVED", days: 15 },
  { payment: "PAID", delivery: "PARTIALLY_DELIVERED", creation: "APPROVED", days: 12 },
  { payment: "PAID", delivery: "UNDELIVERED", creation: "APPROVED", days: 9 },
  { payment: "PARTIALLY_PAID", delivery: "DELIVERED", creation: "APPROVED", days: 8 },
  { payment: "PARTIALLY_PAID", delivery: "PARTIALLY_DELIVERED", creation: "APPROVED", days: 6 },
  { payment: "UNPAID", delivery: "DELIVERED", creation: "APPROVED", days: 5 },
  { payment: "UNPAID", delivery: "UNDELIVERED", creation: "APPROVED", days: 3 },
  { payment: "UNPAID", delivery: "UNDELIVERED", creation: "PENDING_APPROVAL", days: 2 },
  { payment: "UNPAID", delivery: "UNDELIVERED", creation: "DRAFT", days: 1 },
];

const INVOICE_STATUS = { PAID: "PAID", PARTIALLY_PAID: "PARTIALLY_PAID", UNPAID: "ISSUED" };

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const round2 = (n) => Math.round(n * 100) / 100;

async function main() {
  const store = await prisma.stores.findFirst({ orderBy: { storeId: "asc" } });
  if (!store) throw new Error("No store found. Run the main seed first.");
  const storeId = store.storeId;

  const variants = await prisma.productVariants.findMany({
    where: { storeId, productStatus: "ACTIVE" },
    include: { product: true },
  });
  if (!variants.length) throw new Error("No active product variants. Seed products first.");

  const channels = await prisma.channels.findMany({ include: { subChannels: true } });

  // running on-hand stock so deliveries never push a variant negative
  const sums = await prisma.stockMovements.groupBy({
    by: ["productVariantId"],
    where: { storeId },
    _sum: { change: true },
  });
  const stock = new Map(sums.map((s) => [s.productVariantId, s._sum.change ?? 0]));

  const lastInvoice = await prisma.invoices.count();
  let invoiceSeq = lastInvoice + 1;
  let created = 0;

  for (const [i, sc] of SCENARIOS.entries()) {
    const orderDate = daysAgo(sc.days);
    const delivered = sc.delivery !== "UNDELIVERED";

    // 1-3 distinct in-stock variants per order
    const wanted = 1 + Math.floor(Math.random() * 3);
    const lines = [];
    for (const v of [...variants].sort(() => Math.random() - 0.5)) {
      if (lines.length >= wanted) break;
      const available = stock.get(v.productVariantId) ?? 0;
      if (available < 1) continue;
      const qty = Math.min(1 + Math.floor(Math.random() * 3), available);
      lines.push({ variant: v, qty, price: Number(v.sellingPrice) });
    }
    if (!lines.length) continue;

    const subtotal = round2(lines.reduce((s, l) => s + l.qty * l.price, 0));
    const discount = Math.random() < 0.25 ? round2(subtotal * 0.05) : 0;
    const total = round2(subtotal - discount);

    const channel = channels.length ? pick(channels) : null;
    const subChannel = channel?.subChannels.length ? pick(channel.subChannels) : null;

    const order = await prisma.salesOrders.create({
      data: {
        storeId,
        customerName: CUSTOMERS[i % CUSTOMERS.length],
        orderDate,
        creationStatus: sc.creation,
        paymentStatus: sc.payment,
        deliveryStatus: sc.delivery,
        paymentTerms: sc.payment === "PAID" ? "Paid upfront" : "Net 14",
        totalAmount: total,
        discount,
        createdBy: store.ownerId,
        channelId: channel?.channelId ?? null,
        subChannelId: subChannel?.subChannelId ?? null,
      },
    });

    for (const [li, l] of lines.entries()) {
      const item = await prisma.salesOrderItems.create({
        data: {
          salesOrderId: order.salesOrderId,
          productVariantId: l.variant.productVariantId,
          quantityOrdered: l.qty,
          unitPrice: l.price,
        },
      });

      if (!delivered) continue;
      // partial delivery: first line fully delivered, the rest only part (or nothing)
      let qtyDelivered = l.qty;
      if (sc.delivery === "PARTIALLY_DELIVERED" && li > 0) qtyDelivered = Math.floor(l.qty / 2);
      if (sc.delivery === "PARTIALLY_DELIVERED" && lines.length === 1) {
        qtyDelivered = Math.max(1, l.qty - 1);
      }
      if (qtyDelivered < 1) continue;

      const deliveryDate = new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000);
      await prisma.salesDeliveryItems.create({
        data: { salesOrderItemsId: item.salesOrderItemsId, quantityDelivered: qtyDelivered, deliveryDate },
      });
      await prisma.stockMovements.create({
        data: {
          storeId,
          productVariantId: l.variant.productVariantId,
          referenceId: order.salesOrderId,
          referenceType: "SALES_ORDER",
          change: -qtyDelivered,
          reason: "Sales order delivered",
          createdAt: deliveryDate,
        },
      });
      stock.set(l.variant.productVariantId, (stock.get(l.variant.productVariantId) ?? 0) - qtyDelivered);
    }

    // approved orders get an invoice that mirrors the payment status
    if (sc.creation === "APPROVED") {
      const invoice = await prisma.invoices.create({
        data: {
          storeId,
          salesOrderId: order.salesOrderId,
          invoiceNumber: `INV-${orderDate.getFullYear()}-${String(invoiceSeq++).padStart(4, "0")}`,
          invoiceType: "SALE",
          invoiceSubject: lines[0].variant.product.productName,
          invoiceDate: orderDate,
          discount,
          subtotal,
          totalAmount: total,
          status: INVOICE_STATUS[sc.payment],
        },
      });
      await prisma.invoiceLineItems.createMany({
        data: lines.map((l) => ({
          storeId,
          invoiceId: invoice.invoiceId,
          productVariantsId: l.variant.productVariantId,
          desc: l.variant.product.productName,
          quantitySold: l.qty,
          sellingPrice: l.price,
        })),
      });
    }
    created++;
  }

  console.log(`Created ${created} sales orders.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
