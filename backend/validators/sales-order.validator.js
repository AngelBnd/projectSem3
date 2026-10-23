const { z } = require("zod");

// Shapes taken from the CreateOrderSale page (frontend/src/pages/CreateOrderSale
// and CreateOrderSaleSteps/StepGeneralInfo + StepReview). On edit, values loaded
// from GET /sales-order/:id can be numeric strings (Prisma Decimal), so money
// fields accept number | numeric string.
const money = (name) =>
  z.union(
    [z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)],
    { error: `${name} must be a number` }
  );

const id = (name) =>
  z.number({ error: `${name} must be a number` }).int(`${name} must be an integer`);

const generalInfo = z.object({
  customerName: z.string({ error: "generalInfo.customerName is required" }),
  orderDate: z
    .string({ error: "generalInfo.orderDate is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "generalInfo.orderDate must be YYYY-MM-DD"),
  paymentTerm: z.string().nullish(),
  channelId: id("generalInfo.channelId").nullish(),
  subChannelId: id("generalInfo.subChannelId").nullish(),
  applyDiscount: z.boolean().optional(),
  // "" until the user ticks the discount box
  discountAmount: z.union([z.number(), z.string()]).nullish(),
});

const totals = z.object({
  subtotal: z.number().optional(),
  // NaN serializes to null when the discount field was never set
  discount: z.union([z.number(), z.string()]).nullish(),
  totalAmount: money("totals.totalAmount"),
});

const product = z.object({
  productVariantId: id("products[].productVariantId"),
  quantitySold: z
    .number({ error: "products[].quantitySold must be a number" })
    .int("products[].quantitySold must be an integer")
    .positive("products[].quantitySold must be greater than 0"),
  unitPrice: money("products[].unitPrice"),
});

const service = z.object({
  serviceName: z
    .string({ error: "services[].serviceName is required" })
    .trim()
    .min(1, "services[].serviceName is required"),
  quantity: z
    .number({ error: "services[].quantity must be a number" })
    .int("services[].quantity must be an integer")
    .positive("services[].quantity must be greater than 0"),
  unitPrice: money("services[].unitPrice"),
});

const orderBody = z
  .object({
    formData: z.object(
      { generalInfo, totals },
      { error: "No form data provided" }
    ),
    products: z.array(product).default([]),
    services: z.array(service).default([]),
  })
  .refine((b) => b.products.length + b.services.length > 0, {
    message: "Order needs at least one product or service",
  });

module.exports = { create: orderBody, update: orderBody };
