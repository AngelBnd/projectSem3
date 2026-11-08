const express = require("express");
const authenticateToken = require("../middleware/auth");
const validate = require("../middleware/validate");
const stockAuditsValidator = require("../validators/stock-audits.validator");
const stockAuditsController = require("../controllers/stock-audits.controller");
const router = express.Router();
router.use(authenticateToken);

router.get("/products", stockAuditsController.listProducts);
router.get("/lookup", stockAuditsController.lookup);
router.post("/", validate(stockAuditsValidator.create), stockAuditsController.create);

module.exports = router;
