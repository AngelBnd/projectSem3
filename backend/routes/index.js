const express = require('express');
const authRoutes = require('./auth');
const inventoryRoutes = require('./inventory');
const salesRoutes = require('./sales');
const invoiceRoutes = require('./invoices')
const dashboardRoutes = require('./dashboard'); 
const userRoutes = require('./users')
const productRoutes = require('./products')
const productVariantsRoutes = require('./product-variants')

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', salesRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/dashboard', dashboardRoutes)
router.use('/users', userRoutes)
router.use('/products', productRoutes)
router.use('/product-variants', productVariantsRoutes)

module.exports = router;