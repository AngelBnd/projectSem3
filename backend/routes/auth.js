// routes/auth.js
const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/validate", authController.validateField);

module.exports = router;
