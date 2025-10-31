const express = require('express');
const authRoutes = require('./auth');
const inventoryRoutes = require('./inventory');
const salesRoutes = require('./sales');
const invoiceRoutes = require('./invoices')
const dashboardRoutes = require('./dashboard'); 

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', salesRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/dashboard', dashboardRoutes)

module.exports = router;