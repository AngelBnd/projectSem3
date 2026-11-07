// Wipes all products (and everything that references product variants) from the
// first store, then loads a realistic car-audio catalogue with suppliers and stock.
// Users, stores, roles, permissions and channels are left untouched.
// Usage: node prisma/seedProducts.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SUPPLIERS = [
  "Audio Distributors Inc.",
  "Car Audio Wholesale",
  "Metro Mobile Electronics",
];

// prices/costs in USD; stock is the quantity received via the initial purchase orders
const CATALOGUE = [
  {
    name: "DMH-W4660NEX Digital Media Receiver",
    description:
      "6.8\" capacitive touchscreen, wireless Apple CarPlay and Android Auto, Bluetooth, SiriusXM-ready.",
    category: "HEAD_UNITS",
    brand: "PIONEER",
    variants: [
      { sku: "PIO-DMH-W4660NEX", barcode: "012562979471", price: 449.99, cost: 329.0, supplier: 0, stock: 12, threshold: 4 },
    ],
  },
  {
    name: "iLX-F511 9\" Halo Receiver",
    description:
      "9\" floating display digital media receiver with wireless CarPlay/Android Auto and HDMI input.",
    category: "CARPLAY_ANDROIDAUTO",
    brand: "ALPINE",
    variants: [
      { sku: "ALP-ILX-F511", barcode: "793276101822", price: 799.95, cost: 612.5, supplier: 0, stock: 6, threshold: 2 },
    ],
  },
  {
    name: "KMM-BT328 Bluetooth Digital Media Receiver",
    description:
      "Mechless single-DIN receiver with Bluetooth, USB, 13-band EQ and 3 pre-outs.",
    category: "HEAD_UNITS",
    brand: "KENWOOD",
    variants: [
      { sku: "KEN-KMM-BT328", barcode: "019048228467", price: 129.95, cost: 88.0, supplier: 1, stock: 18, threshold: 5 },
    ],
  },
  {
    name: "TS-A1676C 6.5\" Component Speakers",
    description:
      "2-way 6.5\" component speaker system, 350 W peak power, carbon/mica reinforced IMPP cone.",
    category: "SPEAKERS",
    brand: "PIONEER",
    variants: [
      { sku: "PIO-TSA1676C", barcode: "012562917862", price: 109.99, cost: 74.5, supplier: 0, stock: 20, threshold: 6, attrs: { Size: "6.5\"" } },
    ],
  },
  {
    name: "Club Series Coaxial Speakers",
    description:
      "3-way coaxial speakers with polypropylene cones and woven-glass tweeters. Sold per pair.",
    category: "SPEAKERS",
    brand: "JBL",
    variants: [
      { sku: "JBL-CLUB-6520", barcode: "050036370108", price: 89.95, cost: 58.0, supplier: 1, stock: 24, threshold: 8, attrs: { Size: "6.5\"" } },
      { sku: "JBL-CLUB-6920", barcode: "050036370122", price: 119.95, cost: 79.0, supplier: 1, stock: 15, threshold: 5, attrs: { Size: "6x9\"" } },
    ],
  },
  {
    name: "KSC Series Coaxial Speakers",
    description:
      "2-way coaxial speakers with polypropylene cones, built for easy factory replacement.",
    category: "SPEAKERS",
    brand: "KICKER",
    variants: [
      { sku: "KIC-KSC-65", barcode: "082204450329", price: 79.99, cost: 52.0, supplier: 2, stock: 22, threshold: 6, attrs: { Size: "6.5\"" } },
      { sku: "KIC-KSC-69", barcode: "082204450336", price: 109.99, cost: 72.0, supplier: 2, stock: 14, threshold: 4, attrs: { Size: "6x9\"" } },
    ],
  },
  {
    name: "Punch P1000X5 5-Channel Amplifier",
    description:
      "Compact 5-channel Class-D amplifier, 1000 W RMS system power, with remote bass knob.",
    category: "AMPLIFIERS",
    brand: "ROCKFORD_FOSGATE",
    variants: [
      { sku: "RF-P1000X5", barcode: "085059116212", price: 549.99, cost: 405.0, supplier: 0, stock: 5, threshold: 2, attrs: { Channels: "5-Channel", Power: "1000W" } },
    ],
  },
  {
    name: "Mono Class-D Subwoofer Amplifier",
    description:
      "Full-range capable monoblock Class-D amplifier with variable low-pass filter and bass boost.",
    category: "AMPLIFIERS",
    brand: "JL_AUDIO",
    variants: [
      { sku: "JL-JX500-1D", barcode: "050003045132", price: 349.99, cost: 255.0, supplier: 0, stock: 7, threshold: 3, attrs: { Channels: "Mono", Power: "500W" } },
      { sku: "JL-JX1000-1D", barcode: "050003045149", price: 499.99, cost: 372.0, supplier: 0, stock: 4, threshold: 2, attrs: { Channels: "Mono", Power: "1000W" } },
    ],
  },
  {
    name: "Competition CVR Subwoofer",
    description:
      "Dual 2-ohm voice-coil competition subwoofer with a vented-ready cone and high-temperature coil.",
    category: "SUBWOOFERS",
    brand: "KICKER",
    variants: [
      { sku: "KIC-CVR10", barcode: "082204450411", price: 189.99, cost: 128.0, supplier: 2, stock: 10, threshold: 3, attrs: { Size: "10\"" } },
      { sku: "KIC-CVR12", barcode: "082204450428", price: 219.99, cost: 148.0, supplier: 2, stock: 9, threshold: 3, attrs: { Size: "12\"" } },
    ],
  },
  {
    name: "Loaded Subwoofer Enclosure",
    description:
      "Pre-loaded vented enclosure with a single high-output subwoofer, ready to wire and install.",
    category: "SUBWOOFERS",
    brand: "MTX",
    variants: [
      { sku: "MTX-TNE212D", barcode: "031488110048", price: 329.95, cost: 232.0, supplier: 1, stock: 6, threshold: 2, attrs: { Size: "12\"" } },
    ],
  },
  {
    name: "4-Gauge Amplifier Wiring Kit",
    description:
      "Complete OFC copper-clad power kit: 17 ft power cable, ground, remote wire, RCA and ANL fuse holder.",
    category: "WIRING_ACCESSORIES",
    brand: "STINGER",
    variants: [
      { sku: "STG-SK4141", barcode: "018354941410", price: 59.99, cost: 34.0, supplier: 1, stock: 30, threshold: 10, attrs: { Gauge: "4 AWG" } },
      { sku: "STG-SK4081", barcode: "018354940819", price: 89.99, cost: 52.0, supplier: 1, stock: 16, threshold: 6, attrs: { Gauge: "0 AWG" } },
    ],
  },
  {
    name: "Wireless Backup Camera",
    description:
      "Waterproof license-plate-mount backup camera with night vision and parking guide lines.",
    category: "BACKUP_CAMERAS",
    brand: "PIONEER",
    variants: [
      { sku: "PIO-ND-BC8", barcode: "012562982144", price: 79.99, cost: 49.0, supplier: 2, stock: 25, threshold: 8 },
    ],
  },
  {
    name: "Single-DIN Dash Install Kit",
    description:
      "Dash kit for single-DIN receivers with wiring harness and antenna adapter. Vehicle-specific.",
    category: "DASH_KITS",
    brand: "METRA",
    variants: [
      { sku: "MET-99-7550", barcode: "086429182451", price: 24.95, cost: 12.5, supplier: 1, stock: 40, threshold: 12, attrs: { Finish: "Black" } },
      { sku: "MET-99-7550S", barcode: "086429182468", price: 24.95, cost: 12.5, supplier: 1, stock: 28, threshold: 12, attrs: { Finish: "Silver" } },
    ],
  },
  {
    name: "Steering Wheel Control Interface",
    description:
      "Retains factory steering wheel audio controls when installing an aftermarket receiver.",
    category: "INSTALLATION_ACCESSORIES",
    brand: "PAC",
    variants: [
      { sku: "PAC-SWI-RC", barcode: "068248100116", price: 64.99, cost: 41.0, supplier: 0, stock: 14, threshold: 5 },
    ],
  },
  {
    name: "Sound Deadening Mat Kit",
    description:
      "Butyl rubber sound-deadening sheets with aluminium constraining layer. Covers about 36 sq ft.",
    category: "SOUND_DEADENING",
    brand: "STINGER",
    variants: [
      { sku: "STG-RS-36", barcode: "018354360362", price: 99.99, cost: 62.0, supplier: 1, stock: 3, threshold: 5 },
    ],
  },
  {
    name: "Digital Capacitor 1.0 Farad",
    description:
      "Digital voltage display capacitor that stabilises power for systems up to 1,000 W RMS.",
    category: "BATTERIES_POWER",
    brand: "DS18",
    variants: [
      { sku: "DS18-CAP1F", barcode: "000000100018", price: 54.99, cost: 31.0, supplier: 2, stock: 11, threshold: 4 },
    ],
  },
];

async function wipe() {
  // child tables first so foreign keys never block the delete
  await prisma.creditNoteItems.deleteMany();
  await prisma.creditNotes.deleteMany();
  await prisma.invoiceLineItems.deleteMany();
  await prisma.invoices.deleteMany();
  await prisma.salesDeliveryItems.deleteMany();
  await prisma.salesReturnItems.deleteMany();
  await prisma.salesOrderItems.deleteMany();
  await prisma.salesOrders.deleteMany();
  await prisma.purchaseReturnItems.deleteMany();
  await prisma.purchaseReturns.deleteMany();
  await prisma.receivedGoodsNotes.deleteMany();
  await prisma.purchaseOrderItems.deleteMany();
  await prisma.purchaseOrders.deleteMany();
  await prisma.stockAdjustmentPerProduct.deleteMany();
  await prisma.stockAudits.deleteMany();
  await prisma.stockMovements.deleteMany();
  await prisma.productVariantAttributes.deleteMany();
  await prisma.productVariantSuppliers.deleteMany();
  await prisma.attributeValues.deleteMany();
  await prisma.attributes.deleteMany();
  await prisma.productVariants.deleteMany();
  await prisma.products.deleteMany();
}

async function main() {
  const store = await prisma.stores.findFirst({ orderBy: { storeId: "asc" } });
  if (!store) throw new Error("No store found. Run the main seed first.");
  const storeId = store.storeId;
  const admin = await prisma.users.findUnique({ where: { userId: store.ownerId } });

  console.log("Removing existing products and dependent records...");
  await wipe();

  const suppliers = [];
  for (const name of SUPPLIERS) {
    suppliers.push(
      await prisma.suppliers.upsert({
        where: { storeId_name: { storeId, name } },
        update: {},
        create: { storeId, name },
      }),
    );
  }

  const attributeCache = new Map(); // "Size" -> attribute row
  const valueCache = new Map(); // "Size|6.5\"" -> value row
  const getAttributeValue = async (attrName, valueName) => {
    let attr = attributeCache.get(attrName);
    if (!attr) {
      attr = await prisma.attributes.create({ data: { storeId, name: attrName } });
      attributeCache.set(attrName, attr);
    }
    const key = `${attrName}|${valueName}`;
    let value = valueCache.get(key);
    if (!value) {
      value = await prisma.attributeValues.create({
        data: { storeId, attributeId: attr.attributeId, valueName },
      });
      valueCache.set(key, value);
    }
    return value;
  };

  // supplier index -> [{ variantId, qty, cost }] for the initial purchase orders
  const receipts = suppliers.map(() => []);

  for (const p of CATALOGUE) {
    const product = await prisma.products.create({
      data: {
        storeId,
        productName: p.name,
        productDescription: p.description,
        productStatus: "ACTIVE",
        approvalStatus: "APPROVED",
        category: p.category,
        brand: p.brand,
        createdBy: admin.userId,
      },
    });

    for (const [i, v] of p.variants.entries()) {
      const variant = await prisma.productVariants.create({
        data: {
          storeId,
          productId: product.productId,
          sku: v.sku,
          barcode: v.barcode,
          sellingPrice: v.price,
          isDefault: i === 0,
          thresholdStock: v.threshold,
          productStatus: "ACTIVE",
        },
      });

      for (const [attrName, valueName] of Object.entries(v.attrs ?? {})) {
        const value = await getAttributeValue(attrName, valueName);
        await prisma.productVariantAttributes.create({
          data: {
            storeId,
            attributeValuesId: value.attributeValuesId,
            productVariantsId: variant.productVariantId,
          },
        });
      }

      await prisma.productVariantSuppliers.create({
        data: {
          storeId,
          productVariantId: variant.productVariantId,
          supplierId: suppliers[v.supplier].supplierId,
          cost: v.cost,
        },
      });

      receipts[v.supplier].push({ variantId: variant.productVariantId, qty: v.stock, cost: v.cost });
    }
  }

  // Stock only exists through movements, so receive it via completed purchase orders
  const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  for (const [idx, items] of receipts.entries()) {
    if (!items.length) continue;
    const orderDate = daysAgo(30 - idx * 7);
    const receivedAt = daysAgo(23 - idx * 7);
    const po = await prisma.purchaseOrders.create({
      data: {
        storeId,
        supplierId: suppliers[idx].supplierId,
        orderDate,
        expectedArrivalDate: receivedAt,
        status: "COMPLETED",
        totalCost: items.reduce((sum, it) => sum + it.qty * it.cost, 0),
      },
    });

    for (const it of items) {
      await prisma.purchaseOrderItems.create({
        data: {
          storeId,
          purchaseOrderId: po.purchaseOrderId,
          productVariantId: it.variantId,
          quantityOrdered: it.qty,
          costPrice: it.cost,
        },
      });
      await prisma.receivedGoodsNotes.create({
        data: {
          storeId,
          purchaseOrderId: po.purchaseOrderId,
          productVariantId: it.variantId,
          qtyReceived: it.qty,
          dateReceived: receivedAt,
        },
      });
      await prisma.stockMovements.create({
        data: {
          storeId,
          productVariantId: it.variantId,
          referenceId: po.purchaseOrderId,
          referenceType: "PURCHASE_ORDER",
          change: it.qty,
          reason: "Purchase order received",
          createdAt: receivedAt,
        },
      });
    }
  }

  const variantCount = CATALOGUE.reduce((n, p) => n + p.variants.length, 0);
  console.log(`Done: ${CATALOGUE.length} products, ${variantCount} variants.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
