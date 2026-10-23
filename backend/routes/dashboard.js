const express = require("express");
const authenticateToken = require("../middleware/auth");
const dashboardController = require("../controllers/dashboard.controller");
const router = express.Router();
router.use(authenticateToken);

router.get("/summary", authenticateToken, dashboardController.getSummary);
router.get("/top-selling-products", authenticateToken, dashboardController.getTopSellingProducts);
router.get("/recent-transactions", authenticateToken, dashboardController.getRecentTransactions);
router.get("/export", authenticateToken, dashboardController.exportPdf);

module.exports = router;
