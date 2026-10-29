const express = require("express");
// NOTE: /inventory and /invoices were unmounted in the controller/service refactor;
// their old route files live in backend/_legacy/ (they target a schema that no longer exists).
const dashboardRoutes = require("./dashboard");
const userRoutes = require("./users");
const productRoutes = require("./products");
const productVariantsRoutes = require("./product-variants");
const salesOrderRoutes = require("./sales-order");
const supplierRoutes = require("./suppliers");

const router = express.Router();

router.use("/dashboard", dashboardRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/product-variants", productVariantsRoutes);
router.use("/sales-order", salesOrderRoutes);
router.use("/suppliers", supplierRoutes);

module.exports = router;
