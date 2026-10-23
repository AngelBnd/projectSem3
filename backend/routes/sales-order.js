const express = require("express");
const authenticateToken = require("../middleware/auth");
const validate = require("../middleware/validate");
const salesOrderValidator = require("../validators/sales-order.validator");
const salesOrderController = require("../controllers/sales-order.controller");
const router = express.Router();
router.use(authenticateToken);

router.get("/channels", authenticateToken, salesOrderController.listChannels);
router.get("/", authenticateToken, salesOrderController.list);
router.get("/:id", authenticateToken, salesOrderController.getById);
router.post("/", authenticateToken, validate(salesOrderValidator.create), salesOrderController.create);
router.post("/populate", authenticateToken, salesOrderController.populateDemo);
router.put("/:id", authenticateToken, validate(salesOrderValidator.update), salesOrderController.update);
router.delete("/:id", authenticateToken, salesOrderController.remove);

module.exports = router;
