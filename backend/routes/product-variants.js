const express = require("express");
const authenticateToken = require("../middleware/auth");
const productVariantsController = require("../controllers/product-variants.controller");
const router = express.Router();
router.use(authenticateToken);

router.get("/", authenticateToken, productVariantsController.list);
router.post("/quick-add", authenticateToken, productVariantsController.quickAdd);

module.exports = router;
