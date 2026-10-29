const express = require("express");
const authenticateToken = require("../middleware/auth");
const suppliersController = require("../controllers/suppliers.controller");
const router = express.Router();
router.use(authenticateToken);

router.get("/", authenticateToken, suppliersController.list);

module.exports = router;
