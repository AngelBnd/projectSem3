const express = require("express");
const authenticateToken = require("../middleware/auth");
const productsController = require("../controllers/products.controller");
const router = express.Router();
router.use(authenticateToken);

router.get("/", authenticateToken, productsController.list);

module.exports = router;
