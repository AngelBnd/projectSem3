const express = require('express');
const inventoryRoutes = require('./inventory');
const invoicesRoutes = require('./invoices');
// const invoiceRoutes = require('./invoicesTemp')
const dashboardRoutes = require('./dashboard'); 
const userRoutes = require('./users')
const productRoutes = require('./products')
const productVariantsRoutes = require('./product-variants')
const salesOrderRoutes = require('./sales-order')

const router = express.Router();

router.use('/inventory', inventoryRoutes);
router.use('/invoices', invoicesRoutes);
router.use('/dashboard', dashboardRoutes)
router.use('/users', userRoutes)
router.use('/products', productRoutes)
router.use('/product-variants', productVariantsRoutes)
router.use('/sales-order', salesOrderRoutes)

module.exports = router;